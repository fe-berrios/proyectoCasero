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
    { name: 'sad', src: 'assets/profile_pics/sad.png' },
    { name: 'kabuki', src: 'assets/profile_pics/kabuki.png' },
    { name: 'sunglasses', src: 'assets/profile_pics/sunglasses.png' },
    { name: 'thief', src: 'assets/profile_pics/thief.png' },
    { name: 'cowboy', src: 'assets/profile_pics/cowboy.png' },
    { name: 'mafia', src: 'assets/profile_pics/mafia.png' },
    { name: 'fire', src: 'assets/profile_pics/fire.png' },
    { name: 'pirate', src: 'assets/profile_pics/pirate.png' },
    { name: 'girl', src: 'assets/profile_pics/girl.png' },
    { name: 'girl-sunglasses', src: 'assets/profile_pics/girl-sunglasses.png' },
    { name: 'goth', src: 'assets/profile_pics/goth.png' },
    { name: 'sailor', src: 'assets/profile_pics/sailor.png' },
    { name: 'witch', src: 'assets/profile_pics/witch.png' },
    { name: 'skull', src: 'assets/profile_pics/skull.png' },
    { name: 'cat', src: 'assets/profile_pics/cat.png' },
    { name: 'farmer', src: 'assets/profile_pics/farmer.png' },
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
