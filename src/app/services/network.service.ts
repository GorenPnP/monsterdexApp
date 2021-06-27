import { Injectable } from '@angular/core';
import { Network } from '@ngx-pwa/offline';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor(private network: Network) { }

  public isOnline(): Observable<boolean> {
    return this.network.onlineChanges;
  }
}