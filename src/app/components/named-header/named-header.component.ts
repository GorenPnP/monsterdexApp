import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TypeOverviewComponent } from '../type-overview/type-overview.component';

@Component({
  selector: 'app-named-header',
  templateUrl: './named-header.component.html',
  styleUrls: ['./named-header.component.scss'],
})
export class NamedHeaderComponent {

  @Input() item: {name: string};

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
