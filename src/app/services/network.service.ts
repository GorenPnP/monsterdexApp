import { Injectable } from '@angular/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private is_online$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor() {
    Network.getStatus().then(status => {
      this.is_online$.next(status.connected);
      Network.addListener("networkStatusChange", (status: ConnectionStatus) => {
        console.log(status)
        this.is_online$.next(status.connected);
      });
    });
  }

  public isOnline(): Observable<boolean> {
    return this.is_online$.asObservable();
  }
}