import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Profile, SupabaseService } from 'src/app/services/supabase.service'
import { AlertController } from '@ionic/angular'
import { ModalController } from '@ionic/angular';
import { SolicitarCaseroComponent } from 'src/app/components/solicitar-casero/solicitar-casero.component';


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

  constructor(
    private readonly supabase: SupabaseService,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

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
    const loader = await this.supabase.createLoader()
    await loader.present()
    try {
      const { error } = await this.supabase.updateProfile({ ...this.profile, avatar_url })
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
