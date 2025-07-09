import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private router: Router, private navCtrl: NavController) {}

  navegarALogin() {
    // Agregar clase para animación de desvanecimiento
    const logoContainer = document.querySelector('.logo-container') as HTMLElement;
    if (logoContainer) {
      logoContainer.classList.add('desvanecer');
      
      // Navegar después de la animación
      setTimeout(() => {
        this.navCtrl.navigateForward('/login');
      }, 500);
    } else {
      this.navCtrl.navigateForward('/login');
    }
  }

}
