import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FeriaService } from 'src/app/services/feria.service';
import { PlaceSelectorModalComponent } from '../place-selector-modal/place-selector-modal.component';

type CampoHora = 'horaInicioHora' | 'horaInicioMinuto' | 'horaTerminoHora' | 'horaTerminoMinuto';

@Component({
  standalone: false,
  selector: 'app-agregar-feria-modal',
  templateUrl: './agregar-feria-modal.component.html',
  styleUrls: ['./agregar-feria-modal.component.scss'],
})
export class AgregarFeriaModalComponent {
  nombre = '';
  lat: number | null = null;
  lng: number | null = null;

  dia: string[] = [];

  // Cambiados a string
  horaInicioHora: string = '00';
  horaInicioMinuto: string = '00';
  horaTerminoHora: string = '00';
  horaTerminoMinuto: string = '00';

  errorHoraInicio = '';
  errorHoraTermino = '';

  showDiasDropdown = false;

  diasSemana = [
    { label: 'lun', value: 'lun' },
    { label: 'mar', value: 'mar' },
    { label: 'mie', value: 'mie' },
    { label: 'jue', value: 'jue' },
    { label: 'vie', value: 'vie' },
    { label: 'sab', value: 'sab' },
    { label: 'dom', value: 'dom' },
  ];

  constructor(private modalCtrl: ModalController, private feriaService: FeriaService) { }

  async openPlaceSelectorModal() {
    const modal = await this.modalCtrl.create({
      component: PlaceSelectorModalComponent,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.lat = data.lat;
      this.lng = data.lng;
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  toggleDiasDropdown() {
    this.showDiasDropdown = !this.showDiasDropdown;
  }

  isDiaSelected(dia: string): boolean {
    return this.dia.includes(dia);
  }

  toggleDia(dia: string, event: any) {
    if (event.detail.checked) {
      if (!this.dia.includes(dia)) {
        this.dia.push(dia);
      }
    } else {
      this.dia = this.dia.filter(d => d !== dia);
    }
  }

  validarHoras() {
    this.errorHoraInicio = '';
    this.errorHoraTermino = '';

    const inicioHora = parseInt(this.horaInicioHora, 10);
    const inicioMin = parseInt(this.horaInicioMinuto, 10);
    const terminoHora = parseInt(this.horaTerminoHora, 10);
    const terminoMin = parseInt(this.horaTerminoMinuto, 10);

    if (
      isNaN(inicioHora) || isNaN(inicioMin) ||
      inicioHora < 0 || inicioHora > 23 ||
      inicioMin < 0 || inicioMin > 59
    ) {
      this.errorHoraInicio = 'Hora de inicio inválida (HH: 0-23, MM: 0-59)';
    }

    if (
      isNaN(terminoHora) || isNaN(terminoMin) ||
      terminoHora < 0 || terminoHora > 23 ||
      terminoMin < 0 || terminoMin > 59
    ) {
      this.errorHoraTermino = 'Hora de término inválida (HH: 0-23, MM: 0-59)';
    }

    if (!this.errorHoraInicio && !this.errorHoraTermino) {
      const inicio = inicioHora * 60 + inicioMin;
      const termino = terminoHora * 60 + terminoMin;

      if (termino <= inicio) {
        this.errorHoraTermino = 'La hora de término debe ser después de la hora de inicio.';
      }
    }

    return !this.errorHoraInicio && !this.errorHoraTermino;
  }

  async saveFeria() {
    if (!this.nombre || this.lat === null || this.lng === null || this.dia.length === 0) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (!this.validarHoras()) return;

    const hora_inicio = `${this.horaInicioHora.padStart(2, '0')}:${this.horaInicioMinuto.padStart(2, '0')}`;
    const hora_termino = `${this.horaTerminoHora.padStart(2, '0')}:${this.horaTerminoMinuto.padStart(2, '0')}`;
    const diasConcatenados = this.dia.join(' - ');

    const { error } = await this.feriaService.saveFeria(
      this.nombre,
      this.lat,
      this.lng,
      hora_inicio,
      hora_termino,
      diasConcatenados
    );

    if (error) {
      console.error('Error al guardar la feria:', error);
      alert('Error al guardar la feria');
    } else {
      alert('Feria guardada con éxito');
      this.modalCtrl.dismiss(true, 'confirm');
    }
  }

  //Método seguro para formatear valores de hora a "00"
  formatearHora(campo: CampoHora) {
    const valor = parseInt(this[campo], 10);

    if (!isNaN(valor)) {
      this[campo] = valor.toString().padStart(2, '0');
    } else {
      this[campo] = '00';
    }
  }
}
