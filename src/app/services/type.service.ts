import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, filter, map, pluck } from 'rxjs/operators';
import { getIonIcon, Type } from '../types/type';
import { RestService, GetOptions } from './rest.service';


export enum Efficiency {
  VERY_EFFECTIVE,
  NOT_EFFECTIVE,
  DOES_NOT_HIT,
  NORMAL_EFFECTIVE
}
export interface TypeEfficiency {
  fromType: number;
  toType: number;
  efficiency: Efficiency;
}
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

  public getEfficiency(from: Type[] = null, to: Type[] = null): Observable<TypeEfficiency[]> {

    const filters: string[] = [];
    if (from?.length) { filters.push(`fromTypes: [${from.map(type => type.id)}]`); }
    if (to?.length) { filters.push(`toTypes: [${to.map(type => type.id)}]`); }

    const options: GetOptions = {
      params: {
        query: `{
          typeEfficiency (${filters.join(',')}) {
            fromType
            toType
            efficiency
          }
        }`
      }
    }
    return this.rest.get<{typeEfficiency: TypeEfficiency[]}>(options).pipe(map(res => res.typeEfficiency));
  }
}