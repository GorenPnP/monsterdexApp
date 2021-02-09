import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpandedHeaderComponent } from './expanded-header/expanded-header.component';
import { StickyHeaderComponent } from './sticky-header/sticky-header.component';
import { FilterListItemComponent } from './filter-list-item/filter-list-item.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ExpandedHeaderComponent,
    StickyHeaderComponent,
    FilterListItemComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    ExpandedHeaderComponent,
    StickyHeaderComponent,
    FilterListItemComponent
  ]
})
export class SharedComponentModule { }
