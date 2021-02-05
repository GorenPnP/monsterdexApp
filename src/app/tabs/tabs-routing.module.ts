import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'monster-list',
        loadChildren: () => import('../pages/monster-list/monster-list.module').then( m => m.MonsterListPageModule)
      },
      {
        path: 'attack-list',
        loadChildren: () => import('../pages/attack-list/attack-list.module').then( m => m.AttackListPageModule)
      },
      {
        path: '',
        redirectTo: 'monster-list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/monster-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
