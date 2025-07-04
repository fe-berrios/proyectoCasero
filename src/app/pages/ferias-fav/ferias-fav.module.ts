import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeriasFavPageRoutingModule } from './ferias-fav-routing.module';

import { FeriasFavPage } from './ferias-fav.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeriasFavPageRoutingModule
  ],
  declarations: [FeriasFavPage]
})
export class FeriasFavPageModule {}
