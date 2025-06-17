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

  tipo_productos = ''; // original
  tiposDisponibles = ['Frutas', 'Verduras', 'Abarrotes', 'Ropa', 'Otros'];
  tiposSeleccionados: string[] = [];

  ferias: any[] = [];
  feriasFiltradas: any[] = [];
  filtroFerias = '';
  isAccordionOpen = false;
  isTiposAccordionOpen = false;

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

    this.tipo_productos = this.puesto.tipo_productos || '';
    this.tiposSeleccionados = this.tipo_productos
      ? this.tipo_productos.split(' - ').map(t => t.trim())
      : [];

    await this.cargarFerias();
  }

  toggleTipoProducto(tipo: string) {
    const index = this.tiposSeleccionados.indexOf(tipo);
    if (index > -1) {
      this.tiposSeleccionados.splice(index, 1);
    } else {
      this.tiposSeleccionados.push(tipo);
    }
  }

  toggleTiposAccordion() {
    this.isTiposAccordionOpen = !this.isTiposAccordionOpen;
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
    this.feriasFiltradas = this.ferias.filter(f =>
      f.nombre.toLowerCase().includes(valor)
    );
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

    const tipo_productos = this.tiposSeleccionados.join(' - ');

    const { error } = await this.puestoService.updatePuesto(
      this.puesto.id,
      this.nombre,
      this.descripcion,
      this.feria_id,
      this.casero_id,
      this.img_url,
      this.ubicacion,
      tipo_productos
    );

    if (error) {
      alert('Error al actualizar el puesto: ' + error.message);
    } else {
      alert('Puesto actualizado con éxito');
      this.modalCtrl.dismiss(true, 'confirm');
    }
  }

  async subirImagen(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const bucket = 'imagenes-puestos';
    const filePath = `puestos/${Date.now()}_${archivo.name}`;

    console.log('Subiendo imagen:', filePath);

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, archivo);

    if (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen: ' + JSON.stringify(error));
      return;
    }

    const publicUrlData = supabase.storage.from(bucket).getPublicUrl(filePath);
    this.img_url = publicUrlData.data.publicUrl;
  }
}
