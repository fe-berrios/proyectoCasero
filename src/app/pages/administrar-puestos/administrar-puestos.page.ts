import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { AgregarPuestoModalComponent } from 'src/app/components/agregar-puesto-modal/agregar-puesto-modal.component';
import { EditarPuestoModalComponent } from 'src/app/components/editar-puesto-modal/editar-puesto-modal.component';
import { SolicitudesPuestosComponent } from 'src/app/components/solicitudes-puestos/solicitudes-puestos.component';
import { supabase } from 'src/app/supabase_client';

@Component({
  standalone: false,
  selector: 'app-administrar-puestos',
  templateUrl: './administrar-puestos.page.html',
  styleUrls: ['./administrar-puestos.page.scss'],
})
export class AdministrarPuestosPage implements OnInit {
  puestos: any[] = [];
  todosLosPuestos: any[] = [];

  ferias: any[] = [];
  feria_id: number | null = null;
  estadoSeleccionado: string = 'aceptado';

  constructor(
    private puestoService: PuestoService,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    await this.cargarFerias();
    await this.cargarPuestos();
  }

  async cargarFerias() {
    const { data, error } = await supabase.from('ferias').select('id, nombre');
    if (error) {
      console.error('Error al cargar ferias:', error);
      return;
    }
    this.ferias = data ?? [];
  }

  async cargarPuestos() {
    let data, error;

    if (this.feria_id === null) {
      ({ data, error } = await this.puestoService.getPuestos());
    } else {
      ({ data, error } = await this.puestoService.getPuestosByFeria(this.feria_id));
    }

    if (error) {
      console.error('Error al cargar puestos:', error);
      return;
    }

    this.todosLosPuestos = data ?? [];
    this.filtrarPuestosLocalmente();
  }

  filtrarPuestosLocalmente() {
    this.puestos = this.todosLosPuestos.filter(p => {
      const coincideEstado = this.estadoSeleccionado ? p.estado_solicitud === this.estadoSeleccionado : true;
      return coincideEstado;
    });
  }

  async eliminarPuesto(id: number) {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este puesto?');
    if (!confirmDelete) return;

    const { error } = await this.puestoService.deletePuesto(id);
    if (error) {
      console.error('Error al eliminar el puesto:', error);
      alert('No se pudo eliminar el puesto.');
    } else {
      alert('Puesto eliminado con éxito.');
      await this.cargarPuestos();
    }
  }

  async abrirModalEditarPuesto(puesto: any) {
    const modal = await this.modalCtrl.create({
      component: EditarPuestoModalComponent,
      componentProps: { puesto }
    });

    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'confirm') {
      await this.cargarPuestos();
    }
  }

  async openAgregarPuestoModal() {
    const modal = await this.modalCtrl.create({
      component: AgregarPuestoModalComponent,
      componentProps: {
        feria_id: this.feria_id,
      },
    });
    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      await this.cargarPuestos();
    }
  }

    async openSolicitudesPuestos() {
    const modal = await this.modalCtrl.create({
      component: SolicitudesPuestosComponent,
      componentProps: {
        feria_id: this.feria_id,
      },
    });
    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      await this.cargarPuestos();
    }
  }

  async onFeriaSeleccionada() {
    await this.cargarPuestos(); // se recargan los puestos y se aplica el filtro local de estado
  }

  onEstadoSeleccionado() {
    this.filtrarPuestosLocalmente(); // no hace falta recargar desde backend
  }
}
