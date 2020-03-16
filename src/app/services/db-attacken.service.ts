import { Injectable } from '@angular/core';

import { DatabaseService } from './database.service';
import { MessageService } from './message.service'
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Attacke } from '../interfaces/attacke'
import { Typ } from '../interfaces/typ';
import { DbTypenService } from './db-typen.service';

/**
 * db service for attacks and related topics
 */
@Injectable({
  providedIn: 'root'
})
export class DbAttackenService {
  /**
   * represents the actual database
   */
  private db: SQLiteObject;
  /**
   * signal if this service is done initializing
   */
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * amount of attacks loaded at max. at once
   */
  LIMIT: number = 25;
  /**
   * total amount of all monsters (also unloaded ones)
   */
  NUM_ATTACKEN: number = 0;
  /**
   * id of last attack loaded as bunch (due to infinite scroll)
   */
  private lastAttacke: number = 0;
  /**
   * stores all attack instances loaded sometime while the app is opened.
   * minimizes database access
   */
  private allAttacken: BehaviorSubject<Attacke[]> = new BehaviorSubject([]);
  /**
   * selection of allMonsters, may be a filtered subset. Publicised to subscriptors
   */
  private attacken: BehaviorSubject<Attacke[]> = new BehaviorSubject([]);

  /**
   * last known result of word search, is null if not searching
   */
  private wordSearchList: Attacke[] = null;
  /**
   * last known result of type search, is null if not searching
   */
  private typSearchList: Attacke[] = null;

  /**
   * init service
   * @param databaseService main db service to retrieve the db
   * @param dbTypen        db for typs
   * @param messageService  to communicate to the user
   */
  constructor(private databaseService: DatabaseService,
              private dbTypen: DbTypenService,
              private messageService: MessageService) {

    this.databaseService.getDatabaseState().subscribe(rdy => {
    if (rdy) {
      // get db from DatabaseService
      this.db = this.databaseService.getDatabase();
      if (!this.db) {
        this.messageService.error('Die Datenbank fehlt', 'in INIT ATTACKEN DB: got no db: ', JSON.stringify(this.db));
      }

      // get NUM_ATTACKEN
      this.db.executeSql('SELECT COUNT(*) AS num FROM monster_attacke', []).then(data => {
        if (!data || !data.rows.length) {
          this.messageService.error('Konnte Anzahl der Attacken nicht ermitteln');
        }
        this.NUM_ATTACKEN = data.rows.item(0).num;

        // init allAttacken
        let i = 0;
        const emptyList = [];
        while (i++ < this.NUM_ATTACKEN) { emptyList.push(null); }
        this.allAttacken.next(emptyList);

        // use allAttacken internal, Attacken external
        this.dbTypen.getDatabaseState().subscribe(ready => {
          if (ready) {
            // use allMonsters internal, monsters external
            this.allAttacken.asObservable().subscribe(allAtts => {

              // if changes in 'loaded' part occured
              if (this.attacken.getValue().length !== this.lastAttacke) {
                const atts = allAtts.slice(0, this.lastAttacke);
                this.attacken.next(atts);
              }
            });
            this.dbReady.next(true);
          }
        });
      });
      }
    });
  }

  /**
   * get information whether this service is ready
   * @return Observable<boolean>
   */
  getDatabaseState(): Observable<boolean> {
    return this.dbReady.asObservable();
  }

  /**
   * subscriptable to be notified on changes of attacks
   * @return Observable<boolean>
   */
  observeAttacke(): Observable<Attacke[]> {
    return this.attacken.asObservable();
  }

  /**
   * add input list of Attacken to this.attacken, access changes through ovservable
   * @param atts        contains all Attacken to be added
   * @param from_filter if true just set the atts-value, if false combine old with this new ones
   * @return void
   */
  private updateAttacken(atts: Attacke[], fromFilter: boolean = false): void {
    const allAtts: Attacke[] = this.allAttacken.getValue();
    for (const att of atts) {
      allAtts[att.id - 1] = att;
    }

    // filter is activated, ignore allMonsters
    if (fromFilter) { this.attacken.next(atts); return; }

    // filter is not active, use allMonsters and lastMonster
    this.allAttacken.next(allAtts);
  }

