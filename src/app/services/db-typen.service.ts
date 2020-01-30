import { Injectable } from '@angular/core';

import { DatabaseService } from "./database.service";
import { MessageService } from "./message.service"
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Typ, StrToTyp } from "../interfaces/typ";

@Injectable({
  providedIn: 'root'
})
export class DbTypenService {

	LIMIT: number = 25;
	NUM_TYPEN: number = 0;

	private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

	private db: SQLiteObject;

	private allTypen = new BehaviorSubject([]);

  constructor(private databaseService: DatabaseService,
							private messageService: MessageService,
						) {
		this.databaseService.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				// get db from DatabaseService
				this.db = this.databaseService.getDatabase();
				if (!this.db) {
					this.messageService.error("Die Datenbank fehlt", "in INIT TYPEN DB: got no db: ", JSON.stringify(this.db));
				}

				// get NUM_Typen
				this.db.executeSql("SELECT COUNT(*) AS num FROM monster_typ", []).then(data => {
					if (!data || !data.rows.length) {
						this.messageService.error("Konnte Anzahl der Typen nicht ermitteln");
					}
					this.NUM_TYPEN = data.rows.item(0).num;

					// init allTypen
					let i = 0;
					let emptyList = []
					while (i++ < this.NUM_TYPEN) {emptyList.push(null);}
					this.allTypen.next(emptyList);

					// seed db and set this.dbReady to true
					this.seedDatabase();
				}).catch(err => {
					this.messageService.error("Konnte Typen nicht finden", "Could not initiate TypenService.", err);
					this.NUM_TYPEN = 21;

					// init allTypen
					let i = 0;
					let emptyList = []
					while (i++ < this.NUM_TYPEN) {emptyList.push(null);}
					this.allTypen.next(emptyList);
				});
			}
		});
	}

	private async seedDatabase() {

		// TODO: delete because debug
/*		this.allTypen.asObservable().subscribe(mon => {
			try {
				let indices:number[] = this.listIds(mon);
				console.log("allTypen on Subscription, got ids:", indices);
			} catch (e) {
				console.log("error in allTypen sub:", e);
			}
		});
*/
		this.dbReady.next(true);
	}

	getDatabaseState(): Observable<boolean> {
		return this.dbReady.asObservable();
	}


	observeTyp(): Observable<Typ[]> {
		return this.allTypen.asObservable();
	}

	/**
	 * add input list of Ḿonsters to this.typen, access changes through ovservable
	 * @param mons - contains all Typen to be added
	 */
	private updateTypen(mons: Typ[]): void {
		// filter is not active, use allTypen and lastTyp
		let allMons: Typ[] = this.allTypen.getValue();
		for (let i = 0; i < mons.length; i++) {
			allMons[mons[i].id-1] = mons[i];
		}
		this.allTypen.next(allMons);
	}


	async getAllTypenIcons() {
		let ids: number[] = [];
		for (let i = 1; i <= this.NUM_TYPEN; i++) {ids.push(i);}

		await this.getTypenByIds(ids);
		let typen = this.allTypen.getValue();

		return typen;
	}

	async getTypen(neededIds: number[]): Promise<Typ[]> {
		return this.getTypenByIds(neededIds);
	}

	/**
	 * only function to read Typ entries from the db
	 * @param  neededIds - look for Typen with folliwing IDs
	 * @return           - the Typen found
	 */
	private async getTypenByIds(neededIds: number[]): Promise<Typ[]> {
		// build query and values
		let query = `SELECT * FROM monster_typ WHERE id IN (`;
		let values = [];

		let prepopulatedTypes: Typ[] = [];

		let allTypes = this.allTypen.getValue().slice();

		let tempType;
		for (let i = 0; i < neededIds.length; i++) {
			// dont go over allTyp's boundaries
			if (neededIds[i] > this.NUM_TYPEN) {continue;}

			tempType = allTypes[neededIds[i]-1];

			// if no information about Typ in this.allTypes, add to query
			if (tempType === null || tempType.id === 0) {
				query += "?,";
				values.push(`${neededIds[i]}`);
			} else {
				prepopulatedTypes.push(tempType);
			}
		}

		// if all information already gathered, return it
		if (values.length === 0) {return prepopulatedTypes;}

		// exchange last comma with closing paenthesis
		query = query.slice(0, -1) + ")";

		return this.db.executeSql(query, values).then(async data => {
			let types = this.dataToTyp(data);

			if (types === null || types === []) {
				this.messageService.error("Konnte Typ nicht finden", "in getTypen: could not get Typen with ids ", neededIds);
				return [];
			}

			// return rest prematurely, even though not all ids found (of course, if they do not exist!)
			if (neededIds[neededIds.length-1] > this.NUM_TYPEN) {return types;}

			if (types.length != values.length) {
				this.messageService.alert("Nicht alle Typ gefunden", "in GET Typ: could not get all Typ with ids: ", values, " found: ", this.listIds(types));
				return [];
			}

			// sole place to update
			this.updateTypen(types);

			// sort concatenated lists in place
			let returnList = prepopulatedTypes.concat(types).sort(function(a, b) {return a.id < b.id? -1 : 1;});
			return returnList;
		}).catch(err => {
			this.messageService.error("Konnte Typen nicht laden", "GET TYPEN BY IDS: DB query didnt work", err);
			return []
		});
  }

	async getTyp(id: number): Promise<Typ> {
		return this.getTypenByIds([id]).then(mons => {
			if (!(mons && mons.length)) {
				this.messageService.error("Konnte Typ nicht finden", "GET Typ: could not find Typ with id", id);
				return this.defaultTyp();
			}
			return mons[0];
		});
	}

	async getMonsterTypen(monId: number): Promise<Typ[]> {

		return this.db.executeSql(`SELECT typ_id FROM monster_monster_typen WHERE monster_id=?`, [`${monId}`]).then(data => {
			let typIds: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
				typIds.push(data.rows.item(i).typ_id);
			}

			return this.getTypenByIds(typIds).then(typen =>  {
				return typen;
			});
		});
	}

	async getAttackeTypen(attId: number): Promise<Typ[]> {

		return this.db.executeSql(`SELECT typ_id FROM monster_attacke_typen WHERE attacke_id=?`, [`${attId}`]).then(data => {
			let typIds: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
				typIds.push(data.rows.item(i).typ_id);
			}

			return this.getTypenByIds(typIds).then(typen =>  {
				return typen;
			});
		});
	}

	dataToTyp(data): Typ[] {
		let typen: Typ[] = [];
		let item;
		let typClass: Typ;
		for (let i = 0; i < data.rows.length; i++) {
			item = data.rows.item(i);
			typClass = StrToTyp[item.titel];
			typClass.id = item.id;

			typen.push(typClass);
		}
		return typen;
	}

	defaultTyp(): Typ {
		let typClass: Typ;
		return typClass;
	}

	/**
	 * helper function for debug output
	 * @param  mons - list of Typen
	 * @return      - list of Typen ids
	 */
	private listIds(typen: Typ[]): number[] {
		let ids: number[] = [];
		for (let i = 0; i < typen.length; i++) {
			if (typen[i] === null || typen[i].id === 0) {
				ids.push(0);
			} else {
				ids.push(typen[i].id);
			}
		}
		return ids;
	}

	// returns INT, not FLOAT
	async getEfficiency(fromIds: number[], toIds: number[]): Promise<number> {
		let query = "SELECT efficiency AS eff FROM monster_typ_efficiency WHERE from_typ_id IN (";
		for (let i = 0; i < fromIds.length; i++) {
			query += "?,";
		}

		query = query.slice(0, query.length-1) + ") AND to_typ_id IN (";
		for (let i = 0; i < toIds.length; i++) {
			query += "?,";
		}

		query = query.slice(0, query.length-1) + ")";
		return this.db.executeSql(query, fromIds.concat(toIds)).then(data => {
			let factor: number = 1.0;
			let dummy: number;
			for (let i = 0; i < data.rows.length; i++) {
				dummy = data.rows.item(i).eff;
				if (dummy < 0.0) {
					return 0;
				}
				factor *= dummy;
			}

			if (factor >= 1.0) {
				return Math.round(factor);
			}
			// less than normal effective
			return Math.round(Math.log(factor) / Math.log(2));
		});
	}
}
