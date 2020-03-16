import { Component } from '@angular/core';

import { PopoverController, NavParams } from '@ionic/angular';

/**
 * popover, content generic from caller
 */
@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage {
  /**
   * content of dropdown list
   * format:
   * [
   *   {
   *     "topic": "Typen",
   *     "content": [{"title": "Liste", "icon": "list", "path": "/list-typen"}, ...]
   *   },
   *   {...}
   * ];
   */
  headerPopover = [];

  /**
   * init content of popover
   * @param popoverController used to present popover
   * @param navParams         used to get content
   */
  constructor(private popoverController: PopoverController,
              private navParams: NavParams) {
    this.headerPopover = this.navParams.get('data');
  }

  /**
   * close this popover and send chosen path back
   * @param  path chosen path
   * @return void
   */
  close(path: string): void {
    this.popoverController.dismiss({
      dismissed: true,
      path
    });
  }
}
