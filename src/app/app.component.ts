import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  isInvitado = false;

  constructor(
    private zone: NgZone,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    this.setupListener();
  }

  ngOnInit() {
    // Forzar tema claro al cargar la página
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    document.documentElement.setAttribute('color-theme', 'light');
    this.isInvitado = localStorage.getItem('casero_invitado') === 'true';
  }

  ionViewWillEnter() {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    document.documentElement.setAttribute('color-theme', 'light');
  }

  setupListener() {
    App.addListener('appUrlOpen', async (data: URLOpenListenerEvent) => {
      console.log('App opened with URL:', data.url);

      try {
        const url = data.url;

        const accessToken = this.getParamFromUrl(url, 'access_token');
        const refreshToken = this.getParamFromUrl(url, 'refresh_token');

        if (accessToken && refreshToken) {
          await this.supabaseService.setSession(accessToken, refreshToken);
          this.zone.run(() => {
            this.router.navigateByUrl('/mapa', { replaceUrl: true });
          });
        }
      } catch (err) {
        console.error('Error setting session from URL:', err);
      }
    });
  }

  private getParamFromUrl(url: string, key: string): string | null {
    const regex = new RegExp(`[&#]${key}=([^&]*)`);
    const match = url.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
