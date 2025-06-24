import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { SolicitudCaseroService } from 'src/app/services/solicitud-casero.service';

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

  constructor(
    private modalCtrl: ModalController,
    private supabaseService: SupabaseService,
    private solicitudService: SolicitudCaseroService
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
}
