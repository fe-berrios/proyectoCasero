import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgregarFeriaModalComponent } from 'src/app/components/agregar-feria-modal/agregar-feria-modal.component';
import { FeriaService } from 'src/app/services/feria.service';
import { EditarFeriaModalComponent } from 'src/app/components/editar-feria-modal/editar-feria-modal.component';

@Component({
  standalone: false,
  selector: 'app-administrar',
  templateUrl: './administrar.page.html',
  styleUrls: ['./administrar.page.scss'],
})
export class AdministrarPage implements OnInit, OnDestroy {
  ferias: any[] = [];
  subscriptionChannel: any;

  constructor(private modalCtrl: ModalController, private feriaService: FeriaService) { }

  async ngOnInit() {
    await this.cargarFerias();

    // Subscribirse a cambios en tiempo real
    this.subscriptionChannel = this.feriaService.subscribeToFerias((nuevaFeria) => {
      this.ferias.push(nuevaFeria);
    });
  }

  ngOnDestroy() {
    if (this.subscriptionChannel) {
      this.feriaService.unsubscribeFromFerias(this.subscriptionChannel);
    }
  }

  async cargarFerias() {
    const { data, error } = await this.feriaService.getFerias();
    if (error) {
      console.error('Error al cargar ferias:', error);
      return;
    }
    this.ferias = data ?? [];
  }

  async abrirModalAgregarFeria() {
    const modal = await this.modalCtrl.create({
      component: AgregarFeriaModalComponent,
    });
    await modal.present();

    // Recargar ferias cuando se cierre el modal (para actualizar la tabla)
    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm') {
      await this.cargarFerias();
    }
  }

  async abrirModalEditarFeria(feria: any) {
    const modal = await this.modalCtrl.create({
      component: EditarFeriaModalComponent,
      componentProps: {
        feria: feria
      }
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'confirm' || role === 'true') {
      await this.cargarFerias();
    }
  }

  async eliminarFeria(id: number) {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta feria?');
    if (!confirmDelete) return;

    const { error } = await this.feriaService.deleteFeria(id);
    if (error) {
      console.error('Error al eliminar la feria:', error);
      alert('No se pudo eliminar la feria.');
    } else {
      alert('Feria eliminada con éxito.');
      await this.cargarFerias(); // Recargar lista después de eliminar
    }
  }

}
