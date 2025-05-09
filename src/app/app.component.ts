import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {}
  ngOnInit() {
    // Forzar tema claro al cargar la página
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    document.documentElement.setAttribute('color-theme', 'light');
  }

  // También puedes usar ionViewWillEnter si quieres que se aplique cada vez que entras
  ionViewWillEnter() {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    document.documentElement.setAttribute('color-theme', 'light');
  }
}
