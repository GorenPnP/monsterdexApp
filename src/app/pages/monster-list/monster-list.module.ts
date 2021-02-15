import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonsterListPageRoutingModule } from './monster-list-routing.module';

import { MonsterListPage } from './monster-list.page';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';
import { SharedComponentModule } from 'src/app/components/shared-component.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonsterListPageRoutingModule,
    TranslateModule,
    SharedDirectivesModule,
    SharedComponentModule
  ],
  declarations: [MonsterListPage]
})
export class MonsterListPageModule {}
