import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { OperatorFunction, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AttackService } from 'src/app/services/attack.service';
import { TypeService } from 'src/app/services/type.service';
import { Attack } from 'src/app/types/attack';
import { Filter } from 'src/app/types/filter';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-attack-list',
  templateUrl: './attack-list.page.html',
  styleUrls: ['./attack-list.page.scss'],
})
export class AttackListPage implements OnInit {

  /**
   * all attacks displayed
   */
  attacks: Attack[] = [];
  /**
   * contains all params necessary for filtering & sorting attacks
   */
  filter: Filter = {
    pageNr: null,
    typeAnd: true,
    types: [],
    name: ''
  }
  /**
   * toggle header expansion
   */
  headerIsExpanded: boolean = true;
  /**
   * all types for filtering in header
   */
  allTypes: Type[] = [];

  private activeSearch: Subscription = null;

  /**
   * initialize needed values for header
   * @param attackService db service for monsters
   * @param typeService    db service to get all types for filter
   */
  constructor(private attackService: AttackService,
              private typeService: TypeService,
              private loadingCtrl: LoadingController) { }

  /**
   * initialize values
   * @return void
   */
  ngOnInit(): Promise<void> {
    this.filter.pageNr = 0;
    return Promise.allSettled([
      this.updateAttacks(),
      this.typeService.getAll().toPromise().then(types => this.allTypes = types)
    ]).then(() => { return; });
  }

  allPagesLoaded(): boolean {
    return this.filter.pageNr === -1;
  }

  private setAllPagesLoaded(): void {
    this.filter.pageNr = -1;
  }

  private async displayLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      backdropDismiss: true,
      keyboardClose: false,
      message: '* nachdenk *',
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
  private updateAttacks(
      displayLoadingSpinner: boolean = true,
      onLoaded: OperatorFunction<Attack[], Attack[]> = tap()): void {

    // nothing new to load
    if (this.allPagesLoaded()) { return; }

    // search and filter Monsters
    if (this.activeSearch) { this.activeSearch.unsubscribe(); }

    const loadingSpinner = displayLoadingSpinner ? this.displayLoading() : null;
    this.activeSearch = this.attackService.filter(this.filter).pipe(

      // dismiss loading spinner
      tap(() => { loadingSpinner?.then(spinner => spinner.dismiss()) }),

      // execute custom operator function
      onLoaded
      ).subscribe(attacks => {

        // if first page (pageNr === 0), override this.monsters entirely.
        // We don't want any old ones from another search, do we :) ?
        this.attacks = this.filter.pageNr ? [...this.attacks, ...attacks] : attacks;
        attacks.length === this.attackService.limit ? this.filter.pageNr++ : this.setAllPagesLoaded();
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
    this.updateAttacks();
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
    this.updateAttacks();
  }

  /**
   * toggle OR/AND for type search and search if needed
   * @return void
   */
  toggleTypeAnd(): void {
    this.filter.typeAnd = !this.filter.typeAnd;

    if (this.filter.types.length > 1) {
      this.filter.pageNr = 0;
      this.updateAttacks();
    }
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
    const onLoaded: OperatorFunction<Attack[], Attack[]> =
      tap(() => event.target.complete());

    this.updateAttacks(false, onLoaded);
  }
}
