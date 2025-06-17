import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgregarPuestoModalComponent } from 'src/app/components/agregar-puesto-modal/agregar-puesto-modal.component';
import { EditarPuestoModalComponent } from 'src/app/components/editar-puesto-modal/editar-puesto-modal.component';
import { supabase } from 'src/app/supabase_client';

@Component({
  standalone: false,
  selector: 'app-panel-casero',
  templateUrl: './panel-casero.page.html',
  styleUrls: ['./panel-casero.page.scss'],
})
export class PanelCaseroPage implements OnInit {
  puestos: any[] = [];
  codigoCasero: string | null = null;

  constructor(private modalCtrl: ModalController) {}

  async ngOnInit() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error('Error obteniendo usuario:', userError);
      return;
    }

    const userId = userData.user.id;

    // Obtener el perfil con codigo_casero
    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('codigo_casero')
      .eq('id', userId)
      .single();

    if (perfilError || !perfil?.codigo_casero) {
      console.error('Error obteniendo perfil:', perfilError);
      return;
    }

    this.codigoCasero = perfil.codigo_casero;
    await this.cargarMisPuestos();
  }

  async cargarMisPuestos() {
    if (!this.codigoCasero) return;

    const { data, error } = await supabase
      .from('puestos')
      .select('*')
      .eq('casero_id', this.codigoCasero)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al cargar mis puestos:', error);
      return;
    }

    this.puestos = data ?? [];
  }

  async eliminarPuesto(id: number) {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este puesto?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('puestos').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar el puesto:', error);
      alert('No se pudo eliminar el puesto.');
    } else {
      alert('Puesto eliminado con éxito.');
      await this.cargarMisPuestos();
    }
  }

  async abrirModalEditarPuesto(puesto: any) {
    const modal = await this.modalCtrl.create({
      component: EditarPuestoModalComponent,
      componentProps: { puesto },
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'confirm') {
      await this.cargarMisPuestos();
    }
  }

  async openAgregarPuestoModal() {
    const modal = await this.modalCtrl.create({
      component: AgregarPuestoModalComponent,
      componentProps: {
        casero_id: this.codigoCasero, // importante: pasar codigo_casero, no user ID
      },
    });
    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      await this.cargarMisPuestos();
    }
  }
}
