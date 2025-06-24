import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupabaseService, Profile } from 'src/app/services/supabase.service';

@Component({
  standalone: false,
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.component.html',
  styleUrls: ['./modificar-usuario.component.scss'],
})
export class ModificarUsuarioComponent implements OnInit {
  @Input() userId!: string;

  usuario: Partial<Profile> = {
    full_name: '',
    username: '',
    phone: '',
    admin_status: false,
    casero_status: false,
    banned: false,  // Agregado
  };

  cargando = false;

  constructor(
    private modalCtrl: ModalController,
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit() {
    this.cargando = true;

    const { data, error } = await this.supabaseService.getProfileById(this.userId);

    if (error) {
      console.error('Error al cargar usuario:', error.message);
      await this.supabaseService.createNotice('No se pudo cargar el usuario');
    } else {
      this.usuario = data;
    }

    this.cargando = false;
  }

  async guardarCambios() {
    this.cargando = true;

    const { error } = await this.supabaseService.updateProfileById(this.userId, {
      full_name: this.usuario.full_name,
      username: this.usuario.username,
      phone: this.usuario.phone,
      admin_status: this.usuario.admin_status,
      casero_status: this.usuario.casero_status,
      banned: this.usuario.banned,  // Agregado
    });

    if (error) {
      console.error('Error al guardar usuario:', error.message);
      await this.supabaseService.createNotice('No se pudieron guardar los cambios');
    } else {
      await this.supabaseService.createNotice('Usuario actualizado correctamente');
      this.modalCtrl.dismiss({ recargar: true }, 'confirm');

    }

    this.cargando = false;
  }

  cerrarModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
