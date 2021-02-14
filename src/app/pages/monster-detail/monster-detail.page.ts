import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
              private monsterService: MonsterService) { }

  ngOnInit(): void {
    const id: number = parseInt(this.route.snapshot.paramMap.get('id'));
    this.monsterService.get(id).subscribe(monster => this.monster = monster);
  }
}
