import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EfficienciesComponent } from './efficiencies/efficiencies.component';
import { FilterListItemComponent } from './filter-list-item/filter-list-item.component';
import { TypeComponent } from './type/type.component';
import { TypePopoverComponent } from './type-popover/type-popover.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    EfficienciesComponent,
    FilterListItemComponent,
    TypeComponent,
    TypePopoverComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterModule
  ],
  exports: [
    EfficienciesComponent,
    FilterListItemComponent,
    TypeComponent,
    TypePopoverComponent
  ]
})
export class BaseComponentsModule { }
