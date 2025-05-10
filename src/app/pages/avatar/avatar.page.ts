import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { NavController, LoadingController } from '@ionic/angular'; // ✅ Importar LoadingController

@Component({
  standalone: false,
  selector: 'app-avatar',
  templateUrl: './avatar.page.html',
  styleUrls: ['./avatar.page.scss'],
})
export class AvatarPage {

  avatars = [
    { name: 'joy', src: 'assets/profile_pics/joy.png' },
    { name: 'angry', src: 'assets/profile_pics/angry.png' },
    { name: 'sad', src: 'assets/profile_pics/sad.png' }
  ];

  selectedAvatar: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController // ✅ Inyectar LoadingController
  ) {}

  selectAvatar(avatar: { name: string, src: string }) {
    this.selectedAvatar = avatar.name;
  }

  async updateProfileAvatar() {
    if (!this.selectedAvatar) return;

    const loading = await this.loadingCtrl.create({
      message: 'Actualizando avatar...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    const profileResponse = await this.supabaseService.profile;

    if (profileResponse.error || !profileResponse.data) {
      await loading.dismiss();
      return;
    }

    const avatarUrl = `assets/profile_pics/${this.selectedAvatar}.png`;

    const profile = {
      ...profileResponse.data,
      avatar_url: avatarUrl
    };

    try {
      await this.supabaseService.updateProfile(profile);
      await loading.dismiss();
      window.location.replace('/account'); // 🔁 Forzar recarga
    } catch (error) {
      await loading.dismiss();
    }
  }
}