  /**
   * only function to read Attacke entries from the db (and return found ones)
   * @param  neededIds  look for Attacken with folliwing IDs
   * @return Promise<Attacke[]>
   */
  private async getAttackenByIds(neededIds: number[]): Promise<Attacke[]> {

    // build query and values
    let query = `SELECT * FROM monster_attacke WHERE id IN (`;
    const values = [];

    const prepopulatedAtts: Attacke[] = [];

    const allAtts = this.allAttacken.getValue().slice();
    let tempAtt;
    for (const neededId of neededIds) {
      // dont go over allMonster's boundaries
      if (neededId > this.NUM_ATTACKEN) { continue; }

      tempAtt = allAtts[neededId - 1];

      // if no information about monster in this.allMons, add to query
      if (tempAtt === null || tempAtt.id === 0) {
        query += '?,';
        values.push(`${neededId}`);
      } else {
        prepopulatedAtts.push(tempAtt);
      }
    }

    // if all information already gathered, return it
    if (values.length === 0) { return prepopulatedAtts; }

    // exchange last comma with closing paenthesis
    query = query.slice(0, -1) + ')';

    return this.db.executeSql(query, values).then(async data => {
      return this.dataToAttacke(data).then(atts => {

        if (atts === null || atts === []) {
          this.messageService.error('Konnte Attacken nicht finden', 'in getAttackenByIds: could not get atts with ids ', neededIds);
          return [];
        }

        // return rest prematurely, even though not all ids found (of course, if they do not exist!)
        if (neededIds[neededIds.length - 1] >= this.NUM_ATTACKEN) { return atts; }

        if (atts.length !== values.length) {
          this.messageService.alert('Nicht alle Attacken gefunden',
                                    'in getAttackenByIds: could not get all atts with ids: ', values,
                                    ' found: ', this.databaseService.listIds(atts));
          return [];
        }

        // sort concatenated lists in place
        const returnList = prepopulatedAtts.concat(atts).sort((a, b) => a.id < b.id ? -1 : 1);
        return returnList;
      });
    });
    }

  /**
   * public wrapper around getAttackenByIds() for retrieving one attack
   * @param  id id of the searched attack
   * @return Promise<Attacke>
   */
  async getAttacke(id: number): Promise<Attacke> {
    return this.getAttackenByIds([id]).then(atts => {
      if (!(atts && atts.length)) {
        this.messageService.error('Konnte Attacke nicht finden', 'GET Attacke: could not find Attacke with id', id);
        return this.defaultAttacke();
      }
      return atts[0];
    });
  }

  /**
   * public wrapper for function getAttackenByList()
   * @param  ids ids of attacks to be found
   * @return Promise<Attacke[]>
   */
  async getAttackenByList(ids: number[]): Promise<Attacke[]> {
    return this.getAttackenByIds(ids).then(atts => {
      return atts;
    });
  }

  /**
   * public wrapper around getAttackenByIds() for retrieving one chunk attacks with size of LIMIT
   * @param  offset point where to start with ids
   * @return Promise<void>
   */
  async getAttacken(offset: number): Promise<void> {

    // gather needed ids
    const idOffset = offset + 1;  // monster ids start at 1, not 0
    const neededList: number[] = [];
    for (let i = idOffset; i < idOffset + this.LIMIT; i++) { neededList.push(i); }

    // recieve attacks and call updateAttacken() with them
    return this.getAttackenByIds(neededList).then(atts => {
      this.lastAttacke += atts.length;
      this.updateAttacken(atts);
    });
  }

  /**
   * filter attacks by name or id and store them in wordSearchList.
   * If nameValue is empty, end the search
   * @param  nameValue             substring of a attacks' name or an id
   * @param  callCombineAfterwards if true combine search result with that of type search, if false not
   * @return Promise<void>
   */
  async findbyWord(nameValue: string, callCombineAfterwards: boolean = true): Promise<void> {

    // end search
    if (nameValue === null || nameValue.length === 0) {
      this.wordSearchList = null;

      // this.lastMonster seems to be 25 too far, subtract from it beforehand
      this.lastAttacke -= this.LIMIT;
      if (callCombineAfterwards) { this.combineSearchLists(); }
      return;
    }

    // construct query
    const mask = '%' + nameValue + '%';
    const query = `SELECT * FROM monster_attacke WHERE titel LIKE ? OR id=?`;

    // search attacks
    return this.db.executeSql(query, [mask, nameValue]).then(data => {
      return this.dataToAttacke(data).then(atts => {

        // save result
        this.wordSearchList = atts;
        if (callCombineAfterwards) { this.combineSearchLists(); }
      });
    });
  }

