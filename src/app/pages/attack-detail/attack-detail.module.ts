import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttackDetailPageRoutingModule } from './attack-detail-routing.module';

import { AttackDetailPage } from './attack-detail.page';
import { SharedComponentModule } from 'src/app/components/shared-component.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    AttackDetailPageRoutingModule,
    SharedComponentModule
  ],
  declarations: [AttackDetailPage]
})
export class AttackDetailPageModule {}
