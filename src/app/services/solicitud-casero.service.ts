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
    return supabase.from('solicitud_casero').insert([data]);
  }
}
