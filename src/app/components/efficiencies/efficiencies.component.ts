import { AfterViewInit, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { zip } from 'rxjs/internal/observable/zip';
import { concatAll, map } from 'rxjs/operators';
import { TypeService } from 'src/app/services/type.service';
import { Type } from 'src/app/types/type';
import { Efficiency, TypeEfficiency } from 'src/app/types/type-efficiency';

@Component({
  selector: 'app-efficiencies',
  templateUrl: './efficiencies.component.html',
  styleUrls: ['./efficiencies.component.scss'],
})
export class EfficienciesComponent implements AfterViewInit {

  @Input() types: Observable<Type[]>;
  @Input() showAsFrom = true;
  @Input() showAsTo = true;

  plainTypes: Type[];
  
  efficienciesAsFrom: {[efficiency: number]: Type[]} = {};
  efficienciesAsTo: {[efficiency: number]: Type[]} = {};

  Object = Object;

  constructor(private typeService: TypeService) { }


  ngAfterViewInit(): void {
    this.types.subscribe(types => {
      if (types && types.some(type => !type.name)) {
        this.typeService.getMultiple(types.map(type => type.id))
          .subscribe(namedTypes => {
            this.plainTypes = namedTypes;
            this.updateEfficiencies();
          });
      } else {
        this.plainTypes = types;
        this.updateEfficiencies();
      }
    })
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
  private zip(efficiencies: TypeEfficiency[], returnFromType: boolean): Observable<{[efficiency: number]: Type[]}> {
    const eff: {efficiency: Efficiency, type_id: number}[] = efficiencies.map(eff => ({
          type_id: returnFromType ? eff.fromType : eff.toType,
          efficiency: eff.efficiency
        })
    );
    return zip(this.getTypes(eff.map(e => e.type_id)), this.sortEfficiencies(eff)).pipe(
      map(([types, sorting]) => {

        return Object.entries(sorting).reduce((final, [efficiency, type_ids]) => {
          final[efficiency] = type_ids.map(id => types[id]);
          return final;
        }, {})
      })
    )
  }

    
  private getAsFrom(types: Type[]) {

    // .. as from-types
    return this.typeService.getEfficiency(types, null).pipe(
      map(efficiencies => this.zip(efficiencies, false)),
      concatAll()
    );
  }


  private getAsTo(types: Type[]) {

    // .. as to-types
    return this.typeService.getEfficiency(null, types).pipe(
      map(efficiencies => this.zip(efficiencies, true)),
      concatAll()
    );
  }

  /**
   * Loads Types which this.type is not normally efficient against. (Save in this.efficienciesAsFrom)
   * Loads Types which are not normally efficient against this.type. (Save in this.efficienciesAsTo)
   */
  private updateEfficiencies() {
    if (!this.plainTypes || !this.plainTypes.length) {
      this.efficienciesAsFrom = {};
      this.efficienciesAsTo = {};
      return;
    }
    this.getAsFrom(this.plainTypes).subscribe(res => this.efficienciesAsFrom = res);
    this.getAsTo(this.plainTypes).subscribe(res => this.efficienciesAsTo = res);
  }

  getNames(types: Type[]): string {
    return types && types.length ? types.map(t => t.name).join(', ') : '';
  }
}
