import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonsterDetailPageRoutingModule } from './monster-detail-routing.module';

import { MonsterDetailPage } from './monster-detail.page';
import { SharedComponentModule } from 'src/app/components/shared-component.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonsterDetailPageRoutingModule,
    TranslateModule,
    SharedComponentModule
  ],
  declarations: [MonsterDetailPage]
})
export class MonsterDetailPageModule {}
