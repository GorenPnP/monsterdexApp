import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getIonIcon, Type } from '../types/type';
import { TypeEfficiency } from '../types/type-efficiency';
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

  public get(type_id: number): Observable<Type> {
    return this.getMultiple([type_id]).pipe(
      map(types => types[0])
    );
  }

  public getMultiple(type_ids: number[]): Observable<Type[]> {

    const options: GetOptions = {
      params: {
        query: `{
          type (id: [${type_ids.join(',')}]) {
            id
            name
          }
        }`
      }
    }
    return this.rest.get<{type: Type[]}>(options).pipe(map(res => this.cleanTypes(res.type)));
  }

  public getEfficiency(from: Type[] = null, to: Type[] = null, getValues=false): Observable<TypeEfficiency[]> {

    const filters: string[] = [];
    if (from?.length) { filters.push(`fromTypes: [${from.map(type => type.id)}]`); }
    if (to?.length) { filters.push(`toTypes: [${to.map(type => type.id)}]`); }

    const options: GetOptions = {
      params: {
        query: `{
          typeEfficiency (${filters.join(',')}) {
            fromType
            toType
            ${getValues ? 'efficiencyValue' : 'efficiency'}
          }
        }`
      }
    }
    return this.rest.get<{typeEfficiency: TypeEfficiency[]}>(options).pipe(map(res => res.typeEfficiency));
  }
}