import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: '', redirectTo: 'tabs/list-monster', pathMatch: 'full'},
      { path: 'list-monster', loadChildren: '../list-monster/list-monster.module#ListMonsterPageModule' },
      { path: 'list-attacken', loadChildren: '../list-attacken/list-attacken.module#ListAttackenPageModule' },
    ]
  },
  {
    path: '', redirectTo: 'tabs/list-monster', pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
