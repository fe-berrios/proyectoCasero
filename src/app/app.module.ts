import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';  // <-- Importa FormsModule aquí
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FeriaModalComponent } from './components/feria-modal/feria-modal.component';
import { AgregarFeriaModalComponent } from './components/agregar-feria-modal/agregar-feria-modal.component'; // <-- Importa el modal nuevo

@NgModule({
  declarations: [
    AppComponent,
    FeriaModalComponent,
    AgregarFeriaModalComponent, // declara el modal nuevo aquí también
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,           // <-- Agrega aquí
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
