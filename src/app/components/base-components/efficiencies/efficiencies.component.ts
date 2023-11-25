import { AfterViewInit, Component, Input } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { TypeService } from 'src/app/services/type.service';
import { Type } from 'src/app/types/type';
import { efficiencyFromValue, TypeEfficiency } from 'src/app/types/type-efficiency';

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
   * Calculates cumulative efficiencyValues of each type_id.
   * @param selectFromType if true, use fromType, else use toType of TypeEfficiency
   * @returns mentioned dict in an Observable (format: {[type_id: number]: efficiencyValue as number})
   */
  private reformatEfficiencies(returnFromType: boolean): OperatorFunction<TypeEfficiency[], {[type_id: number]: number}> {
    
    return (source: Observable<TypeEfficiency[]>) => {
      return source.pipe(
        map(efficiencies => {

          // reduce efficiency representation to essentials: type_id, efficiencyValue
          const eff: {efficiencyValue: number, type_id: number}[] = efficiencies.map(eff => ({
              type_id: returnFromType ? eff.fromType : eff.toType,
              efficiencyValue: eff.efficiencyValue
            })
          );
          
          // calc type efficiencies by multiplying if multiple entries exist (may be because of multiple types as fromTypes or toTypes)
          return eff.reduce((acc, e) => {
            acc[e.type_id] = acc[e.type_id] ? acc[e.type_id] * e.efficiencyValue : e.efficiencyValue;
            return acc;
          }, {});
        })
      );
    }
  }


  /**
   * Takes Types of this.getTypes() and replaces the type_ids with them.
   * @returns mentioned dict in an Observable (format: {[efficiency: number]: Type[]})
   */
  private replaceTypeIdWithType(): OperatorFunction<{[type_id: number]: number}, {[efficiency: number]: Type[]}> {

    return (source: Observable<{[type_id: number]: number}>) => {
      
      return source.pipe(
        map(typeEfficiencies => {
          const type_ids: number[] = Object.keys(typeEfficiencies).map(id => parseInt(id));

          // fetch full types from mere type_ids
          return this.getTypes(type_ids).pipe(
            map(types => {
    
              // replace type_ids with their types
              return Object.entries(typeEfficiencies).reduce((acc, [type_id, efficiencyValue]) => {
                const efficiency = efficiencyFromValue(efficiencyValue);
    
                acc[efficiency] = acc[efficiency] ? [...acc[efficiency], types[type_id]] : [types[type_id]];
                return acc;
              }, {})
            })
          );
        }),

        // Observable<Observable<..>> to Observable<...>
        concatAll()
      );
    }
  }

    
  private getAsFrom(types: Type[]) {

    // .. as from-types
    return this.typeService.getEfficiency(types, null, true).pipe(
      this.reformatEfficiencies(false),
      this.replaceTypeIdWithType()
    );
  }


  private getAsTo(types: Type[]) {

    // .. as to-types
    return this.typeService.getEfficiency(null, types, true).pipe(
      this.reformatEfficiencies(true),
      this.replaceTypeIdWithType()
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
