import { Injectable } from '@angular/core';

import { DatabaseService } from './database.service';
import { MessageService } from './message.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Typ, StrToTyp } from '../interfaces/typ';

/**
 * service for all functionalities concerning typs
 */
@Injectable({
  providedIn: 'root'
})
export class DbTypenService {

  /**
   * represents the actual database
   */
  private db: SQLiteObject;
  /**
   * signal if this service is done initializing
   */
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * total amount of all monsters (also unloaded ones)
   */
  NUM_TYPEN: number = 0;
  /**
   * stores all typ instances loaded sometime while the app is opened.
   * minimizes database access
   */
  private allTypen = new BehaviorSubject([]);

  /**
   * init db service
   * @param databaseService main db service to retrieve the db
   * @param messageService  to communicate to the user
   */
  constructor(private databaseService: DatabaseService,
              private messageService: MessageService) {

    this.databaseService.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        // get db from DatabaseService
        this.db = this.databaseService.getDatabase();
        if (!this.db) {
          this.messageService.error('Die Datenbank fehlt', 'in INIT TYPEN DB: got no db: ', JSON.stringify(this.db));
        }

        // get NUM_Typen
        this.db.executeSql('SELECT COUNT(*) AS num FROM monster_typ', []).then(data => {
          if (!data || !data.rows.length) {
            this.messageService.error('Konnte Anzahl der Typen nicht ermitteln');
          }
          this.NUM_TYPEN = data.rows.item(0).num;

          // init allTypen
          let i = 0;
          const emptyList = [];
          while (i++ < this.NUM_TYPEN) { emptyList.push(null); }
          this.allTypen.next(emptyList);

          // seed db and set this.dbReady to true
          this.dbReady.next(true);

        }).catch(err => {
          this.messageService.error('Konnte Typen nicht finden', 'Could not initiate TypenService.', err);
          this.NUM_TYPEN = 21;

          // init allTypen
          let i = 0;
          const emptyList = [];
          while (i++ < this.NUM_TYPEN) { emptyList.push(null); }
          this.allTypen.next(emptyList);
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
   * get all newly loaded typs from here
   * @return Observable<Typ[]>
   */
  observeTyp(): Observable<Typ[]> {
    return this.allTypen.asObservable();
  }

  /**
   * add input list of typs to this.typen, access changes through ovservable
   * @param mons - contains all Typen to be added
   */
  private updateTypen(typs: Typ[]): void {
    // filter is not active, use allTypen and lastTyp
    const allTyps: Typ[] = this.allTypen.getValue();
    for (const typ of typs) {
      allTyps[typ.id - 1] = typ;
    }
    this.allTypen.next(allTyps);
  }

  /**
   * returns a list of all typs
   * @return Promise<Typ>
   */
  async getAllTypen(): Promise<Typ[]> {

    // get all typen by id so they are stored in allTypen
    const ids: number[] = [];
    for (let i = 1; i <= this.NUM_TYPEN; i++) { ids.push(i); }
    await this.getTypenByIds(ids);

    // return them
    return this.allTypen.getValue();
  }

  /**
   * only function to read Typ entries from the db
   * @param  neededIds - look for Typen with folliwing IDs
   * @return           - the Typen found
   */
  private async getTypenByIds(neededIds: number[]): Promise<Typ[]> {
    // build query and values
    let query = `SELECT * FROM monster_typ WHERE id IN (`;
    const values = [];

    const prepopulatedTypes: Typ[] = [];

    const allTypes = this.allTypen.getValue().slice();

    let tempType;
    for (const neededId of neededIds) {
      // dont go over allTyp's boundaries
      if (neededId > this.NUM_TYPEN) { continue; }

      tempType = allTypes[neededId - 1];

      // if no information about Typ in this.allTypes, add to query
      if (tempType === null || tempType.id === 0) {
        query += '?,';
        values.push(`${neededId}`);
      } else {
        prepopulatedTypes.push(tempType);
      }
    }

    // if all information already gathered, return it
    if (values.length === 0) { return prepopulatedTypes; }

    // exchange last comma with closing paenthesis
    query = query.slice(0, -1) + ')';

    return this.db.executeSql(query, values).then(async data => {
      const types = this.dataToTyp(data);

      if (types === null || types === []) {
        this.messageService.error('Konnte Typ nicht finden', 'in getTypen: could not get Typen with ids ', neededIds);
        return [];
      }

      // return rest prematurely, even though not all ids found (of course, if they do not exist!)
      if (neededIds[neededIds.length - 1] > this.NUM_TYPEN) { return types; }

      if (types.length !== values.length) {
        this.messageService.alert('Nicht alle Typ gefunden',
                                  'in GET Typ: could not get all Typ with ids: ', values,
                                  ' found: ', this.databaseService.listIds(types));
        return [];
      }

      // sole place to update
      this.updateTypen(types);

      // sort concatenated lists in place
      const returnList = prepopulatedTypes.concat(types).sort((a, b) => a.id < b.id ? -1 : 1);
      return returnList;
    }).catch(err => {
      this.messageService.error('Konnte Typen nicht laden', 'GET TYPEN BY IDS: DB query didnt work', err);
      return [];
    });
  }

  /**
   * public wrapper around getTypenByIds() for retrieving one typ
   * @param  id id of the searched typ
   * @return Promise<Typ>
   */
  async getTyp(id: number): Promise<Typ> {
    return this.getTypenByIds([id]).then(typs => {
      if (!(typs && typs.length)) {
        this.messageService.error('Konnte Typ nicht finden', 'GET Typ: could not find Typ with id', id);
        return this.defaultTyp();
      }
      return typs[0];
    });
  }

  /**
   * public wrapper around getMonstersByIds()
   * @param  neededIds  needed ids of required typs
   * @return Promise<Typ[]>
   */
  async getTypen(neededIds: number[]): Promise<Typ[]> {
    return this.getTypenByIds(neededIds);
  }

  /**
   * get typen to a monster's id
   * @param  monId id of a monster
   * @return Promise<Typ[]>
   */
  async getMonsterTypen(monId: number): Promise<Typ[]> {

    // lookup needed ids of typs
    return this.db.executeSql(`SELECT typ_id FROM monster_monster_typen WHERE monster_id=?`, [`${monId}`]).then(data => {

      // collect type ids
      const typIds: number[] = [];
      for (let i = 0; i < data.rows.length; i++) {
        typIds.push(data.rows.item(i).typ_id);
      }
      // get typs from ids
      return this.getTypenByIds(typIds).then(typen =>  {
        return typen;
      });
    });
  }

  /**
   * get typen to an attack's id
   * @param  attId id of an attack instance
   * @return Promise<Typ[]>
   */
  async getAttackeTypen(attId: number): Promise<Typ[]> {

    // lookup needed ids of typs
    return this.db.executeSql(`SELECT typ_id FROM monster_attacke_typen WHERE attacke_id=?`, [`${attId}`]).then(data => {

      // collect type ids
      const typIds: number[] = [];
      for (let i = 0; i < data.rows.length; i++) {
        typIds.push(data.rows.item(i).typ_id);
      }
      // get typs from ids
      return this.getTypenByIds(typIds).then(typen =>  {
        return typen;
      });
    });
  }

  /**
   * convert db data result from select query with typs to list of typ instances
   * @param  data db data
   * @return Promise<Typ[]>
   */
  dataToTyp(data): Typ[] {
    const typen: Typ[] = [];
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

  /**
   * get dummy typ
   * @return Typ
   */
  defaultTyp(): Typ {
    let typClass: Typ;
    return typClass;
  }


  /**
   * get efficiency of hypothetical attack with typs of fromIds to hypothetical monster with typs of toIds
   * @param  fromIds [description]
   * @param  toIds   [description]
   * @return Promise<number> (INT, not FLOAT; 0 ^= wirkungslos, >1 ^= sehr effektiv, <0 ^= nicht sehr effektiv)
   */
  async getEfficiency(fromIds: number[], toIds: number[]): Promise<number> {

    // construct query from
    let query = 'SELECT efficiency AS eff FROM monster_typ_efficiency WHERE from_typ_id IN (';
    for (const _ of fromIds) {
      query += '?,';
    }

    // construct query to
    query = query.slice(0, query.length - 1) + ') AND to_typ_id IN (';
    for (const _ of toIds) {
      query += '?,';
    }

    query = query.slice(0, query.length - 1) + ')';

    // find efficiencies
    return this.db.executeSql(query, fromIds.concat(toIds)).then(data => {

      // factorize all
      let factor: number = 1.0;
      let dummy: number;
      for (let i = 0; i < data.rows.length; i++) {
        dummy = data.rows.item(i).eff;
        if (dummy < 0.0) {
          return 0;
        }
        factor *= dummy;
      }

      // round normally on normaly effective and up
      if (factor >= 1.0) {
        return Math.round(factor);
      }

      // less than normal effective
      // log2(factor), is an int and negative
      // example: 1/4 => -2
      return Math.round(Math.log(factor) / Math.log(2));
    });
  }
}
