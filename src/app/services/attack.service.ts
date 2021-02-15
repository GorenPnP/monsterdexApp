import { Injectable } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, pipe, UnaryFunction } from 'rxjs';
import { catchError, concatAll, map, pluck, tap } from 'rxjs/operators';
import { Attack } from '../types/attack';
import { Filter } from '../types/filter';
import { Monster } from '../types/monster';
import { getIonIcon, Type } from '../types/type';
import { MonsterService } from './monster.service';
import { GetOptions, RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class AttackService {

  private _limit: number = 25;
  public get limit(): number { return this._limit; }

  constructor(private rest: RestService,
              private monsterService: MonsterService) { }

  /**
   * Reads properties of passed attacks and adds missing / alters existing ones based on those.
   * pairs are:
   *      - types: Type[] -> types: Type[] (with new field 'icon' set)
   * @param attacks attacks that get new/changed fields
   * @returns passed attacks + the newly set / changed properties from above
   */
  private addBasicFields(attacks: Attack[]): Attack[] {

    return attacks.map(attack => {

      // type icons
      const types: Type[] = attack.types?.map(type => ({
          ...type,
          icon: getIonIcon(type.id)
        })
      );

      return {
        ...attack,
        types
      } as Attack;
    });
  }

  /**
   * Reads properties of passed attack and gets missing monsters from api via a new request.
   * those pairs are:
   *      - monsters: id[] -> showMonsters: Monster[]
   * if no id was specified, the resulting new field will get the value of [].
   * @param attack attack that gets new fields
   * @returns Observable of passed attack + the newly set properties from above
   */
  private addRequestFields(attack: Attack): Observable<Attack> {
    
    // get all missing fields by backend call
    return forkJoin({
      showMonsters: attack.monsters?.length ? this.monsterService.filter({ids: attack.monsters}) : of([] as Monster[])
    }).pipe(
      map<{ showMonsters: Monster[] }, Attack>(fields => ({...attack, ...fields})), // add new fields to existing attack
    )
  }


  /**
   * adds properties to monsters that do not need another backend call
   */
  private addBasicFields$() {
    return map<Attack[], Attack[]>(monsters => this.addBasicFields(monsters));
  }
  
  /**
   * adds properties to attacks that need another call to the backend first
   */
  private addRequestFields$(): UnaryFunction<Observable<Attack[]>, Observable<Attack[]>> {
    return pipe(
      map<Attack[], Observable<Attack[]>>(attacks => {
        if (!attacks.length) { return of(attacks); }

        return combineLatest(    // takes each Observable<Attack> ( from attacks.map(...) ) and puts them into one Observable<Attack[]>
          attacks.map<Observable<Attack>>(attack =>
            this.addRequestFields(attack))   // adds missing fields on Attack, returns it as Observable<Attack>
        )
      }),
      concatAll()   // flattens Observable like this: Observable<Observable<Attack[]>> -> Observable<Attack[]>
    )
  }
    
    
  private cleanAttacks(key: string) {
    
    return pipe(
      pluck(key),
      this.addBasicFields$(),
      this.addRequestFields$(),
      
      catchError(err => {
        console.error(err);
        return [];
      })
    )
  }
      
  public filter(filter: Filter): Observable<Attack[]> {
    
    // stringify filter values
    let filters: string[] = [`pageSize: ${this.limit}`];
    if (filter.typeAnd !== undefined) filters.push(`typeAnd: ${filter.typeAnd}`);
    if (filter.name) { filters.push(`name: "${filter.name}"`); }
    if (filter.types?.length) { filters.push(`types: [${filter.types}]`); }
    if (filter.rankOrdering) { filters.push(`rankOrdering: ${filter.rankOrdering}`); }
    if (filter.pageNr || filter.pageNr === 0) { filters.push(`pageNr: ${filter.pageNr}`); }
    if (filter.ids?.length) { filters.push(`id: [${filter.ids.join(',')}]`); }
    
    
    const options: GetOptions = {
      params: {
        query: `{
          attack ${filters.length ? '(' + filters.join(', ') + ')' : ''} {
            id
            name
            types {
              id
            }
          }
        }`
      }
    }
    return this.rest.get<{attack: Attack[]}>(options).pipe(
      this.cleanAttacks('attack')
    );
  }
    
    
  public get(id: number): Observable<Attack> {
    
    const options: GetOptions = {
      params: {
        query: `{
          attack (id: ${id}) {
            name
            description
            damage
            types {
              id
            }
            monsters
          }
        }`
      }
    }
    return this.rest.get<{attack: Attack[]}>(options).pipe(
      this.cleanAttacks('attack'),
      map(attacks => attacks[0])
    );
  }
}
