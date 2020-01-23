import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';

import { DbMonsterService } from "../../services/db-monster.service";
import { MessageService } from "../../services/message.service";

import { Monster } from "../../interfaces/monster";
import { BehaviorSubject } from 'rxjs';

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
	private filter_locked: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private search_buffer: BehaviorSubject<string[]> = new BehaviorSubject([]);

  constructor(private db: DbMonsterService,
							private messageService: MessageService) { }

  ngOnInit() {
		this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
				this.db.getMonsters(this.offset).then(_ => this.offset += this.db.LIMIT);
        this.db.observeMonster().subscribe(monsters => {

          this.monsters = monsters;

					// adapt in list_items
					this.list_items = [];
					for (let i = 0; i < monsters.length; i++) {
						this.db.typIcons(this.monsters[i].id).then(icons => {this.list_items[i] = [this.monsters[i], icons];});
					}
        });

				// handle looking for monsters via search field in view
				this.search_buffer.asObservable().subscribe(_ => {this.findMonsters();});
				this.filter_locked.asObservable().subscribe(_ => {this.findMonsters();});

				/* TODO
				this.db.getSelectedMonsters().subscribe(sMonsters => {
          this.selectedMonsters = sMonsters;
        });
				*/
      }
    });
  }

	private async findMonsters() {

		let locked: boolean = this.filter_locked.getValue();
		let search_items: string[] = this.search_buffer.getValue();

		// nothing to do, return
		if (locked || !search_items.length) {return;}

		// search and filter Monsters
		this.filter_locked.next(true);

		let index = search_items.length - 1;
		let latest_search = search_items[index];

		// case if search was empty, stop search and otherwise deliver results
		// communicate with empty or not empty "latest_search" to db service
			this.filter_on = !(latest_search === "" || latest_search === null);

		// search monsters or stop search session
		return this.db.findMonster(latest_search).then(_ => {

			// in case that latest_search was the last entry, prevent out of bounds
			if (index+1 >=  search_items.length) {
				this.search_buffer.next([]);
			} else {
				this.search_buffer.next(search_items.slice(index+1));
			}

			// start to potential new round
			this.filter_locked.next(false);
		});
	}

	onChangeSearch(event) {

		let next_list: string[] = this.search_buffer.getValue();
		next_list.push(event.detail.value);

		this.search_buffer.next(next_list);
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
