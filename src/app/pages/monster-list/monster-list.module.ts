import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonsterListPageRoutingModule } from './monster-list-routing.module';

import { MonsterListPage } from './monster-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { ListComponentsModule } from 'src/app/components/list-components/list-components.module';
import { BaseComponentsModule } from 'src/app/components/base-components/base-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonsterListPageRoutingModule,
    TranslateModule,
    BaseComponentsModule,
    ListComponentsModule
  ],
  declarations: [MonsterListPage]
})
export class MonsterListPageModule {}
