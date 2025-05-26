import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FeriaService } from 'src/app/services/feria.service';
import { PlaceSelectorModalComponent } from '../place-selector-modal/place-selector-modal.component';

@Component({
  standalone: false,
  selector: 'app-editar-feria-modal',
  templateUrl: './editar-feria-modal.component.html',
  styleUrls: ['./editar-feria-modal.component.scss'],
})
export class EditarFeriaModalComponent implements OnInit {
  @Input() feria: any;

  nombre = '';
  lat: number | null = null;
  lng: number | null = null;
  dia: string[] = [];

  horaInicioHora: number | null = 0;
  horaInicioMinuto: number | null = 0;
  horaTerminoHora: number | null = 0;
  horaTerminoMinuto: number | null = 0;

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

  constructor(private modalCtrl: ModalController, private feriaService: FeriaService) {}

  ngOnInit() {
    if (this.feria) {
      this.nombre = this.feria.nombre;
      this.lat = this.feria.lat;
      this.lng = this.feria.lng;

      // Parsear días separados por " - "
      this.dia = this.feria.dia ? this.feria.dia.split(' - ') : [];

      // Parsear horas "HH:MM"
      if (this.feria.hora_inicio) {
        const [hI, mI] = this.feria.hora_inicio.split(':');
        this.horaInicioHora = parseInt(hI, 10);
        this.horaInicioMinuto = parseInt(mI, 10);
      }

      if (this.feria.hora_termino) {
        const [hT, mT] = this.feria.hora_termino.split(':');
        this.horaTerminoHora = parseInt(hT, 10);
        this.horaTerminoMinuto = parseInt(mT, 10);
      }
    }
  }

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

    if (
      this.horaInicioHora === null || this.horaInicioMinuto === null ||
      this.horaInicioHora < 0 || this.horaInicioHora > 23 ||
      this.horaInicioMinuto < 0 || this.horaInicioMinuto > 59
    ) {
      this.errorHoraInicio = 'Hora de inicio inválida (HH: 0-23, MM: 0-59)';
    }

    if (
      this.horaTerminoHora === null || this.horaTerminoMinuto === null ||
      this.horaTerminoHora < 0 || this.horaTerminoHora > 23 ||
      this.horaTerminoMinuto < 0 || this.horaTerminoMinuto > 59
    ) {
      this.errorHoraTermino = 'Hora de término inválida (HH: 0-23, MM: 0-59)';
    }

    if (!this.errorHoraInicio && !this.errorHoraTermino) {
      const inicio = (this.horaInicioHora ?? 0) * 60 + (this.horaInicioMinuto ?? 0);
      const termino = (this.horaTerminoHora ?? 0) * 60 + (this.horaTerminoMinuto ?? 0);

      if (termino <= inicio) {
        this.errorHoraTermino = 'La hora de término debe ser después de la hora de inicio.';
      }
    }

    return !this.errorHoraInicio && !this.errorHoraTermino;
  }

  async updateFeria() {
    if (!this.nombre || this.lat === null || this.lng === null || this.dia.length === 0) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (!this.validarHoras()) return;

    const hora_inicio = `${this.horaInicioHora?.toString().padStart(2, '0')}:${this.horaInicioMinuto?.toString().padStart(2, '0')}`;
    const hora_termino = `${this.horaTerminoHora?.toString().padStart(2, '0')}:${this.horaTerminoMinuto?.toString().padStart(2, '0')}`;
    const diasConcatenados = this.dia.join(' - ');

    const { error } = await this.feriaService.updateFeria(
      this.feria.id,
      this.nombre,
      this.lat,
      this.lng,
      hora_inicio,
      hora_termino,
      diasConcatenados
    );

    if (error) {
      console.error('Error al actualizar la feria:', error);
      alert('Error al actualizar la feria');
    } else {
      alert('Feria actualizada con éxito');
      this.modalCtrl.dismiss(true);
    }
  }
}
