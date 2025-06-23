import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/app/supabase_client';
import { ModalController } from '@ionic/angular';
import { ModificarUsuarioComponent } from 'src/app/components/modificar-usuario/modificar-usuario.component';
import { SolicitudesCaseroComponent } from 'src/app/components/solicitudes-casero/solicitudes-casero.component';

@Component({
  standalone: false,
  selector: 'app-administrar-usuarios',
  templateUrl: './administrar-usuarios.page.html',
  styleUrls: ['./administrar-usuarios.page.scss'],
})
export class AdministrarUsuariosPage implements OnInit {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  searchTerm: string = '';

  constructor(private modalCtrl: ModalController) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        phone,
        casero_status,
        admin_status,
        codigo_casero
      `)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error al cargar usuarios:', error.message);
      return;
    }

    this.usuarios = data || [];
    this.usuariosFiltrados = [...this.usuarios];
  }

  filtrarUsuarios() {
    const term = this.searchTerm.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(user =>
      (user.full_name || '').toLowerCase().includes(term) ||
      (user.username || '').toLowerCase().includes(term) ||
      (user.codigo_casero || '').toLowerCase().includes(term)
    );
  }

  async abrirModal(id: string) {
    const modal = await this.modalCtrl.create({
      component: ModificarUsuarioComponent,
      componentProps: { userId: id }, // ✅ corrección clave
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.cargarUsuarios(); // recarga lista si hubo cambios
      }
    });

    await modal.present();
  }

      async openSolicitudesCasero() {
      const modal = await this.modalCtrl.create({
        component: SolicitudesCaseroComponent,
      });
      await modal.present();
  
      const { role } = await modal.onWillDismiss();
      if (role === 'confirm') {
        await this.cargarUsuarios();
      }
    }
}
