import { Component, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { DbAttackenService } from '../../services/db-attacken.service';
import { FullHeaderService } from 'src/app/services/full-header.service';

import { headerPopover } from '../../header_popover_content.module';

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
  listItems = [];

  /**
   * offset for loading the next bundle of attacks (is index to the first one of them)
   */
  private offset: number = 0;

  /********************* header functionality **********************/
  /**
   * background color of the header
   */
  headerColor = 'secondary';
  /**
   * toggle header expansion
   */
  headerExpanded: boolean = false;
  /**
   * indicates if filtering is used at the moment
   */
  private filterOn: boolean = false;
  /**
   * guard to a lock in function findAttacken()
   */
  private filterLocked: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
  private wordSearchBuffer: BehaviorSubject<string[]> = new BehaviorSubject([]);
  /**
   * buffer for type search
   */
  private typSearchBuffer: BehaviorSubject<number[][]> = new BehaviorSubject([]);
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
    this.wordSearchBuffer.asObservable().subscribe(_ => this.findAttacken());
    this.typSearchBuffer.asObservable().subscribe(_ => this.findAttacken());
    this.filterLocked.asObservable().subscribe(_ => this.findAttacken());
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

          // adapt in listItems
          this.listItems = [];
          for (let i = 0; i < atts.length; i++) {
            this.db.typIcons(atts[i].id).then(icons => this.listItems[i] = [atts[i], icons]);
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

    const locked: boolean = this.filterLocked.getValue();
    const wordSearchItems: string[] = this.wordSearchBuffer.getValue();
    const typSearchItems: number[][] = this.typSearchBuffer.getValue();

    // nothing to do, return
    if (locked || (!wordSearchItems.length && !typSearchItems.length)) { return; }

    // search and filter Monsters
    this.filterLocked.next(true);

    // collect information about word search
    let wordLatest: string;
    let wordSearchNew: boolean = false;
    if (wordSearchItems.length) {
      const index = wordSearchItems.length - 1;
      wordLatest = wordSearchItems[index];
      wordSearchNew = true;

      // cleanup
      // in case that latestSearch was the last entry, prevent out of bounds
      if (index + 1 >= wordSearchItems.length) {
        this.wordSearchBuffer.next([]);
      } else {
        this.wordSearchBuffer.next(wordSearchItems.slice(index + 1));
      }
    }

    // collect information about type search
    let typLatest: number[];
    let typSearchNew: boolean = false;
    if (typSearchItems.length) {
      const index = typSearchItems.length - 1;
      typLatest = typSearchItems[index];
      typSearchNew = true;

      // cleanup
      // in case that latestSearch was the last entry, prevent out of bounds
      if (index + 1 >= typSearchItems.length) {
        this.typSearchBuffer.next([]);
      } else {
        this.typSearchBuffer.next(typSearchItems.slice(index + 1));
      }
    }

    // case if search was empty, stop search and otherwise deliver results
    // communicate with empty or not empty 'latestSearch' to db service
    this.filterOn = (wordSearchNew && wordLatest !== null && wordLatest.length !== 0) ||
                    (typSearchNew && typLatest !== null && typLatest.length !== 0);

    // search monsters or stop search session
    if (wordSearchNew) { await this.db.findbyWord(wordLatest, !typSearchNew); }
    if (typSearchNew) { await this.db.findByType(typLatest, this.operatorTypenIsOr, true); }

    // start to potential new round
    this.filterLocked.next(false);
  }

  /**
   * start (or end) search by entered word
   * @param event thrown on change of search field
   * @return void
   */
  onChangeSearch(event): void {

    const nextList: string[] = this.wordSearchBuffer.getValue();
    nextList.push(event.detail.value);
    this.wordSearchBuffer.next(nextList);
  }

  /**
   * toggle expansion of header
   * @return void
   */
  toggleExpandHeader(): void {
    this.headerExpanded = !this.headerExpanded;
  }

  /**
   * open popover (navigation to type pages)
   * @param ev event fired to set popover
   * @return void
   */
  presentPopover(ev: Event): void {
    this.headerService.presentPopover(ev, headerPopover);
  }

  /**
   * toggle setting of type on type search and start search
   * @param id id of type to be toggled
   * @return void
   */
  toggleSet(id: number): void {
    this.headerService.toggleTypSet(id, this.searchTypen, this.allTypen);

    // update attacken filtered by type
    const typSearch: number[][] = this.typSearchBuffer.getValue();
    typSearch.push(this.searchTypen);
    this.typSearchBuffer.next(typSearch);
  }

  /**
   * toggle OR/AND on type search and start search if needed
   * @return void
   */
  toggleOperator(): void {
    this.operatorTypenIsOr = !this.operatorTypenIsOr;

    if (this.searchTypen.length > 1) {
      // update monster filtered by type
      const typSearch: number[][] = this.typSearchBuffer.getValue();
      typSearch.push(this.searchTypen);
      this.typSearchBuffer.next(typSearch);
    }
  }

  /**
   * load more attacks on infinite scroll event
   * @param event          event thrown on infinite scroll, complete target to stop spinner showing
   * @return void
   */
  loadAttacken(event): void {

    // had offset beginning with 0, num (or id) of monsters with 1
    if ( (this.offset + 1) >= this.db.NUM_ATTACKEN || this.filterOn) {
      if (event) { event.target.complete(); }
      return;
    }

    // handled thorugh observable subscription
    this.db.getAttacken(this.offset).then(_ => {
      if (event) { event.target.complete(); }

      this.offset += this.db.LIMIT;
    });
  }
}
