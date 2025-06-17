import { Injectable } from '@angular/core'
import { LoadingController, ToastController } from '@ionic/angular'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '../supabase_client'
import { isPlatform } from '@ionic/angular'

export interface Profile {
  username: string
  phone: string
  avatar_url: string
  full_name: string
  admin_status?: boolean
  codigo_casero?: string
  casero_status?: boolean  // <-- Agregado casero_status opcional
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  get user() {
    return supabase.auth.getUser().then(({ data }) => data?.user)
  }

  get session() {
    return supabase.auth.getSession().then(({ data }) => data?.session)
  }

  get profile() {
    return this.user
      .then((user) => user?.id)
      .then((id) =>
        supabase
          .from('profiles')
          .select(`username, full_name, phone, avatar_url, admin_status, codigo_casero, casero_status`) // <-- Agregado casero_status aquí
          .eq('id', id)
          .single()
      )
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  signIn(email: string) {
    const redirectTo = isPlatform('capacitor')
      ? 'casero://login'
      : `${window.location.origin}/login` // O tu ruta web deseada

    return supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    })
  }

  signOut() {
    return supabase.auth.signOut()
  }

  async updateProfile(profile: Profile) {
    const user = await this.user
    const update = {
      ...profile,
      id: user?.id,
      updated_at: new Date(),
    }

    return supabase.from('profiles').upsert(update)
  }

  downLoadImage(path: string) {
    return supabase.storage.from('avatars').download(path)
  }

  uploadAvatar(filePath: string, file: File) {
    return supabase.storage.from('avatars').upload(filePath, file)
  }

  async createNotice(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 5000 })
    await toast.present()
  }

  createLoader() {
    return this.loadingCtrl.create()
  }

  // Necesario para establecer la sesión desde un magic link en móviles
  setSession(access_token: string, refresh_token: string) {
    return supabase.auth.setSession({ access_token, refresh_token })
  }
}
