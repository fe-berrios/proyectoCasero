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
    documento_url?: string; // se guarda como path interno
    run: number;
    dv: string;
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
        documento_url,
        created_at,
        status,
        run,
        dv,
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
      .select(`
      id,
      user_id,
      comentario,
      telefono,
      email,
      documento_url,
      created_at,
      status,
      run,
      dv,
      profiles:profiles!user_id(full_name, codigo_casero)
    `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }


  async subirDocumento(userId: string, file: File): Promise<{ path: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `solicitud_casero/${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) return { path: null, error: uploadError };

      return { path: filePath, error: null }; // solo se retorna el path interno
    } catch (e) {
      return { path: null, error: e };
    }
  }

  async obtenerUrlTemporal(path: string, expiresInSeconds = 120) {
    // expiresInSeconds: duración en segundos que la URL será válida (por defecto 60s)
    const { data, error } = await supabase.storage
      .from('documentos')
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      throw error;
    }

    return data?.signedUrl || null;
  }

}
