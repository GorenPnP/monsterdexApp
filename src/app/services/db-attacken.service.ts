import { Injectable } from '@angular/core';

import { InitDatabaseService } from "./init-db.service";
import { MessageService } from "./message.service"
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Attacke } from "../interfaces/attacke"

@Injectable({
  providedIn: 'root'
})
export class DbAttackenService {

	LIMIT: number = 25;
	NUM_ATTACKEN: number = 0;

	private lastAttacke: number = 0;
	private filter_on: boolean = false;

	private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

	private db: SQLiteObject;

	private allAttacken = new BehaviorSubject([]);
	private attacken = new BehaviorSubject([]);

  constructor(private databaseService: InitDatabaseService,
							private messageService: MessageService,
						) {
		this.databaseService.getDatabaseState().subscribe(rdy => {
		if (rdy) {
			// get db from DatabaseService
			this.db = this.databaseService.getDatabase();
			if (!this.db) {
				this.messageService.error("Die Datenbank fehlt", "in INIT ATTACKEN DB: got no db: ", JSON.stringify(this.db));
			}

			// get NUM_ATTACKEN
			this.db.executeSql("SELECT COUNT(*) AS num FROM monster_attacke", []).then(data => {
				if (!data || !data.rows.length) {
					this.messageService.error("Konnte Anzahl der Attacken nicht ermitteln");
				}
				this.NUM_ATTACKEN = data.rows.item(0).num;

				// init allAttacken
				let i = 0;
				let emptyList = []
				while (i++ < this.NUM_ATTACKEN) {emptyList.push(null);}
				this.allAttacken.next(emptyList);

				// seed db and set this.dbReady to true
				this.seedDatabase();
			});
			}
		});
	}

	private async seedDatabase() {
		// use allAttacken internal, Attacken external
		this.allAttacken.asObservable().subscribe(mon => {

			// if changes in 'loaded' part occured
			if (this.attacken.getValue().length < this.lastAttacke) {
				let mons = mon.slice(0, this.lastAttacke);
				this.attacken.next(mons);
			}
		});


		// TODO: delete because debug
		this.attacken.asObservable().subscribe(mon => {
			let indices:number[] = [];
			for (let i = 0; i < mon.length; i++) {
				indices.push(mon[i].id);
			}
		})

		this.dbReady.next(true);
	}

	getDatabaseState(): Observable<boolean> {
		return this.dbReady.asObservable();
	}


	observeAttacke(): Observable<Attacke[]> {
		return this.attacken.asObservable();
	}

	/**
	 * add input list of Ḿonsters to this.attacken, access changes through ovservable
	 * @param mons - contains all Attacken to be added
	 */
	private updateAttacken(mons: Attacke[], from_filter: boolean=false): void {
		if ( (this.filter_on && !from_filter) || (!this.filter_on && from_filter) ) {return;}

		// filter is activated, ignore allAttacken
		if (this.filter_on && from_filter) {this.attacken.next(mons); return;}

		// filter is not active, use allAttacken and lastAttacke
		let allMons: Attacke[] = this.allAttacken.getValue();
		for (let i = 0; i < mons.length; i++) {
			allMons[mons[i].id-1] = mons[i];
		}
		this.allAttacken.next(allMons);
	}

