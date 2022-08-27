import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { MonsterService } from 'src/app/services/monster.service';
import { Monster } from 'src/app/types/monster';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-monster-detail',
  templateUrl: './monster-detail.page.html',
  styleUrls: ['./monster-detail.page.scss'],
})
export class MonsterDetailPage implements OnInit, AfterViewInit {
  @ViewChild(IonContent) content: IonContent;

  monster: Monster;
  types: BehaviorSubject<Type[]> = new BehaviorSubject<Type[]>(null);

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
              private monsterService: MonsterService) { }

  ngOnInit(): void {
    const id: number = parseInt(this.route.snapshot.paramMap.get('id'));
    this.monsterService.get(id).subscribe(monster => {
      this.monster = monster;
      this.types.next(monster.types);
    });
  }

  ngAfterViewInit() {
    this.content.scrollToTop();
  }
}
