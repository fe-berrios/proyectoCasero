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
  selectedFile: File | null = null;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private supabaseService: SupabaseService,
    private solicitudCaseroService: SolicitudCaseroService
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

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

    let documento_url: string | undefined = undefined;

    if (this.selectedFile) {
      const { path, error } = await this.solicitudCaseroService.subirDocumento(
        user.id,
        this.selectedFile
      );

      if (error) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo subir el documento. Intenta nuevamente.',
          buttons: ['OK'],
        });
        await alert.present();
        return;
      }

      documento_url = path ?? undefined;
    }

    const { error } = await this.solicitudCaseroService.enviarSolicitud({
      user_id: user.id,
      comentario: this.comentario,
      telefono: this.telefono,
      email: this.email,
      documento_url,
    });

    if (error) {
      let message = 'No se pudo enviar la solicitud. Intenta nuevamente.';

      if (error.code === '23505') {
        if (error.message?.includes('solicitud_casero_user_id_key')) {
          message = 'Ya has enviado una solicitud anteriormente.';
        }
      }

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message,
        buttons: ['OK'],
      });
      await alert.present();
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Solicitud enviada',
        message:
          'Tu solicitud ha sido enviada con éxito. Un administrador la revisará pronto.',
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
