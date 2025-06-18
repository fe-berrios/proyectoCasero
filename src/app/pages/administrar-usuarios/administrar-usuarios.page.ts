import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/app/supabase_client';

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

  async ngOnInit() {
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
      (user.username || '').toLowerCase().includes(term)
    );
  }
}
