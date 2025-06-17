import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuestoService } from 'src/app/services/puesto.service';
import { PuestoDetalleModalComponent } from '../puesto-detalle-modal/puesto-detalle-modal.component';
import { ComentarFeriaComponent } from '../comentar-feria/comentar-feria.component';
import { supabase } from 'src/app/supabase_client'; // Asegúrate de que la ruta sea correcta




@Component({
  standalone: false,
  selector: 'app-feria-modal',
  templateUrl: './feria-modal.component.html',
  styleUrls: ['./feria-modal.component.scss'],
})
export class FeriaModalComponent {
  @Input() feria: any;
  puestos: any[] = [];
  isAccordionOpen = false;
  isComentariosAccordionOpen = true; // Abierto por defecto
  comentarios: any[] = [];
  constructor(private modalCtrl: ModalController, private puestoService: PuestoService
  ) { }

  async ngOnInit() {
    await this.cargarPuestos();
    await this.cargarComentarios();
  }

  toggleComentariosAccordion() {
    this.isComentariosAccordionOpen = !this.isComentariosAccordionOpen;
  }


  async cargarComentarios() {
    const { data, error } = await supabase
      .from('comentarios_feria')
      .select('comentario, created_at, usuario_id, profiles(full_name, avatar_url)')
      .eq('feria_id', this.feria.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando comentarios:', error);
      return;
    }

    this.comentarios = data.map((c: any) => ({
      comentario: c.comentario,
      created_at: c.created_at,
      usuario_id: c.usuario_id,
      full_name: c.profiles?.full_name ?? 'Anónimo',
      avatar_url: c.profiles?.avatar_url ?? null,
    }));
  }



  async abrirModalComentario() {
    const modal = await this.modalCtrl.create({
      component: ComentarFeriaComponent,
      componentProps: {
        feriaId: this.feria.id
      }
    })

    await modal.present()

    const { data } = await modal.onDidDismiss()
    if (data?.recargar) {
      this.cargarComentarios() // Esta función debes implementarla si no existe aún
    }
  }

  async abrirModalDetallePuesto(puestoId: number) {
    const modal = await this.modalCtrl.create({
      component: PuestoDetalleModalComponent,
      componentProps: {
        puestoId: puestoId
      },
    });
    return await modal.present();
  }

  async cargarPuestos() {
    if (!this.feria?.id) return;
    const { data, error } = await this.puestoService.getPuestosByFeria(this.feria.id);
    if (error) {
      console.error('Error al cargar puestos:', error.message);
      return;
    }
    this.puestos = data ?? [];
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}