import { Injectable } from '@angular/core';
import { Typ, string_of_enum } from '../interfaces/typ';
import { AlertController } from '@ionic/angular';
import { DbTypenService } from './db-typen.service';

@Injectable({
  providedIn: 'root'
})
export class TypPopupService {

  typName: string;
  list = [];

  constructor(private alertController: AlertController, private db: DbTypenService) { }

  async show(showTyp: Typ): Promise<void> {

    this.typName = string_of_enum(showTyp);

    this.db.getAllTypen().then(async allTypen => {

      const promises = allTypen.map(typ => this.db.getEfficiency([showTyp.id], [typ.id]));

      Promise.all(promises).then(async data => {

        this.list = [{ topic: 'stark', content: [] },
                     { topic: 'schwach', content: [] },
                     { topic: 'trifft nicht', content: [] }
        ];

        for (let i = 0; i < data.length; i++) {
          if (data[i] === 1) { continue; }

          const typ = await this.db.getTyp(i);
          const content = { icon: typ.icon, title: string_of_enum(typ) };

          if (data[i] > 1) { this.list[0].content.push(content); }
          else if (data[i] === 0) { this.list[2].content.push(content); }
          else { this.list[1].content.push(content); }
        }

        let message = `<ion-list class="shrink">`;

        for (const section of this.list) {
          if (section.content.length === 0) { continue; }

          message += `<ion-item-divider class="shrink" style="margin: 0 auto;">
        <ion-label class="ion-text-wrap" style="margin: 0 auto;">${section.topic}</ion-label>
      </ion-item-divider>`;

          for (const content of section.content) {
            message += `<ion-item class="shrink" lines="full">
          <ion-icon slot="start" name=${content.icon}></ion-icon>
          <ion-label class="ion-text-wrap">${ content.title }</ion-label>
        </ion-item>
      </div>
    </div>`;
          }
        }
        message += '</ion-list>';


        const popover = await this.alertController.create({
          header: this.typName,
          message

        });
        return await popover.present();
      });
    });
  }
}
