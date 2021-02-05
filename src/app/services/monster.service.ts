import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Attack } from '../types/attack';
import { Monster } from '../types/monster';
import { RankOrdering } from '../types/rank-ordering';
import { getIonIcon, Type } from '../types/type';
import { GetOptions, RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class MonsterService {

  private _limit: number = 25;

  constructor(private rest: RestService,
              private sanitizer: DomSanitizer) { }

  private cleanMonsters(monsters: Monster[]): Monster[] {
    return monsters.map(monster => {
        
      const showThumbnail = monster.thumbnail ?
        this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml('data:image/png;base64,' + monster.thumbnail)) :
        null;

      const showImage = monster.image ?
        this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml('data:image/png;base64,' + monster.image)) :
        null;

      const types: Type[] = monster.types?.map(type => ({
          ...type,
          icon: getIonIcon(type.id)
        })
      );

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
      };
    })
  }

  public get limit() {
    return this._limit;
  }

  public getAll(offset?: number): Observable<Monster[]> {

    const options: GetOptions = {
      params: {
        query: `{
          monster {
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
    return this.rest.get<{monster: Monster[]}>(options).pipe(map(res => this.cleanMonsters(res.monster)));
  }

  public filter(
    name?: string,
    id?: number[] | number,
    types?: number[],
    typeAnd: boolean = true,
    rankOrdering?: RankOrdering): Observable<Monster[]> {

      // construct filter
      let filters: string[] = [`typeAnd: ${typeAnd}`];
      if (name) { filters.push(`name: "${name}"`); }
      if (id)   { filters.push(`id: [${id}]`); }
      if (types.length) { filters.push(`types: [${types}]`); }
      if (rankOrdering) { filters.push(`rankOrdering: ${rankOrdering}`); }

    
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
    console.log(options.params['query']);
    return this.rest.get<{monster: Monster[]}>(options).pipe(map(res => this.cleanMonsters(res.monster)));
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
            description
            types {
              id
              name
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
    return this.rest.get<{monster: Monster[]}>(options).pipe(map(res => this.cleanMonsters(res.monster)[0]));
  }
}
