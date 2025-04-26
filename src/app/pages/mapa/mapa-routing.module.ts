import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapaPage } from './mapa.page';
import { AccountPage } from '../account/account.page';

const routes: Routes = [
  {
    path: '',
    component: MapaPage
  },
    {
      path: 'account',
      component: AccountPage
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapaPageRoutingModule {}
