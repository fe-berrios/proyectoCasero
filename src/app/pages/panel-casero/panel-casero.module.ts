import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PanelCaseroPageRoutingModule } from './panel-casero-routing.module';

import { PanelCaseroPage } from './panel-casero.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PanelCaseroPageRoutingModule
  ],
  declarations: [PanelCaseroPage]
})
export class PanelCaseroPageModule {}
