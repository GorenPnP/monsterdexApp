import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollHeaderDirective } from 'src/app/directives/scroll-header.directive';
import { ExpandedHeaderComponent } from './expanded-header/expanded-header.component';
import { StickyHeaderComponent } from './sticky-header/sticky-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { TypeComponent } from '../base-components/type/type.component';
import { BaseComponentsModule } from '../base-components/base-components.module';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    ScrollHeaderDirective,
    ExpandedHeaderComponent,
    StickyHeaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    BaseComponentsModule
  ],
  exports: [
    ExpandedHeaderComponent,
    StickyHeaderComponent
  ]
})
export class ListComponentsModule { }
