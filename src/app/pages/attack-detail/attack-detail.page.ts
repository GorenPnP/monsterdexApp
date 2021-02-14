import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AttackService } from 'src/app/services/attack.service';
import { Attack } from 'src/app/types/attack';

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
              private attackService: AttackService) { }

  ngOnInit(): void {
    const id: number = parseInt(this.route.snapshot.paramMap.get('id'));
    this.attackService.get(id).subscribe(attack => this.attack = attack);
  }
}
