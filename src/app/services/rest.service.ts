import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { observable, Observable } from 'rxjs';


export interface GetOptions {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe?: "body";
  params?: HttpParams | {
      [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class RestService {

  private url = 'https://vstein.pythonanywhere.com/';

  constructor(private http: HttpClient) {}

  public get<ReturnType>(options: GetOptions): Observable<ReturnType> {

    return this.http.get<ReturnType>(this.url, options);
  }
}
