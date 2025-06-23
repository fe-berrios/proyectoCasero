import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { supabase } from 'src/app/supabase_client';
import { Session } from '@supabase/supabase-js';

@Component({
  standalone: false,
  selector: 'app-solicitud-puesto-modal',
  templateUrl: './solicitud-puesto-modal.component.html',
  styleUrls: ['./solicitud-puesto-modal.component.scss'],
})
export class SolicitudPuestoModalComponent implements OnInit {
  nombre = '';
  descripcion = '';
  casero_id = '';
  img_url = '';
  ubicacion = '';
  feria_id: number | null = null;
  comentario = '';
  documento: File | null = null;

  ferias: any[] = [];
  feriasFiltradas: any[] = [];
  filtroFerias = '';

  tiposDisponibles = ['Frutas', 'Verduras', 'Abarrotes', 'Ropa', 'Otros'];
  tiposSeleccionados: string[] = [];

  isAccordionOpen = false;
  isTiposAccordionOpen = false;

  user_id: string = '';

  constructor(private modalCtrl: ModalController) { }

  async ngOnInit() {
    await this.cargarFerias();
    const { data: { session } } = await supabase.auth.getSession();
    this.user_id = session?.user?.id || '';
  }

  async cargarFerias() {
    const { data, error } = await supabase.from('ferias').select('id, nombre');
    if (!error) {
      this.ferias = data ?? [];
      this.feriasFiltradas = this.ferias;
    }
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
    if (index > -1) this.tiposSeleccionados.splice(index, 1);
    else this.tiposSeleccionados.push(tipo);
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.documento = file || null;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async enviarSolicitud() {
    if (!this.nombre || !this.feria_id || !this.documento) {
      alert('Completa todos los campos obligatorios y selecciona un archivo.');
      return;
    }

    const tipo_productos = this.tiposSeleccionados.join(' -');

    // 1. Subir el documento
    const fileExt = this.documento.name.split('.').pop();
    const filePath = `${this.user_id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, this.documento);

    if (uploadError) {
      alert('Error al subir el documento: ' + uploadError.message);
      return;
    }

    // 2. Insertar el puesto como pendiente
    const { data: puestoData, error: puestoError } = await supabase
      .from('puestos')
      .insert({
        nombre: this.nombre,
        descripcion: this.descripcion,
        feria_id: this.feria_id,
        casero_id: this.casero_id,
        img_url: this.img_url,
        ubicacion: this.ubicacion,
        tipo_productos
      })
      .select()
      .single();

    if (puestoError || !puestoData) {
      alert('Error al registrar el puesto.');
      return;
    }

    // 3. Insertar la solicitud (CORREGIDO aquí documento -> documento_url)
    const { error: solicitudError } = await supabase.from('solicitud_puesto').insert({
      puesto_id: puestoData.id,
      user_id: this.user_id,
      comentario: this.comentario,
      documento_url: filePath
    });

    if (solicitudError) {
      alert('Error al registrar la solicitud: ' + solicitudError.message);
    } else {
      alert('Solicitud enviada correctamente.');
      this.modalCtrl.dismiss(true, 'confirm');
    }
  }

  // Método para subir una imagen al storage de Supabase
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
