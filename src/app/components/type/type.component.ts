import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Type } from 'src/app/types/type';
import { TypePopoverComponent } from '../type-popover/type-popover.component';

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.scss'],
})
export class TypeComponent {

  @Input() type: Type;
  @Input() showTooltip: boolean = true;

  @Input() color: string = 'tertiary';
  @Input() style: string = '';
  @Input() disabled: boolean = false;

  @Output() clicked: EventEmitter<Type> = new EventEmitter<Type>();

  constructor(private popoverCtrl: PopoverController) { }

  /**
   * 
   * @param event click-event fired
   * @param type  the type to display information for
   */
  private async openTypeDescription(event: Event, type: Type): Promise<void> {

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
