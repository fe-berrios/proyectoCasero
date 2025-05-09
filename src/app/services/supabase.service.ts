import { Injectable } from '@angular/core'
import { LoadingController, ToastController } from '@ionic/angular'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '../supabase_client'

export interface Profile {
  username: string
  phone: string
  avatar_url: string
  full_name: string
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
        supabase.from('profiles').select(`username, full_name, phone, avatar_url, admin_status`).eq('id', id).single()
      )
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  signIn(email: string) {
    return supabase.auth.signInWithOtp({ email })
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
}
