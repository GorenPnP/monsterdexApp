import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpandedHeaderComponent } from './expanded-header/expanded-header.component';
import { StickyHeaderComponent } from './sticky-header/sticky-header.component';
import { FilterListItemComponent } from './filter-list-item/filter-list-item.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TypePopoverComponent } from './type-popover/type-popover.component';
import { TypeComponent } from './type/type.component';
import { TypeOverviewComponent } from './type-overview/type-overview.component';
import { ListToppingComponent } from './list-topping/list-topping.component';
import { NamedHeaderComponent } from'./named-header/named-header.component';

@NgModule({
  declarations: [
    ExpandedHeaderComponent,
    StickyHeaderComponent,
    FilterListItemComponent,
    TypePopoverComponent,
    TypeComponent,
    TypeOverviewComponent,
    ListToppingComponent,
    NamedHeaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    ExpandedHeaderComponent,
    StickyHeaderComponent,
    FilterListItemComponent,
    TypePopoverComponent,
    TypeComponent,
    TypeOverviewComponent,
    ListToppingComponent,
    NamedHeaderComponent
  ]
})
export class SharedComponentModule { }
