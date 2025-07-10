import { Component, OnInit, OnDestroy } from '@angular/core';
import * as leaflet from 'leaflet';
import { FeriaService } from 'src/app/services/feria.service';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { FeriaModalComponent } from 'src/app/components/feria-modal/feria-modal.component';
import { ModalController, Platform, AlertController, ToastController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { MenuController } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  standalone: false,
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, OnDestroy {
  map: leaflet.Map | undefined;
  markers: leaflet.Marker[] = [];
  subscription: any;
  isAdmin: boolean = false; // NUEVA variable para controlar visibilidad
  isCasero: boolean = false;
  loading: boolean = true;  // Para manejar la carga del perfil y evitar flicker
  userName: string = '';
  profileImgUrl: string = 'assets/profile_pics/loading.svg'; // Valor por defecto
  searchTerm: string = '';
  suggestedFerias: any[] = [];
  userLocationMarker: leaflet.Marker | null = null;
  watchId: string | null = null;
  tileLayers: leaflet.TileLayer[] = [];
  currentTileLayerIndex: number = 0;
  private shouldCenterOnLocation: boolean = false;
  private backButtonListener: any;
  isInvitado = false;

  constructor(
    private router: Router,
    private readonly supabase: SupabaseService,
    private feriaService: FeriaService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private menuCtrl: MenuController,
    private platform: Platform,
  ) { }

  // Idealmente en ngAfterViewInit()
  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.backButtonListener = App.addListener('backButton', async () => {
        const topModal = await this.modalCtrl.getTop();

        if (topModal) {
          await topModal.dismiss();
          return;
        }

        // ✅ Solo salir de la app si estamos en /mapa
        if (this.router.url === '/mapa') {
          App.exitApp();
        }
      });
    });
  }

  ngOnInit() {
    this.initMap();
    this.loadFerias();
    this.subscribeToNewFerias();

    this.isInvitado = localStorage.getItem('casero_invitado') === 'true';
    

    if (this.isInvitado) {
      this.profileImgUrl = 'assets/profile_pics/joy.png';
      this.loading = false;
    } else {
      this.supabase.profile.then((response) => {
        const profile = response.data;
        this.isAdmin = profile?.admin_status === true;
        this.isCasero = profile?.casero_status === true;
        this.userName = profile?.full_name || 'Usuario';
        this.profileImgUrl = profile?.avatar_url || 'assets/profile_pics/loading.svg';
        this.loading = false;
      });
    }
  }

  ngOnDestroy() {
    if (this.backButtonListener) {
      this.backButtonListener.remove();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  openMenu() {
    this.menuCtrl.open('main-menu');  // usa el menuId que definiste en el ion-menu
  }

  private initMap(): void {
    this.map = leaflet.map('map', {
      zoomControl: false,
      center: [-33.499939765375, -70.61597756156033],
      zoom: 17,
      renderer: leaflet.canvas(),
    });

    // Define solo dos capas base
    const openStreetMap = leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    });

    const stadiaSatellite = leaflet.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '© OpenStreetMap',
    });

    this.tileLayers = [openStreetMap, stadiaSatellite];

    // Agregar la capa inicial
    this.tileLayers[0].addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);
  }

  private async loadFerias(dayFilter?: string) {
    const { data: ferias, error } = await this.feriaService.getFerias();
    if (error) {
      console.error('Error al cargar las ferias:', error);
      return;
    }

    const filteredFerias = dayFilter
      ? ferias?.filter((feria: any) => feria.dia?.includes(dayFilter))
      : ferias;

    this.clearMarkers();

    filteredFerias?.forEach((feria: any) => {
      this.addMarker(feria);
    });
  }

  private addMarker(feria: any) {
    const marker = leaflet.marker([feria.lat, feria.lng], {
      icon: leaflet.icon({
        iconUrl: 'assets/icon/feria-marker.png',
        iconSize: [25, 25],
        iconAnchor: [12, 41],
      }),
    });

    marker.addTo(this.map!).on('click', () => this.showFeriaDetails(feria));
    this.markers.push(marker);
  }

  private clearMarkers() {
    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers = [];
  }

  public async openDaySelector() {
    const alert = await this.alertCtrl.create({
      header: 'Selecciona un día',
      cssClass: 'custom-alert',
      inputs: [
        { type: 'radio', label: 'Lunes', value: 'lun' },
        { type: 'radio', label: 'Martes', value: 'mar' },
        { type: 'radio', label: 'Miércoles', value: 'mie' },
        { type: 'radio', label: 'Jueves', value: 'jue' },
        { type: 'radio', label: 'Viernes', value: 'vie' },
        { type: 'radio', label: 'Sábado', value: 'sab' },
        { type: 'radio', label: 'Domingo', value: 'dom' },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
            await this.loadFeriasByRating(0);
          },
        },
        {
          text: 'Aceptar',
          handler: (selectedDay) => {
            this.loadFerias(selectedDay);
          },
        },
      ],
    });

    await alert.present();
  }

  private async showFeriaDetails(feria: any) {
    const modal = await this.modalCtrl.create({
      component: FeriaModalComponent,
      componentProps: { feria },
    });
    await modal.present();
  }

  private subscribeToNewFerias() {
    this.subscription = this.feriaService.subscribeToFerias((newFeria) => {
      this.addMarker(newFeria);
    });
  }

  async signOut() {
    console.log('testing?');
    localStorage.removeItem('casero_invitado');
    await this.supabase.signOut();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  public async filterByHorario() {
    const alert = await this.alertCtrl.create({
      header: 'Selecciona un rango de horario',
      cssClass: 'custom-alert',
      inputs: [
        { type: 'time', label: 'Hora Inicio', name: 'horaInicio', placeholder: '08:00' },
        { type: 'time', label: 'Hora Término', name: 'horaTermino', placeholder: '18:00' },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
            await this.loadFeriasByRating(0);
          },
        },
        {
          text: 'Aceptar',
          handler: (data) => {
            const { horaInicio, horaTermino } = data;
            this.loadFeriasByHorario(horaInicio, horaTermino);
          },
        },
      ],
    });

    await alert.present();
  }

  private async loadFeriasByHorario(horaInicio: string, horaTermino: string) {
    const { data: ferias, error } = await this.feriaService.getFerias();
    if (error) {
      console.error('Error al cargar las ferias:', error);
      return;
    }

    const filteredFerias = ferias?.filter((feria: any) => {
      return feria.hora_inicio >= horaInicio && feria.hora_termino <= horaTermino;
    });

    this.clearMarkers();

    filteredFerias?.forEach((feria: any) => {
      this.addMarker(feria);
    });
  }

  async onSearchChange() {
    const term = this.searchTerm.trim().toLowerCase();

    const { data: ferias, error } = await this.feriaService.getFerias();
    if (error) {
      console.error('Error al buscar ferias:', error);
      return;
    }

    const filteredFerias = !term
      ? []
      : ferias?.filter((feria: any) =>
        feria.nombre.toLowerCase().includes(term)
      );

    // Mostrar sugerencias debajo
    this.suggestedFerias = filteredFerias;

    // Opcional: si hay una sola coincidencia, mover el mapa
    if (filteredFerias.length === 1) {
      const feria = filteredFerias[0];
      this.flyToFeria(feria);
    }
  }

  selectFeria(feria: any) {
    this.searchTerm = feria.nombre;
    this.suggestedFerias = [];
    this.flyToFeria(feria);
  }

  flyToFeria(feria: any) {
    this.map?.flyTo([feria.lat, feria.lng], 18, {
      animate: true,
      duration: 1.5,
    });
  }

  // Nueva función para centrar mapa en la ubicación actual del usuario
  public async centrarEnUsuario() {
    if (!this.map) return;

    try {
      let permission = await Geolocation.checkPermissions();

      if (permission.location === 'prompt') {
        permission = await Geolocation.requestPermissions();
      }

      if (permission.location === 'denied') {
        this.mostrarToast('Permiso de ubicación denegado. Por favor habilítalo en configuración.');
        return;
      }

      if (permission.location === 'granted') {
        this.shouldCenterOnLocation = true;  // ✅ Habilitar centrado solo una vez

        // Si ya hay un watch activo, no lo duplicamos
        if (this.watchId) return;

        this.watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
          (position, err) => {
            if (err) {
              console.error('Error de geolocalización:', err);
              this.mostrarToast('Error al rastrear tu ubicación.');
              return;
            }

            if (position) {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              // ✅ Solo centrar la primera vez
              if (this.shouldCenterOnLocation && this.map) {
                this.map.flyTo([lat, lng], 18, {
                  animate: true,
                  duration: 1,
                });

                this.shouldCenterOnLocation = false; // ❌ Ya no volver a centrar
              }

              // Crear o mover el marcador del usuario
              if (!this.userLocationMarker) {
                this.userLocationMarker = leaflet.marker([lat, lng], {
                  icon: leaflet.icon({
                    iconUrl: 'assets/icon/user-location.png',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30],
                  }),
                  title: 'Tu ubicación',
                }).addTo(this.map!);
              } else {
                this.userLocationMarker.setLatLng([lat, lng]);
              }
            }
          }
        );
      } else {
        this.mostrarToast('No se pudo obtener el permiso de ubicación.');
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      this.mostrarToast('No se pudo obtener la ubicación. Verifica permisos y configuración.');
    }
  }

  // Método para mostrar un toast
  private async mostrarToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }

  alternarTileLayer() {
    if (!this.map || this.tileLayers.length === 0) return;

    // Remover la capa actual
    this.map.removeLayer(this.tileLayers[this.currentTileLayerIndex]);

    // Calcular el siguiente índice circularmente
    this.currentTileLayerIndex = (this.currentTileLayerIndex + 1) % this.tileLayers.length;

    // Agregar la nueva capa
    this.tileLayers[this.currentTileLayerIndex].addTo(this.map);
  }
  // Método para cargar ferias filtradas por calificación
  private async loadFeriasByRating(minRating: number) {
    let query = this.supabase.client.from('feria_con_calificacion').select('*');

    if (minRating > 0) {
      query = query.gte('calificacion', minRating);
    }

    const { data: ferias, error } = await query;

    if (error) {
      console.error('Error al cargar ferias con calificación:', error);
      this.mostrarToast('Error al cargar ferias filtradas');
      return;
    }

    this.clearMarkers();

    ferias?.forEach((feria: any) => {
      this.addMarker(feria);
    });
  }

  //Metodo para mostrar un alert para filtrar por calificación
  public async filtrarPorCalificacion() {
    const alert = await this.alertCtrl.create({
      header: 'Filtrar por calificación mínima',
      cssClass: 'custom-alert',
      inputs: [
        { type: 'radio', label: '🍅', value: 1 },
        { type: 'radio', label: '🍅🍅', value: 2 },
        { type: 'radio', label: '🍅🍅🍅', value: 3 },
        { type: 'radio', label: '🍅🍅🍅🍅', value: 4 },
        { type: 'radio', label: '🍅🍅🍅🍅🍅', value: 5 },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
            await this.loadFeriasByRating(0);
          },
        },
        {
          text: 'Aceptar',
          handler: async (selectedRating) => {
            if (selectedRating !== undefined) {
              await this.loadFeriasByRating(selectedRating);
            } else {
              this.mostrarToast('Por favor selecciona una calificación');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para mostrar un alert para filtrar por comuna
  public async filtrarPorComuna() {
    // Obtener comunas disponibles
    const comunas = await this.feriaService.getComunasDisponibles();
    
    if (comunas.length === 0) {
      this.mostrarToast('No hay comunas disponibles');
      return;
    }

    const inputs = comunas.map(comuna => ({
      type: 'radio' as const,
      label: comuna,
      value: comuna
    }));

    const alert = await this.alertCtrl.create({
      header: 'Filtrar por comuna',
      cssClass: 'custom-alert',
      inputs: inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
            await this.loadFerias(); // Cargar todas las ferias
          },
        },
        {
          text: 'Aceptar',
          handler: async (selectedComuna) => {
            if (selectedComuna) {
              await this.loadFeriasPorComuna(selectedComuna);
            } else {
              this.mostrarToast('Por favor selecciona una comuna');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para cargar ferias filtradas por comuna
  private async loadFeriasPorComuna(comuna: string) {
    const { data: ferias, error } = await this.feriaService.getFeriasPorComuna(comuna);
    
    if (error) {
      console.error('Error al cargar ferias por comuna:', error);
      this.mostrarToast('Error al cargar ferias filtradas');
      return;
    }

    this.clearMarkers();

    ferias?.forEach((feria: any) => {
      // Agregar calificación por defecto ya que viene de la tabla ferias
      const feriaConCalificacion = {
        ...feria,
        calificacion: 0 // Valor por defecto para ferias sin calificación
      };
      this.addMarker(feriaConCalificacion);
    });

    this.mostrarToast(`Mostrando ferias de ${comuna}`);
  }

  onProfileClick() {
    this.menuCtrl.open('main-menu');
  }

}