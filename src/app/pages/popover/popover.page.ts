import { Component } from '@angular/core';

import { PopoverController, NavParams } from '@ionic/angular';


@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage {

	/** format of header_popover:
	 * 		[
	 			{
	 				"topic": "Typen",
	 				"content": [{"title": "Liste", "icon": "list", "path": "/list-typen"}, ...]
	 			},
				{...}
	 		];
	 */
	private header_popover = [];

  constructor(private popoverController: PopoverController,
							private navParams: NavParams,) {
		this.header_popover = this.navParams.get('data');
	}

	close(path: string) {
		this.popoverController.dismiss({
			'dismissed': true,
			'path': path
		});
	}
}
