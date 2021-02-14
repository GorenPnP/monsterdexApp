import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Filter } from 'src/app/types/filter';
import { TypeOverviewComponent } from '../type-overview/type-overview.component';

@Component({
  selector: 'app-sticky-header',
  templateUrl: './sticky-header.component.html',
  styleUrls: ['./sticky-header.component.scss'],
})
export class StickyHeaderComponent {

  @Input() filter: Filter;
  @Output() searchbarChanged = new EventEmitter<string>();

  headerIsExpanded = true;

  constructor(private popoverCtrl: PopoverController) { }

  /**
   * 
   * @param event click-event fired
   */
  async openTypeOverview(event: Event): Promise<void> {

    // open popover with type information
    const popover = await this.popoverCtrl.create({
      component: TypeOverviewComponent,
      cssClass: 'type-overview-popover',
      event: event,
      keyboardClose: false,
      translucent: true
    });
    return popover.present();
  }
}
