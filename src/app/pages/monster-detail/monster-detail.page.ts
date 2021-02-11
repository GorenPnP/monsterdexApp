import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonsterService } from 'src/app/services/monster.service';
import { Monster } from 'src/app/types/monster';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-monster-detail',
  templateUrl: './monster-detail.page.html',
  styleUrls: ['./monster-detail.page.scss'],
})
export class MonsterDetailPage implements OnInit {

  monster: Monster;

  constructor(private route: ActivatedRoute,
              private monsterService: MonsterService) { }

  ngOnInit() {
    const id: number = parseInt(this.route.snapshot.paramMap.get('id'));
    this.monsterService.get(id).subscribe(monster => {
      this.monster = monster;
    });
  }

  typeInfo(type: Type) {
    console.log(type);
    // TODO
  }

  presentTypePopover(ev: Event) {
    console.log(ev);
    // TODO
  }

  /**
   * 
   * @param event click-event fired
   * @param type  the type to display information for
   */
  openTypeDescription(event: Event, type: Type) {

    // stop routing to detail page
    event.preventDefault();
    event.stopImmediatePropagation();

    // open popover with type information
    // TODO
    console.log(event, type)
  }
}
