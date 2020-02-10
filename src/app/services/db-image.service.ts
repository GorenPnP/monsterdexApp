import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { DatabaseService } from './database.service';
import { MessageService } from "./message.service";

import { Image } from "../interfaces/image";

/**
 * service for all things image entries
 */
@Injectable({
  providedIn: 'root'
})
export class DbImageService {

	/**
	 * actual sqlite db
	 */
	private database: SQLiteObject = null;
	/**
	 * changes to true if this service is properly intialized
	 */
	private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

	/**
	 * retrieve db and set this.dbReady to true
	 * @param {DatabaseService} databaseService							- to get the actual db
	 * @param {MessageService} messageService								- to inform the user about successes, alerts, errors
	 */
	constructor(private databaseService: DatabaseService,
							private messageService: MessageService) {

		this.databaseService.getDatabaseState().subscribe(rdy => {
      if (rdy) {
      	this.database = this.databaseService.getDatabase();
				if (!this.database) {
					this.messageService.error("Die Datenbank fehlt", "in INIT IMAGE DB: got no db: ", JSON.stringify(this.database));
				}
				this.dbReady.next(true);
			}
		});
	}

	/**
	 * get database state as observable, so notify on change
	 * @return {Observable<boolean>} observable of this.dbReady
	 */
	getDatabaseState(): Observable<boolean> {
		return this.dbReady.asObservable();
	}

	/**
	 * get the image belonging to the @param {number} imageId
	 * @async
	 * @param {number} imageId - the id to find according image entry
	 * @return {Promise<Image>} - the image found or null
	 */
	async getImage(imageId: number): Promise<Image> {

		if (!imageId) {
			this.messageService.error("Fehlerhafter Input einer Funktion", "in GET IMAGE: image id not valid: ", imageId);
			return null;
		}

		// set resLocation
		return {id: imageId, resLocation: `assets/monster_images/${imageId}.png`};
	}


	/**
	 * get all images to a specific monster (there is exactly one)
	 * @async
	 * @param {number} monsterId		- the id of a monster to find images for
	 * @return {Promise<Images[]>}	- the images found
	 */
	async getImages(monsterId: number): Promise<any> {

		// validate mushroomId
		if (!monsterId) {
			this.messageService.error("Fehlerhafter Input einer Funktion", "in GET IMAGES FROM: mushroom id not valid: ", monsterId);
			return null;
		}

		// get the one image
		return this.getImage(monsterId).then(image => {
			return image? image : null;

		}).catch(err => {
			this.messageService.error("Problem beim Lesen eines Bildes", "in  GET IMAGES -> GET IMAGE: ", JSON.stringify(err));
			return null;
		});
	}
}
