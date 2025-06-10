import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { FeriaService } from 'src/app/services/feria.service';
import { ReviewsService, Review } from 'src/app/services/reviews.service';

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

  constructor(
    private modalCtrl: ModalController,
    private puestoService: PuestoService,
    private feriaService: FeriaService,
    private reviewsService: ReviewsService
  ) {}

  async ngOnInit() {
    await this.cargarPuesto();
    await this.cargarReviewsConUsuarios();
  }

  private async cargarPuesto() {
    const { data, error } = await this.puestoService.getPuestoById(this.puestoId);
    if (error) return;
    if (data?.length) {
      this.puesto = data[0];
      if (this.puesto.feria_id) {
        await this.cargarNombreFeria(this.puesto.feria_id);
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

    // Mapear username y avatar_url a cada review
    this.reviews = reviews.map(r => {
      const profile = profiles.find(p => p.id === r.user_id);
      return {
        ...r,
        username: profile?.username ?? 'Usuario',
        avatar_url: profile?.avatar_url ?? 'assets/icon/user-location.svg',
      };
    });
  }

  abrirModalComentario() {
    // Placeholder para abrir modal de nuevo comentario
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
