import { Injectable } from '@angular/core';

import { DatabaseService } from "./database.service";
import { MessageService } from "./message.service"
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Monster } from "../interfaces/monster"
import { Typ } from '../interfaces/typ';
import { DbTypenService } from './db-typen.service';

@Injectable({
  providedIn: 'root'
})
export class DbMonsterService {

	LIMIT: number = 25;
	NUM_MONSTER:number = 0;

	private lastMonster: number = 0;

	private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

	private db: SQLiteObject;

	private allMonsters = new BehaviorSubject([]);
	private monsters = new BehaviorSubject([]);

	private wordSearchList: Monster[] = null;
	private typSearchList: Monster[] = null;

  constructor(private databaseService: DatabaseService,
							private messageService: MessageService,
							private db_typen: DbTypenService
							) {
		this.databaseService.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				// get db from DatabaseService
				this.db = this.databaseService.getDatabase();
				if (!this.db) {
					this.messageService.error("Die Datenbank fehlt", "in INIT MUSHROOM DB: got no db: ", JSON.stringify(this.db));
				}

				this.db.executeSql("SELECT COUNT(*) AS num FROM monster_monster", []).then(data => {
					if (!data || !data.rows.length) {
						this.messageService.error("Konnte Anzahl der Monster nicht ermitteln");
					}
					this.NUM_MONSTER = data.rows.item(0).num;

					// init allMonster
					let i = 0;
					let emptyList = [];
					while (i++ < this.NUM_MONSTER) {emptyList.push(null);}
					this.allMonsters.next(emptyList);

					// seed db and set this.dbReady to true
					this.seedDatabase();
				});
			}
		});
	}

	private async seedDatabase() {

		this.db_typen.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				// use allMonsters internal, monsters external
				this.allMonsters.asObservable().subscribe(mon => {

					// if changes in 'loaded' part occured
					if (this.monsters.getValue().length !== this.lastMonster) {
						let mons = mon.slice(0, this.lastMonster);
						this.monsters.next(mons);
					}
				});
				this.dbReady.next(true);
			}
		});
	}

	getDatabaseState(): Observable<boolean> {
		return this.dbReady.asObservable();
	}


	observeMonster(): Observable<Monster[]> {
		return this.monsters.asObservable();
	}


	/**
	 * add input list of Ḿonsters to this.monsters, access changes through ovservable
	 * @param mons - contains all monsters to be added
	 */
	private updateMonsters(mons: Monster[], from_filter: boolean=false): void {

		let allMons: Monster[] = this.allMonsters.getValue();
		for (let i = 0; i < mons.length; i++) {
			allMons[mons[i].id-1] = mons[i];
		}

		// filter is activated, ignore allMonsters
		if (from_filter) {this.monsters.next(mons); return;}

		// filter is not active, use allMonsters and lastMonster
		this.allMonsters.next(allMons);
	}

	/**
	 * only function to read monster entries from the db
	 * @param  neededIds - look for monsters with folliwing IDs
	 * @return           - the monsters found
	 */
	async getMonstersByIds(neededIds: number[]): Promise<Monster[]> {

		// build query and values
		let query = `SELECT * FROM monster_monster WHERE id IN (`;
		let values = [];

		let prepopulatedMons: Monster[] = [];

		let allMon = this.allMonsters.getValue().slice();
		let tempMon;
		for (let i = 0; i < neededIds.length; i++) {
			// dont go over allMonster's boundaries
			if (neededIds[i] > this.NUM_MONSTER) {continue;}

			tempMon = allMon[neededIds[i]-1];

			// if no information about monster in this.allMons, add to query
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
			return this.dataToMonster(data).then(mons => {

				if (mons === null || mons === []) {
					this.messageService.error("Konnte Monster nicht finden", "in getMonsters: could not get monsters with ids ", neededIds);
					return [];
				}

				// return rest prematurely, even though not all ids found (of course, if they do not exist!)
				if (neededIds[neededIds.length-1] >= this.NUM_MONSTER) {return mons;}

				if (mons.length != values.length) {
					this.messageService.alert("Nicht alle Monster gefunden", "in GET MONSTER: could not get all monster with ids: ", values, " found: ", this.listIds(mons));
					return [];
				}

				// sort concatenated lists in place
				let returnList = prepopulatedMons.concat(mons).sort(function(a, b) {return a.id < b.id? -1 : 1;});
				return returnList;
			});
		});
  }

	async getMonster(id: number): Promise<Monster> {
		return this.getMonstersByIds([id]).then(mons => {
			if (!(mons && mons.length)) {
				this.messageService.error("Konnte Monster nicht finden", "GET MONSTER: could not find monster with id", id);
				return this.defaultMonster();
			}
			return mons[0];
		});
	}

	async getMonsters(offset: number): Promise<void> {
		let idOffset = offset+1;	// monster ids start at 1, not 0
		let neededList: number[] = [];
		for (let i = idOffset; i < idOffset+this.LIMIT; i++) {neededList.push(i)}
		return this.getMonstersByIds(neededList).then(mon => {
			this.lastMonster += mon.length;
			return this.updateMonsters(mon);
		});
	}


	async findMonster(nameValue:string, callCombineAfterwards: boolean = true): Promise<void> {
		if (nameValue === null || nameValue.length === 0) {
			this.wordSearchList = null;

			// this.lastMonster seems to be 25 too far, subtract from it beforehand
			this.lastMonster -= this.LIMIT;
			if (callCombineAfterwards) {this.combineSearchLists();}
			return;
		}

		let mask = "%"+nameValue+"%";
		let query = `SELECT * FROM monster_monster WHERE name LIKE ? OR id=?`;

		return this.db.executeSql(query, [mask, nameValue]).then(data => {
			return this.dataToMonster(data).then(mons => {
				this.wordSearchList = mons;
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
		let query: string = "SELECT * FROM monster_monster WHERE id IN (SELECT a.monster_id FROM (SELECT monster_id, COUNT(*) AS num FROM monster_monster_typen WHERE typ_id IN (";
		let values = [];
		let limit: number = operandIsOr? 1 : typeIdList.length;

		for (let i = 0; i < typeIdList.length; i++) {
			values.push(`${typeIdList[i]}`);

			// if last, leave last operand (AND || OR) out
			if (i == typeIdList.length - 1) {
				query += `?) GROUP BY monster_id) a WHERE a.num>=${limit})`;
				continue;
			}
			query += "?,";
		}

		// excecute query
		return this.db.executeSql(query, values).then(data => {

			return this.dataToMonster(data).then(mons => {
				this.typSearchList = mons;
				if (callCombineAfterwards) {this.combineSearchLists();}
			});
		}).catch(e => {
				this.messageService.error("Konnte nicht nach Typen filtern", e);
		});
	}

	combineSearchLists() {
		if (this.typSearchList === null) {
			// no filter set, return to normality
			if (this.wordSearchList === null) {this.getMonsters(this.lastMonster); return;}
			// only wordSearch set
			this.updateMonsters(this.wordSearchList, true); return;
		}

		// only type filter is set
		if (this.wordSearchList === null) {this.updateMonsters(this.typSearchList, true); return;}

		// both filters set
		let shorterIdList: number[];
		let longerIdList: number[];
		let referenceList: Monster[];
		let combinedList: Monster[] = [];

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
		this.updateMonsters(combinedList, true);
	}

	private async getAttacken(monId: number): Promise<number[]> {

		let query = `SELECT attacke_id FROM monster_monster_attacken WHERE monster_id=?`;

		return this.db.executeSql(query, [`${monId}`]).then(data => {
			let ids: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
					ids.push(data.rows.item(i).attacke_id);
			}
			return ids;
		}).catch(e => {this.messageService.error("Konnte Attacken zu dem Monster nicht finden", e); return [];});
	}


	private async dataToMonster(data): Promise<Monster[]> {

		let monsters: Monster[] = [];
		let item;
		let atts: number[];
		let typen: Typ[];
		let gegenteilmonster: number[];
		let aehnlicheFormen: number[];

		for (let i = 0; i < data.rows.length; i++) {
			item = data.rows.item(i);

			atts = await this.getAttacken(item.id);
			typen = await this.db_typen.getMonsterTypen(item.id);
			gegenteilmonster = await this.getGegenteilmonster(item.id);
			aehnlicheFormen = await this.getAehnlicheFormen(item.id);

			monsters.push({
				id: item.id,
				name: item.name,
				rang: item.rang,
				groesse: item.größe,
				gewicht: item.gewicht,
				hp: item.hp,
				habitat: item.habitat,
				schadensverhinderung: item.schadensverhinderung,
				beschreibung: item.beschreibung,
				gegenteilmonster: gegenteilmonster,
				aehnlicheFormen: aehnlicheFormen,
				attacken: atts,
				typen: typen
			});
		}
		return monsters;
	}

	defaultMonster(): Monster {
		return {
			id: 0,
			name: "",
			rang: 0,
			groesse: 0,
			gewicht: 0,
			hp: 0,
			habitat: "",
			schadensverhinderung: "",
			beschreibung: "",
			gegenteilmonster: [],
			aehnlicheFormen: [],
			attacken: [],
			typen: []
		}
	}

	/**
	 * helper function for debug output
	 * @param  mons - list of monsters
	 * @return      - list of monsters ids
	 */
	private	listIds(mons: Monster[]): number[] {
		if (mons === null) {return null;}

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

	async typIcons(monId: number): Promise<string[]> {
		return this.getMonster(monId).then(mon => {
			let icons: string[] = [];

			for (let i = 0; i < mon.typen.length; i++) {
				icons.push(mon.typen[i].icon);
			}
			return icons;
		});
	}

	async getMonstersByAttacke(attId: number): Promise<Monster[]> {

		let query = `SELECT monster_id FROM monster_monster_attacken WHERE attacke_id=?`;

		return this.db.executeSql(query, [`${attId}`]).then(data => {
			let ids: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
					ids.push(data.rows.item(i).monster_id);
			}
			return this.getMonstersByIds(ids).then(mons => {return mons});
		}).catch(e => {this.messageService.error("Konnte Monster zu der Attacke nicht finden", e); return [];});
	}

	async getAehnlicheFormen(monsId: number): Promise<number[]> {
		return this.db.executeSql("SELECT mon_2 FROM monster_monster_verschFormen WHERE mon_1=?", [`${monsId}`]).then(data => {

			let returnList: number[] = [];
			for (let i = 0; i < data.rows.length; i++) {
				returnList.push(data.rows.item(i).mon_2);
			}
			return returnList;
		}).catch(err => {console.log("error loading aehnliche formen of", monsId, err); return [];});
	}

	async getGegenteilmonster(monsId: number): Promise<number[]> {
		return this.db.executeSql("SELECT mon_2 FROM monster_gegenteilmonster WHERE mon_1=?", [`${monsId}`]).then(data => {

			let returnList: number[] = [];
			for (let i = 0; i < data.rows.length; i++) {
				returnList.push(data.rows.item(i).mon_2);
			}
			return returnList;
		}).catch(err => {console.log("error loading gegenteilmonster of", monsId, err); return [];});
	}


	async getEvolution(monId: number) {
		let anchestors = await this.getAnchestors(monId);
		let predecessor = await this.getPredecessors(monId);
		return [anchestors, predecessor];
	}

	// look before (where b is monId, ...)
	async getAnchestors(monId: number) {
		let query: string = "SELECT vor FROM monster_evolution WHERE nach=?";

		return this.db.executeSql(query, [`${monId}`]).then(data => {
			let ids: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
				ids.push(data.rows.item(i).vor);
			}
			return this.getMonstersByIds(ids).then(mons => {return mons});
		});
	}

	// look after (where a is monId, ...)
	async getPredecessors(monId: number) {
		let query: string = "SELECT nach FROM monster_evolution WHERE vor=?";

		return this.db.executeSql(query, [`${monId}`]).then(data => {
			let ids: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
				ids.push(data.rows.item(i).nach);
			}
			return this.getMonstersByIds(ids).then(mons => {return mons});
		});
	}

	async getAllSortedByRang(sortingIndex: number) {
		if (sortingIndex === 0) {return this.combineSearchLists();}

		let query: string = "SELECT * FROM monster_monster ORDER BY rang " + (sortingIndex === 1? "ASC" : "DESC");
		return this.db.executeSql(query, []).then(data => {
			return this.dataToMonster(data).then(mons => {
				return this.updateMonsters(mons, true);
			});
		}).catch(err => {console.log("rang sort:", query, err)})
	}
}
