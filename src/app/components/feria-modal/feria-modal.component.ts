import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-feria-modal',
  templateUrl: './feria-modal.component.html',
  styleUrls: ['./feria-modal.component.scss'],
})
export class FeriaModalComponent {
  @Input() feria: any;

  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }
}