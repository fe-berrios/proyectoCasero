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
      .select('id, user_id, comentario, telefono, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }
}
