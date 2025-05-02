import { Component, OnInit } from '@angular/core';
import { FeriaService } from 'src/app/services/feria.service';
import { inject, runInInjectionContext } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  ferias: any[] = []; // Lista de ferias
  nuevaFeria: any = { id: '', name: '', location: '' }; // Modelo para crear una nueva feria

  constructor(private feriaService: FeriaService) {}

  ngOnInit() {
    this.obtenerFerias();
  }

  obtenerFerias() {
    this.feriaService.getFerias().subscribe((data) => {
      this.ferias = data;
    });
  }

  async crearFeria() {
    if (this.nuevaFeria.id && this.nuevaFeria.name && this.nuevaFeria.location) {
      try {
        const success = await this.feriaService.createFeria(this.nuevaFeria);
        if (success) {
          alert('Feria creada con éxito');
          this.nuevaFeria = { id: '', name: '', location: '' }; // Limpiar formulario
          this.obtenerFerias(); // Actualizar la lista de ferias
        } else {
          alert('Ya existe una feria con ese ID');
        }
      } catch (error) {
        console.error('Error al crear la feria:', error);
        alert('Ocurrió un error al crear la feria');
      }
    } else {
      alert('Por favor, completa todos los campos');
    }
  }

  eliminarFeria(id: string) {
    this.feriaService.deleteFeria(id).then(() => {
      alert('Feria eliminada con éxito');
    });
  }
}
