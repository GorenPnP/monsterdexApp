import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';

import { DbAttackenService } from "../../services/db-attacken.service";
import { MessageService } from "../../services/message.service";

import { Attacke } from "../../interfaces/attacke";

@Component({
  selector: 'app-list-attacken',
  templateUrl: './list-attacken.page.html',
  styleUrls: ['./list-attacken.page.scss'],
})
export class ListAttackenPage implements OnInit {

	private attacken: Attacke[];

	private offset: number = 0;
	//@ViewChild(IonInfiniteScroll) infinite: IonInfiniteScroll;

	private filter_on: boolean = false;


  constructor(private db: DbAttackenService,
							private messageService: MessageService) { }

  ngOnInit() {
		this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
				this.db.getAttacken(this.offset).then(_ => this.offset += this.db.LIMIT);
        this.db.observeAttacke().subscribe(atts => {
          this.attacken = atts;
        });
      }
    });
  }

	onChangeSearch(event) {
		this.filter_on = !!event.detail.value;
		this.db.findAttacke(event.detail.value).catch(err => {
			console.log("DB SEARCH ERROR: ", JSON.stringify(err));
			this.attacken = [];
		});
	}

	loadAttacken(loadMore=false, event?) {
		if (loadMore) {

			// TODO: delete if @ViewChild works
			// had offset beginning with 0, num (or id) of attacken with 1
			if ( (this.offset+1) >= this.db.NUM_ATTACKEN || this.filter_on) {
				if (event) {event.target.complete();}
				return;
			}
		}

		// handled thorugh observable subscription
		this.db.getAttacken(this.offset).then(_ => {
			if (event) {event.target.complete();}

			this.offset += this.db.LIMIT;

			// Optional
			/* TODO: with @ViewChild
			if (this.offset+this.limit >= this.db.NUM_ATTACKEN) {
				this.infinite.disabled = true;
			}
			*/
		});
	}
}
