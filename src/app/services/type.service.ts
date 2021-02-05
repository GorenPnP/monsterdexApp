import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getIonIcon, Type } from '../types/type';
import { RestService, GetOptions } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class TypeService {

  constructor(private rest: RestService) { }

  private cleanTypes(types: Type[]): Type[] {
    return types.map(type => ({
        ...type,
        icon: getIonIcon(type.id)
      })
    )
  }

  public getAll(): Observable<Type[]> {

    const options: GetOptions = {
      params: {
        query: `{
          type {
            id
          }
        }`
      }
    }
    return this.rest.get<{type: Type[]}>(options).pipe(map(res => this.cleanTypes(res.type)));
  }
}