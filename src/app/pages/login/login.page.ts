import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  email:any = '';
  password:any= '';

  constructor(private router: Router ){

  }

  home() {
    this.router.navigate(['home']);
  }
  registro() {
    this.router.navigate(['registro']);
  }


}
