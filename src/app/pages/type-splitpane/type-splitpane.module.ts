import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TypeSplitpanePageRoutingModule } from './type-splitpane-routing.module';

import { TypeSplitpanePage } from './type-splitpane.page';
import { TranslateModule } from '@ngx-translate/core';
import { SplitPaneComponentsModule } from 'src/app/components/split-pane-components/split-pane-components.module';
import { BaseComponentsModule } from 'src/app/components/base-components/base-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    TypeSplitpanePageRoutingModule,
    BaseComponentsModule,
    SplitPaneComponentsModule
  ],
  declarations: [TypeSplitpanePage]
})
export class TypeSplitpanePageModule {}
