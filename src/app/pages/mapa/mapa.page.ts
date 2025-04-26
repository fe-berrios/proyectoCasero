import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as leaflet from 'leaflet';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
}) 
export class MapaPage implements OnInit {
  map: leaflet.Map | undefined;

  constructor(
    private router: Router,
    private readonly supabase: SupabaseService,
  ) {}

  ngOnInit() {
    this.initMap();
  }


  private initMap(): void {
    this.map = leaflet.map('map', {
      zoomControl: false,
      center: [-33.499939765375, -70.61597756156033],
      zoom: 17,
      renderer: leaflet.canvas(),
    });

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    // Forzar el redimensionamiento del mapa
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);
  }

  async signOut() {
    console.log('testing?')
    await this.supabase.signOut()
    this.router.navigate(['/'], { replaceUrl: true })
  }
}
