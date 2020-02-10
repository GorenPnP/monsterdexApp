import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { DatabaseService } from "./database.service";
import { MessageService } from "./message.service";

import { Monster } from "../interfaces/monster"
import { DbTypenService } from './db-typen.service';

/**
 * db service for monsters and related topics
 */
@Injectable({
  providedIn: 'root'
})
export class DbMonsterService {

	/**
	 * represents the actual database
	 */
	private db: SQLiteObject;
	/**
	 * signal if this service is done initializing
	 */
	private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

	/**
	 * amount of monsters loaded at max. at once
	 */
	LIMIT: number = 25;
	/**
	 * total amount of all monsters (also unloaded ones)
	 */
	NUM_MONSTER: number = 0;
	/**
	 * id of last monster loaded as bunch (due to infinite scroll)
	 */
	private lastMonster: number = 0;
	/**
	 * stores all monster instances loaded sometime while the app is opened.
	 * minimizes database access
	 */
	private allMonsters: BehaviorSubject<Monster[]> = new BehaviorSubject([]);
	/**
	 * selection of allMonsters, may be a filtered subset. Publicised to subscriptors
	 */
	private monsters: BehaviorSubject<Monster[]> = new BehaviorSubject([]);

	/**
	 * last known result of word search, is null if not searching
	 */
	private wordSearchList: Monster[] = null;
	/**
	 * last known result of type search, is null if not searching
	 */
	private typSearchList: Monster[] = null;

