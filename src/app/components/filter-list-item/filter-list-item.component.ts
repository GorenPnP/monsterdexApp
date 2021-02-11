import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Type } from 'src/app/types/type';
import { TypePopoverComponent } from '../type-popover/type-popover.component';

@Component({
  selector: 'app-filter-list-item',
  templateUrl: './filter-list-item.component.html',
  styleUrls: ['./filter-list-item.component.scss'],
})
export class FilterListItemComponent {

  @Input() item;

  constructor(private popoverCtrl: PopoverController) {}

  /**
   * 
   * @param event click-event fired
   * @param type  the type to display information for
   */
  async openTypeDescription(event: Event, type: Type): Promise<void> {

    // stop routing to detail page
    event.preventDefault();
    event.stopImmediatePropagation();

    // open popover with type information
    const popover = await this.popoverCtrl.create({
      component: TypePopoverComponent,
      componentProps: {type},
      cssClass: 'type-popover',
      event: event,
      keyboardClose: false,
      translucent: true
    });
    return popover.present();
  }
}
