import { Injectable } from '@angular/core';
import { supabase } from '../supabase_client';

@Injectable({
  providedIn: 'root',
})
export class FeriaService {

  // Guardar una feria en la base de datos (sin calificación, sigue igual)
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

  // Actualizar feria por id (sin calificación, sigue igual)
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

  // Eliminar una feria por id (sin calificación, sigue igual)
  async deleteFeria(id: number) {
    return supabase
      .from('ferias')
      .delete()
      .eq('id', id);
  }

  // Obtener todas las ferias con calificación desde la vista
  async getFerias() {
    return supabase.from('feria_con_calificacion').select('*');
  }

  // Obtener una feria por id con calificación desde la vista
  async getFeriaById(id: number) {
    return supabase.from('feria_con_calificacion').select('*').eq('id', id).single();
  }

  // Suscribirse a cambios en tiempo real en la tabla de ferias (esto sigue con la tabla real)
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

  // Agregar o quitar feria de favoritos
  async toggleFeriaFavorita(userId: string, feriaId: number, isFavorita: boolean) {
    if (isFavorita) {
      // Quitar de favoritos
      return supabase
        .from('ferias_fav')
        .delete()
        .eq('user_id', userId)
        .eq('feria_id', feriaId);
    } else {
      // Agregar a favoritos
      return supabase
        .from('ferias_fav')
        .insert([{ user_id: userId, feria_id: feriaId }]);
    }
  }

  // Consultar si la feria es favorita del usuario
  async esFeriaFavorita(userId: string, feriaId: number) {
    const { data, error } = await supabase
      .from('ferias_fav')
      .select('id')
      .eq('user_id', userId)
      .eq('feria_id', feriaId)
      .single();
    return !!data;
  }
}
