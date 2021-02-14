import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttackListPageRoutingModule } from './attack-list-routing.module';

import { AttackListPage } from './attack-list.page';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';
import { SharedComponentModule } from 'src/app/components/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttackListPageRoutingModule,
    SharedDirectivesModule,
    SharedComponentModule
  ],
  declarations: [AttackListPage]
})
export class AttackListPageModule {}
