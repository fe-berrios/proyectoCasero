import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AlertController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loading = false;
  signInForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private supabase: SupabaseService,
    private alertController: AlertController
  ) {}

  // Método para manejar el envío del formulario de inicio de sesión
  async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      const email = this.signInForm.value.email as string;

      // Llamada al servicio de Supabase para enviar el Magic Link
      const { error } = await this.supabase.signIn(email);
      if (error) throw error;

      // Mostrar alerta de éxito
      const alert = await this.alertController.create({
        header: 'Correo enviado',
        message: 'Revisa tu bandeja de entrada para continuar con el inicio de sesión.',
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      if (error instanceof Error) {
        // Mostrar alerta de error
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    } finally {
      this.signInForm.reset();
      this.loading = false;
    }
  }
}

