import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as leaflet from 'leaflet';
import 'leaflet-control-geocoder';
import { ModalController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-place-selector-modal',
  templateUrl: './place-selector-modal.component.html',
  styleUrls: ['./place-selector-modal.component.scss'],
})
export class PlaceSelectorModalComponent implements OnInit, AfterViewInit, OnDestroy {
  map: leaflet.Map | undefined;
  marker: leaflet.Marker | undefined;

  selectedLat: number | null = null;
  selectedLng: number | null = null;

  private customIcon = leaflet.icon({
    iconUrl: 'assets/icon/feria-marker.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
  });

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.initMap();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = leaflet.map('modal-map', {
      center: [-33.4999, -70.6159],
      zoom: 13,
    });

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // @ts-ignore
    const geocoder = new (leaflet.Control as any).Geocoder({
      defaultMarkGeocode: false,
    }).addTo(this.map);

    geocoder.on('markgeocode', (e: any) => {
      const latlng = e.geocode.center;

      if (this.marker) {
        this.marker.setLatLng(latlng);
      } else {
        this.marker = leaflet.marker(latlng, { icon: this.customIcon }).addTo(this.map!);
      }

      this.map?.setView(latlng, 16);

      this.selectedLat = latlng.lat;
      this.selectedLng = latlng.lng;
      console.log('Ubicación seleccionada (geocoder):', this.selectedLat, this.selectedLng);
    });

    // Selección con click en el mapa
    this.map.on('click', (e: leaflet.LeafletMouseEvent) => {
      const latlng = e.latlng;

      if (this.marker) {
        this.marker.setLatLng(latlng);
      } else {
        this.marker = leaflet.marker(latlng, { icon: this.customIcon }).addTo(this.map!);
      }

      this.selectedLat = latlng.lat;
      this.selectedLng = latlng.lng;
      this.map?.setView(latlng, this.map.getZoom());
      console.log('Ubicación seleccionada (click):', this.selectedLat, this.selectedLng);
    });
  }

  confirmSelection() {
    if (this.selectedLat !== null && this.selectedLng !== null) {
      this.modalCtrl.dismiss({ lat: this.selectedLat, lng: this.selectedLng });
    } else {
      alert('Por favor selecciona una ubicación en el mapa antes de confirmar.');
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
