import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { PuestoDetalleModalComponent } from '../puesto-detalle-modal/puesto-detalle-modal.component';
import { ComentarFeriaComponent } from '../comentar-feria/comentar-feria.component';
import { supabase } from 'src/app/supabase_client'; // Asegúrate de que la ruta sea correcta
import { SupabaseService } from 'src/app/services/supabase.service'; // Asegúrate de que la ruta sea correcta

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

  constructor(
    private modalCtrl: ModalController,
    private puestoService: PuestoService,
    private supabaseService: SupabaseService 
  ) { }

  async ngOnInit() {
    const user = await this.supabaseService.user;
    this.userId = user ? user.id : null;
    console.log('Usuario actual:', user);

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
    const { data, error } = await this.puestoService.getPuestosByFeria(this.feria.id);
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

}
