import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonsterDetailPageRoutingModule } from './monster-detail-routing.module';

import { MonsterDetailPage } from './monster-detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { DetailComponentsModule } from 'src/app/components/detail-components/detail-components.module';
import { BaseComponentsModule } from 'src/app/components/base-components/base-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonsterDetailPageRoutingModule,
    TranslateModule,
    BaseComponentsModule,
    DetailComponentsModule
  ],
  declarations: [MonsterDetailPage]
})
export class MonsterDetailPageModule {}
