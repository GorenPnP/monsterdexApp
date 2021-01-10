import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { SqliteDbCopy } from '@ionic-native/sqlite-db-copy/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { BehaviorSubject, Observable } from 'rxjs';

import { MessageService } from './message.service';

/**
 * inits the sqlite db and provides it
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  /**
   * db name in file system
   */
  private dbName = 'monster.db';
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
   * @param plt        - wait until it is ready, so db in file system is set up and reachable
   * @param sqlite        - create or open db in file system
   * @param dbCopy - reset db to one in www/ directory
   */
  constructor(private plt: Platform,
              private messageService: MessageService) { this.initDB(); }

  /**
   * get database state as observable, so notify on change
   * @return observable of this.dbReady
   */
  getDatabaseState(): Observable<boolean> { return this.dbReady.asObservable(); }

  /**
   * get the actual database
   * @return - the database
   */
  getDatabase(): SQLiteObject { return this.database; }

  /**
   * init and open db, set dbReady to true
   */
  private async initDB(): Promise<void> {
    this.plt.ready().then(() => this.dbReady.next(true));
  }

  /**
   * helper function, get a list of ids
   * @param  instances - list of instances with id field
   * @return number[]
   */
  listIds(instances: any[]): number[] {

    // return null if param is null
    // return null as instance if it is null or its id is 0
    return instances?.map(instance => (instance === null || instance.id === 0) ? null : instance.id);
  }
}
