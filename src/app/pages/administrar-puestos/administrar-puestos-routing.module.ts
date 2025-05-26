import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdministrarPuestosPage } from './administrar-puestos.page';
import { MapaPage } from '../mapa/mapa.page';

const routes: Routes = [
  {
    path: '',
    component: AdministrarPuestosPage,
  },
    {
    path: 'mapa',
    component: MapaPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrarPuestosPageRoutingModule {}
