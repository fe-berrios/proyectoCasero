import { Injectable } from '@angular/core';
import { supabase } from '../supabase_client';

@Injectable({
  providedIn: 'root',
})
export class FeriaService {

  // Guardar una feria en la base de datos (ahora con comuna y calle_principal)
  async saveFeria(
    nombre: string,
    lat: number,
    lng: number,
    hora_inicio: string,
    hora_termino: string,
    dia: string,
    comuna: string,
    calle_principal: string
  ) {
    return supabase.from('ferias').insert([
      {
        nombre,
        lat,
        lng,
        hora_inicio,
        hora_termino,
        dia,
        comuna,
        calle_principal
      },
    ]);
  }

  // Actualizar feria por id (ahora con comuna y calle_principal)
  async updateFeria(
    id: number,
    nombre: string,
    lat: number,
    lng: number,
    hora_inicio: string,
    hora_termino: string,
    dia: string,
    comuna: string,
    calle_principal: string
  ) {
    return supabase
      .from('ferias')
      .update({
        nombre,
        lat,
        lng,
        hora_inicio,
        hora_termino,
        dia,
        comuna,
        calle_principal
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

  // Obtener todas las ferias con calificación desde la vista (usa select('*') para evitar errores si la vista no tiene los campos nuevos)
  async getFerias() {
    return supabase.from('feria_con_calificacion').select('*');
  }

  // Obtener una feria por id con calificación desde la vista (usa select('*'))
  async getFeriaById(id: number) {
    return supabase.from('feria_con_calificacion').select('*').eq('id', id).single();
  }

  // Obtener una feria por id directamente de la tabla ferias (todos los campos)
  async getFeriaRawById(id: number) {
    return supabase.from('ferias').select('*').eq('id', id).single();
  }

  // Obtener todas las ferias directamente de la tabla ferias (todos los campos)
  async getFeriasRaw() {
    return supabase.from('ferias').select('*');
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

  // Obtener las ferias favoritas del usuario autenticado
  async getFeriasFavoritas(userId: string) {
    return supabase
      .from('ferias_fav')
      .select('feria_id, feria_con_calificacion:feria_id(*)')
      .eq('user_id', userId);
  }
}
