import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { FeriaService } from 'src/app/services/feria.service';  // Importa el servicio feria

@Component({
  standalone: false,
  selector: 'app-puesto-detalle-modal',
  templateUrl: './puesto-detalle-modal.component.html',
  styleUrls: ['./puesto-detalle-modal.component.scss'],
})
export class PuestoDetalleModalComponent implements OnInit {
  @Input() puestoId!: number;
  puesto: any;
  nombreFeria: string | null = null;  // Guarda el nombre de la feria

  constructor(
    private modalCtrl: ModalController,
    private puestoService: PuestoService,
    private feriaService: FeriaService   // Inyecta el servicio feria
  ) {}

  async ngOnInit() {
    await this.cargarPuesto();
  }

  async cargarPuesto() {
    const { data, error } = await this.puestoService.getPuestoById(this.puestoId);
    if (error) {
      console.error('Error al obtener detalles del puesto:', error.message);
      return;
    }
    if (data && data.length > 0) {
      this.puesto = data[0];
      if (this.puesto.feria_id) {
        await this.cargarNombreFeria(this.puesto.feria_id);
      }
    }
  }

  async cargarNombreFeria(feriaId: number) {
    const { data, error } = await this.feriaService.getFeriaById(feriaId);
    if (error) {
      console.error('Error al obtener nombre de feria:', error.message);
      this.nombreFeria = null;
      return;
    }
    this.nombreFeria = data?.nombre ?? null;
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
