import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttackDetailPageRoutingModule } from './attack-detail-routing.module';

import { AttackDetailPage } from './attack-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttackDetailPageRoutingModule
  ],
  declarations: [AttackDetailPage]
})
export class AttackDetailPageModule {}
