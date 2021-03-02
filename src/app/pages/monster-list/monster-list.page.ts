import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

import { OperatorFunction, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LanguageService } from 'src/app/services/language.service';

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

  private activeSearch: Subscription = null;

  /**
   * initialize needed values for header
   * @param monsterService db service for monsters
   * @param typeService    db service to get all types for filter
   */
  constructor(private monsterService: MonsterService,
              private typeService: TypeService,
              private language: LanguageService,
              private loadingCtrl: LoadingController) { }

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

  nextOrderingOf(ordering: RankOrdering): RankOrdering {
    switch (ordering) {
      case RankOrdering.NONE: return RankOrdering.ASC;
      case RankOrdering.ASC: return RankOrdering.DESC;
      default: return RankOrdering.NONE;
    }
  }

  private async displayLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      backdropDismiss: true,
      keyboardClose: false,
      message: await this.language.translateByKey('list.loading'),
      spinner: 'bubbles',
      duration: 5000
    });
    await loading.present();
    return loading;
  }

  /**
   * sole point to change the monsters displayed by params of this.filter.
   * Updates Subscription in this.activeSearch
   * @param {boolean} displayLoadingSpinner whether or not to display a loading spinner during data fetching
   * @param {OperatorFunction<Monster[], Monster[]>} onLoaded
   *   optional function that may be applied after the values have been retrieved from service.
   *   Function will be applied last in an Observable<Monster[]>.pipe() - block.
   * @return void
   */
  private updateMonsters(
      displayLoadingSpinner: boolean = true,
      onLoaded: OperatorFunction<Monster[], Monster[]> = tap()): void {

    // nothing new to load
    if (this.allPagesLoaded()) { return; }

    // search and filter Monsters
    if (this.activeSearch) { this.activeSearch.unsubscribe(); }

    const loadingSpinner = displayLoadingSpinner ? this.displayLoading() : null;
    this.activeSearch = this.monsterService.filter(this.filter).pipe(

      // dismiss loading spinner
      tap(() => { loadingSpinner?.then(spinner => spinner.dismiss()) }),

      // execute custom operator function
      onLoaded
      ).subscribe(monsters => {

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
  updateOnSearchChanged(search: string): void {
    this.filter.name = search;
    this.filter.pageNr = 0;
    this.updateMonsters();
  }

  /**
   * toggle given type on this.filter.types and search
   * @param type {Type} to be toggled
   * @return void
   */
  toggleType(type: Type): void {

    if (this.filter.types.includes(type.id)) {
      this.filter.types = this.filter.types.filter(t => t !== type.id);
    } else {
      this.filter.types.push(type.id);
    }

    this.filter.pageNr = 0;
    this.updateMonsters();
  }

  /**
   * toggle OR/AND for type search and search if needed
   * @return void
   */
  toggleTypeAnd(): void {
    this.filter.typeAnd = !this.filter.typeAnd;

    if (this.filter.types.length > 1) {
      this.filter.pageNr = 0;
      this.updateMonsters();
    }
  }

  /**
   * change sorting by rank and search
   * @param newOrdering {RankOrdering} the new rankOrdering to use
   * @return void
   */
  sortByRank(newOrdering: RankOrdering): void {
    this.filter.rankOrdering = newOrdering;
    this.filter.pageNr = 0;
    this.updateMonsters();
  }

  /**
   * load more monsters on infinite scroll event
   * @param event event thrown on infinite scroll, complete target to stop spinner showing
   * @return void
   */
  async loadMoreOnScroll(event): Promise<void> {

    // if already loaded everything
    if (this.allPagesLoaded()) {
      event?.target.complete();
      return;
    }

    // if not loaded everything jet
    const onLoaded: OperatorFunction<Monster[], Monster[]> =
      tap(() => event.target.complete());

    this.updateMonsters(false, onLoaded);
  }
}
