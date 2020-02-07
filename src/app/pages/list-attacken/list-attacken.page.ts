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
	private search_buffer: BehaviorSubject<string[]> = new BehaviorSubject([]);

	header_color = "secondary";
	private header_expanded: boolean = false;

	allTypen = [];
	searchTypen: number[] = [];
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
				this.search_buffer.asObservable().subscribe(_ => {this.findAttacken();});
				this.filter_locked.asObservable().subscribe(_ => {this.findAttacken();});

				/* TODO
				this.db.getSelectedMonsters().subscribe(sMonsters => {
          this.selectedMonsters = sMonsters;
        });
				*/
      }
    });
  }

	private async findAttacken() {

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
		return this.db.findAttacke(latest_search).then(_ => {

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
		this.db.findByType(this.searchTypen, this.operatorTypenIsOr);
	}

	toggleOperator() {
		this.operatorTypenIsOr = !this.operatorTypenIsOr;

		if (this.searchTypen.length > 1) {
			// update monster filtered by type
			this.db.findByType(this.searchTypen, this.operatorTypenIsOr);
		}
	}
}
