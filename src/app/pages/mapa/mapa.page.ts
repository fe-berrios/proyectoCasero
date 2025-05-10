import { Component, OnInit, OnDestroy } from '@angular/core';
import * as leaflet from 'leaflet';
import { FeriaService } from 'src/app/services/feria.service';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { FeriaModalComponent } from 'src/app/components/feria-modal/feria-modal.component';
import { ModalController, AlertController } from '@ionic/angular';

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
  loading: boolean = true;  // Para manejar la carga del perfil y evitar flicker
  userName: string = '';
  profileImgUrl: string = 'assets/profile_pics/joy.png'; // Valor por defecto

  constructor(
    private router: Router,
    private readonly supabase: SupabaseService,
    private feriaService: FeriaService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    // Inicializa el mapa y carga las ferias al entrar en la vista
    this.initMap();
    this.loadFerias();
    this.subscribeToNewFerias();

    // Verifica si el usuario es admin
    this.supabase.profile.then((response) => {
      this.isAdmin = response.data?.admin_status === true;
      this.loading = false; // Una vez cargado el perfil, ya no estamos en carga
    });

 this.supabase.profile.then((response) => {
      const profile = response.data;
      this.isAdmin = profile?.admin_status === true;
      this.userName = profile?.full_name || 'Usuario';
      this.profileImgUrl = profile?.avatar_url || 'assets/profile_pics/default.png';
      this.loading = false;
    });  
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private initMap(): void {
    this.map = leaflet.map('map', {
      zoomControl: false,
      center: [-33.499939765375, -70.61597756156033],
      zoom: 17,
      renderer: leaflet.canvas(),
    });

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

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
      ? ferias?.filter((feria: any) => feria.dia === dayFilter)
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
    await this.supabase.signOut();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  public async filterByHorario() {
    const alert = await this.alertCtrl.create({
      header: 'Selecciona un rango de horario',
      inputs: [
        { type: 'time', label: 'Hora Inicio', name: 'horaInicio', placeholder: '08:00' },
        { type: 'time', label: 'Hora Término', name: 'horaTermino', placeholder: '18:00' },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
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
}
