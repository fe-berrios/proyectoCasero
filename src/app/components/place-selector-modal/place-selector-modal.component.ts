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

  selectedCityOrTown: string | null = null;
  selectedState: string | null = null;

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
    this.map?.remove();
  }

  private initMap(): void {
    this.map = leaflet.map('modal-map', {
      center: [-33.4999, -70.6159],
      zoom: 13,
    });

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // ✅ Crear instancia de Nominatim con htmlTemplate personalizado
    // @ts-ignore
    const nominatimGeocoder = new (leaflet.Control.Geocoder as any).Nominatim({
      geocodingQueryParams: {
        countrycodes: 'cl',
      },
      htmlTemplate: (result: any) => {
        const address = result.address || result.properties?.address || {};
        const parts = [
          result.name,
          address.city || address.town || address.village || '',
          address.state || '',
          address.country || '',
        ].filter(Boolean);
        return parts.join(', ');
      }
    });

    // ✅ Crear control con geocoder personalizado
    // @ts-ignore
    const geocoderControl = (leaflet.Control as any).geocoder({
      geocoder: nominatimGeocoder,
      placeholder: 'Buscar dirección',
      defaultMarkGeocode: false,
    }).addTo(this.map);

    // ✅ Manejar evento de selección de resultado
    geocoderControl.on('markgeocode', (e: any) => {
      const latlng = e.geocode.center;
      const address = e.geocode.properties?.address || e.geocode.address || {};

      if (this.marker) {
        this.marker.setLatLng(latlng);
      } else {
        this.marker = leaflet.marker(latlng, { icon: this.customIcon }).addTo(this.map!);
      }

      this.map?.setView(latlng, 16);

      this.selectedLat = latlng.lat;
      this.selectedLng = latlng.lng;
      this.selectedCityOrTown = address.city || address.town || address.village || null;
      this.selectedState = address.state || null;

      console.log('Ubicación seleccionada (geocoder):', this.selectedLat, this.selectedLng);
      console.log('Ciudad/Comuna:', this.selectedCityOrTown);
      console.log('Estado/Región:', this.selectedState);
    });

    // ✅ Manejar click manual en el mapa
    this.map.on('click', async (e: leaflet.LeafletMouseEvent) => {
      const latlng = e.latlng;

      if (this.marker) {
        this.marker.setLatLng(latlng);
      } else {
        this.marker = leaflet.marker(latlng, { icon: this.customIcon }).addTo(this.map!);
      }

      this.selectedLat = latlng.lat;
      this.selectedLng = latlng.lng;
      this.map?.setView(latlng, this.map.getZoom());

      await this.reverseGeocode(latlng.lat, latlng.lng);

      console.log('Ubicación seleccionada (click):', this.selectedLat, this.selectedLng);
      console.log('Ciudad/Comuna:', this.selectedCityOrTown);
      console.log('Estado/Región:', this.selectedState);
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es&countrycodes=cl`;
      const response = await fetch(url);
      const data = await response.json();
      const address = data.address || {};

      this.selectedCityOrTown = address.city || address.town || address.village || null;
      this.selectedState = address.state || null;
    } catch (error) {
      console.error('Error en reverse geocode:', error);
      this.selectedCityOrTown = null;
      this.selectedState = null;
    }
  }

  confirmSelection() {
    if (this.selectedLat !== null && this.selectedLng !== null) {
      this.modalCtrl.dismiss({
        lat: this.selectedLat,
        lng: this.selectedLng,
        cityOrTown: this.selectedCityOrTown,
        state: this.selectedState,
      });
    } else {
      alert('Por favor selecciona una ubicación en el mapa antes de confirmar.');
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
