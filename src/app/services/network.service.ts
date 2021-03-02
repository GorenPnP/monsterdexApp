import { Injectable, OnInit } from '@angular/core';
import { Network, NetworkStatus } from '@capacitor/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private online: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.online.subscribe(online => console.log('online:', online));
    
    Network.getStatus().then(status => {
      if (this.online.value !== status.connected) {
        this.online.next(status.connected);
      }
    });


    Network.addListener('networkStatusChange', (status: NetworkStatus) => {
      if (this.online.value !== status.connected) {
        this.online.next(status.connected);
      }
    })
  }

  public isOnline(): Observable<boolean> {
    return this.online.asObservable();
  }
}