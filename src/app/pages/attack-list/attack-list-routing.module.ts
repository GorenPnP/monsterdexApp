import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttackListPage } from './attack-list.page';

const routes: Routes = [
  {
    path: '',
    component: AttackListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttackListPageRoutingModule {}
