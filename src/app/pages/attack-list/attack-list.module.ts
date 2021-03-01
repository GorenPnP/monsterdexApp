import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttackListPageRoutingModule } from './attack-list-routing.module';

import { AttackListPage } from './attack-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { ListComponentsModule } from 'src/app/components/list-components/list-components.module';
import { BaseComponentsModule } from 'src/app/components/base-components/base-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttackListPageRoutingModule,
    TranslateModule,
    BaseComponentsModule,
    ListComponentsModule
  ],
  declarations: [AttackListPage]
})
export class AttackListPageModule {}
