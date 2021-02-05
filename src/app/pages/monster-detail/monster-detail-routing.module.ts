import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MonsterDetailPage } from './monster-detail.page';

const routes: Routes = [
  {
    path: '',
    component: MonsterDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonsterDetailPageRoutingModule {}
