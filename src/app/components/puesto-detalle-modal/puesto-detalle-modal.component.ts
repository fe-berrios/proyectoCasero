import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { FeriaService } from 'src/app/services/feria.service';
import { ReviewsService, Review } from 'src/app/services/reviews.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ComentarModalComponent } from '../comentar-modal/comentar-modal.component';

interface ReviewWithUser extends Review {
  username?: string;
  avatar_url?: string;
}

@Component({
  standalone: false,
  selector: 'app-puesto-detalle-modal',
  templateUrl: './puesto-detalle-modal.component.html',
  styleUrls: ['./puesto-detalle-modal.component.scss'],
})
export class PuestoDetalleModalComponent implements OnInit {
  @Input() puestoId!: number;

  puesto: any;
  nombreFeria: string | null = null;

  reviews: ReviewWithUser[] = [];
  tipoBadges: { nombre: string, imagen: string }[] = [];
  isInvitado = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private puestoService: PuestoService,
    private feriaService: FeriaService,
    private reviewsService: ReviewsService,
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit() {
    await this.cargarPuesto();
    await this.cargarReviewsConUsuarios();
    this.isInvitado = localStorage.getItem('casero_invitado') === 'true';
  }

  private async cargarPuesto() {
    const { data, error } = await this.puestoService.getPuestoById(this.puestoId);
    if (error) return;
    if (data?.length) {
      this.puesto = data[0];

      if (this.puesto.feria_id) {
        await this.cargarNombreFeria(this.puesto.feria_id);
      }

      // Procesar badges
      const tiposTexto = (this.puesto.tipo_productos || '').toLowerCase();
      this.tipoBadges = [];

      const tiposDisponibles = [
        { nombre: 'Frutas', imagen: 'assets/types/type1.png' },
        { nombre: 'Verduras', imagen: 'assets/types/type2.png' },
        { nombre: 'Abarrotes', imagen: 'assets/types/type3.png' },
        { nombre: 'Ropa', imagen: 'assets/types/type4.png' },
        { nombre: 'Otros', imagen: 'assets/types/type5.png' },
      ];

      for (const tipo of tiposDisponibles) {
        if (tiposTexto.includes(tipo.nombre.toLowerCase())) {
          this.tipoBadges.push(tipo);
        }
      }
    }
  }

  private async cargarNombreFeria(feriaId: number) {
    const { data, error } = await this.feriaService.getFeriaById(feriaId);
    if (error) return;
    this.nombreFeria = data?.nombre ?? null;
  }

  private async cargarReviewsConUsuarios() {
    const reviews = await this.reviewsService.getReviewsByPuestoId(this.puestoId);
    if (reviews.length === 0) {
      this.reviews = [];
      return;
    }
    const userIds = Array.from(new Set(reviews.map(r => r.user_id)));
    const profiles = await this.reviewsService.getProfilesByIds(userIds);

    this.reviews = reviews.map(r => {
      const profile = profiles.find(p => p.id === r.user_id);
      return {
        ...r,
        username: profile?.username ?? 'Usuario',
        avatar_url: profile?.avatar_url ?? 'assets/icon/user-location.svg',
      };
    });
  }

  async abrirModalComentario() {
    const user = await this.supabaseService.user;
    if (!user) {
      await this.mostrarToast('Debes iniciar sesión para calificar.');
      return;
    }

    const reviewExistente = await this.reviewsService.getReviewByUserAndPuesto(user.id, this.puestoId);
    if (reviewExistente) {
      await this.mostrarToast('Ya has calificado este puesto.');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: ComentarModalComponent,
      componentProps: { puestoId: this.puestoId },
    });

    await modal.present();

    const { data: refrescar } = await modal.onWillDismiss();
    if (refrescar) {
      await this.cargarReviewsConUsuarios();
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}
