import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TypeSplitpanePage } from './type-splitpane.page';

const routes: Routes = [
  {
    path: '',
    component: TypeSplitpanePage,
    children: [
      {
        path: 'monster-detail/:id',
        loadChildren: () => import('../monster-detail/monster-detail.module').then( m => m.MonsterDetailPageModule)
      },
      {
        path: 'attack-detail/:id',
        loadChildren: () => import('../attack-detail/attack-detail.module').then( m => m.AttackDetailPageModule)
      },
      {
        path: '',
        loadChildren: () => import('../tabs/tabs.module').then(m => m.TabsPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TypeSplitpanePageRoutingModule {}
