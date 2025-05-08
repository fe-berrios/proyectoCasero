import { Component } from '@angular/core';
import { FeriaService } from 'src/app/services/feria.service';

@Component({
  standalone: false,
  selector: 'app-administrar',
  templateUrl: './administrar.page.html',
  styleUrls: ['./administrar.page.scss'],
})
export class AdministrarPage {
  nombre = '';
  lat = 0;
  lng = 0;

  constructor(private feriaService: FeriaService) {}

  async saveFeria() {
    if (!this.nombre || !this.lat || !this.lng) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const { error } = await this.feriaService.saveFeria(this.nombre, this.lat, this.lng);
    if (error) {
      console.error('Error al guardar la feria:', error);
      alert('Error al guardar la feria');
    } else {
      alert('Feria guardada con éxito');
      this.resetForm();
    }
  }

  resetForm() {
    this.nombre = '';
    this.lat = 0;
    this.lng = 0;
  }
}