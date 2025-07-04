import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeriasFavPage } from './ferias-fav.page';

const routes: Routes = [
  {
    path: '',
    component: FeriasFavPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeriasFavPageRoutingModule {}
