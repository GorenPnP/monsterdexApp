import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MonsterListPage } from './monster-list.page';

const routes: Routes = [
  {
    path: '',
    component: MonsterListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonsterListPageRoutingModule {}
