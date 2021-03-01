import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeCalcComponent } from './type-calc/type-calc.component';
import { TypeOverviewComponent } from './type-overview/type-overview.component';
import { TranslateModule } from '@ngx-translate/core';
import { BaseComponentsModule } from '../base-components/base-components.module';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    TypeCalcComponent,
    TypeOverviewComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    BaseComponentsModule
  ],
  exports: [
    TypeCalcComponent,
    TypeOverviewComponent
  ]
})
export class SplitPaneComponentsModule { }
