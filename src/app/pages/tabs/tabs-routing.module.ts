import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'monster-list',
        pathMatch: 'full'
      },
      {
        path: 'monster-list',
        loadChildren: () => import('../monster-list/monster-list.module').then( m => m.MonsterListPageModule)
      },
      {
        path: 'attack-list',
        loadChildren: () => import('../attack-list/attack-list.module').then( m => m.AttackListPageModule)
      },
    ]
  },
  {
    path: '',
    redirectTo: '/monster-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
