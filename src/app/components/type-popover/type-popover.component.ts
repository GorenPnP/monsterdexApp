import { Component, Input, OnInit } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeService } from 'src/app/services/type.service';

import { Type } from 'src/app/types/type';
import { Efficiency, TypeEfficiency } from 'src/app/types/type-efficiency';

@Component({
  selector: 'app-type-popover',
  templateUrl: './type-popover.component.html',
  styleUrls: ['./type-popover.component.scss'],
})
export class TypePopoverComponent implements OnInit {

  @Input() type: Type;

  displayEfficiencies: boolean = false;
  efficienciesAsFrom: {[efficiency: number]: Type[]} = {};
  efficienciesAsTo: {[efficiency: number]: Type[]} = {};

  Object = Object // needed reference for template

  constructor(private typeService: TypeService) { }

  /**
   * get the type from service -> display minimal information
   */
  ngOnInit(): Promise<void> {
    if (!this.type.name) {
      return this.typeService.get(this.type.id).toPromise()
        .then(type => { this.type = type; });
    }
  }

  /**
   * Load types with specified ids.
   * @param type_ids ids of types to be loaded
   * @returns dict with ids as keys to their types
   */
  private getTypes(type_ids: number[]): Observable<{[id: number]: Type}> {
    return this.typeService.getMultiple(type_ids).pipe(
      map(types =>
        types.reduce((acc, type) => {
          acc[type.id] = type;
          return acc;
        }, {})
      )
    );
  }

  /**
   * Transforms list of {efficiency: Efficiency, type_id: number}[] into {[Efficiency]: type_id[]} dict.
   * Data format changes, content stays the same.
   * @param efficiencies the efficiencies to write as dict
   * @returns dict in an Observable
   */
  private sortEfficiencies(efficiencies: {efficiency: Efficiency, type_id: number}[]): Observable<{[efficiency: number]: number[]}> {
    return new Observable(
      obs => obs.next(
        efficiencies.reduce(
          (eff_dict, efficiency) => {
            const type_ids: number[] = eff_dict[efficiency.efficiency] || [];
            eff_dict[efficiency.efficiency] = [...type_ids, efficiency.type_id];
            return eff_dict;
          }, {}
        )
      )
    );
  }

  /**
   * Uses this.getTypes() & this.sortEfficiencies().
   * Takes Types of this.getTypes() and replaces the type_ids of this.sortEfficiencies() with them.
   * @param efficiencies to be transformed into a dict of form {[efficiency: Efficiency]: Type[]}
   * @param selectFromType if true, use fromType, else use toType of TypeEfficiency
   * @returns mentioned dict in an Observable
   */
  private zip(efficiencies: TypeEfficiency[], selectFromType: boolean): Observable<{[efficiency: number]: Type[]}> {
    const eff: {efficiency: Efficiency, type_id: number}[] = efficiencies.map(eff => ({
          type_id: selectFromType ? eff.fromType : eff.toType,
          efficiency: eff.efficiency
        })
    );
    return zip(this.getTypes(eff.map(e => e.type_id)), this.sortEfficiencies(eff)).pipe(
      map(([types, sorting]) => 
        Object.entries(sorting).reduce((final, [efficiency, type_ids]) => {
          final[efficiency] = type_ids.map(id => types[id]);
          return final;
        }, {})
      )
    )
  }

  /**
   * Loads Types which this.type is not normally efficient against. (Save in this.efficienciesAsFrom)
   * Loads Types which are not normally efficient against this.type. (Save in this.efficienciesAsTo)
   */
  showDetails() {
    
    // .. as from-type
    this.typeService.getEfficiency([this.type], null).toPromise().then(efficiencies =>
      this.zip(efficiencies, false)
      .subscribe(res => this.efficienciesAsFrom = res)
    );

    // .. as to-type
    this.typeService.getEfficiency(null, [this.type]).toPromise().then(efficiencies =>
      this.zip(efficiencies, true)
      .subscribe(res => this.efficienciesAsTo = res));
  }
}
