import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'mapa',
    loadChildren: () => import('../mapa/mapa.module').then( m => m.MapaPageModule)
  },
  {
    path: 'administrar',
    loadChildren: () => import('../administrar/administrar.module').then( m => m.AdministrarPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
