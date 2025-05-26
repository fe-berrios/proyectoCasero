import { Component, OnInit } from '@angular/core';
import { PuestoService } from 'src/app/services/puesto.service';

@Component({
  standalone: false,
  selector: 'app-administrar-puestos',
  templateUrl: './administrar-puestos.page.html',
  styleUrls: ['./administrar-puestos.page.scss'],
})
export class AdministrarPuestosPage implements OnInit {
  puestos: any[] = [];

  constructor(private puestoService: PuestoService) {}

  async ngOnInit() {
    await this.cargarPuestos();
  }

  async cargarPuestos() {
    const { data, error } = await this.puestoService.getPuestos();
    if (error) {
      console.error('Error al cargar puestos:', error);
      return;
    }
    this.puestos = data ?? [];
  }
}
