import { Injectable } from '@angular/core';

import { DbTypenService } from 'src/app/services/db-typen.service';
import { Typ } from 'src/app/interfaces/typ';
import { Observable, BehaviorSubject } from 'rxjs';
import { MinimalHeaderService } from './minimal-header.service';

/**
 * service for all functionality of a full header with type search
 */
@Injectable({
  providedIn: 'root'
})
export class FullHeaderService {
  /**
   * indicator if initializing done
   */
  private initReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * list of all formatted typs for search
   */
  private allTypen: Typ[] = [];

  /**
   * initialize all needed fields
   * @param db_typen         db service for typs
   * @param minHeaderService extend functionalities of the minimal header service
   */
  constructor(private dbTypen: DbTypenService,
              private minHeaderService: MinimalHeaderService) {

    this.dbTypen.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        // get all typen formatted
        this.dbTypen.getAllTypen().then(typen => {
          this.allTypen = typen;

          this.initReady.next(true);
        });
      }
    });
  }

  /**
   * communicate if init is done
   * @return Observable<boolean>
   */
  getInitState(): Observable<boolean> {
    return this.initReady.asObservable();
  }

  /**
   * get all formatted typs
   * @return [{"id": <number>, "icon": <string>, "set": <boolean>}, {}]
   */
  allTypenFormatted(): any {
    const formatted = [];
    for (const typ of this.allTypen) {
      formatted.push({id: typ.id, icon: typ.icon, set: false});
    }
    return formatted;
  }

  /**
   * toggle setting of a typ
   * @param  id                id of typ to toggle
   * @param  searchTypen       list of typ-ids set for filtering
   * @param  allFormattedTypen list of formatted typs with selected y/n
   * @return the modified lists in a dictionary
   */
  toggleTypSet(id: number, searchTypen: number[], allFormattedTypen: any) {
    const typ = allFormattedTypen[id - 1];
    const newState = !typ.set;

    if (newState) {
      // add to list
      searchTypen.push(id);
    } else {
      // remove from list
      searchTypen.splice(searchTypen.indexOf(id), 1);
    }

    typ.set = newState;

    if (searchTypen.length) {
      // selection changed and valid for a search
      return {search: searchTypen, all: this.allTypen};
    }
  }

  /**
   * open popover, using MinimalHeaderService
   * @param  ev    event to the popover, needed for controller
   * @param  data  the content to be displayed
   * @return Promise<void>
   */
  async presentPopover(ev: Event, data: any): Promise<void> {
    this.minHeaderService.presentPopover(ev, data);
  }
}
