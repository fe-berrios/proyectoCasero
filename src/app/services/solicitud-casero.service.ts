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
    console.log('Enviando solicitud con:', data);
    const result = await supabase.from('solicitud_casero').insert([data]).select('*'); // Para obtener más feedback
    console.log('Resultado:', result);
    return result;
  }

}
