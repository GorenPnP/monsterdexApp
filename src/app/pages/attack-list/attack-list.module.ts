import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttackListPageRoutingModule } from './attack-list-routing.module';

import { AttackListPage } from './attack-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttackListPageRoutingModule
  ],
  declarations: [AttackListPage]
})
export class AttackListPageModule {}
