import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { PuestoDetalleModalComponent } from '../puesto-detalle-modal/puesto-detalle-modal.component';
import { ComentarFeriaComponent } from '../comentar-feria/comentar-feria.component';
import { supabase } from 'src/app/supabase_client'; // Asegúrate de que la ruta sea correcta
import { SupabaseService } from 'src/app/services/supabase.service'; // Asegúrate de que la ruta sea correcta
import { FeriaService } from 'src/app/services/feria.service';
import * as L from 'leaflet';

@Component({
  standalone: false,
  selector: 'app-feria-modal',
  templateUrl: './feria-modal.component.html',
  styleUrls: ['./feria-modal.component.scss'],
})
export class FeriaModalComponent {
  @Input() feria: any;
  puestos: any[] = [];
  isAccordionOpen = false;
  isComentariosAccordionOpen = true;
  comentarios: any[] = [];
  userId: string | null = null;
  esFavorita: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private puestoService: PuestoService,
    private supabaseService: SupabaseService,
    private feriaService: FeriaService
  ) { }

  async ngOnInit() {
    // Obtener usuario
    const user = await this.supabaseService.user;
    this.userId = user ? user.id : null;
    if (this.userId) {
      this.esFavorita = await this.feriaService.esFeriaFavorita(this.userId, this.feria.id);
    }
    // Obtener datos de la vista (calificación y generales)
    const { data: feriaVista } = await this.feriaService.getFeriaById(this.feria.id);
    // Obtener datos de la tabla ferias (comuna y calle_principal)
    const { data: feriaRaw } = await this.feriaService.getFeriaRawById(this.feria.id);
    // Combinar ambos resultados en this.feria
    this.feria = { ...feriaVista, ...feriaRaw };
    
    // Inicializar mapa después de obtener los datos
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
    
    await this.cargarPuestos();
    await this.cargarComentarios();
  }

  async obtenerUsuario() {
    const user = await this.supabaseService.user;
    this.userId = user ? user.id : null;
  }

  toggleComentariosAccordion() {
    this.isComentariosAccordionOpen = !this.isComentariosAccordionOpen;
  }

  async cargarComentarios() {
    const { data, error } = await supabase
      .from('comentarios_feria')
      .select(`
      id,
      comentario,
      created_at,
      usuario_id,
      profiles(full_name, avatar_url),
      comentario_reacciones (
        usuario_id,
        tipo
      )
    `)
      .eq('feria_id', this.feria.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando comentarios:', error);
      return;
    }

    this.comentarios = data.map((c: any) => {
      const likesUsers = c.comentario_reacciones?.filter((r: any) => r.tipo === 'like').map((r: any) => r.usuario_id) || [];
      const dislikesUsers = c.comentario_reacciones?.filter((r: any) => r.tipo === 'dislike').map((r: any) => r.usuario_id) || [];

      return {
        id: c.id,
        comentario: c.comentario,
        created_at: c.created_at,
        usuario_id: c.usuario_id,
        full_name: c.profiles?.full_name ?? 'Anónimo',
        avatar_url: c.profiles?.avatar_url ?? null,
        likes: likesUsers.length,
        dislikes: dislikesUsers.length,
        userLiked: this.userId ? likesUsers.includes(this.userId) : false,
        userDisliked: this.userId ? dislikesUsers.includes(this.userId) : false,
      };
    });
  }

  async abrirModalComentario() {
    const modal = await this.modalCtrl.create({
      component: ComentarFeriaComponent,
      componentProps: {
        feriaId: this.feria.id,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.recargar) {
      await this.cargarComentarios();
    }
  }

  async abrirModalDetallePuesto(puestoId: number) {
    const modal = await this.modalCtrl.create({
      component: PuestoDetalleModalComponent,
      componentProps: {
        puestoId: puestoId,
      },
    });
    return await modal.present();
  }

  async cargarPuestos() {
    if (!this.feria?.id) return;
    const { data, error } = await this.puestoService.getPuestosAceptadosByFeria(this.feria.id);
    if (error) {
      console.error('Error al cargar puestos:', error.message);
      return;
    }
    this.puestos = data ?? [];
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async toggleFavorita() {
    if (!this.userId) return;
    await this.feriaService.toggleFeriaFavorita(this.userId, this.feria.id, this.esFavorita);
    this.esFavorita = !this.esFavorita;
  }

  // Método para manejar like/dislike con lógica de intercambio y eliminación
  async toggleLikeDislike(comentarioId: number, tipo: 'like' | 'dislike') {
    if (!this.userId) {
      console.warn('Usuario no autenticado');
      return;
    }

    const comentario = this.comentarios.find(c => c.id === comentarioId);
    if (!comentario) return;

    if (tipo === 'like') {
      if (comentario.userLiked) {
        // Quitar like
        await supabase
          .from('comentario_reacciones')
          .delete()
          .eq('comentario_id', comentarioId)
          .eq('usuario_id', this.userId);
      } else {
        // Si tiene dislike, quitarlo primero
        if (comentario.userDisliked) {
          await supabase
            .from('comentario_reacciones')
            .delete()
            .eq('comentario_id', comentarioId)
            .eq('usuario_id', this.userId);
        }
        // Insertar like
        await supabase.from('comentario_reacciones').insert({
          comentario_id: comentarioId,
          usuario_id: this.userId,
          tipo: 'like'
        });
      }
    } else if (tipo === 'dislike') {
      if (comentario.userDisliked) {
        // Quitar dislike
        await supabase
          .from('comentario_reacciones')
          .delete()
          .eq('comentario_id', comentarioId)
          .eq('usuario_id', this.userId);
      } else {
        // Si tiene like, quitarlo primero
        if (comentario.userLiked) {
          await supabase
            .from('comentario_reacciones')
            .delete()
            .eq('comentario_id', comentarioId)
            .eq('usuario_id', this.userId);
        }
        // Insertar dislike
        await supabase.from('comentario_reacciones').insert({
          comentario_id: comentarioId,
          usuario_id: this.userId,
          tipo: 'dislike'
        });
      }
    }

    await this.cargarComentarios();
  }

  inicializarMapa() {
    if (!this.feria.lat || !this.feria.lng) return;
    
    const map = L.map('feriaMap', {
      zoomControl: false
    }).setView([this.feria.lat, this.feria.lng], 15);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Crear icono personalizado
    const customIcon = L.icon({
      iconUrl: 'assets/icon/feria-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
    
    // Agregar marcador en la ubicación de la feria con icono personalizado
    L.marker([this.feria.lat, this.feria.lng], { icon: customIcon })
      .addTo(map);
    
    // Guardar referencia a this para usar en el callback
    const component = this;
    
    // Agregar botón de recargar en la esquina superior izquierda
    const reloadButton = L.Control.extend({
      options: {
        position: 'topleft'
      },
      
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', 'leaflet-control-zoom-in', container);
        button.innerHTML = '<ion-icon name="refresh"></ion-icon>';
        button.title = 'Volver a la ubicación';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.lineHeight = '30px';
        button.style.textAlign = 'center';
        button.style.fontSize = '16px';
        
        L.DomEvent.on(button, 'click', function() {
          map.setView([component.feria.lat, component.feria.lng], 15);
        });
        
        return container;
      }
    });
    
    map.addControl(new reloadButton());
  }

  // Método para verificar si un día está activo
  isDiaActivo(dia: string): boolean {
    if (!this.feria?.dia) return false;
    
    // Convertir el string de días a un array y verificar si contiene el día
    const diasArray = this.feria.dia.split(' - ');
    return diasArray.includes(dia);
  }

}
