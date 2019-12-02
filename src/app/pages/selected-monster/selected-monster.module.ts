import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectedMonsterPage } from './selected-monster.page';

const routes: Routes = [
  {
    path: '',
    component: SelectedMonsterPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SelectedMonsterPage]
})
export class SelectedMonsterPageModule {}
