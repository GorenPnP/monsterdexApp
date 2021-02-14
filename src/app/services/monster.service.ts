import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { combineLatest, forkJoin, Observable, of, pipe, UnaryFunction } from 'rxjs';
import { catchError, concatAll, map, pluck, tap } from 'rxjs/operators';
import { Attack } from '../types/attack';
import { Filter } from '../types/filter';
import { Monster } from '../types/monster';
import { getIonIcon, Type } from '../types/type';
import { GetOptions, RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class MonsterService {

  private _limit: number = 25;
  public get limit(): number { return this._limit; }

  constructor(private rest: RestService,
              private sanitizer: DomSanitizer) { }

  /**
   * Reads properties of passed monsters and adds missing / alters existing ones based on those.
   * pairs are:
   *      - thumbnail: string (base64) -> showThumbnail: string (sanitized url) OR null
   *      - image: string (base64) -> showImage: string (sanitized url) OR null
   *      - types: Type[] -> types: Type[] (with new field 'icon' set)
   *      - attacks: Attack[] -> attacks: Attack[] (with new field 'type.icon' set)
   * @param monsters monsters that get new/changed fields
   * @returns passed monsters + the newly set / changed properties from above
   */
  private addBasicFields(monsters: Monster[]): Monster[] {

    return monsters.map(monster => {
  
      // thumbnail
      const showThumbnail = monster.thumbnail ?
      this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml('data:image/png;base64,' + monster.thumbnail)) :
      null;

      // image
      const showImage = monster.image ?
        this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml('data:image/png;base64,' + monster.image)) :
        null;

      // type icons
      const types: Type[] = monster.types?.map(type => ({
          ...type,
          icon: getIonIcon(type.id)
        })
      );

      // types of attacks
      const attacks: Attack[] = monster.attacks?.map(attack => ({
          ...attack,
          types: attack?.types.map(type => ({
            ...type,
            icon: getIonIcon(type.id)
            })
          )
        })
      );

      return {
        ...monster,
        showThumbnail,
        showImage,
        types,
        attacks
      } as Monster;
    });
  }

  /**
   * Reads properties of passed monster and gets missing monsters from api via a new request.
   * those pairs are:
   *      - forms: id[] -> formMonsters: Monster[]
   *      - opposite: id[] -> oppositeMonsters: Monster[]
   *      - evolutionPre: id[] -> preMonsters: Monster[]
   *      - evolutionAfter: id[] -> afterMonsters: Monster[]
   * if no id was specified, the resulting new field will get the value of [].
   * @param monster monster that gets new fields
   * @returns Observable of passed monster + the newly set properties from above
   */
  private addRequestFields(monster: Monster): Observable<Monster> {
    
    // get all missing fields by backend call
    return forkJoin({
      formMonsters: monster.forms?.length ? this.filter({ids: monster.forms}) : of([] as Monster[]),
      oppositeMonsters: monster.opposite?.length ? this.filter({ids: monster.opposite}) : of([] as Monster[]),
      
      preMonsters: monster.evolutionPre?.length ? this.filter({ids: monster.evolutionPre}) : of([] as Monster[]),
      afterMonsters: monster.evolutionAfter?.length ? this.filter({ids: monster.evolutionAfter}) : of([] as Monster[])
    }).pipe(
      map<{
        formMonsters: Monster[];
        oppositeMonsters: Monster[];
        preMonsters: Monster[];
        afterMonsters: Monster[];
      }, Monster>(fields => ({...monster, ...fields})), // add new fields to existing monster
    )
  }


  /**
   * adds properties to monsters that do not need another backend call
   */
  private addBasicFields$() {
    return map<Monster[], Monster[]>(monsters => this.addBasicFields(monsters));
  }
  
  /**
   * adds properties to monsters that need another call to the backend first
   */
  private addRequestFields$(): UnaryFunction<Observable<Monster[]>, Observable<Monster[]>> {
    return pipe(
      map<Monster[], Observable<Monster[]>>(monsters =>
        combineLatest(    // takes each Observable<Monster> ( from monsters.map(...) ) and puts them into one Observable<Monster[]>
          monsters.map<Observable<Monster>>(monster =>
            this.addRequestFields(monster))   // adds missing fields on Monster, returns it as Observable<Monster>
        )
      ),
      concatAll()   // flattens Observable like this: Observable<Observable<Monster[]>> -> Observable<Monster[]>
    )
  }
    
    
  private cleanMonsters(key: string) {
    
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
      
  public filter(filter: Filter): Observable<Monster[]> {
    
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
          monster ${filters.length ? '(' + filters.join(', ') + ')' : ''} {
            thumbnail
            id
            name
            types {
              id
            }
          }
        }`
      }
    }
    return this.rest.get<{monster: Monster[]}>(options).pipe(
      this.cleanMonsters('monster')
    );
  }
    
    
  public get(id: number): Observable<Monster> {
    
    const options: GetOptions = {
      params: {
        query: `{
          monster (id: ${id}) {
            image
            id
            name
            rank
            height
            weight
            habitat
            hp
            damagePrevention
            description
            types {
              id
            }
            attacks {
              id
              name
              types {
                id
              }
            }
            evolutionPre
            evolutionAfter
            opposite
            forms
          }
        }`
      }
    }
    return this.rest.get<{monster: Monster[]}>(options).pipe(
      this.cleanMonsters('monster'),
      map(monster => monster[0])
    );
  }
    
  private mapOperatorFromScratch<T, R>(fn: (value: T) => R) {
    return (source: Observable<T>) => new Observable<R>(subscriber => {
      return source.subscribe({
        error: e => subscriber.error(e),
        complete: () => subscriber.complete(),
        next: v => subscriber.next(fn(v)) // <- execute passed function fn() and use return value as new value for returned Observable
      })
    })
  }
}
  