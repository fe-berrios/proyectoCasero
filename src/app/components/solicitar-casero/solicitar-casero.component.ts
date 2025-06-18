import { Component } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { SolicitudCaseroService } from 'src/app/services/solicitud-casero.service';

@Component({
  standalone: false,
  selector: 'app-solicitar-casero',
  templateUrl: './solicitar-casero.component.html',
  styleUrls: ['./solicitar-casero.component.scss'],
})
export class SolicitarCaseroComponent {
  comentario = '';
  telefono = '';
  email = '';

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private supabaseService: SupabaseService,
    private solicitudCaseroService: SolicitudCaseroService
  ) {}

  async enviarSolicitud() {
    const user = await this.supabaseService.user;

    if (!user) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Debes estar autenticado para enviar una solicitud.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const { error } = await this.solicitudCaseroService.enviarSolicitud({
      user_id: user.id,
      comentario: this.comentario,
      telefono: this.telefono,
      email: this.email,
    });

    if (error) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo enviar la solicitud. Intenta nuevamente.',
        buttons: ['OK'],
      });
      await alert.present();
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Solicitud enviada',
        message: 'Tu solicitud ha sido enviada con éxito. Un administrador la revisará pronto.',
        buttons: ['OK'],
      });
      await alert.present();
      this.modalCtrl.dismiss();
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
