import { Component, OnInit } from '@angular/core';

import { string_of_enum } from 'src/app/interfaces/typ';

import { DbTypenService } from 'src/app/services/db-typen.service';
import { header_popover_not_list } from 'src/app/header_popover_content.module';
import { MinimalHeaderService } from 'src/app/services/minimal-header.service';

@Component({
  selector: 'app-list-typen',
  templateUrl: './list-typen.page.html',
  styleUrls: ['./list-typen.page.scss'],
})
export class ListTypenPage implements OnInit {

	item_list = [];

  constructor(private db: DbTypenService,
							private headerService: MinimalHeaderService) {}

  ngOnInit() {
		this.db.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				this.db.getAllTypenIcons().then(typen => {

					// write pairs of [name, typ] into item_list
					for (let i = 0; i < typen.length; i++) {
						this.item_list.push([string_of_enum(typen[i]), typen[i]]);
					}
				});
			}
		});
  }

	presentPopover(ev: Event) {
			this.headerService.presentPopover(ev, header_popover_not_list);
	}
}
