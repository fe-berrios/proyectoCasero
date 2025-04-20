import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as leaflet from 'leaflet';

@Component({
  standalone: false,
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
}) 
export class MapaPage implements OnInit {
  map: leaflet.Map | undefined;

  constructor() {}

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
}
