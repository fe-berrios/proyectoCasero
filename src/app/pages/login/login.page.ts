import { Component } from '@angular/core'
import { SupabaseService } from 'src/app/services/supabase.service'
import { AlertController } from '@ionic/angular'
import { Router } from '@angular/router'

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = ''

  constructor(
    private readonly supabase: SupabaseService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si la sesión está activa
    this.supabase.session.then((session) => {
      if (session) {
        // Si la sesión está activa, redirigir al mapa
        this.router.navigate(['/mapa']);
      }
    });
  }

  async handleLogin(event: any) {
    event.preventDefault()
    const loader = await this.supabase.createLoader()
    await loader.present()
    try {
      const { error } = await this.supabase.signIn(this.email)
      if (error) {
        throw error
      }
      await loader.dismiss()

      // Popup de éxito
      const successAlert = await this.alertController.create({
        header: '¡Éxito!',
        message: '¡Revisa tu correo electrónico y haz clic en el enlace para iniciar sesión!',
        buttons: ['OK']
      })
      await successAlert.present()

    } catch (error: any) {
      await loader.dismiss()

      // Popup de error
      const errorAlert = await this.alertController.create({
        header: '¡Error!',
        message: error.error_description || error.message,
        buttons: ['OK']
      })
      await errorAlert.present()
    }
  }
}
