import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MonsterService } from 'src/app/services/monster.service';
import { TypeService } from 'src/app/services/type.service';
import { Filter } from 'src/app/types/filter';
import { Monster } from 'src/app/types/monster';
import { RankOrdering } from 'src/app/types/rank-ordering';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-monster-list',
  templateUrl: './monster-list.page.html',
  styleUrls: ['./monster-list.page.scss'],
})
export class MonsterListPage implements OnInit {

  /**
   * all attacks displayed at the moment with their typ icons as strings for rendering
   * format: [[Monster, [icon:string, ...], ...]
   */
  monsters: Monster[] = [];

  filter: Filter = {
    pageNr: null,
    typeAnd: true,
    types: [],
    name: '',
    rankOrdering: RankOrdering.NONE
  }

  // /**
  //  * number of page with next monsters to load.
  //  * If pageNr === -1, all have been loaded
  //  */
  // private pageNr: number = 0;

  /********************* header functionality **********************/
  /**
   * toggle header expansion
   */
  headerIsExpanded: boolean = true;
  
  private activeSearch: Observable<Monster[]> = null;

  // /**
  //  * operator in type search
  //  * if true the operator to connect the types is OR, if false AND
  //  */
  // operatorTypesIsOr: boolean = false;
  /**
   * all types for filtering in header
   */
  allTypes: Type[] = [];
  // /**
  //  * buffer for type search
  //  */
  // typeFilter: Type[] = [];
  // /**
  //  * latest in word search
  //  */
  // nameFilter: string = '';
  // /**
  //  * index to rankSorting
  //  */
  // rankOrdering: RankOrdering = RankOrdering.NONE;
  /**
   * make enum RankOrdering accessible in html template
   */
  RankOrdering = RankOrdering;
  /****************************************************************/

  /**
   * initialize needed values for header
   * @param db             db service for monsters
   * @param headerService  handle header affairs
   */
  constructor(private monsterService: MonsterService,
              private typeService: TypeService) { }

  /**
   * initialize values
   * @return void
   */
  ngOnInit(): void {
    this.filter.pageNr = 0;
    this.updateMonsters();
    this.typeService.getAll().subscribe(types => this.allTypes = types);
  }

  /**
   * lock to synchronize searches
   * @return Promise<void>
   */
  private async updateMonsters(): Promise<void> {

    // nothing new to load
    if (this.filter.pageNr === -1) { return; }

    // // search and filter Monsters
    // if (this.activeSearch) {
    //   this.activeSearch.unsubscribe();
    // }

    this.activeSearch = this.monsterService.filter(this.filter);
    return this.activeSearch.toPromise().then(monsters => {

      // if first page (pageNr === 0), override this.monsters entirely.
      // We don't want any old ones from another search, do we :) ?
      this.monsters = this.filter.pageNr ? [...this.monsters, ...monsters] : monsters;
      monsters.length === this.monsterService.limit ? this.filter.pageNr++ : this.filter.pageNr = -1;
    });
  }

  /**
   * start (or end) search by entered word
   * @param event thrown on change of search field
   * @return void
   */
  onSearchChanged(): void {
    this.filter.pageNr = 0;
    this.updateMonsters();
  }

  /**
   * open popover (navigation to type pages)
   * @param ev event fired to set popover
   * @return void
   */
  presentTypePopover(ev: Event): void {
  //   this.headerService.presentPopover(ev, headerPopover);
  }

  /**
   * toggle setting of type on type search and start search
   * @param id id of type to be toggled
   * @return void
   */
  toggleType(type: Type): void {
    // this.headerService.toggleTypeSet(type.id, this.typeFilter.map(type => type.id), this.allTypes);

    if (this.filter.types.includes(type.id)) {
      this.filter.types = this.filter.types.filter(t => t !== type.id);
    } else {
      this.filter.types.push(type.id);
    }

    this.filter.pageNr = 0;
    this.updateMonsters();
  }

  /**
   * toggle OR/AND on type search and start search if needed
   * @return void
   */
  toggleOperator(): void {
    this.filter.typeAnd = !this.filter.typeAnd;

    if (this.filter.types.length > 1) {
      this.filter.pageNr = 0;
      this.updateMonsters();
    }
  }

  /**
   * change sorting by rank and adapt list of monsters
   * @return void
   */
  sortByRank(newOrdering: RankOrdering): void {
    this.filter.rankOrdering = newOrdering;
    this.filter.pageNr = 0;
    this.updateMonsters();
  }

  /**
   * load more monsters on infinite scroll event
   * @param event          event thrown on infinite scroll, complete target to stop spinner showing
   * @return void
   */
  async loadMonsters(event) {

    // if not loaded everything jet
    if (this.filter.pageNr !== -1) {
      await this.updateMonsters();
    }

    if (event) { event.target.complete(); }
  }
}
