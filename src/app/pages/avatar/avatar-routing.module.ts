import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AvatarPage } from './avatar.page';
import { AccountPage } from '../account/account.page'; // Importar AccountPage
import { MapaPage } from '../mapa/mapa.page'; // Importar MapaPage 

const routes: Routes = [
  {
    path: '',
    component: AvatarPage
  },
  {
    path: 'account',
    component: AccountPage
  },
      {
      path: 'mapa',
      component: MapaPage
    },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AvatarPageRoutingModule { }
