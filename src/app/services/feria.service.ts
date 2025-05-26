import { Injectable } from '@angular/core';
import { supabase } from '../supabase_client';

@Injectable({
  providedIn: 'root',
})
export class FeriaService {

  // Guardar una feria en la base de datos
  async saveFeria(
    nombre: string,
    lat: number,
    lng: number,
    hora_inicio: string,
    hora_termino: string,
    dia: string
  ) {
    return supabase.from('ferias').insert([
      {
        nombre,
        lat,
        lng,
        hora_inicio,
        hora_termino,
        dia,
      },
    ]);
  }

  // Actualizar feria por id
  async updateFeria(
    id: number,
    nombre: string,
    lat: number,
    lng: number,
    hora_inicio: string,
    hora_termino: string,
    dia: string
  ) {
    return supabase
      .from('ferias')
      .update({
        nombre,
        lat,
        lng,
        hora_inicio,
        hora_termino,
        dia
      })
      .eq('id', id);
  }

  // Eliminar una feria por id
  async deleteFeria(id: number) {
    return supabase
      .from('ferias')
      .delete()
      .eq('id', id);
  }

  // Obtener todas las ferias de la base de datos
  async getFerias() {
    return supabase.from('ferias').select('*');
  }

  // Obtener una feria por id
  async getFeriaById(id: number) {
    return supabase.from('ferias').select('*').eq('id', id).single();
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

  // Cancelar la suscripción cuando ya no sea necesaria
  unsubscribeFromFerias(channel: any) {
    supabase.removeChannel(channel);
  }
}
