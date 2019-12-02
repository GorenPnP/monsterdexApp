import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { environment } from '../../environments/environment';

/**
 * to resolve from message type to color of toast
 */
enum MessageType {
	success = "success",
	alert = "warning",
	error = "danger"
}

/**
 * service to communicate messages to the user
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {

	/**
	 * show no debug info in prod
	 */
	private inProd: Boolean;

	/**
	 * init values
	 * @param toastCtrl [description]
	 */
  constructor(private toastCtrl: ToastController) {
		this.inProd = environment.production;
	}

	/**
	 * toast success message
	 * @param {string} message				- the message to be shown
	 * @param {any[]} optionalParams	- optional additional information
	 * @return {void}
	 */
	success(message: string, ...optionalParams: any[]): void {
		if (this.inProd) {
			this.presentToast(MessageType.success, [message]);
		} else {
			this.presentToast(MessageType.success, [message, ...optionalParams]);
		}
	}

	/**
	 * toast alert message
	 * @param {string} message				- the message to be shown
	 * @param {any[]} optionalParams	- optional additional information
	 * @return {void}
	 */
	alert(message: string, ...optionalParams: any[]): void {
		if (this.inProd) {
			this.presentToast(MessageType.alert, [message]);
		} else {
			this.presentToast(MessageType.alert, [message, ...optionalParams]);
		}
	}

	/**
	 * toast error message
	 * @param {string} message				- the message to be shown
	 * @param {any[]} optionalParams	- optional additional information
	 * @return {void}
	 */
	error(message: string, ...optionalParams: any[]): void {
		if (this.inProd) {
			this.presentToast(MessageType.error, [message]);
		} else {
			this.presentToast(MessageType.error, [message, ...optionalParams]);
		}
	}

	/**
	 * helper to toast a message
	 * @async
	 * @param {any[]} message - toast message
	 * @return {Promise<void>}
	 */
	private async presentToast(type: MessageType, message: any[]): Promise<void> {

		// chars which should have no whitespace to the left and one space to the right
		const delimiters: {} = {":": null, ",": null};
		for (let key of Object.keys(delimiters)) {
			delimiters[key] = new RegExp(`\s*${key}\s*`, "g");
		}

		let mStrings: string[] = [];

		// add whitespace after each delimiter
		for (let m of message) {
			if (typeof m !== "string") {m = JSON.stringify(m)}
			m = m.replace(/\s+/g, " ");

			for (let delimiter of Object.entries(delimiters)) {
				m = m.replace(delimiter[1], `${delimiter[0]} `);
			}
			mStrings.push(m);
		}

		// construct toast
		const toast = await this.toastCtrl.create({
			message: mStrings.join("| "),
			showCloseButton: true,
			closeButtonText: "Schließen",
			//duration: 3000,
			color: type,
			animated: true
		});
		toast.present();
	}
}
