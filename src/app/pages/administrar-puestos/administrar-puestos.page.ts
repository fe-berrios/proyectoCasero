import { Component, OnInit } from '@angular/core';
import { PuestoService } from 'src/app/services/puesto.service';
import { ModalController } from '@ionic/angular';
import { AgregarPuestoModalComponent } from 'src/app/components/agregar-puesto-modal/agregar-puesto-modal.component';

@Component({
  standalone: false,
  selector: 'app-administrar-puestos',
  templateUrl: './administrar-puestos.page.html',
  styleUrls: ['./administrar-puestos.page.scss'],
})
export class AdministrarPuestosPage implements OnInit {
  puestos: any[] = [];

  feria_id = 1;  // Asigna aquí el ID de feria que corresponda

  constructor(
    private puestoService: PuestoService,
    private modalCtrl: ModalController  // Inyecta ModalController aquí
  ) {}

  async ngOnInit() {
    await this.cargarPuestos();
  }

  async cargarPuestos() {
    const { data, error } = await this.puestoService.getPuestosByFeria(this.feria_id);  // Mejor filtrar por feria
    if (error) {
      console.error('Error al cargar puestos:', error);
      return;
    }
    this.puestos = data ?? [];
  }

  async openAgregarPuestoModal() {
    const modal = await this.modalCtrl.create({
      component: AgregarPuestoModalComponent,
      componentProps: {
        feria_id: this.feria_id,
      },
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      await this.cargarPuestos();
    }
  }
}
