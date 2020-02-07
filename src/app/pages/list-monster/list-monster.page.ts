import { Component, OnInit } from '@angular/core';

import { DbMonsterService } from "../../services/db-monster.service";
import { MessageService } from "../../services/message.service";
import { FullHeaderService } from 'src/app/services/full-header.service';

import { Monster } from "../../interfaces/monster";
import { BehaviorSubject } from 'rxjs';
import { header_popover } from 'src/app/header_popover_content.module';

@Component({
  selector: 'app-list-monster',
  templateUrl: './list-monster.page.html',
  styleUrls: ['./list-monster.page.scss'],
})
export class ListMonsterPage implements OnInit {

	private monsters: Monster[];

	private list_items = [];

	private offset: number = 0;

	private filter_on: boolean = false;
	private filter_locked: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private search_buffer: BehaviorSubject<string[]> = new BehaviorSubject([]);

	private wordSearchDone: BehaviorSubject<boolean> = new BehaviorSubject(false);

	header_color = "primary";
	private header_expanded: boolean = false;

	allTypen = [];
	searchTypen: number[] = [];
	operatorTypenIsOr: boolean = false;

	rangSorting: string[] = ["nein", "asc", "desc"];
	rangSortIndex: number = 0;

  constructor(private db: DbMonsterService,
							private headerService: FullHeaderService,
							private messageService: MessageService) {

		this.headerService.getInitState().subscribe(rdy => {
			if (rdy) {
				this.allTypen = headerService.allTypenFormatted();
			}
		});
	}

  ngOnInit() {
		this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
				this.db.getMonsters(this.offset).then(_ => this.offset += this.db.LIMIT);
        this.db.observeMonster().subscribe(monsters => {

          this.monsters = monsters;

					// add monster and its typ-icons in list_items
					this.list_items = [];
					for (let i = 0; i < monsters.length; i++) {
						this.db.typIcons(this.monsters[i].id).then(icons => {this.list_items[i] = [this.monsters[i], icons];});
					}
        });

				// handle looking for monsters via search field in view every time one of the following changes
				this.search_buffer.asObservable().subscribe(_ => {this.findMonsters();});
				this.filter_locked.asObservable().subscribe(_ => {this.findMonsters();});

				//this.wordSearchDone.asObservable().subscribe(_ => {this.combineFiltering();});
      }
    });
  }

	private async findMonsters() {
		this.wordSearchDone.next(false);

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

				// notify to melt results with filter for typen
				this.wordSearchDone.next(true);
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


	loadMonsters(loadMore=false, event?) {
		if (loadMore) {

			// had offset beginning with 0, num (or id) of monsters with 1
			if ( (this.offset+1) >= this.db.NUM_MONSTER || this.filter_on || this.searchTypen.length) {
				if (event) {event.target.complete();}
				return;
			}
		}

		// handled thorugh observable subscription
		this.db.getMonsters(this.offset).then(_ => {
			if (event) {event.target.complete();}

			this.offset += this.db.LIMIT;
		});
	}

	toggle_expand_header() {
		this.header_expanded = !this.header_expanded;
	}

	presentPopover(ev: Event) {
		this.headerService.presentPopover(ev, header_popover);
	}

	toggleSet(id: number) {
		this.headerService.toggleTypSet(id, this.searchTypen, this.allTypen);

		// update monster filtered by type
		this.db.findByType(this.searchTypen, this.operatorTypenIsOr);
	}

	toggleOperator() {
		this.operatorTypenIsOr = !this.operatorTypenIsOr;

		if (this.searchTypen.length > 1) {
			// update monster filtered by type
			this.db.findByType(this.searchTypen, this.operatorTypenIsOr);
		}
	}

	NextSortByRang() {
		this.rangSortIndex = (this.rangSortIndex+1) % 3;
console.log(this.rangSortIndex)


		// notify database service
	}
}
