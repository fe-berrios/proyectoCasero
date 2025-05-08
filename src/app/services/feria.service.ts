import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeriaService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
  
  // Guardar una feria en la base de datos
  async saveFeria(nombre: string, lat: number, lng: number) {
    return this.supabase.from('ferias').insert([{ nombre, lat, lng }]);
  }
  
  // Obtener todas las ferias de la base de datos
  async getFerias() {
    return this.supabase.from('ferias').select('*');
  }
  
  // Suscribirse a cambios en tiempo real en la tabla de ferias
  subscribeToFerias(callback: (feria: any) => void) {
    const channel = this.supabase
      .channel('ferias-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ferias' },
        (payload) => callback(payload.new)
      )
      .subscribe();
      
    return channel;
  }
  
  // Método para cancelar la suscripción cuando ya no sea necesaria
  unsubscribeFromFerias(channel: any) {
    this.supabase.removeChannel(channel);
  }
}