import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';  
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FeriaModalComponent } from './components/feria-modal/feria-modal.component';
import { AgregarFeriaModalComponent } from './components/agregar-feria-modal/agregar-feria-modal.component'; 
import { PlaceSelectorModalComponent } from './components/place-selector-modal/place-selector-modal.component';
import { EditarFeriaModalComponent } from './components/editar-feria-modal/editar-feria-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    FeriaModalComponent,
    AgregarFeriaModalComponent,
    PlaceSelectorModalComponent,
    EditarFeriaModalComponent,
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule, 
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
