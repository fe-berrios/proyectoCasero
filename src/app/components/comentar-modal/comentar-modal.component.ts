import { Component, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ReviewsService, Review } from 'src/app/services/reviews.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  standalone: false,
  selector: 'app-comentar-modal',
  templateUrl: './comentar-modal.component.html',
  styleUrls: ['./comentar-modal.component.scss'],
})
export class ComentarModalComponent {
  @Input() puestoId!: number;

  comentario = '';
  calificacion = 1;

  constructor(
    private modalCtrl: ModalController,
    private reviewsService: ReviewsService,
    private supabaseService: SupabaseService,
    private toastCtrl: ToastController
  ) {}

  setCalificacion(valor: number) {
    this.calificacion = valor;
  }

  get isComentarioInvalido(): boolean {
    return /[<>{}\[\]"'/\\]/.test(this.comentario);
  }

  async enviar() {
    if (!this.comentario.trim()) {
      this.mostrarToast('Por favor escribe un comentario.');
      return;
    }
    if (this.isComentarioInvalido) {
      this.mostrarToast('El comentario no puede contener los símbolos < > { } [ ] " \' / \\');
      return;
    }

    const user = await this.supabaseService.user;
    if (!user) {
      this.mostrarToast('Debes iniciar sesión para comentar.');
      return;
    }

    const existingReview = await this.reviewsService.getReviewByUserAndPuesto(user.id, this.puestoId);
    if (existingReview) {
      this.mostrarToast('Solo puedes dejar un comentario por puesto.');
      return;
    }

    const review: Review = {
      user_id: user.id,
      puesto_id: this.puestoId,
      comentario: this.comentario.trim(),
      calificacion: this.calificacion,
    };

    const res = await this.reviewsService.addReview(review);
    if (res) {
      await this.mostrarToast('Comentario agregado con éxito.');
      this.modalCtrl.dismiss(true); // true = hubo cambio
    } else {
      this.mostrarToast('Error al agregar comentario, intenta de nuevo.');
    }
  }

  cerrar() {
    this.modalCtrl.dismiss(false);
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
