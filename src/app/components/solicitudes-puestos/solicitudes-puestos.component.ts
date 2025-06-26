import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { supabase } from 'src/app/supabase_client';

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

  constructor(private modalCtrl: ModalController) {}

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

  abrirModal(id: number) {
    console.log('Abrir modal con solicitud id:', id);
    // Aquí implementa el modal para detalles si tienes
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
