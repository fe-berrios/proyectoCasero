import { Injectable } from '@angular/core';
import { supabase } from '../supabase_client';

@Injectable({
  providedIn: 'root',
})
export class SolicitudCaseroService {
  async enviarSolicitud(data: {
    user_id: string;
    comentario: string;
    telefono: string;
    email: string;
  }) {
    const result = await supabase.from('solicitud_casero').insert([data]).select('*');
    return result;
  }

  async obtenerSolicitudes() {
    const { data, error } = await supabase
      .from('solicitud_casero')
      .select(`
      id,
      user_id,
      comentario,
      telefono,
      email,
      created_at,
      status,
      profiles:profiles!user_id(full_name, codigo_casero)
    `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }


  async obtenerSolicitudPorUserId(userId: string) {
    const { data, error } = await supabase
      .from('solicitud_casero')
      .select('id, user_id, comentario, telefono, email, created_at, status')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }
}
