import { Injectable } from '@angular/core'
import { supabase } from '../supabase_client'
import { SupabaseService } from './supabase.service'

@Injectable({
  providedIn: 'root',
})
export class ComentarFeriaService {
  constructor(private supabaseService: SupabaseService) { }

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

  async reaccionarComentario(comentario_id: number, tipo: 'like' | 'dislike') {
    const user = await this.supabaseService.user
    if (!user) throw new Error('Usuario no autenticado')

    const { data: existente, error: fetchError } = await supabase
      .from('reacciones_comentario')
      .select('id, tipo')
      .eq('usuario_id', user.id)
      .eq('comentario_id', comentario_id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows found → eso no es error crítico
      throw fetchError
    }

    if (!existente) {
      // no existe reacción → insertar
      const { error: insertError } = await supabase
        .from('reacciones_comentario')
        .insert({
          usuario_id: user.id,
          comentario_id,
          tipo,
        })

      if (insertError) throw insertError
    } else if (existente.tipo !== tipo) {
      // ya existe con tipo distinto → actualizar
      const { error: updateError } = await supabase
        .from('reacciones_comentario')
        .update({ tipo })
        .eq('id', existente.id)

      if (updateError) throw updateError
    }
    // si ya existe con el mismo tipo, no hacemos nada
  }

}
