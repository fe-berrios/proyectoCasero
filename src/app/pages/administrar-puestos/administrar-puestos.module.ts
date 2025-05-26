import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdministrarPuestosPageRoutingModule } from './administrar-puestos-routing.module';

import { AdministrarPuestosPage } from './administrar-puestos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdministrarPuestosPageRoutingModule
  ],
  declarations: [AdministrarPuestosPage]
})
export class AdministrarPuestosPageModule {}
