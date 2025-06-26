import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { supabase } from 'src/app/supabase_client';
import { SolicitudPuestoDetalleComponent } from '../solicitud-puesto-detalle/solicitud-puesto-detalle.component';

@Component({
  standalone: false,
  selector: 'app-solicitudes-puestos',
  templateUrl: './solicitudes-puestos.component.html',
  styleUrls: ['./solicitudes-puestos.component.scss'],
})
export class SolicitudesPuestosComponent implements OnInit {
  solicitudes: any[] = [];
  todasLasSolicitudes: any[] = [];
  estadoSeleccionado: string | null = 'pendiente';

  constructor(private modalCtrl: ModalController) { }

  async ngOnInit() {
    await this.cargarSolicitudes();
    this.filtrarSolicitudes();
  }

  async cargarSolicitudes() {
    const { data, error } = await supabase
      .from('solicitud_puesto')
      .select(`
        id,
        status,
        created_at,
        puesto:puestos (
          nombre,
          feria:ferias (nombre)
        ),
        user:profiles (full_name)
      `);

    if (error) {
      console.error('Error al cargar solicitudes:', error);
      this.todasLasSolicitudes = [];
    } else {
      this.todasLasSolicitudes = data || [];
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss({ recargar: true }, 'confirm');
  }

  async abrirModal(id: number) {
    const modal = await this.modalCtrl.create({
      component: SolicitudPuestoDetalleComponent,
      componentProps: { solicitudId: id },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.recargar) {
        // Aquí puedes recargar la lista de solicitudes si quieres
        this.cargarSolicitudes();
      }
    });

    await modal.present();
  }

  onEstadoSeleccionado() {
    this.filtrarSolicitudes();
  }

  filtrarSolicitudes() {
    if (this.estadoSeleccionado) {
      const estado = this.estadoSeleccionado.toLowerCase();
      this.solicitudes = this.todasLasSolicitudes.filter(
        (s) => (s.status || 'pendiente').toLowerCase() === estado
      );
    } else {
      this.solicitudes = [...this.todasLasSolicitudes];
    }
  }
}
