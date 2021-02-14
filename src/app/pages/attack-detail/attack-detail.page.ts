import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { TypeOverviewComponent } from 'src/app/components/type-overview/type-overview.component';
import { AttackService } from 'src/app/services/attack.service';
import { Attack } from 'src/app/types/attack';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-attack-detail',
  templateUrl: './attack-detail.page.html',
  styleUrls: ['./attack-detail.page.scss'],
})
export class AttackDetailPage implements OnInit {

  attack: Attack;

  generalFields = [
    'name',
    'damage',
    'description'
  ]

  constructor(private route: ActivatedRoute,
              private popoverCtrl: PopoverController,
              private attackService: AttackService) { }

  ngOnInit(): void {
    const id: number = parseInt(this.route.snapshot.paramMap.get('id'));
    this.attackService.get(id).subscribe(attack => this.attack = attack);
  }

  /**
   * 
   * @param event click-event fired
   */
  async openTypeOverview(event: Event): Promise<void> {

    // open popover with type information
    const popover = await this.popoverCtrl.create({
      component: TypeOverviewComponent,
      cssClass: 'type-overview-popover',
      event: event,
      keyboardClose: false,
      translucent: true
    });
    return popover.present();
  }
}
