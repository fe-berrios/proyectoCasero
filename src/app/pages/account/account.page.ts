import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Profile, SupabaseService } from 'src/app/services/supabase.service'
import { AlertController } from '@ionic/angular'
import { ModalController } from '@ionic/angular';
import { SolicitarCaseroComponent } from 'src/app/components/solicitar-casero/solicitar-casero.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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
    avatar_url: 'assets/profile_pics/loading.svg',
    phone: '',
  }

  email = ''
  form: FormGroup;

  constructor(
    private readonly supabase: SupabaseService,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern('^[a-zA-Z0-9]+$')
        ]
      ],
      full_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/)
        ]
      ],
      phone: [
        '',
        [
          Validators.pattern(/^\d{9}$/)
        ]
      ]
    });
  }

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
        this.profile = {
          ...profile,
          avatar_url: profile.avatar_url || 'assets/profile_pics/joy.png'
        }
        // Sincronizar los valores en el formulario reactivo
        this.form.patchValue({ 
          username: this.profile.username,
          full_name: this.profile.full_name,
          phone: this.profile.phone
        });
      }
    } catch (error: any) {
      const alert = await this.alertController.create({
        header: '¡Error!',
        message: error.message,
        buttons: ['OK']
      })
      await alert.present()
    }
  }

  async updateProfile(avatar_url: string = '') {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const loader = await this.supabase.createLoader()
    await loader.present()
    try {
      // Actualizar los valores desde el formulario reactivo
      const username = this.form.get('username')?.value;
      const full_name = this.form.get('full_name')?.value;
      // Al guardar, concatenar '+56' con el valor del input (o solo '+56' si está vacío)
      let phone = this.form.get('phone')?.value;
      phone = phone ? `+56${phone}` : '+56';
      const { error } = await this.supabase.updateProfile({ ...this.profile, username, full_name, phone, avatar_url })
      if (error) {
        throw error
      }
      await loader.dismiss()

      const successAlert = await this.alertController.create({
        header: '¡Éxito!',
        message: 'Perfil actualizado con éxito',
        buttons: ['OK']
      })
      await successAlert.present()

    } catch (error: any) {
      await loader.dismiss()
      const errorAlert = await this.alertController.create({
        header: '¡Error!',
        message: error.message,
        buttons: ['OK']
      })
      await errorAlert.present()
    }
  }

  goToAvatar() {
    this.router.navigate(['/avatar']);
  }


  async abrirModalSolicitudCasero() {
    const modal = await this.modalController.create({
      component: SolicitarCaseroComponent,
      componentProps: {
        // Puedes pasar datos si lo necesitas
      },
    });

    await modal.present();
  }

}
