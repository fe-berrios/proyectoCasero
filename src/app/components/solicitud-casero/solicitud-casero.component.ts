import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { SolicitudCaseroService } from 'src/app/services/solicitud-casero.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';


@Component({
  standalone: false,
  selector: 'app-solicitud-casero',
  templateUrl: './solicitud-casero.component.html',
  styleUrls: ['./solicitud-casero.component.scss'],
})
export class SolicitudCaseroComponent implements OnInit {
  @Input() userId!: string;

  solicitud: any = null;
  perfil: any = null;
  loading = true;

  descargadoLocalPath: string | null = null; // ruta local del archivo descargado
  descargando = false;

  constructor(
    private modalCtrl: ModalController,
    private supabaseService: SupabaseService,
    private solicitudService: SolicitudCaseroService,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    try {
      this.solicitud = await this.solicitudService.obtenerSolicitudPorUserId(this.userId);

      const { data: perfil } = await this.supabaseService.getProfileById(this.userId);
      this.perfil = perfil;

      this.loading = false;
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.loading = false;
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async aceptarSolicitud() {
    try {
      // 1. Actualizar solicitud a aceptado
      const { error: errorSolicitud } = await this.supabaseService.client
        .from('solicitud_casero')
        .update({ status: 'aceptado' })
        .eq('user_id', this.userId);

      if (errorSolicitud) throw errorSolicitud;

      // 2. Actualizar perfil del usuario
      const { error: errorPerfil } = await this.supabaseService.updateProfileById(this.userId, {
        casero_status: true,
      });

      if (errorPerfil) throw errorPerfil;

      await this.supabaseService.createNotice('Solicitud aceptada correctamente');
      this.modalCtrl.dismiss(true); // para recargar lista
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
      this.supabaseService.createNotice('Error al aceptar la solicitud');
    }
  }

  async rechazarSolicitud() {
    // 1. Actualizar solicitud a rechazado
    const { error: errorSolicitud } = await this.supabaseService.client
      .from('solicitud_casero')
      .update({ status: 'rechazado' })
      .eq('user_id', this.userId);

    if (errorSolicitud) throw errorSolicitud;
    await this.supabaseService.createNotice('Solicitud rechazada correctamente');
    this.modalCtrl.dismiss(true);
  }

  async pendienteSolicitud() {
    // 1. Actualizar solicitud a rechazado
    const { error: errorSolicitud } = await this.supabaseService.client
      .from('solicitud_casero')
      .update({ status: 'pendiente' })
      .eq('user_id', this.userId);

    if (errorSolicitud) throw errorSolicitud;
    await this.supabaseService.createNotice('Solicitud pendiente');
    this.modalCtrl.dismiss(true);
  }

  // NUEVO: Descargar archivo del documento_url y guardar localmente
  async descargarDocumento() {
    if (!this.solicitud?.documento_url) {
      this.showAlert('No hay documento para descargar.');
      return;
    }

    this.descargando = true;
    try {
      // 1. Obtener URL firmada temporal para descargar el archivo
      const urlFirmada = await this.solicitudService.obtenerUrlTemporal(this.solicitud.documento_url, 300); // 5 min

      if (!urlFirmada) throw new Error('No se pudo obtener URL firmada');

      // 2. Descargar archivo con fetch usando la URL firmada
      const response = await fetch(urlFirmada);
      if (!response.ok) throw new Error('Error al descargar archivo');

      const blob = await response.blob();

      // 3. Obtener extensión del archivo desde el path original
      const extension = this.solicitud.documento_url.split('.').pop()?.split('?')[0] || 'dat';

      // 4. Crear nombre archivo local único
      const fileName = `solicitud_casero_${this.userId}.${extension}`;

      // 5. Convertir blob a base64
      const base64Data = await this.blobToBase64(blob);

      // 6. Guardar archivo localmente con Capacitor Filesystem
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      console.log('Ruta guardada:', savedFile.uri);
      this.descargadoLocalPath = savedFile.uri;

      this.showAlert('Archivo descargado correctamente. Ahora puedes abrirlo.');

    } catch (error) {
      console.error('Error al descargar archivo:', error);
      this.showAlert('Error al descargar el archivo.');
    } finally {
      this.descargando = false;
    }
  }

  async abrirDocumento() {
    if (!this.descargadoLocalPath) {
      this.showAlert('Primero descarga el archivo.');
      return;
    }

    try {
      const mimeType = this.getMimeType(this.descargadoLocalPath);

      await FileOpener.open({
        filePath: this.descargadoLocalPath,
        contentType: mimeType,
      });

    } catch (error) {
      console.error('Error al abrir el archivo:', error);
      this.showAlert('No se pudo abrir el archivo. Verifica que tienes una app compatible.');
    }
  }

  private getMimeType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      default: return 'application/octet-stream';
    }
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Información',
      message,
      buttons: ['OK'],
    }).then(alert => alert.present());
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Extraemos solo la parte base64 sin el prefix data:...
        resolve(dataUrl.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  }
}
