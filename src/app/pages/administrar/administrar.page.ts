import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgregarFeriaModalComponent } from 'src/app/components/agregar-feria-modal/agregar-feria-modal.component';

@Component({
  standalone: false,
  selector: 'app-administrar',
  templateUrl: './administrar.page.html',
  styleUrls: ['./administrar.page.scss'],
})
export class AdministrarPage {
  constructor(private modalCtrl: ModalController) {}

  async abrirModalAgregarFeria() {
    const modal = await this.modalCtrl.create({
      component: AgregarFeriaModalComponent,
    });
    await modal.present();
  }
}
