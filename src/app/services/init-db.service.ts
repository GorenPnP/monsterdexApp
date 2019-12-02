import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { SqliteDbCopy } from '@ionic-native/sqlite-db-copy/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../environments/environment';

/**
 * inits the sqlite db and provides it
 */
@Injectable({
  providedIn: 'root'
})
export class InitDatabaseService {
	/**
	 * db name in file system
	 */
	private dbName = "monster.db";
	/**
	 * changes to true if this service is properly intialized
	 */
	private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
	/**
	 * actual sqlite db
	 */
	private database: SQLiteObject = null;

	/**
	 * open database and save all mushroom entries in this.mushrooms
	 * @constructor
	 * @param {Platform} plt				- wait until it is ready, so db in file system is set up and reachable
	 * @param {SQLite} sqlite				- create or open db in file system
	 * @param {SqliteDbCopy} dbCopy - reset db to one in www/ directory
	 */
	constructor(private plt: Platform,
							private sqlite: SQLite,
							private dbCopy: SqliteDbCopy) {

		let willDelete = !environment.production;

		// delete and copy db on debug
		if (willDelete) {
			console.log("will delete db");
			this.deleteDB().then(_ => {
				this.initDB();
			});
		} else {
			this.initDB();
		}
	}

	/**
	 * get database state as observable, so notify on change
	 * @return {Observable<boolean>} observable of this.dbReady
	 */
	getDatabaseState(): Observable<boolean> {
		return this.dbReady.asObservable();
	}

	/**
	 * get the actual database
	 * @return {SQLiteObject} - the database
	 */
	getDatabase(): SQLiteObject {
		return this.database;
	}

	/**
	 * init and open db, set dbReady to true
	 * @return {Promise<void>}
	 */
	private async initDB(): Promise<void> {

		// copy even if none to delete found or sth.
		await this.dbCopy.copy(this.dbName, 0).then(_ => {
			// db is copied
		}).catch((e) => {
			if (e.code ===  516) {
				// db already exists, did not copy
				return;
			}
			console.log("ERROR: could not copy db: ", JSON.stringify(e));
		});

		// (create and) open db in file system
		this.plt.ready().then(() => {
			this.sqlite.create({
				name: this.dbName,
				location: 'default'
			})
				.then((db: SQLiteObject) => {
					this.database = db;
					this.dbReady.next(true);
				});
		});
	}

	/**
	 * delete db
	 * @private
	 * @async
	 * @return {Promise<void>}
	 */
	private async deleteDB(): Promise<void> {
		this.dbCopy.remove(this.dbName, 0).then(_ => {
			// db is deleted
		}).catch((e) => {
			console.log("ERROR: could not delete db: ", JSON.stringify(e));
		});
	}
}
