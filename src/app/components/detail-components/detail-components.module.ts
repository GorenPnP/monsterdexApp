import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListToppingComponent } from './list-topping/list-topping.component';
import { NamedHeaderComponent } from './named-header/named-header.component';
import { BaseComponentsModule } from '../base-components/base-components.module';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    ListToppingComponent,
    NamedHeaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    BaseComponentsModule
  ],
  exports: [
    ListToppingComponent,
    NamedHeaderComponent
  ]
})
export class DetailComponentsModule { }
