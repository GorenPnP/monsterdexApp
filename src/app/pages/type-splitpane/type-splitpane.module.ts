import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TypeSplitpanePageRoutingModule } from './type-splitpane-routing.module';

import { TypeSplitpanePage } from './type-splitpane.page';
import { SharedComponentModule } from 'src/app/components/shared-component.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    TypeSplitpanePageRoutingModule,
    SharedComponentModule,
  ],
  declarations: [TypeSplitpanePage]
})
export class TypeSplitpanePageModule {}
