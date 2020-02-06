import { Injectable } from '@angular/core';

import { DbTypenService } from 'src/app/services/db-typen.service';
import { Typ } from 'src/app/interfaces/typ';
import { Observable, BehaviorSubject } from 'rxjs';
import { MinimalHeaderService } from './minimal-header.service';

@Injectable({
  providedIn: 'root'
})
export class FullHeaderService {
	private initReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

	private allTypen: Typ[] = [];

  constructor(private db_typen: DbTypenService,
							private minHeaderService: MinimalHeaderService
							) {
		this.db_typen.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				this.db_typen.getAllTypenIcons().then(typen => {
					this.allTypen = typen;

					this.initReady.next(true);
				});
			}
		});
	}

		getInitState(): Observable<boolean> {
			return this.initReady.asObservable();
		}

	allTypenFormatted() {
		let formatted = [];
		for (let i = 0; i < this.allTypen.length; i++) {
			formatted.push({"id": this.allTypen[i].id, "icon": this.allTypen[i].icon, "set": false});
		}
		return formatted;
	}

	/**
	 * [toggleTypSet description]
	 * @param  id                id of typ to toggle
	 * @param  searchTypen       list of typ-ids set for filtering
	 * @param  allFormattedTypen list of formatted typs with selected y/n
	 * @return the modified lists in a dictionary
	 */
	toggleTypSet(id: number, searchTypen: number[], allFormattedTypen: any) {
		let typ = allFormattedTypen[id-1];
		let newState = !typ["set"];

		if (newState) {
			// add to list
			searchTypen.push(id);
		} else {
			// remove from list
			searchTypen.splice(searchTypen.indexOf(id), 1);
		}

		typ["set"] = newState;

		if (searchTypen.length) {
			// selection changed and valid for a search
			//this.db_typen.getEfficiency(this.setFromTypen, this.setToTypen).then(eff => {

			return {"search": searchTypen, "all": this.allTypen};
		}
	}

	async presentPopover(ev: Event, data: any) {
		this.minHeaderService.presentPopover(ev, data);
	}
}
