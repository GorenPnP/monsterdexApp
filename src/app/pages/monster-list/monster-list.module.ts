import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonsterListPageRoutingModule } from './monster-list-routing.module';

import { MonsterListPage } from './monster-list.page';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';
import { SharedComponentModule } from 'src/app/components/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonsterListPageRoutingModule,
    SharedDirectivesModule,
    SharedComponentModule
  ],
  declarations: [MonsterListPage]
})
export class MonsterListPageModule {}
