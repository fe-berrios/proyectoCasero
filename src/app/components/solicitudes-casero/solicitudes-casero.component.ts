import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SolicitudCaseroService } from 'src/app/services/solicitud-casero.service';

@Component({
  standalone: false,
  selector: 'app-solicitudes-casero',
  templateUrl: './solicitudes-casero.component.html',
  styleUrls: ['./solicitudes-casero.component.scss'],
})
export class SolicitudesCaseroComponent implements OnInit {
  solicitudes: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private solicitudService: SolicitudCaseroService
  ) {}

  async ngOnInit() {
    try {
      this.solicitudes = await this.solicitudService.obtenerSolicitudes();
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
