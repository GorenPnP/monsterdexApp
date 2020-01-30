import { Injectable } from '@angular/core';

import { DatabaseService } from "./database.service";
import { MessageService } from "./message.service"
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Monster } from "../interfaces/monster"
import { Typ } from '../interfaces/typ';
import { DbTypenService } from './db-typen.service';
import { Attacke } from '../interfaces/attacke';

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
	private selectedMonsters = new BehaviorSubject([]);

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

	/*	TODO: add here

			// notify about changed images
			this.imageService.getDatabaseState().subscribe(i_rdy => {
				if (i_rdy) {
					this.imageService.getImagesChanged().subscribe(_ => {this.loadMonsters();})
				}
			});
	*/

			}
		});
	}

	private async seedDatabase() {

		this.db_typen.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				// use allMonsters internal, monsters external
				this.allMonsters.asObservable().subscribe(mon => {

					// if changes in 'loaded' part occured
					if (this.monsters.getValue().length < this.lastMonster) {
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

	getSelectedMonsters(): Observable<Monster[]> {
		return this.selectedMonsters.asObservable();
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
		if (from_filter) {
			this.monsters.next(mons); return;}

		// filter is not active, use allMonsters and lastMonster
		this.allMonsters.next(allMons);
	}

	/**
	 * only function to read monster entries from the db
	 * @param  neededIds - look for monsters with folliwing IDs
	 * @return           - the monsters found
	 */
	private async getMonstersByIds(neededIds: number[]): Promise<Monster[]> {

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
			this.updateMonsters(mon);
		});
	}

	async loadSelectedMonsters() {
		/*
		return this.db.executeSql('SELECT * FROM monster_selected', []).then(data => {
			let selectedMonsters: Monster[] = [];
			let item;
			let rawMonster: Monster;
			for (let i = 0; i < data.rows.length; i++) {
				item = data.item(i);
				console.log("id = ", item.monster);
				this.getMonster(item.monster).then(mon => {
					rawMonster = mon;
					selectedMonsters.push(rawMonster);
				});
			}
			console.log("selected: ", selectedMonsters);

			this.selectedMonsters.next(selectedMonsters);
		});
		*/
	}

	toggleIsSelected(monster: Monster) {
/*		let monsters: Monster[] = [];
		let selectedMonsters = this.selectedMonsters.getValue();
		for (let m of this.monsters.getValue()) {
			// toggle
			if (m.id === monster.id) {

				// add to selectedMonsters
				if (!m.isSelected) {
					selectedMonsters.push(m);
				} else
				// remove from selectedMonsters
				{
					let i = selectedMonsters.indexOf(m);
					if (i <= -1) {
						console.log("ERROR, MONSTER SHOULD BE SELECTED: ", JSON.stringify(m));
						break;
					}
						selectedMonsters.splice(i, 1);
				}
				m.isSelected = !m.isSelected;
			}
			monsters.push(m);
		}
		this.monsters.next(monsters);
		this.selectedMonsters.next(selectedMonsters);
*/	}


	async findMonster(nameValue:string): Promise<void> {
		if (nameValue && nameValue.length) {

			let mask = "%"+nameValue+"%";
			let query = `SELECT * FROM monster_monster WHERE name LIKE ? OR id=?`;

			return this.db.executeSql(query, [mask, nameValue]).then(data => {
				return this.dataToMonster(data).then(mons => {

/*
let slices = [];
for (let i = 0; i < mons.length; i++) {
	slices.push((mons[i].id, mons[i].name));
}
console.log(nameValue, "\nfound:", slices);
*/

					this.updateMonsters(mons, true);
				});
			});
		} else {

			// this.lastMonster seems to be 25 too far, subtract from it beforehand
			this.lastMonster -= this.LIMIT;
			return this.getMonsters(this.lastMonster);
		}
	}

	private async getAttacken(monId: number): Promise<number[]> {

		let query = `SELECT attacke_id FROM monster_monster_attacken WHERE monster_id=?`;

		return this.db.executeSql(query, [`${monId}`]).then(data => {
			let ids: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
					ids.push(data.rows.item(i).attacke_id);
			}
			return ids;
		}).catch(e => {console.log(e); return [];});
	}


	private async dataToMonster(data): Promise<Monster[]> {

		let monsters: Monster[] = [];
		let item;
		let atts: number[];
		let typen: Typ[];

		for (let i = 0; i < data.rows.length; i++) {
			item = data.rows.item(i);

			atts = await this.getAttacken(item.id);
			typen = await this.db_typen.getMonsterTypen(item.id);

			monsters.push({
				id: item.id,
				name: item.name,
				rang: item.rang,
				groesse: item.größe,
				gewicht: item.gewicht,
				hp: item.hp,
				habitat: item.habitat,
				schadensverhinderung: item.schadensverhinderung,
				isSelected: !!item.isSelected,
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
			isSelected: false,
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
		}).catch(e => {console.log(e); return [];});
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
}
