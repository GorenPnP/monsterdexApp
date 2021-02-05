import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonsterDetailPageRoutingModule } from './monster-detail-routing.module';

import { MonsterDetailPage } from './monster-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonsterDetailPageRoutingModule
  ],
  declarations: [MonsterDetailPage]
})
export class MonsterDetailPageModule {}
