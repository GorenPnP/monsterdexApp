import { Component } from '@angular/core';

import { string_of_enum, Typ } from 'src/app/interfaces/typ';

import { DbTypenService } from 'src/app/services/db-typen.service';
import { headerPopoverNotList } from 'src/app/header_popover_content.module';
import { MinimalHeaderService } from 'src/app/services/minimal-header.service';
import { TypPopupService } from 'src/app/services/typ-popup.service';

/**
 * page with list to display all typs
 */
@Component({
  selector: 'app-list-typen',
  templateUrl: './list-typen.page.html',
  styleUrls: ['./list-typen.page.scss'],
})
export class ListTypenPage {

  /**
   * list of type names and typs
   * format: [[name:string, typ], ...]
   */
  itemList = [];

  /**
   * [constructor description]
   * @param db            db service for typs
   * @param headerService handle header affairs
   */
  constructor(private db: DbTypenService,
              private headerService: MinimalHeaderService,
              private typPopup: TypPopupService) {

    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.db.getAllTypen().then(typen => {

          // write pairs of [name, typ] into item_list
          for (const typ of typen) {
            this.itemList.push([string_of_enum(typ), typ]);
          }
        });
      }
    });
  }

  /**
   * open popover (navigation to type pages)
   * @param ev event fired to set popover
   * @return void
   */
  presentPopover(ev: Event): void {
      this.headerService.presentPopover(ev, headerPopoverNotList);
  }

  typInfo(typ: Typ) {
    this.typPopup.show(typ);
  }
}
