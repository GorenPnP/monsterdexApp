import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttackDetailPageRoutingModule } from './attack-detail-routing.module';

import { AttackDetailPage } from './attack-detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { DetailComponentsModule } from 'src/app/components/detail-components/detail-components.module';
import { BaseComponentsModule } from 'src/app/components/base-components/base-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    AttackDetailPageRoutingModule,
    BaseComponentsModule,
    DetailComponentsModule
  ],
  declarations: [AttackDetailPage]
})
export class AttackDetailPageModule {}
