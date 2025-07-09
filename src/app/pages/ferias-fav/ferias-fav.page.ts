import { Component, OnInit } from '@angular/core';
import { FeriaService } from 'src/app/services/feria.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ModalController, AlertController } from '@ionic/angular';
import { FeriaModalComponent } from 'src/app/components/feria-modal/feria-modal.component';

@Component({
  standalone: false,
  selector: 'app-ferias-fav',
  templateUrl: './ferias-fav.page.html',
  styleUrls: ['./ferias-fav.page.scss'],
})
export class FeriasFavPage implements OnInit {
  feriasFav: any[] = [];
  userId: string | null = null;

  constructor(
    private feriaService: FeriaService,
    private supabaseService: SupabaseService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    const user = await this.supabaseService.user;
    this.userId = user?.id ?? null;
    await this.cargarFeriasFav();
  }

  async cargarFeriasFav() {
    if (this.userId) {
      const { data, error } = await this.feriaService.getFeriasFavoritas(this.userId);
      if (!error) {
        this.feriasFav = data.map((f: any) => {
          // Combinar datos de la vista con calificación y la tabla ferias
          const feriaCompleta = {
            ...f.feria_con_calificacion, // Datos con calificación
            ...f.ferias // Datos de la tabla ferias (comuna, calle_principal)
          };
          return feriaCompleta;
        });
      }
    }
  }

  async abrirFeriaModal(feria: any) {
    const modal = await this.modalCtrl.create({
      component: FeriaModalComponent,
      componentProps: { feria }
    });
    await modal.present();
    await modal.onDidDismiss();
    await this.cargarFeriasFav();
  }

  async confirmarEliminarFavorito(event: Event, feria: any) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Quitar de favoritos',
      message: `¿Estás seguro de que quieres quitar "${feria.nombre}" de tus favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Quitar',
          handler: async () => {
            if (this.userId) {
              await this.feriaService.toggleFeriaFavorita(this.userId, feria.id, true);
              await this.cargarFeriasFav();
            }
          },
          cssClass: 'danger'
        }
      ]
    });
    await alert.present();
  }
}
