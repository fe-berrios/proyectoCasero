import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { PuestoDetalleModalComponent } from '../puesto-detalle-modal/puesto-detalle-modal.component';
import { ComentarFeriaComponent } from '../comentar-feria/comentar-feria.component';



@Component({
  standalone: false,
  selector: 'app-feria-modal',
  templateUrl: './feria-modal.component.html',
  styleUrls: ['./feria-modal.component.scss'],
})
export class FeriaModalComponent {
  @Input() feria: any;
  puestos: any[] = [];
  isAccordionOpen = false;
  isComentariosAccordionOpen = true; // Abierto por defecto
  constructor(private modalCtrl: ModalController, private puestoService: PuestoService
  ) { }

  async ngOnInit() {
    await this.cargarPuestos();
  }

  toggleComentariosAccordion() {
    this.isComentariosAccordionOpen = !this.isComentariosAccordionOpen;
  }

  async abrirModalComentario() {
    const modal = await this.modalCtrl.create({
      component: ComentarFeriaComponent,
      componentProps: {
        feriaId: this.feria.id
      }
    });
    return await modal.present();
  }

  async abrirModalDetallePuesto(puestoId: number) {
    const modal = await this.modalCtrl.create({
      component: PuestoDetalleModalComponent,
      componentProps: {
        puestoId: puestoId
      },
    });
    return await modal.present();
  }

  async cargarPuestos() {
    if (!this.feria?.id) return;
    const { data, error } = await this.puestoService.getPuestosByFeria(this.feria.id);
    if (error) {
      console.error('Error al cargar puestos:', error.message);
      return;
    }
    this.puestos = data ?? [];
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}