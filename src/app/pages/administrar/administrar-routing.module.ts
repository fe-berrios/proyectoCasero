import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdministrarPage } from './administrar.page';
import { MapaPage } from '../mapa/mapa.page';

const routes: Routes = [
  {
    path: '',
    component: AdministrarPage
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
export class AdministrarPageRoutingModule {}