	/**
	 * only function to read Attacke entries from the db
	 * @param  neededIds - look for Attacken with folliwing IDs
	 * @return           - the Attacken found
	 */
	private async getAttackenByIds(neededIds: number[]): Promise<Attacke[]> {

		// build query and values
		let query = `SELECT * FROM monster_attacke WHERE id IN (`;
		let values = [];

		let prepopulatedMons: Attacke[] = [];

		let allMon = this.allAttacken.getValue().slice();
		let tempMon;
		for (let i = 0; i < neededIds.length; i++) {
			// dont go over allAttacke's boundaries
			if (neededIds[i] > this.NUM_ATTACKEN) {continue;}

			tempMon = allMon[neededIds[i]-1];

			// if no information about Attacke in this.allMons, add to query
			if (tempMon === null || tempMon.id === 0) {
				query += "?,";
				values.push(`${neededIds[i]}`);
			} else {
				prepopulatedMons.push(tempMon);
			}
		}

		// if all information already gathered, return it
		if (values.length === 0) {
			return prepopulatedMons;
		}

		// exchange last comma with closing paenthesis
		query = query.slice(0, -1) + ")";

		return this.db.executeSql(query, values).then(async data => {
			let mons = this.dataToAttacke(data);

			if (mons === null || mons === []) {
				this.messageService.error("Konnte Attacke nicht finden", "in getAttacken: could not get Attacken with ids ", neededIds);
				return [this.defaultAttacke()];
			}

			// return rest prematurely, even though not all ids found (of course, if they do not exist!)
			if (neededIds[neededIds.length-1] >= this.NUM_ATTACKEN) {return mons;}

			if (mons.length != values.length) {
				this.messageService.alert("Nicht alle Attacke gefunden", "in GET Attacke: could not get all Attacke with ids: ", values, " found: ", this.listIds(mons));
				return [this.defaultAttacke()];
			}

			// sort concatenated lists in place
			let returnList = prepopulatedMons.concat(mons).sort(function(a, b) {return a.id < b.id? -1 : 1;});
			return returnList;
		});
  }

	async getAttacke(id: number): Promise<Attacke> {
		return this.getAttackenByIds([id]).then(mons => {
			if (!(mons && mons.length)) {
				this.messageService.error("Konnte Attacke nicht finden", "GET Attacke: could not find Attacke with id", id);
				return this.defaultAttacke();
			}
			this.updateAttacken([mons[0]]);
			return mons[0];
		});
	}

	async getAttackenByList(ids: number[]): Promise<Attacke[]> {
		return this.getAttackenByIds(ids).then(mon => {
			this.updateAttacken(mon);

			return mon;
		});
	}

	async getAttacken(offset: number): Promise<void> {
		let idOffset = offset+1;	// Attacke ids start at 1, not 0
		let neededList: number[] = [];
		for (let i = idOffset; i < idOffset+this.LIMIT; i++) {neededList.push(i)}
		return this.getAttackenByIds(neededList).then(mon => {
			this.lastAttacke += this.LIMIT;
			this.updateAttacken(mon);
		});
	}

	async findAttacke(nameValue:string): Promise<void> {
		if (nameValue && nameValue.length) {
			this.filter_on = true;

			let mask = "%"+nameValue+"%";
			let query = `SELECT * FROM monster_attacke WHERE titel LIKE ?`;

			return this.db.executeSql(query, [mask]).then(data => {
				let mons = this.dataToAttacke(data);
				this.updateAttacken(mons, true);
			});
		}
		this.filter_on = false;
		// this.lastAttacke seems to be 25 too far, subtract from it beforehand
		this.lastAttacke -= this.LIMIT;
		return this.getAttacken(this.lastAttacke);
	}

	dataToAttacke(data): Attacke[] {
		let attacken: Attacke[] = [];
		let item;
		for (let i = 0; i < data.rows.length; i++) {
			item = data.rows.item(i);
			attacken.push({
				id: item.id,
				name: item.titel,
				schaden: item.schaden,
				beschreibung: item.beschreibung
			});
		}
		return attacken;
	}

	defaultAttacke(): Attacke {
		return {
			id: 0,
			name: "",
			schaden: "",
			beschreibung: ""
		}
	}

	/**
	 * helper function for debug output
	 * @param  mons - list of Attacken
	 * @return      - list of Attacken ids
	 */
	private listIds(mons: Attacke[]): number[] {
		let ids: number[] = [];
		for (let i = 0; i < mons.length; i++) {
			if (mons[i] === null || mons[i].id === 0) {
				ids.push(0);
			} else {
				ids.push(mons[i].id);
			}
		}
		return ids;
	}
}
