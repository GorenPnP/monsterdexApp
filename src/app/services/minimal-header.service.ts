import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { PopoverPage } from "../pages/popover/popover.page";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MinimalHeaderService {

  constructor(public popoverController: PopoverController,
							public router: Router) { }


	async presentPopover(ev: Event, data: any) {
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
