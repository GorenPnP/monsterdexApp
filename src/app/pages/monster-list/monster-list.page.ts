import { Component, OnInit } from '@angular/core';
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
   * all monsters displayed
   */
  monsters: Monster[] = [];
  /**
   * contains all params necessary for filtering & sorting monsters
   */
  filter: Filter = {
    pageNr: null,
    typeAnd: true,
    types: [],
    name: '',
    rankOrdering: RankOrdering.NONE
  }
  /**
   * toggle header expansion
   */
  headerIsExpanded: boolean = true;
  /**
   * all types for filtering in header
   */
  allTypes: Type[] = [];
  /**
   * make enum RankOrdering accessible in html template
   */
  RankOrdering = RankOrdering;

  private activeSearch = null;

  /**
   * initialize needed values for header
   * @param monsterService db service for monsters
   * @param typeService    db service to get all types for filter
   */
  constructor(private monsterService: MonsterService,
              private typeService: TypeService) { }

  /**
   * initialize values
   * @return void
   */
  ngOnInit(): Promise<void> {
    this.filter.pageNr = 0;
    return Promise.allSettled([
      this.updateMonsters(),
      this.typeService.getAll().toPromise().then(types => this.allTypes = types)
    ]).then(() => { return; });
  }

  allPagesLoaded(): boolean {
    return this.filter.pageNr === -1;
  }

  private setAllPagesLoaded(): void {
    this.filter.pageNr = -1;
  }

  /**
   * sole point to change the monsters displayed by params of this.filter
   * @return Promise<void>
   */
  private async updateMonsters(): Promise<void> {

    // nothing new to load
    if (this.allPagesLoaded()) { return; }

    // // search and filter Monsters
    // if (this.activeSearch) {
    //   this.activeSearch.unsubscribe();
    // }

    this.activeSearch = this.monsterService.filter(this.filter);
    return this.activeSearch.toPromise().then(monsters => {

      // if first page (pageNr === 0), override this.monsters entirely.
      // We don't want any old ones from another search, do we :) ?
      this.monsters = this.filter.pageNr ? [...this.monsters, ...monsters] : monsters;
      monsters.length === this.monsterService.limit ? this.filter.pageNr++ : this.setAllPagesLoaded();
    });
  }

  /**
   * search on change of entered word
   * @param event thrown on change of search field
   * @return void
   */
  updateOnSearchChanged(): Promise<void> {
    this.filter.pageNr = 0;
    return this.updateMonsters();
  }

  /**
   * toggle given type on this.filter.types and search
   * @param type {Type} to be toggled
   * @return void
   */
  toggleType(type: Type): Promise<void> {

    if (this.filter.types.includes(type.id)) {
      this.filter.types = this.filter.types.filter(t => t !== type.id);
    } else {
      this.filter.types.push(type.id);
    }

    this.filter.pageNr = 0;
    return this.updateMonsters();
  }

  /**
   * toggle OR/AND for type search and search if needed
   * @return void
   */
  toggleTypeAnd(): Promise<void> {
    this.filter.typeAnd = !this.filter.typeAnd;

    if (this.filter.types.length > 1) {
      this.filter.pageNr = 0;
      return this.updateMonsters();
    }
  }

  /**
   * change sorting by rank and search
   * @param newOrdering {RankOrdering} the new rankOrdering to use
   * @return void
   */
  sortByRank(newOrdering: RankOrdering): Promise<void> {
    this.filter.rankOrdering = newOrdering;
    this.filter.pageNr = 0;
    return this.updateMonsters();
  }

  /**
   * load more monsters on infinite scroll event
   * @param event event thrown on infinite scroll, complete target to stop spinner showing
   * @return void
   */
  loadMonstersOnScroll(event): Promise<void> {

    // if not loaded everything jet
    if (!this.allPagesLoaded()) {
      return this.updateMonsters();
    }

    if (event) { event.target.complete(); }
  }

  /**
   * open popover (navigation to type pages)
   * @param ev event fired to set popover
   * @return void
   */
  presentTypePopover(ev: Event): void {
    //   this.headerService.presentPopover(ev, headerPopover);
  }
}
