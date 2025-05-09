import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  email:any = '';
  showToast: boolean = false;
  toastMessage: string = '';

  constructor( private router:Router) { }

  ngOnInit() {
  }

  login() {
    this.router.navigateByUrl('login');
  }
  correo() {
    
    if (this.email) {
      // Simula el envío del correo
      this.toastMessage = `El enlace ha sido enviado a ${this.email}`;
      this.showToast = true;

      // Ocultar el toast después de 5 segundos (opcional)
      setTimeout(() => {
        this.showToast = false;
        this.router.navigateByUrl('login');
      }, 2000);
    } else {
      // Mostrar un mensaje de error si el email está vacío
      this.toastMessage = 'Por favor, ingrese un correo válido.';
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, 2000);
    }

  }



}
