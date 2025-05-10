import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountPage } from './account.page';
import { AvatarPage } from '../avatar/avatar.page'; // Importar AvatarPage
import { MapaPage } from '../mapa/mapa.page'; // Importar MapaPage

const routes: Routes = [
  {
    path: '',
    component: AccountPage
  },
  {
    path: 'avatar',
    component: AvatarPage
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
export class AccountPageRoutingModule { }
