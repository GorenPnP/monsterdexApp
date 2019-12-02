import { Injectable } from '@angular/core';

import { InitDatabaseService } from "./init-db.service";
import { MessageService } from "./message.service"
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Typ, StrToTyp } from "../interfaces/typ";
import { Monster } from "../interfaces/monster";

@Injectable({
  providedIn: 'root'
})
export class DbTypenService {

	LIMIT: number = 25;
	NUM_TYPEN: number = 0;

	private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

	private db: SQLiteObject;

	private allTypen = new BehaviorSubject([]);

  constructor(private databaseService: InitDatabaseService,
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
			});
			}
		});
	}

	private async seedDatabase() {

		// TODO: delete because debug
		this.allTypen.asObservable().subscribe(mon => {
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

	/**
	 * only function to read Typ entries from the db
	 * @param  neededIds - look for Typen with folliwing IDs
	 * @return           - the Typen found
	 */
	private async getTypenByIds(neededIds: number[]): Promise<Typ[]> {

		// build query and values
		let query = `SELECT * FROM monster_typ WHERE id IN (`;
		let values = [];

		let prepopulatedMons: Typ[] = [];

		let allMon = this.allTypen.getValue().slice();
		let tempMon;
		for (let i = 0; i < neededIds.length; i++) {
			// dont go over allTyp's boundaries
			if (neededIds[i] > this.NUM_TYPEN) {continue;}

			tempMon = allMon[neededIds[i]-1];

			// if no information about Typ in this.allMons, add to query
			if (tempMon === null || tempMon.id === 0) {
				query += "?,";
				values.push(`${neededIds[i]}`);
			} else {
				prepopulatedMons.push(tempMon);
			}
		}

		// if all information already gathered, return it
		if (values.length === 0) {return prepopulatedMons;}

		// exchange last comma with closing paenthesis
		query = query.slice(0, -1) + ")";

		return this.db.executeSql(query, values).then(async data => {
			let mons = this.dataToTyp(data);

			if (mons === null || mons === []) {
				this.messageService.error("Konnte Typ nicht finden", "in getTypen: could not get Typen with ids ", neededIds);
				return [this.defaultTyp()];
			}

			// return rest prematurely, even though not all ids found (of course, if they do not exist!)
			if (neededIds[neededIds.length-1] >= this.NUM_TYPEN) {return mons;}

			if (mons.length != values.length) {
				this.messageService.alert("Nicht alle Typ gefunden", "in GET Typ: could not get all Typ with ids: ", values, " found: ", this.listIds(mons));
				return [this.defaultTyp()];
			}

			// sort concatenated lists in place
			let returnList = prepopulatedMons.concat(mons).sort(function(a, b) {return a.id < b.id? -1 : 1;});
			return returnList;
		});
  }

	async getTyp(id: number): Promise<Typ> {
		return this.getTypenByIds([id]).then(mons => {
			if (!(mons && mons.length)) {
				this.messageService.error("Konnte Typ nicht finden", "GET Typ: could not find Typ with id", id);
				return this.defaultTyp();
			}
			this.updateTypen([mons[0]]);
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
	private listIds(mons: Typ[]): number[] {
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
