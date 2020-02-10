import { Component, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { DbAttackenService } from "../../services/db-attacken.service";
import { FullHeaderService } from 'src/app/services/full-header.service';

import { header_popover } from "../../header_popover_content.module";

/**
 * page with list to display and filter all attacks
 */
@Component({
  selector: 'app-list-attacken',
  templateUrl: './list-attacken.page.html',
  styleUrls: ['./list-attacken.page.scss'],
})
export class ListAttackenPage implements OnInit {

	/**
	 * all attacks displayed at the moment with their typ icons as strings for rendering
	 * format: [[Attacke, [icon:string, ...], ...]
	 */
	private list_items = [];

	/**
	 * offset for loading the next bundle of attacks (is index to the first one of them)
	 */
	private offset: number = 0;

	/********************* header functionality **********************/
	/**
	 * background color of the header
	 */
	header_color = "secondary";
	/**
	 * toggle header expansion
	 */
	private header_expanded: boolean = false;
	/**
	 * indicates if filtering is used at the moment
	 */
	private filter_on: boolean = false;
	/**
	 * guard to a lock in function findAttacken()
	 */
	private filter_locked: BehaviorSubject<boolean> = new BehaviorSubject(false);

	/**
	 * operator in typ search
	 * if true the operator to connect the types is OR, if false AND
	 */
	operatorTypenIsOr: boolean = false;
	/**
	 * all typs, formatted for search
	 */
	allTypen = [];

	/**
	 * buffer for word search
	 */
	private word_search_buffer: BehaviorSubject<string[]> = new BehaviorSubject([]);
	/**
	 * buffer for type search
	 */
	private typ_search_buffer: BehaviorSubject<number[][]> = new BehaviorSubject([]);
	/**
	 * all latest selected typs in search
	 */
	searchTypen: number[] = [];
	/**
	 * latest in word search
	 */
	searchWord: string = null;

	/****************************************************************/

	/**
	 * initalize needed values for header
	 * @param db             db service for attacks
	 * @param headerService  handle header affairs
	 */
  constructor(private db: DbAttackenService,
							private headerService: FullHeaderService) {

		this.headerService.getInitState().subscribe(rdy => {
			if (rdy) {
				this.allTypen = headerService.allTypenFormatted();
			}
		});

		// handle looking for monsters via search field in view
		this.word_search_buffer.asObservable().subscribe(_ => {this.findAttacken();});
		this.typ_search_buffer.asObservable().subscribe(_ => {this.findAttacken();})
		this.filter_locked.asObservable().subscribe(_ => {this.findAttacken();});
	}

	/**
	 * inizialize values concerning attack list
	 * @return void
	 */
  ngOnInit(): void {
		this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
				// get first bunch of attacks
				this.db.getAttacken(this.offset).then(_ => this.offset += this.db.LIMIT);

				// establish subscription to changes concerning attacks
				this.db.observeAttacke().subscribe(atts => {

					// adapt in list_items
					this.list_items = [];
					for (let i = 0; i < atts.length; i++) {
						this.db.typIcons(atts[i].id).then(icons => {this.list_items[i] = [atts[i], icons];});
					}
        });
      }
    });
  }

	/**
	 * lock to synchronize searches
	 * @return Promise<void>
	 */
	private async findAttacken(): Promise<void> {

		let locked: boolean = this.filter_locked.getValue();
		let word_search_items: string[] = this.word_search_buffer.getValue();
		let typ_search_items: number[][] = this.typ_search_buffer.getValue();

		// nothing to do, return
		if (locked || (!word_search_items.length && !typ_search_items.length)) {return;}

		// search and filter Monsters
		this.filter_locked.next(true);

		// collect information about word search
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

		// collect information about type search
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
		if (word_search_new) {await this.db.findbyWord(word_latest, !typ_search_new);}
		if (typ_search_new) {await this.db.findByType(typ_latest, this.operatorTypenIsOr, true);}

		// start to potential new round
		this.filter_locked.next(false);
	}

	/**
	 * start (or end) search by entered word
	 * @param event thrown on change of search field
	 * @return void
	 */
	onChangeSearch(event): void {

		let next_list: string[] = this.word_search_buffer.getValue();
		next_list.push(event.detail.value);
		this.word_search_buffer.next(next_list);
	}

	/**
	 * toggle expansion of header
	 * @return void
	 */
	toggle_expand_header(): void {
		this.header_expanded = !this.header_expanded;
	}

	/**
	 * open popover (navigation to type pages)
	 * @param ev event fired to set popover
	 * @return void
	 */
	presentPopover(ev: Event): void {
		this.headerService.presentPopover(ev, header_popover);
	}

	/**
	 * toggle setting of type on type search and start search
	 * @param id id of type to be toggled
	 * @return void
	 */
	toggleSet(id: number): void {
		this.headerService.toggleTypSet(id, this.searchTypen, this.allTypen);

		// update attacken filtered by type
		let typ_search: number[][] = this.typ_search_buffer.getValue();
    typ_search.push(this.searchTypen);
		this.typ_search_buffer.next(typ_search);
	}

	/**
	 * toggle OR/AND on type search and start search if needed
	 * @return void
	 */
	toggleOperator(): void {
		this.operatorTypenIsOr = !this.operatorTypenIsOr;

		if (this.searchTypen.length > 1) {
			// update monster filtered by type
			let typ_search: number[][] = this.typ_search_buffer.getValue();
	    typ_search.push(this.searchTypen);
			this.typ_search_buffer.next(typ_search);
		}
	}

	/**
	 * load more attacks on infinite scroll event
	 * @param event          event thrown on infinite scroll, complete target to stop spinner showing
	 * @return void
	 */
	loadAttacken(event): void {

		// had offset beginning with 0, num (or id) of monsters with 1
		if ( (this.offset+1) >= this.db.NUM_ATTACKEN || this.filter_on) {
			if (event) {event.target.complete();}
			return;
		}

		// handled thorugh observable subscription
		this.db.getAttacken(this.offset).then(_ => {
			if (event) {event.target.complete();}

			this.offset += this.db.LIMIT;
		});
	}
}
