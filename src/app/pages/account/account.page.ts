import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Profile, SupabaseService } from 'src/app/services/supabase.service'
import { AlertController } from '@ionic/angular'

@Component({
  standalone: false,
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  profile: Profile = {
    username: '',
    full_name: '',
    avatar_url: '',
    phone: '',
  }

  email = ''

  constructor(
    private readonly supabase: SupabaseService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.getEmail()
    this.getProfile()
  }

  async getEmail() {
    this.email = await this.supabase.user.then((user) => user?.email || '')
  }

  async getProfile() {
    try {
      const { data: profile, error, status } = await this.supabase.profile
      if (error && status !== 406) {
        throw error
      }
      if (profile) {
        this.profile = profile
      }
    } catch (error: any) {
      // Mostrar mensaje de error en un popup
      const alert = await this.alertController.create({
        header: '¡Error!',
        message: error.message,
        buttons: ['OK']
      })
      await alert.present()
    }
  }

  async updateProfile(avatar_url: string = '') {
    const loader = await this.supabase.createLoader()
    await loader.present()
    try {
      const { error } = await this.supabase.updateProfile({ ...this.profile, avatar_url })
      if (error) {
        throw error
      }
      await loader.dismiss()

      // Mostrar mensaje de éxito en un popup
      const successAlert = await this.alertController.create({
        header: '¡Éxito!',
        message: 'Perfil actualizado con éxito',
        buttons: ['OK']
      })
      await successAlert.present()

    } catch (error: any) {
      await loader.dismiss()

      // Mostrar mensaje de error en un popup
      const errorAlert = await this.alertController.create({
        header: '¡Error!',
        message: error.message,
        buttons: ['OK']
      })
      await errorAlert.present()
    }
  }

  async signOut() {
    console.log('testing?')
    await this.supabase.signOut()
    this.router.navigate(['/'], { replaceUrl: true })
  }
}