	/**
	 * initialize service
	 * @param databaseService main db service to retrieve the db
	 * @param messageService  to communicate to the user
	 * @param db_typen        db for typs
	 */
  constructor(private databaseService: DatabaseService,
							private messageService: MessageService,
							private db_typen: DbTypenService) {

		this.databaseService.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				// get db from DatabaseService
				this.db = this.databaseService.getDatabase();
				if (!this.db) {
					this.messageService.error("Die Datenbank fehlt", "in INIT MUSHROOM DB: got no db: ", JSON.stringify(this.db));
				}

				// get number of monsters for NUM_MONSTER
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

					// handle update of monsters on change of allMonsters
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
							// set signal to be initialized
							this.dbReady.next(true);
						}
					});
				});
			}
		});
	}

	/**
	 * communicate if this service is done initializing
	 * @return Observable<boolean>
	 */
	getDatabaseState(): Observable<boolean> {
		return this.dbReady.asObservable();
	}

	/**
	 * get all filtered and newly loaded monsters from here
	 * @return Observable<Monster[]>
	 */
	observeMonster(): Observable<Monster[]> {
		return this.monsters.asObservable();
	}

	/**
	 * add input list of Ḿonsters to this.monsters, access changes through ovservable
	 * @param mons				contains all monsters to be added
	 * @param from_filter if true just set the atts-value, if false combine old with this new ones
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
	 * only function to read monster entries from the db (and return found ones)
	 * @param  neededIds - look for monsters with folliwing IDs
	 * @return Observable<Monster[]>
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
					this.messageService.alert("Nicht alle Monster gefunden", "in GET MONSTER: could not get all monster with ids: ", values, " found: ", this.databaseService.listIds(mons));
					return [];
				}

				// sort concatenated lists in place
				let returnList = prepopulatedMons.concat(mons).sort(function(a, b) {return a.id < b.id? -1 : 1;});
				return returnList;
			});
		});
  }

	/**
	 * public wrapper around getMonstersByIds() for retrieving one monster
	 * @param  id id of the searched monster
	 * @return Promise<Monster>
	 */
	async getMonster(id: number): Promise<Monster> {
		return this.getMonstersByIds([id]).then(mons => {
			if (!(mons && mons.length)) {
				this.messageService.error("Konnte Monster nicht finden", "GET MONSTER: could not find monster with id", id);
				return this.defaultMonster();
			}
			return mons[0];
		});
	}

	/**
	 * public wrapper for function getMonstersByList()
	 * @param  ids ids of monsters to be found
	 * @return Promise<Monster[]>
	 */
	async getMonstersByList(ids: number[]): Promise<Monster[]> {
		return this.getMonstersByIds(ids).then(atts => {
			return atts;
		});
	}

	/**
	 * public wrapper around getMonstersByIds() for retrieving one chunk monsters with size of LIMIT
	 * @param  offset point where to start with ids
	 * @return Promise<void>
	 */
	async getMonsters(offset: number): Promise<void> {

	// gather needed ids
		let idOffset = offset+1;	// monster ids start at 1, not 0
		let neededList: number[] = [];
		for (let i = idOffset; i < idOffset+this.LIMIT; i++) {neededList.push(i)}

		// recieve attacks and call updateMonsters() with them
		return this.getMonstersByIds(neededList).then(mon => {
			this.lastMonster += mon.length;
			return this.updateMonsters(mon);
		});
	}

	/**
	 * filter monsters by name or id and store them in wordSearchList.
	 * If nameValue is empty, end the search
	 * @param  nameValue             substring of a monsters' name or an id
	 * @param  callCombineAfterwards if true combine search result with that of type search, if false not
	 * @return Promise<void>
	 */
	async findByWord(nameValue:string, callCombineAfterwards: boolean = true): Promise<void> {

		// end search
		if (nameValue === null || nameValue.length === 0) {
			this.wordSearchList = null;

			// this.lastMonster seems to be 25 too far, subtract from it beforehand
			this.lastMonster -= this.LIMIT;
			if (callCombineAfterwards) {this.combineSearchLists();}
			return;
		}

		// construct query
		let mask = "%"+nameValue+"%";
		let query = `SELECT * FROM monster_monster WHERE name LIKE ? OR id=?`;

		// search monsters
		return this.db.executeSql(query, [mask, nameValue]).then(data => {
			return this.dataToMonster(data).then(mons => {

				// save result
				this.wordSearchList = mons;
				if (callCombineAfterwards) {this.combineSearchLists();}
			});
		});
	}

	/**
	 * filter monsters by typs and store them in typSearchList.
	 * If typeIdList is empty, end the search
	 * @param  typeIdList            list of type ids
	 * @param  operandIsOr					 if true connect via OR (one type is sufficient), if false with AND (need all types)
	 * @param  callCombineAfterwards if true combine search result with that of word search, if false not
	 * @return Promise<void>
	 */
	async findByType(typeIdList: number[], operandIsOr: boolean, callCombineAfterwards: boolean = true): Promise<void>  {

		// end search
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

	/**
	 * combine results from both filtering methods, use their intersection
	 * @return void
	 */
	combineSearchLists(): void {
		if (this.typSearchList === null) {
			// no filter set, return to normality
			if (this.wordSearchList === null) {this.getMonsters(this.lastMonster); return;}
			// only wordSearch set
			this.updateMonsters(this.wordSearchList, true); return;
		}

		// only type filter is set
		if (this.wordSearchList === null) {this.updateMonsters(this.typSearchList, true); return;}

		// both filters set

		// prepare lists to sort on
		let wordIdList: number[] = this.databaseService.listIds(this.wordSearchList);
		let typIdList: number[] = this.databaseService.listIds(this.typSearchList);
		typIdList.sort((a, b) => {return a-b});

		// collect intersection in this list
		let combinedList: Monster[] = [];
		for (let i = 0; i < this.wordSearchList.length; i++) {
			if (typIdList.indexOf(wordIdList[i]) !== -1) {combinedList.push(this.wordSearchList[i]);}
		}
		// set as filtered value via updateMonsters()
		this.updateMonsters(combinedList, true);
	}

	/**
	 * recieve ids of a monster's attacks
	 * @param  monId a monster's id to get attacks to
	 * @return Promise<number>
	 */
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

	/**
	 * convert db data result from select query with monsters to list of monster instances
	 * @param  data db data
	 * @return Promise<Monster[]>
	 */
	private async dataToMonster(data): Promise<Monster[]> {

		let monsters: Monster[] = [];
		let item;

		for (let i = 0; i < data.rows.length; i++) {
			item = data.rows.item(i);

			// get some fields from another db table, encapsulated in functions
			await Promise.all([
				this.getAttacken(item.id),
				this.db_typen.getMonsterTypen(item.id),
				this.getGegenteilmonster(item.id),
				this.getAehnlicheFormen(item.id)]).then(res => {

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
					gegenteilmonster: res[2],
					aehnlicheFormen: res[3],
					attacken: res[0],
					typen: res[1]
				});
			});
		}
		return monsters;
	}

	/**
	 * get dummy monster
	 * @return Monster
	 */
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
	 * get type icons as strings of monster with id monId (for rendering)
	 * @param  attId id of a monster instance
	 * @return string[]
	 */
	async typIcons(monId: number): Promise<string[]> {
		return this.getMonster(monId).then(mon => {
			let icons: string[] = [];

			// collect icon strings
			for (let i = 0; i < mon.typen.length; i++) {
				icons.push(mon.typen[i].icon);
			}
			return icons;
		});
	}

	/**
	 * get all monsters capable of an attack to attId
	 * @param  attId id of the attack instance
	 * @return Promise<Monster[]>
	 */
	async getMonstersByAttacke(attId: number): Promise<Monster[]> {

		let query = `SELECT monster_id FROM monster_monster_attacken WHERE attacke_id=?`;

		// get monster ids and gather them
		return this.db.executeSql(query, [`${attId}`]).then(data => {
			let ids: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
					ids.push(data.rows.item(i).monster_id);
			}
			// get monsters from ids
			return this.getMonstersByIds(ids).then(mons => {return mons});
		}).catch(e => {this.messageService.error("Konnte Monster zu der Attacke nicht finden", e); return [];});
	}

	/**
	 * get all ids of monsters to which the monster with id monsId can change into by will
	 * @param  monsId id of the monster
	 * @return Promise<number[]>
	 */
	async getAehnlicheFormen(monsId: number): Promise<number[]> {
		return this.db.executeSql("SELECT mon_2 FROM monster_monster_verschFormen WHERE mon_1=?", [`${monsId}`]).then(data => {

			// collect ids
			let returnList: number[] = [];
			for (let i = 0; i < data.rows.length; i++) {
				returnList.push(data.rows.item(i).mon_2);
			}
			return returnList;
		}).catch(err => {console.log("error loading aehnliche formen of", monsId, err); return [];});
	}

	/**
	 * get all ids of monsters to which the monster with id monsId poses the opposite
	 * @param  monsId id of the monster
	 * @return Promise<number[]>
	 */
	async getGegenteilmonster(monsId: number): Promise<number[]> {
		return this.db.executeSql("SELECT mon_2 FROM monster_gegenteilmonster WHERE mon_1=?", [`${monsId}`]).then(data => {

			// collect ids
			let returnList: number[] = [];
			for (let i = 0; i < data.rows.length; i++) {
				returnList.push(data.rows.item(i).mon_2);
			}
			return returnList;
		}).catch(err => {console.log("error loading gegenteilmonster of", monsId, err); return [];});
	}

	/**
	 * get direct anchestors and predecessors of monster with id monId
	 * @param  monId id of the monster
	 * @return Promise<Monster[][]>  ( [[list of anchestors], [list of predecessors]]  )
	 */
	async getEvolution(monId: number): Promise<Monster[][]> {
		let anchestors = await this.getAnchestors(monId);
		let predecessor = await this.getPredecessors(monId);
		return [anchestors, predecessor];
	}

	/**
	 * get all direct ancestors to monster with id monId
	 * @param  monId id of the monster
	 * @return Promise<Monster[]>
	 */
	async getAnchestors(monId: number): Promise<Monster[]> {

		// look before (where b is monId, ...)
		let query: string = "SELECT vor FROM monster_evolution WHERE nach=?";

		return this.db.executeSql(query, [`${monId}`]).then(data => {
			let ids: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
				ids.push(data.rows.item(i).vor);
			}
			// get monsters to ids
			return this.getMonstersByIds(ids).then(mons => {return mons});
		});
	}

	/**
	 * get all direct predecessors of monster with id monId
	 * @param  monId id of the monster
	 * @return Promise<Monster>
	 */
	async getPredecessors(monId: number): Promise<Monster[]> {

		// look after (where a is monId, ...)
		let query: string = "SELECT nach FROM monster_evolution WHERE vor=?";

		return this.db.executeSql(query, [`${monId}`]).then(data => {
			let ids: number[] = [];

			for (let i = 0; i < data.rows.length; i++) {
				ids.push(data.rows.item(i).nach);
			}
			// get monsters to ids
			return this.getMonstersByIds(ids).then(mons => {return mons});
		});
	}

	/**
	 * sort all monsters by their rang (asc or desc)
	 * @param  sortingIndex =0, end sorting, =1 asc, 0" desc
	 * @return Promise<void>
	 */
	async getAllSortedByRang(sortingIndex: number): Promise<void> {
		if (sortingIndex === 0) {return this.combineSearchLists();}

		// get sorting
		let query: string = "SELECT * FROM monster_monster ORDER BY rang " + (sortingIndex === 1? "ASC" : "DESC");
		return this.db.executeSql(query, []).then(data => {

			// get sorted monsters
			return this.dataToMonster(data).then(mons => {

				// update them as filtered
				return this.updateMonsters(mons, true);
			});
		}).catch(err => {console.log("rang sort:", query, err)})
	}
}
