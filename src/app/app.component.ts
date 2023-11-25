import { Component } from '@angular/core';

import { Platform, ToastController } from '@ionic/angular';
import { LanguageService } from './services/language.service';
import { NetworkService } from './services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  offline = false;

  constructor(
    private platform: Platform,
    private language: LanguageService,
    private network: NetworkService,
    private toastCtrl: ToastController
  ) {
    this.initializeApp();
    network.isOnline().subscribe(online => {
      this.offline = !online;

      if (this.offline) {
        this.toastCtrl.create({
          message: 'Offline :(',
          position: 'bottom',
          duration: 5000,
          color: 'danger'
        }).then(toast => toast.present())
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.language.setInitialLanguage();
    });
  }
}
