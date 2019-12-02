/*
import { Injectable } from '@angular/core';

import {SQLite, SQLiteObject} from "@ionic-native/sqlite/ngx";

import { BehaviorSubject, Observable } from 'rxjs';

import { InitDatabaseService } from "./init-db.service";
import { MessageService } from "./message.service";


export interface SelectedMonster {
	rawMonster: Monster,
	name: string,
	rang: number
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

	private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

	private db: SQLiteObject;
	private monsters = new BehaviorSubject([]);
	private selectedMonsters = new BehaviorSubject([]);

	private attacken = new BehaviorSubject([]);

  constructor(private initDBservice: InitDatabaseService,
							private sqlite: SQLite,
							private messageService: MessageService) {

		this.initDBservice.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				this.db = this.initDBservice.getDatabase();
				if (!this.db) {
					this.messageService.error("Die Datenbank fehlt", "in INIT IMAGE DB: got no db: ", JSON.stringify(this.db));
				} else {
					this.seedDatabase();
				}
			}
		});
  }

	private async seedDatabase() {
		await this.loadMonsters(0, 25);
		await this.loadAttacken();
		//await this.loadSelectedMonsters();

		// TODO: delete because debug
		this.monsters.asObservable().subscribe(mon => {
			let indices:number[] = [];
			for (let i = 0; i < mon.length; i++) {
				indices.push(mon[i].id);
			}
			console.log(indices);
		})

		this.dbReady.next(true);
	}

	getDatabaseState(): Observable<boolean> {
		return this.dbReady.asObservable();
	}
}
*/
