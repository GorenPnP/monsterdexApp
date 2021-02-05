import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttackDetailPage } from './attack-detail.page';

const routes: Routes = [
  {
    path: '',
    component: AttackDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttackDetailPageRoutingModule {}
