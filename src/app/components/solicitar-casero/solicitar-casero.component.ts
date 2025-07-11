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
  telefonoSinPrefijo = '';
  email = '';
  selectedFile: File | null = null;
  run = '';
  dv = '';
  runFocused: boolean = false;

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
    // Teléfono obligatorio y válido
    let telefonoValido = true;
    if (!this.telefonoSinPrefijo || !/^\d{9}$/.test(this.telefonoSinPrefijo)) {
      telefonoValido = false;
    }
    if (!telefonoValido) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'El teléfono es obligatorio y debe tener exactamente 9 dígitos numéricos.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }
    // Concatenar el prefijo +56
    this.telefono = `+56${this.telefonoSinPrefijo}`;

    // Comentario obligatorio y válido
    let comentarioValido = true;
    if (!this.comentario || !/^[^<>{}\[\]"'/\\]{1,500}$/.test(this.comentario) || this.comentario.length > 500) {
      comentarioValido = false;
    }
    if (!comentarioValido) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'El comentario es obligatorio, no puede contener los símbolos < > { } [ ] " \' / \\ y debe tener máximo 500 caracteres.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Documento obligatorio
    if (!this.selectedFile) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Debes adjuntar un documento (imagen o PDF).',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Validación del email
    let emailValido = true;
    if (!this.email || !/^\S+@\S+\.\S+$/.test(this.email)) {
      emailValido = false;
    }
    if (!emailValido) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Debes ingresar un correo electrónico válido.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

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
      run: Number(this.run),
      dv: this.dv.toUpperCase(),
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

  async mostrarInfoDocumento() {
  const alert = await this.alertCtrl.create({
    header: '¿Qué documento subir?',
    message: 'Aquí debes subir la patente municipal, carnet de feriante, permiso, o cualquier comprobante que acredite que eres un locatario.',
    buttons: ['Entendido'],
  });

  await alert.present();
}

  get isEmailInvalido(): boolean {
    return !!this.email && !/^\S+@\S+\.\S+$/.test(this.email);
  }

  get isComentarioInvalido(): boolean {
    return (
      !!this.comentario &&
      (!/^[^<>{}\[\]"'/\\]{0,500}$/.test(this.comentario) || this.comentario.length > 500)
    );
  }

  get isRunInvalido(): boolean {
    return !/^\d{7,8}$/.test(this.run);
  }

  get isDvInvalido(): boolean {
    return !/^[0-9Kk]{1}$/.test(this.dv);
  }

  quitarArchivo(event: Event) {
    event.preventDefault();
    this.selectedFile = null;
  }
}
