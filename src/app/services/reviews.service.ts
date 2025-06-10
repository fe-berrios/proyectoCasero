import { Injectable } from '@angular/core'
import { supabase } from '../supabase_client'

export interface Review {
  id?: number
  user_id: string
  puesto_id: number
  created_at?: string
  updated_at?: string
  comentario: string
  calificacion: number
  likes?: number
  dislikes?: number
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {

  constructor() { }

  async getReviewsByPuestoId(puestoId: number): Promise<Review[]> {
    console.log('🔍 Buscando reviews para puestoId:', puestoId)
    console.log('🔎 Tipo de puestoId:', typeof puestoId)

    // Cargar todos para verificar existencia de datos
    const { data: allReviews, error: allError } = await supabase
      .from('reviews')
      .select('*')

    if (allError) {
      console.error('⚠️ Error al obtener todos los reviews:', allError)
    } else {
      console.log('📋 Todos los reviews en la tabla:', allReviews)
    }

    // Llamada real filtrando por puesto_id
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('puesto_id', puestoId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching reviews by puestoId:', error)
      return []
    }

    console.log('✅ Reviews obtenidos filtrando por puestoId:', data)

    return data ?? []
  }

  async addReview(review: Review): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])

    if (error) {
      console.error('❌ Error adding review:', error)
      return null
    }

    console.log('✅ Review añadida:', data)
    return data?.[0] ?? null
  }

  async getProfilesByIds(userIds: string[]): Promise<{ id: string, username: string, avatar_url: string }[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    if (error) {
      console.error('Error fetching profiles:', error)
      return []
    }
    if (!data) return []
    return data
  }

}
