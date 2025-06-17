import { Injectable } from '@angular/core';
import { supabase } from '../supabase_client';

@Injectable({
  providedIn: 'root',
})
export class PuestoService {

  // Guardar un nuevo puesto
  async savePuesto(
    nombre: string,
    descripcion: string,
    feria_id: number,
    casero_id: string,
    img_url: string,
    ubicacion: string,
    tipo_productos: string
  ) {
    return supabase.from('puestos').insert([{
      nombre,
      descripcion,
      feria_id,
      casero_id,
      img_url,
      ubicacion,
      tipo_productos // <--- nuevo campo
    }]);
  }


  // Obtener todos los puestos
  async getPuestos() {
    return supabase.from('puestos').select('*');
  }

  // Obtener puestos por feria
  async getPuestosByFeria(feria_id: number) {
    return supabase.from('puestos').select('*').eq('feria_id', feria_id);
  }

  // Actualizar un puesto
  async updatePuesto(
    id: number,
    nombre: string,
    descripcion: string,
    feria_id: number,
    casero_id: string,
    img_url: string,
    ubicacion: string,
    tipo_productos: string // <--- nuevo campo
  ) {
    return supabase.from('puestos').update({
      nombre,
      descripcion,
      feria_id,
      casero_id,
      img_url,
      ubicacion,
      tipo_productos // <--- nuevo campo
    }).eq('id', id);
  }

  // Eliminar un puesto
  async deletePuesto(id: number) {
    return supabase.from('puestos').delete().eq('id', id);
  }

  // Suscripción a cambios en tiempo real (opcional)
  subscribeToPuestos(callback: (puesto: any) => void) {
    const channel = supabase
      .channel('puestos-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'puestos' },
        (payload) => callback(payload.new)
      )
      .subscribe();

    return channel;
  }

  // Obtener un puesto por su ID
  async getPuestoById(id: number) {
    return supabase.from('puestos').select('*').eq('id', id).limit(1);
  }

  unsubscribeFromPuestos(channel: any) {
    supabase.removeChannel(channel);
  }

  //subir imagen a Supabase Storage
  private bucket = 'ferias-images';

  async uploadImage(file: File): Promise<string | null> {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error al subir la imagen:', error.message);
      return null;
    }

    // Obtener la url pública sin error porque no la devuelve
    const { data: urlData } = supabase.storage.from(this.bucket).getPublicUrl(filePath);

    return urlData.publicUrl;
  }


}