  /**
   * filter attacks by typs and store them in typSearchList.
   * If typeIdList is empty, end the search
   * @param  typeIdList            list of type ids
   * @param  operandIsOr           if true connect via OR (one type is sufficient), if false with AND (need all types)
   * @param  callCombineAfterwards if true combine search result with that of word search, if false not
   * @return Promise<void>
   */
  async findByType(typeIdList: number[], operandIsOr: boolean, callCombineAfterwards: boolean = true): Promise<void>  {

    // end search
    if (!typeIdList || typeIdList.length === 0) {
      this.typSearchList = null;
      if (callCombineAfterwards) { this.combineSearchLists(); }
      return;
    }

    // construct query
    let query: string = 'SELECT * FROM monster_attacke WHERE id IN (SELECT a.attacke_id FROM ' +
                        '(SELECT attacke_id, COUNT(*) AS num FROM monster_attacke_typen WHERE typ_id IN (';
    const values = [];
    const limit: number = operandIsOr ? 1 : typeIdList.length;

    for (let i = 0; i < typeIdList.length; i++) {
      values.push(`${typeIdList[i]}`);

      // if last, leave last operand (AND || OR) out
      if (i === typeIdList.length - 1) {
        query += `?) GROUP BY attacke_id) a WHERE a.num>=${limit})`;
        continue;
      }
      query += '?,';
    }

    // excecute query
    return this.db.executeSql(query, values).then(data => {

      return this.dataToAttacke(data).then(atts => {
        this.typSearchList = atts;
        if (callCombineAfterwards) { this.combineSearchLists(); }
      });
    }).catch(e => {
        this.messageService.error('Konnte nicht nach Typen filtern', e);
    });
  }

  /**
   * combine results from both filtering methods, use their intersection
   * @return void
   */
  combineSearchLists(): void {
    if (this.typSearchList === null) {
      // no filter set, return to normality
      if (this.wordSearchList === null) { this.getAttacken(this.lastAttacke); return; }
      // only wordSearch set
      this.updateAttacken(this.wordSearchList, true); return;
    }

    // only type filter is set
    if (this.wordSearchList === null) { this.updateAttacken(this.typSearchList, true); return; }

    // both filters set

    // prepare lists to sort on
    const wordIdList: number[] = this.databaseService.listIds(this.wordSearchList);
    const typIdList: number[] = this.databaseService.listIds(this.typSearchList);
    typIdList.sort((a, b) => a - b);

    // collect intersection in this list
    const combinedList: Attacke[] = [];
    for (let i = 0; i < this.wordSearchList.length; i++) {
      if (typIdList.indexOf(wordIdList[i]) !== -1) { combinedList.push(this.wordSearchList[i]); }
    }
    // set as filtered value via updateMonsters()
    this.updateAttacken(combinedList, true);
  }

  /**
   * convert db data result from select query with attacks to list of attack instances
   * @param  data db data
   * @return Promise<Attacke[]>
   */
  private async dataToAttacke(data): Promise<Attacke[]> {
    const attacken: Attacke[] = [];
    let item;
    let typen: Typ[] = [];
    for (let i = 0; i < data.rows.length; i++) {
      item = data.rows.item(i);

      // get typs separately from another db table
      typen = await this.dbTypen.getAttackeTypen(item.id);

      attacken.push({
        id: item.id,
        name: item.titel,
        schaden: item.schaden,
        beschreibung: item.beschreibung,
        typen
      });
    }
    return attacken;
  }

  /**
   * get dummy attacke
   * @return Attacke
   */
  defaultAttacke(): Attacke {
    return {
      id: 0,
      name: '',
      schaden: '',
      beschreibung: '',
      typen: []
    };
  }

  /**
   * get type icons as strings of attack with id attId (for rendering)
   * @param  attId id of an attack instance
   * @return string[]
   */
  async typIcons(attId: number): Promise<string[]> {
    return this.getAttacke(attId).then(att => {

      // collect icon strings
      const icons: string[] = [];
      for (const typ of att.typen) {
        icons.push(typ.icon);
      }
      return icons;
    });
  }
}
