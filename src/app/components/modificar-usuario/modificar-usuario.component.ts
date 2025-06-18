import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { supabase } from 'src/app/supabase_client';

@Component({
  standalone: false,
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.component.html',
  styleUrls: ['./modificar-usuario.component.scss'],
})
export class ModificarUsuarioComponent implements OnInit {
  @Input() userId!: string;

  usuario: any = {
    full_name: '',
    username: '',
    phone: '',
    admin_status: false,
    casero_status: false,
  };

  constructor(private modalCtrl: ModalController) {}

  async ngOnInit() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error) {
      console.error('Error al cargar usuario:', error.message);
      return;
    }

    this.usuario = data;
  }

  async guardarCambios() {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: this.usuario.full_name,
        username: this.usuario.username,
        phone: this.usuario.phone,
        admin_status: this.usuario.admin_status,
        casero_status: this.usuario.casero_status,
      })
      .eq('id', this.userId);

    if (error) {
      console.error('Error al guardar usuario:', error.message);
      return;
    }

    this.modalCtrl.dismiss({ recargar: true });
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
