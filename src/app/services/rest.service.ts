import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, delay, map, retryWhen } from 'rxjs/operators';


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

  private url = 'https://monsterdex-backend.herokuapp.com/';

  constructor(private http: HttpClient) {}

  public get<ReturnType>(options: GetOptions): Observable<ReturnType> {

    return this.http.get<ReturnType>(this.url, options).pipe(
      retryWhen(err => {
        let remainingRetries: number = 3;

        return err.pipe(
          delay(1000),
          map(error => {
            if (remainingRetries--) { throw error; }
            return error;
          })
        )
      }),
      catchError(err => {
        console.error('Could not perform http-request:', err);
        return EMPTY
      })
    )
  }
}
