import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';

import { DbMonsterService } from "../../services/db-monster.service";
import { MessageService } from "../../services/message.service";

import { Monster } from "../../interfaces/monster";

@Component({
  selector: 'app-list-monster',
  templateUrl: './list-monster.page.html',
  styleUrls: ['./list-monster.page.scss'],
})
export class ListMonsterPage implements OnInit {

	private monsters: Monster[];
	private selectedMonsters: Monster[];

	private list_items = [];

	private offset: number = 0;
	//@ViewChild(IonInfiniteScroll) infinite: IonInfiniteScroll;

	private filter_on: boolean = false;

  constructor(private db: DbMonsterService,
							private messageService: MessageService) { }

  ngOnInit() {
		this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
				this.db.getMonsters(this.offset).then(_ => this.offset += this.db.LIMIT);
        this.db.observeMonster().subscribe(monsters => {
          this.monsters = monsters;

					for (let i = 0; i < monsters.length; i++) {
						this.db.typIcons(this.monsters[i].id).then(icons => {this.list_items[i] = [this.monsters[i], icons];});
					}
        });

				/* TODO
				this.db.getSelectedMonsters().subscribe(sMonsters => {
          this.selectedMonsters = sMonsters;
        });
				*/
      }
    });
  }

	onChangeSearch(event) {
		this.filter_on = !!event.detail.value;
		this.db.findMonster(event.detail.value).catch(err => {
			console.log("DB SEARCH ERROR: ", JSON.stringify(err));
			this.monsters = [];
		});
	}

	toggleIsSelected(id: number) {
		this.db.getMonster(id).then(data => {
			this.db.toggleIsSelected(data);
		});
	}


	loadMonsters(loadMore=false, event?) {
		if (loadMore) {

			// TODO: delete if @ViewChild works
			// had offset beginning with 0, num (or id) of monsters with 1
			if ( (this.offset+1) >= this.db.NUM_MONSTER || this.filter_on) {
				if (event) {event.target.complete();}
				return;
			}
		}

		// handled thorugh observable subscription
		this.db.getMonsters(this.offset).then(_ => {
			if (event) {event.target.complete();}

			this.offset += this.db.LIMIT;

			// Optional
			/* TODO: with @ViewChild
			if (this.offset+this.limit >= this.db.NUM_MONSTER) {
				this.infinite.disabled = true;
			}
			*/
		});
	}
}
