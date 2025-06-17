import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelCaseroPage } from './panel-casero.page';

const routes: Routes = [
  {
    path: '',
    component: PanelCaseroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelCaseroPageRoutingModule {}
