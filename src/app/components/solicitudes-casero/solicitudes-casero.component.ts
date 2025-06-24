import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SolicitudCaseroService } from 'src/app/services/solicitud-casero.service';
import { SolicitudCaseroComponent } from '../solicitud-casero/solicitud-casero.component';

@Component({
  standalone: false,
  selector: 'app-solicitudes-casero',
  templateUrl: './solicitudes-casero.component.html',
  styleUrls: ['./solicitudes-casero.component.scss'],
})
export class SolicitudesCaseroComponent implements OnInit {
  solicitudes: any[] = [];
  todasLasSolicitudes: any[] = [];
  estadoSeleccionado: string | null = 'pendiente';

  constructor(
    private modalCtrl: ModalController,
    private solicitudService: SolicitudCaseroService
  ) { }

  async ngOnInit() {
    try {
      this.todasLasSolicitudes = await this.solicitudService.obtenerSolicitudes();
      this.filtrarSolicitudes();
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss({ recargar: true }, 'confirm');
  }


  async abrirModal(id: string) {
    const modal = await this.modalCtrl.create({
      component: SolicitudCaseroComponent,
      componentProps: { userId: id },
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data) {
        try {
          this.todasLasSolicitudes = await this.solicitudService.obtenerSolicitudes();
          this.filtrarSolicitudes();
        } catch (error) {
          console.error('Error al recargar solicitudes:', error);
        }
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
        s => (s.status || 'pendiente').toLowerCase() === estado
      );
    } else {
      this.solicitudes = [...this.todasLasSolicitudes];
    }
  }

}
