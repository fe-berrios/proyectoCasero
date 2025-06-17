import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { supabase } from 'src/app/supabase_client';

@Component({
  standalone: false,
  selector: 'app-agregar-puesto-modal',
  templateUrl: './agregar-puesto-modal.component.html',
  styleUrls: ['./agregar-puesto-modal.component.scss'],
})
export class AgregarPuestoModalComponent implements OnInit {

  nombre = '';
  descripcion = '';
  casero_id = '';
  img_url = '';
  ubicacion = '';
  feria_id: number | null = null;

  ferias: any[] = [];
  feriasFiltradas: any[] = [];
  filtroFerias = '';

  tiposDisponibles = ['Frutas', 'Verduras', 'Abarrotes', 'Ropa', 'Otros'];
  tiposSeleccionados: string[] = [];

  isAccordionOpen = false;
  isTiposAccordionOpen = false;

  constructor(
    private modalCtrl: ModalController,
    private puestoService: PuestoService
  ) { }

  async ngOnInit() {
    await this.cargarFerias();
  }

  async cargarFerias() {
    const { data, error } = await supabase.from('ferias').select('id, nombre');
    if (error) {
      console.error('Error al cargar ferias:', error);
      return;
    }
    this.ferias = data ?? [];
    this.feriasFiltradas = this.ferias;
  }

  actualizarFiltro(event: any) {
    const valor = event.target.value?.toLowerCase() || '';
    this.feriasFiltradas = this.ferias.filter(f => f.nombre.toLowerCase().includes(valor));
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  toggleTiposAccordion() {
    this.isTiposAccordionOpen = !this.isTiposAccordionOpen;
  }

  toggleTipoProducto(tipo: string) {
    const index = this.tiposSeleccionados.indexOf(tipo);
    if (index > -1) {
      this.tiposSeleccionados.splice(index, 1);
    } else {
      this.tiposSeleccionados.push(tipo);
    }
  }

  seleccionarFeria(feria: any) {
    this.feria_id = feria.id;
    this.isAccordionOpen = false;
    this.filtroFerias = '';
    this.feriasFiltradas = this.ferias;
  }

  get nombreFeriaSeleccionada(): string {
    const feria = this.ferias.find(f => f.id === this.feria_id);
    return feria ? feria.nombre : 'No seleccionada';
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async savePuesto() {
    if (!this.nombre || !this.feria_id) {
      alert('Por favor completa el nombre y selecciona una feria.');
      return;
    }

    const tipo_productos = this.tiposSeleccionados.join(' - '); // <-- Concatenar tipos

    const { error } = await this.puestoService.savePuesto(
      this.nombre,
      this.descripcion,
      this.feria_id,
      this.casero_id,
      this.img_url,
      this.ubicacion,
      tipo_productos
    );

    if (error) {
      alert('Error al guardar el puesto: ' + error.message);
    } else {
      alert('Puesto guardado con éxito');
      this.modalCtrl.dismiss(true, 'confirm');
    }
  }
}
