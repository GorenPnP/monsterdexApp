import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollHeaderDirective } from '../scroll-header.directive';

@NgModule({
  declarations: [ScrollHeaderDirective],
  imports: [
    CommonModule
  ],
  exports: [ScrollHeaderDirective]
})
export class SharedDirectivesModule { }
