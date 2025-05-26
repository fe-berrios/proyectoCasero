import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { supabase } from 'src/app/supabase_client';

@Component({
  standalone: false,
  selector: 'app-editar-puesto-modal',
  templateUrl: './editar-puesto-modal.component.html',
  styleUrls: ['./editar-puesto-modal.component.scss'],
})
export class EditarPuestoModalComponent implements OnInit {
  @Input() puesto: any;

  nombre = '';
  descripcion = '';
  casero_id = '';
  img_url = '';
  ubicacion = '';
  feria_id: number | null = null;

  ferias: any[] = [];
  feriasFiltradas: any[] = [];
  filtroFerias = '';
  isAccordionOpen = false;

  constructor(
    private modalCtrl: ModalController,
    private puestoService: PuestoService
  ) {}

  async ngOnInit() {
    this.nombre = this.puesto.nombre;
    this.descripcion = this.puesto.descripcion;
    this.casero_id = this.puesto.casero_id;
    this.img_url = this.puesto.img_url;
    this.ubicacion = this.puesto.ubicacion;
    this.feria_id = this.puesto.feria_id;

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

  async editarPuesto() {
    if (!this.nombre || !this.feria_id) {
      alert('Por favor completa el nombre y selecciona una feria.');
      return;
    }

    const { error } = await this.puestoService.updatePuesto(
      this.puesto.id,
      this.nombre,
      this.descripcion,
      this.feria_id,
      this.casero_id,
      this.img_url,
      this.ubicacion
    );

    if (error) {
      alert('Error al actualizar el puesto: ' + error.message);
    } else {
      alert('Puesto actualizado con éxito');
      this.modalCtrl.dismiss(true, 'confirm');
    }
  }
}
