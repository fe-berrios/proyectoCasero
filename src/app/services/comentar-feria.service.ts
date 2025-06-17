import { Injectable } from '@angular/core'
import { supabase } from '../supabase_client'
import { SupabaseService } from './supabase.service'

@Injectable({
  providedIn: 'root',
})
export class ComentarFeriaService {
  constructor(private supabaseService: SupabaseService) {}

  async agregarComentario(feria_id: number, comentario: string) {
    const user = await this.supabaseService.user
    if (!user) throw new Error('Usuario no autenticado')

    const { error } = await supabase.from('comentarios_feria').insert([
      {
        feria_id,
        comentario,
        usuario_id: user.id,
        likes: 0,
        dislikes: 0,
      },
    ])
    if (error) throw error
  }
  
}
