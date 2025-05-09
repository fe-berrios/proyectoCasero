import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-imagen',
  templateUrl: './imagen.page.html',
  styleUrls: ['./imagen.page.scss'],
})
export class ImagenPage implements OnInit {

  constructor( private router:Router) { }

  ngOnInit() {
  }

  mapa(){
    this.router.navigateByUrl('mapa');
  }
  
  login(){
    this.router.navigateByUrl('login');
  }


}
