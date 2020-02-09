import { Injectable } from '@angular/core';

import { DatabaseService } from "./database.service";
import { MessageService } from "./message.service"
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Attacke } from "../interfaces/attacke"
import { Typ } from '../interfaces/typ';
import { DbTypenService } from './db-typen.service';

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

	private wordSearchList: Attacke[] = null;
	private typSearchList: Attacke[] = null;

  constructor(private databaseService: DatabaseService,
							private db_typen: DbTypenService,
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
		this.db_typen.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				// use allMonsters internal, monsters external
				this.allAttacken.asObservable().subscribe(allAtts => {

					// if changes in 'loaded' part occured
					if (this.attacken.getValue().length !== this.lastAttacke) {
						let atts = allAtts.slice(0, this.lastAttacke);
						this.attacken.next(atts);
					}
				});
				this.dbReady.next(true);
			}
		});
	}


	getDatabaseState(): Observable<boolean> {
		return this.dbReady.asObservable();
	}


	observeAttacke(): Observable<Attacke[]> {
		return this.attacken.asObservable();
	}

	/**
	 * add input list of Attacken to this.attacken, access changes through ovservable
	 * @param atts - contains all Attacken to be added
	 */
	private updateAttacken(atts: Attacke[], from_filter: boolean=false): void {
		let allAtts: Attacke[] = this.allAttacken.getValue();
		for (let i = 0; i < atts.length; i++) {
			allAtts[atts[i].id-1] = atts[i];
		}

		// filter is activated, ignore allMonsters
		if (from_filter) {
			this.attacken.next(atts); return;}

		// filter is not active, use allMonsters and lastMonster
		this.allAttacken.next(allAtts);
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

			let prepopulatedAtts: Attacke[] = [];

			let allAtts = this.allAttacken.getValue().slice();
			let tempAtt;
			for (let i = 0; i < neededIds.length; i++) {
				// dont go over allMonster's boundaries
				if (neededIds[i] > this.NUM_ATTACKEN) {continue;}

				tempAtt = allAtts[neededIds[i]-1];

				// if no information about monster in this.allMons, add to query
				if (tempAtt === null || tempAtt.id === 0) {
					query += "?,";
					values.push(`${neededIds[i]}`);
				} else {
					prepopulatedAtts.push(tempAtt);
				}
			}

			// if all information already gathered, return it
			if (values.length === 0) {return prepopulatedAtts;}

			// exchange last comma with closing paenthesis
			query = query.slice(0, -1) + ")";

			return this.db.executeSql(query, values).then(async data => {
				return this.dataToAttacke(data).then(atts => {

					if (atts === null || atts === []) {
						this.messageService.error("Konnte Attacken nicht finden", "in getAttackenByIds: could not get atts with ids ", neededIds);
						return [];
					}

					// return rest prematurely, even though not all ids found (of course, if they do not exist!)
					if (neededIds[neededIds.length-1] >= this.NUM_ATTACKEN) {return atts;}

					if (atts.length != values.length) {
						this.messageService.alert("Nicht alle Attacken gefunden", "in getAttackenByIds: could not get all atts with ids: ", values, " found: ", this.listIds(atts));
						return [];
					}

					// sort concatenated lists in place
					let returnList = prepopulatedAtts.concat(atts).sort(function(a, b) {return a.id < b.id? -1 : 1;});
					return returnList;
				});
			});
	  }

	async getAttacke(id: number): Promise<Attacke> {
		return this.getAttackenByIds([id]).then(atts => {
			if (!(atts && atts.length)) {
				this.messageService.error("Konnte Attacke nicht finden", "GET Attacke: could not find Attacke with id", id);
				return this.defaultAttacke();
			}
			return atts[0];
		});
	}

	async getAttackenByList(ids: number[]): Promise<Attacke[]> {
		return this.getAttackenByIds(ids).then(atts => {
			return atts;
		});
	}

	async getAttacken(offset: number): Promise<void> {
		let idOffset = offset+1;	// monster ids start at 1, not 0
		let neededList: number[] = [];
		for (let i = idOffset; i < idOffset+this.LIMIT; i++) {neededList.push(i)}
		return this.getAttackenByIds(neededList).then(atts => {
			this.lastAttacke += atts.length;
			this.updateAttacken(atts);
		});
	}

	async findAttacke(nameValue:string, callCombineAfterwards: boolean = true): Promise<void> {
		if (nameValue === null || nameValue.length === 0) {
			this.wordSearchList = null;

			// this.lastMonster seems to be 25 too far, subtract from it beforehand
			this.lastAttacke -= this.LIMIT;
			if (callCombineAfterwards) {this.combineSearchLists();}
			return;
		}

		let mask = "%"+nameValue+"%";
		let query = `SELECT * FROM monster_attacke WHERE titel LIKE ? OR id=?`;

		return this.db.executeSql(query, [mask, nameValue]).then(data => {
			return this.dataToAttacke(data).then(atts => {
				this.wordSearchList = atts;
				if (callCombineAfterwards) {this.combineSearchLists();}
			});
		});
	}

	async findByType(typeIdList: number[], operandIsOr: boolean, callCombineAfterwards: boolean = true): Promise<void>  {
		if (!typeIdList || typeIdList.length === 0) {
			this.typSearchList = null;
			if (callCombineAfterwards) {this.combineSearchLists()};
			return;
		}

		// construct query
		let query: string = "SELECT * FROM monster_attacke WHERE id IN (SELECT a.attacke_id FROM (SELECT attacke_id, COUNT(*) AS num FROM monster_attacke_typen WHERE typ_id IN (";
		let values = [];
		let limit: number = operandIsOr? 1 : typeIdList.length;

		for (let i = 0; i < typeIdList.length; i++) {
			values.push(`${typeIdList[i]}`);

			// if last, leave last operand (AND || OR) out
			if (i == typeIdList.length - 1) {
				query += `?) GROUP BY attacke_id) a WHERE a.num>=${limit})`;
				continue;
			}
			query += "?,";
		}

		// excecute query
		return this.db.executeSql(query, values).then(data => {

			return this.dataToAttacke(data).then(atts => {
				this.typSearchList = atts;
				if (callCombineAfterwards) {this.combineSearchLists();}
			});
		}).catch(e => {
				this.messageService.error("Konnte nicht nach Typen filtern", e);
		});
	}

	combineSearchLists() {
		if (this.typSearchList === null) {
			// no filter set, return to normality
			if (this.wordSearchList === null) {this.getAttacken(this.lastAttacke); return;}
			// only wordSearch set
			this.updateAttacken(this.wordSearchList, true); return;
		}

		// only type filter is set
		if (this.wordSearchList === null) {this.updateAttacken(this.typSearchList, true); return;}

		// both filters set
		let shorterIdList: number[];
		let longerIdList: number[];
		let referenceList: Attacke[];
		let combinedList: Attacke[] = [];

		if (this.wordSearchList.length <= this.typSearchList.length) {
			shorterIdList = this.listIds(this.wordSearchList);
			longerIdList = this.listIds(this.typSearchList);
			referenceList = this.wordSearchList;
		} else {
			shorterIdList = this.listIds(this.typSearchList);
			longerIdList = this.listIds(this.wordSearchList);
			referenceList = this.typSearchList;
		}

		for (let i = 0; i < shorterIdList.length; i++) {
			if (longerIdList.indexOf(shorterIdList[i]) !== -1) {combinedList.push(referenceList[i]);}
		}
		this.updateAttacken(combinedList, true);
	}


	private async dataToAttacke(data): Promise<Attacke[]> {
		let attacken: Attacke[] = [];
		let item;
		let typen: Typ[] = [];
		for (let i = 0; i < data.rows.length; i++) {
			item = data.rows.item(i);

			typen = await this.db_typen.getAttackeTypen(item.id);

			attacken.push({
				id: item.id,
				name: item.titel,
				schaden: item.schaden,
				beschreibung: item.beschreibung,
				typen: typen
			});
		}
		return attacken;
	}

	defaultAttacke(): Attacke {
		return {
			id: 0,
			name: "",
			schaden: "",
			beschreibung: "",
			typen: []
		}
	}

	/**
	 * helper function for debug output
	 * @param  atts - list of Attacken
	 * @return      - list of Attacken ids
	 */
	private listIds(atts: Attacke[]): number[] {
		if (atts === null) {return null;}

		let ids: number[] = [];
		for (let i = 0; i < atts.length; i++) {
			if (atts[i] === null || atts[i].id === 0) {
				ids.push(0);
			} else {
				ids.push(atts[i].id);
			}
		}
		return ids;
	}

	async typIcons(attId: number): Promise<string[]> {
		return this.getAttacke(attId).then(att => {
			let icons: string[] = [];

			for (let i = 0; i < att.typen.length; i++) {
				icons.push(att.typen[i].icon);
			}
			return icons;
		});
	}
}
