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
import { AgregarPuestoModalComponent } from './components/agregar-puesto-modal/agregar-puesto-modal.component';
import { EditarPuestoModalComponent } from './components/editar-puesto-modal/editar-puesto-modal.component';
import { PuestoDetalleModalComponent } from './components/puesto-detalle-modal/puesto-detalle-modal.component';
import { ComentarModalComponent } from './components/comentar-modal/comentar-modal.component';
import { ComentarFeriaComponent } from './components/comentar-feria/comentar-feria.component';
import { ModificarUsuarioComponent } from './components/modificar-usuario/modificar-usuario.component';
import { SolicitarCaseroComponent } from './components/solicitar-casero/solicitar-casero.component';
import { SolicitudPuestoModalComponent } from './components/solicitud-puesto-modal/solicitud-puesto-modal.component';
import { SolicitudesPuestosComponent } from './components/solicitudes-puestos/solicitudes-puestos.component';

@NgModule({
  declarations: [
    AppComponent,
    FeriaModalComponent,
    AgregarFeriaModalComponent,
    PlaceSelectorModalComponent,
    EditarFeriaModalComponent,
    AgregarPuestoModalComponent,
    EditarPuestoModalComponent,
    PuestoDetalleModalComponent,
    ComentarModalComponent,
    ComentarFeriaComponent,
    ModificarUsuarioComponent,
    SolicitarCaseroComponent,
    SolicitudPuestoModalComponent,
    SolicitudesPuestosComponent 
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
