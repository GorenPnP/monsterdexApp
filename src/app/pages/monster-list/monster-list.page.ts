import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MonsterService } from 'src/app/services/monster.service';
import { TypeService } from 'src/app/services/type.service';
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

  /**
   * offset for loading the next bundle of monsters (is index to the first one of them)
   */
  private offset: number = 0;

  /********************* header functionality **********************/
  /**
   * toggle header expansion
   */
  headerIsExpanded: boolean = true;
  
  private activeSearch: Observable<Monster[]> = null;

  /**
   * operator in type search
   * if true the operator to connect the types is OR, if false AND
   */
  operatorTypesIsOr: boolean = false;
  /**
   * all types, formatted for search
   */
  allTypes: Type[] = [];
  /**
   * buffer for type search
   */
  typeFilter: Type[] = [];
  /**
   * latest in word search
   */
  nameFilter: string = '';

  /****************************************************************/

  /**
   * text on button for rank sorting in header
   */
  rankSorting: string[] = Object.keys(RankOrdering);
  /**
   * index to rankSorting
   */
  rankOrdering: RankOrdering = RankOrdering.NONE;

  /**
   * initialize needed values for header
   * @param db             db service for monsters
   * @param headerService  handle header affairs
   */
  constructor(private monsterService: MonsterService,
              private typeService: TypeService) {

    // this.headerService.getInitState().subscribe(rdy => {
    //   if (rdy) {
    //     this.allTypes = headerService.allTypesFormatted();
    //   }
    // });
  }

  /**
   * initialize values
   * @return void
   */
  ngOnInit(): void {
    this.monsterService.getAll(this.offset).subscribe(monsters => {
      this.monsters = monsters;
      this.offset += this.monsterService.limit;
    });

    this.typeService.getAll().subscribe(types => this.allTypes = types);
  }

  /**
   * lock to synchronize searches
   * @return Promise<void>
   */
  private async updateMonsters(): Promise<void> {

    // // search and filter Monsters
    // if (this.activeSearch) {
    //   this.activeSearch.unsubscribe();
    // }

    const id: number = parseInt(this.nameFilter);

    this.activeSearch = this.monsterService.filter(
      this.nameFilter,
      id !== NaN ? id : null,
      this.typeFilter.map(type => type.id),
      !this.operatorTypesIsOr,
      this.rankOrdering
    );
    this.activeSearch.subscribe(monsters => this.monsters = monsters);
  }

  /**
   * start (or end) search by entered word
   * @param event thrown on change of search field
   * @return void
   */
  onSearchChange(event): void {

    this.nameFilter = event.currentTarget.value;
    console.log(this.nameFilter);
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

    if (this.typeFilter.includes(type)) {
      this.typeFilter = this.typeFilter.filter(t => t !== type);
    } else {
      this.typeFilter.push(type);
    }

    this.updateMonsters();
  }

  /**
   * toggle OR/AND on type search and start search if needed
   * @return void
   */
  toggleOperator(): void {
    this.operatorTypesIsOr = !this.operatorTypesIsOr;

    if (this.typeFilter.length > 1) {
      this.updateMonsters();
    }
  }

  /**
   * change sorting by rank and adapt list of monsters
   * @return void
   */
  sortByRank(newOrdering: RankOrdering): void {
    this.rankOrdering = newOrdering;
    this.updateMonsters();
  }

  /**
   * load more monsters on infinite scroll event
   * @param event          event thrown on infinite scroll, complete target to stop spinner showing
   * @return void
   */
  loadMonsters(event) {

    // // had offset beginning with 0, num (or id) of monsters with 1
    // if ( (this.offset + 1) >= this.db.NUM_MONSTER || this.rankSortIndex) {
    //   if (event) { event.target.complete(); }
    //   return;
    // }

    // // handled thorugh observable subscription
    // this.db.getMonsters(this.offset).then(_ => {
       if (event) { event.target.complete(); }

    //   this.offset += this.db.LIMIT;
    // });
  }
}
