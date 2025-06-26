import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { supabase } from 'src/app/supabase_client';
import { PuestoService } from 'src/app/services/puesto.service';

@Component({
  standalone: false,
  selector: 'app-solicitud-puesto-detalle',
  templateUrl: './solicitud-puesto-detalle.component.html',
  styleUrls: ['./solicitud-puesto-detalle.component.scss'],
})
export class SolicitudPuestoDetalleComponent implements OnInit {
  @Input() solicitudId!: number;

  solicitud: any = null;
  puestoCompleto: any = null; // <--- Nuevo campo
  loading = true;
  descargando = false;
  descargadoLocalPath: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private puestoService: PuestoService // <--- Inyectamos el servicio
  ) { }

  async ngOnInit() {
    try {
      const { data, error } = await supabase
        .from('solicitud_puesto')
        .select(
          `*, 
          puesto:puestos(nombre), 
          usuario:profiles(full_name, email)`
        )
        .eq('id', this.solicitudId)
        .single();

      if (error) throw error;

      this.solicitud = data;

      // Ahora obtenemos el puesto completo
      if (this.solicitud?.puesto_id) {
        const { data: puestoData, error: puestoError } =
          await this.puestoService.getPuestoById(this.solicitud.puesto_id);

        if (puestoError) throw puestoError;
        this.puestoCompleto = puestoData?.[0] || null;
      }
    } catch (error) {
      console.error('Error al cargar la solicitud:', error);
      this.showAlert('Error al cargar la solicitud.');
    } finally {
      this.loading = false;
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async actualizarEstado(nuevoEstado: string) {
    try {
      // 1. Actualizar la solicitud
      const { error: solicitudError } = await supabase
        .from('solicitud_puesto')
        .update({ status: nuevoEstado })
        .eq('id', this.solicitudId);

      if (solicitudError) throw solicitudError;

      // 2. Actualizar el estado del puesto relacionado (estado_solicitud)
      if (this.solicitud?.puesto_id) {
        const { error: puestoError } = await supabase
          .from('puestos')
          .update({ estado_solicitud: nuevoEstado })
          .eq('id', this.solicitud.puesto_id);

        if (puestoError) throw puestoError;
      }

      this.showAlert(`Solicitud y puesto actualizados a "${nuevoEstado}".`);
      this.modalCtrl.dismiss(true);

    } catch (error) {
      console.error(`Error al actualizar estado:`, error);
      this.showAlert('Error al cambiar el estado de la solicitud o del puesto.');
    }
  }

  aceptarSolicitud() {
    this.actualizarEstado('aceptado');
  }

  rechazarSolicitud() {
    this.actualizarEstado('rechazado');
  }

  pendienteSolicitud() {
    this.actualizarEstado('pendiente');
  }

  async descargarDocumento() {
    if (!this.solicitud?.documento_url) {
      this.showAlert('No hay documento para descargar.');
      return;
    }

    this.descargando = true;
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .createSignedUrl(this.solicitud.documento_url, 300);

      if (error || !data?.signedUrl) throw error;

      const response = await fetch(data.signedUrl);
      if (!response.ok) throw new Error('Error al descargar archivo');

      const blob = await response.blob();
      const extension = this.solicitud.documento_url.split('.').pop()?.split('?')[0] || 'dat';
      const fileName = `solicitud_puesto_${this.solicitudId}.${extension}`;
      const base64Data = await this.blobToBase64(blob);

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

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
        resolve(dataUrl.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  }
}
