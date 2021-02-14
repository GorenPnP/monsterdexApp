import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { TypeOverviewComponent } from 'src/app/components/type-overview/type-overview.component';
import { MonsterService } from 'src/app/services/monster.service';
import { Monster } from 'src/app/types/monster';

@Component({
  selector: 'app-monster-detail',
  templateUrl: './monster-detail.page.html',
  styleUrls: ['./monster-detail.page.scss'],
})
export class MonsterDetailPage implements OnInit {

  monster: Monster;

  generalFields = [
    'id',
    'rank',
    'height',
    'weight',
    'hp',
    'damagePrevention',
    'habitat',
    'description'
  ]

  constructor(private route: ActivatedRoute,
              private popoverCtrl: PopoverController,
              private monsterService: MonsterService) { }

  ngOnInit(): void {
    const id: number = parseInt(this.route.snapshot.paramMap.get('id'));
    this.monsterService.get(id).subscribe(monster => this.monster = monster);
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
