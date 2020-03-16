import { Component, OnInit } from '@angular/core';

import { DbMonsterService } from '../../services/db-monster.service';
import { FullHeaderService } from 'src/app/services/full-header.service';

import { BehaviorSubject } from 'rxjs';
import { headerPopover } from 'src/app/header_popover_content.module';

/**
 * page with list to display and filter all monsters
 */
@Component({
  selector: 'app-list-monster',
  templateUrl: './list-monster.page.html',
  styleUrls: ['./list-monster.page.scss'],
})
export class ListMonsterPage implements OnInit {

  /**
   * all attacks displayed at the moment with their typ icons as strings for rendering
   * format: [[Monster, [icon:string, ...], ...]
   */
  listItems = [];

  /**
   * offset for loading the next bundle of monsters (is index to the first one of them)
   */
  private offset: number = 0;

  /********************* header functionality **********************/
  /**
   * background color of the header
   */
  headerColor = 'primary';
  /**
   * toggle header expansion
   */
  headerExpanded: boolean = false;
  /**
   * indicates if filtering is used at the moment
   */
  filterOn: boolean = false;
  /**
   * guard to a lock in function findMonster()
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
   * text on button for rang sorting in header
   */
  rangSorting: string[] = ['sort?', 'asc', 'desc'];
  /**
   * index to rangSorting
   */
  rangSortIndex: number = 0;
  /**
   * if true, soow spinner to rang sort
   */
  loadingRangSort: boolean = false;

  /**
   * initalize needed values for header
   * @param db             db service for monsters
   * @param headerService  handle header affairs
   */
  constructor(private db: DbMonsterService,
              private headerService: FullHeaderService) {

    this.headerService.getInitState().subscribe(rdy => {
      if (rdy) {
        this.allTypen = headerService.allTypenFormatted();
      }
    });

    // handle looking for monsters via search field in view every time one of the following changes
    this.wordSearchBuffer.asObservable().subscribe(_ => this.findMonsters());
    this.typSearchBuffer.asObservable().subscribe(_ => this.findMonsters());
    this.filterLocked.asObservable().subscribe(_ => this.findMonsters());
  }

  /**
   * inizialize values concerning attack list
   * @return void
   */
  ngOnInit(): void {
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.db.getMonsters(this.offset).then(_ => this.offset += this.db.LIMIT);
        this.db.observeMonster().subscribe(monsters => {

          // add monster and its typ-icons in listItems
          this.listItems = [];
          for (let i = 0; i < monsters.length; i++) {
            this.db.typIcons(monsters[i].id).then(icons => this.listItems[i] = [monsters[i], icons]);
          }
        });
      }
    });
  }

  /**
   * lock to synchronize searches
   * @return Promise<void>
   */
  private async findMonsters(): Promise<void> {

    const locked: boolean = this.filterLocked.getValue();
    const wordSearchItems: string[] = this.wordSearchBuffer.getValue();
    const typSearchItems: number[][] = this.typSearchBuffer.getValue();

    // nothing to do, return
    if (locked || (!wordSearchItems.length && !typSearchItems.length)) {return;}

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
      // in case that latest_search was the last entry, prevent out of bounds
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
      // in case that latest_search was the last entry, prevent out of bounds
      if (index + 1 >= typSearchItems.length) {
        this.typSearchBuffer.next([]);
      } else {
        this.typSearchBuffer.next(typSearchItems.slice(index + 1));
      }
    }

    // case if search was empty, stop search and otherwise deliver results
    // communicate with empty or not empty 'latest_search' to db service
    this.filterOn = (wordSearchNew && wordLatest !== null && wordLatest.length !== 0) ||
                     (typSearchNew && typLatest !== null && typLatest.length !== 0);

    // search monsters or stop search session
    if (wordSearchNew) { await this.db.findByWord(wordLatest, !typSearchNew); }
    if (typSearchNew) { await this.db.findByType(typLatest, this.operatorTypenIsOr, true); }

    // start to potential new round
    this.filterLocked.next(false);

    // addition for rang sorting
    // set to 'no filter' ^= index 0, if a filter is set
    if (this.filterOn) { this.rangSortIndex = 0; }
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
  toggle_expand_header(): void {
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

    // update monster filtered by type
    const typSearch: number[][] = this.typSearchBuffer.getValue();
    typSearch.push(this.searchTypen
    );
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
   * change sorting by rang and adapt list of monsters
   * @return void
   */
  NextSortByRang(): void {
    this.rangSortIndex = (this.rangSortIndex + 1) % 3;

    this.loadingRangSort = true;
    this.db.getAllSortedByRang(this.rangSortIndex).then(_ => this.loadingRangSort = false);
  }

  /**
   * load more monsters on infinite scroll event
   * @param event          event thrown on infinite scroll, complete target to stop spinner showing
   * @return void
   */
  loadMonsters(event) {

    // had offset beginning with 0, num (or id) of monsters with 1
    if ( (this.offset + 1) >= this.db.NUM_MONSTER || this.filterOn || this.rangSortIndex) {
      if (event) { event.target.complete(); }
      return;
    }

    // handled thorugh observable subscription
    this.db.getMonsters(this.offset).then(_ => {
      if (event) { event.target.complete(); }

      this.offset += this.db.LIMIT;
    });
  }
}
