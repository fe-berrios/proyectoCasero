import { Component } from '@angular/core'
import { SupabaseService } from 'src/app/services/supabase.service'
import { AlertController } from '@ionic/angular'
import { Router } from '@angular/router'
import { supabase } from 'src/app/supabase_client'

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = ''
  showPassword = false

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
    event.preventDefault();

    const loader = await this.supabase.createLoader();
    await loader.present();

    try {
      // Consultar profile por email para saber si está baneado
      const { data: profile, error: profileError } = await this.supabase.client
        .from('profiles')
        .select('banned')
        .eq('email', this.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // Si hubo un error diferente a "no encontrado", lanzar error
        throw profileError;
      }

      if (profile?.banned) {
        await loader.dismiss();

        const bannedAlert = await this.alertController.create({
          header: 'Acceso denegado',
          message: 'Tu cuenta ha sido baneada. Contacta con soporte si crees que es un error.',
          buttons: ['OK']
        });
        await bannedAlert.present();
        return; // No enviar magic link
      }

      // Usuario no baneado o no encontrado, enviar magic link
      const { error } = await this.supabase.signIn(this.email);
      if (error) throw error;

      await loader.dismiss();

      const successAlert = await this.alertController.create({
        header: '¡Éxito!',
        message: '¡Revisa tu correo electrónico y haz clic en el enlace para iniciar sesión!',
        buttons: ['OK']
      });
      await successAlert.present();

    } catch (error: any) {
      await loader.dismiss();

      const errorAlert = await this.alertController.create({
        header: '¡Error!',
        message: error.error_description || error.message || 'Error desconocido',
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  }
}
