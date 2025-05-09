import { Injectable } from '@angular/core';
import { supabase } from '../supabase_client';

@Injectable({
  providedIn: 'root',
})
export class FeriaService {

  // Guardar una feria en la base de datos
  async saveFeria(nombre: string, lat: number, lng: number) {
    return supabase.from('ferias').insert([{ nombre, lat, lng }]);
  }

  // Obtener todas las ferias de la base de datos
  async getFerias() {
    return supabase.from('ferias').select('*');
  }

  // Suscribirse a cambios en tiempo real en la tabla de ferias
  subscribeToFerias(callback: (feria: any) => void) {
    const channel = supabase
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
    supabase.removeChannel(channel);
  }
}
