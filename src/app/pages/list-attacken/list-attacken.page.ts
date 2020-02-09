import { Component, OnInit } from '@angular/core';

import { DbAttackenService } from "../../services/db-attacken.service";
import { MessageService } from "../../services/message.service";

import { Attacke } from "../../interfaces/attacke";
import { BehaviorSubject } from 'rxjs';
import { FullHeaderService } from 'src/app/services/full-header.service';

import { header_popover } from "../../header_popover_content.module";

@Component({
  selector: 'app-list-attacken',
  templateUrl: './list-attacken.page.html',
  styleUrls: ['./list-attacken.page.scss'],
})
export class ListAttackenPage implements OnInit {

	private attacken: Attacke[];
	private list_items = [];

	private offset: number = 0;
	//@ViewChild(IonInfiniteScroll) infinite: IonInfiniteScroll;

	private filter_on: boolean = false;
	private filter_locked: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private word_search_buffer: BehaviorSubject<string[]> = new BehaviorSubject([]);

	private typ_search_buffer: BehaviorSubject<number[][]> = new BehaviorSubject([]);

	header_color = "secondary";
	private header_expanded: boolean = false;

	allTypen = [];
	searchTypen: number[] = [];
	searchWord: string = null;
	operatorTypenIsOr: boolean = false;


  constructor(private db: DbAttackenService,
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
				this.db.getAttacken(this.offset).then(_ => this.offset += this.db.LIMIT);
				this.db.observeAttacke().subscribe(atts => {

          this.attacken = atts;

					// adapt in list_items
					this.list_items = [];
					for (let i = 0; i < atts.length; i++) {
						this.db.typIcons(this.attacken[i].id).then(icons => {this.list_items[i] = [this.attacken[i], icons];});
					}
        });

				// handle looking for monsters via search field in view
				this.word_search_buffer.asObservable().subscribe(_ => {this.findAttacken();});
				this.typ_search_buffer.asObservable().subscribe(_ => {this.findAttacken();})
				this.filter_locked.asObservable().subscribe(_ => {this.findAttacken();});
      }
    });
  }

	private async findAttacken() {

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
		if (word_search_new) {await this.db.findAttacke(word_latest, !typ_search_new);}
		if (typ_search_new) {await this.db.findByType(typ_latest, this.operatorTypenIsOr, true);}

		// start to potential new round
		this.filter_locked.next(false);
	}

	onChangeSearch(event) {

		let next_list: string[] = this.word_search_buffer.getValue();
		next_list.push(event.detail.value);

		this.word_search_buffer.next(next_list);
	}

	loadAttacken(loadMore=false, event?) {
		if (loadMore) {

			// had offset beginning with 0, num (or id) of monsters with 1
			if ( (this.offset+1) >= this.db.NUM_ATTACKEN || this.filter_on) {
				if (event) {event.target.complete();}
				return;
			}
		}

		// handled thorugh observable subscription
		this.db.getAttacken(this.offset).then(_ => {
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

		// update attacken filtered by type
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
}
