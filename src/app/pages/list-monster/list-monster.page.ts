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
	private word_search_buffer: BehaviorSubject<string[]> = new BehaviorSubject([]);
	private typ_search_buffer: BehaviorSubject<number[][]> = new BehaviorSubject([]);

	header_color = "primary";
	private header_expanded: boolean = false;

	allTypen = [];
	searchTypen: number[] = [];
	searchWord: string = null;
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
				this.word_search_buffer.asObservable().subscribe(_ => {this.findMonsters();});
				this.typ_search_buffer.asObservable().subscribe(_ => {this.findMonsters();})
				this.filter_locked.asObservable().subscribe(_ => {this.findMonsters();});
      }
    });
  }

	private async findMonsters() {

		let locked: boolean = this.filter_locked.getValue();
		let word_search_items: string[] = this.word_search_buffer.getValue();
		let typ_search_items: number[][] = this.typ_search_buffer.getValue();

		// nothing to do, return
		if (locked || (!word_search_items.length && !typ_search_items.length)) {return;}

		// search and filter Monsters
		this.filter_locked.next(true);

		let word_latest: string;
		let word_search_new: boolean = false;
		if (word_search_items.length) {
			let index = word_search_items.length - 1;
			word_latest = word_search_items[index];
			word_search_new = true;

			// cleanup
			// in case that latest_search was the last entry, prevent out of bounds
			if (index+1 >= word_search_items.length) {
				this.word_search_buffer.next([]);
			} else {
				this.word_search_buffer.next(word_search_items.slice(index+1));
			}
		}

		let typ_latest: number[];
		let typ_search_new: boolean = false;
		if (typ_search_items.length) {
			let index = typ_search_items.length - 1;
			typ_latest = typ_search_items[index];
			typ_search_new = true;

			// cleanup
			// in case that latest_search was the last entry, prevent out of bounds
			if (index+1 >= typ_search_items.length) {
				this.typ_search_buffer.next([]);
			} else {
				this.typ_search_buffer.next(typ_search_items.slice(index+1));
			}
		}

		// case if search was empty, stop search and otherwise deliver results
		// communicate with empty or not empty "latest_search" to db service
		this.filter_on = (word_search_new && word_latest !== null && word_latest.length !== 0) || (typ_search_new && typ_latest !== null && typ_latest.length !== 0);

		// search monsters or stop search session
		if (word_search_new) {await this.db.findMonster(word_latest, !typ_search_new);}
		if (typ_search_new) {await this.db.findByType(typ_latest, this.operatorTypenIsOr, true);}

		// start to potential new round
		this.filter_locked.next(false);
	}


	onChangeSearch(event) {

		let next_list: string[] = this.word_search_buffer.getValue();
		next_list.push(event.detail.value);
		this.word_search_buffer.next(next_list);
	}


	loadMonsters(loadMore=false, event?) {
		if (loadMore) {

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
		let typ_search: number[][] = this.typ_search_buffer.getValue();
		typ_search.push(this.searchTypen);
		this.typ_search_buffer.next(typ_search);
	}

	toggleOperator() {
		this.operatorTypenIsOr = !this.operatorTypenIsOr;

		if (this.searchTypen.length > 1) {
			// update monster filtered by type
			let typ_search: number[][] = this.typ_search_buffer.getValue();
			typ_search.push(this.searchTypen);
			this.typ_search_buffer.next(typ_search);
		}
	}

	NextSortByRang() {
		this.rangSortIndex = (this.rangSortIndex+1) % 3;
console.log(this.rangSortIndex)


		// notify database service
	}
}
