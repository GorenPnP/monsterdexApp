import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TypeSplitpanePageRoutingModule } from './type-splitpane-routing.module';

import { TypeSplitpanePage } from './type-splitpane.page';
import { SharedComponentModule } from 'src/app/components/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TypeSplitpanePageRoutingModule,
    SharedComponentModule,
  ],
  declarations: [TypeSplitpanePage]
})
export class TypeSplitpanePageModule {}
