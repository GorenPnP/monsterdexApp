import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { PopoverPage } from "../pages/popover/popover.page";
import { Router } from '@angular/router';

/**
 * provides minimal functionality for a header
 */
@Injectable({
  providedIn: 'root'
})
export class MinimalHeaderService {

	/**
	 * do nothing in particular
	 * @param popoverController to display a popover
	 * @param router            to navigate to another page
	 */
  constructor(public popoverController: PopoverController,
							public router: Router) { }


	/**
	 * open popover and navigate if path returned
	 * @param  ev		event to the popover, needed for controller
	 * @param  data	the content to be displayed
	 * @return Promise<void>
	 */
	async presentPopover(ev: Event, data: any): Promise<void> {
		const popover = await this.popoverController.create({
				component: PopoverPage,
				event: ev,
				translucent: true,
				componentProps: {"data": data}
			});

		// async operation, fired before modal closes
		popover.onWillDismiss().then((res) => {

			// retrieve filterVals and store them, e.g. for next modal
			let path = res["data"]["path"];

			this.router.navigateByUrl(path);
		});

		return await popover.present();
	}
}
