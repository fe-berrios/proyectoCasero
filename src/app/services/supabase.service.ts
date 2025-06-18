import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase_client';
import { isPlatform } from '@ionic/angular';

export interface Profile {
  username: string;
  phone: string;
  avatar_url: string;
  full_name: string;
  admin_status?: boolean;
  codigo_casero?: string;
  casero_status?: boolean;  // <-- Agregado casero_status opcional
  banned?: boolean;  // <-- Agregado campo banned opcional
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  public get client() {
    return supabase; // or whatever your Supabase client instance is named
  }

  // Obtiene el usuario actual (async)
  get user() {
    return supabase.auth.getUser().then(({ data }) => data?.user);
  }

  // Obtiene la sesión actual (async)
  get session() {
    return supabase.auth.getSession().then(({ data }) => data?.session);
  }

  // Obtiene el perfil completo del usuario (async)
  get profile() {
    return this.user
      .then((user) => user?.id)
      .then((id) =>
        supabase
          .from('profiles')
          .select(`username, full_name, phone, avatar_url, admin_status, codigo_casero, casero_status, banned`) // <-- Agregado casero_status aquí
          .eq('id', id)
          .single()
      );
  }

  // Obtiene el perfil de cualquier usuario por ID (solo para admins)
  getProfileById(id: string) {
    return supabase
      .from('profiles')
      .select('username, full_name, phone, avatar_url, admin_status, codigo_casero, casero_status')
      .eq('id', id)
      .single();
  }

  // Actualiza cualquier perfil por ID (solo para admins)
  updateProfileById(id: string, profile: Partial<Profile>) {
    return supabase
      .from('profiles')
      .update({ ...profile, updated_at: new Date() })
      .eq('id', id);
  }

  // Listener para cambios en el estado de autenticación
  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Iniciar sesión con magic link
  signIn(email: string) {
    const redirectTo = isPlatform('capacitor')
      ? 'casero://login'
      : `${window.location.origin}/login`; // O tu ruta web deseada

    return supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });
  }

  // Cerrar sesión
  signOut() {
    return supabase.auth.signOut();
  }

  // Actualizar perfil del usuario
  async updateProfile(profile: Profile) {
    const user = await this.user;
    const update = {
      ...profile,
      id: user?.id,
      updated_at: new Date(),
    };

    return supabase.from('profiles').upsert(update);
  }

  // Descargar imagen desde storage
  downLoadImage(path: string) {
    return supabase.storage.from('avatars').download(path);
  }

  // Subir avatar a storage
  uploadAvatar(filePath: string, file: File) {
    return supabase.storage.from('avatars').upload(filePath, file);
  }

  // Crear un toast con mensaje
  async createNotice(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 5000 });
    await toast.present();
  }

  // Crear loader (cargando)
  createLoader() {
    return this.loadingCtrl.create();
  }

  // Establecer sesión (para magic links en móviles)
  setSession(access_token: string, refresh_token: string) {
    return supabase.auth.setSession({ access_token, refresh_token });
  }
}
