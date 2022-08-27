import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { AttackService } from 'src/app/services/attack.service';
import { Attack } from 'src/app/types/attack';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-attack-detail',
  templateUrl: './attack-detail.page.html',
  styleUrls: ['./attack-detail.page.scss'],
})
export class AttackDetailPage implements OnInit, AfterViewInit {
  @ViewChild(IonContent) content: IonContent;

  attack: Attack;
  types: BehaviorSubject<Type[]> = new BehaviorSubject<Type[]>(null);

  generalFields = [
    'name',
    'damage',
    'description'
  ]

  constructor(private route: ActivatedRoute,
              private attackService: AttackService) { }

  ngOnInit(): void {
    const id: number = parseInt(this.route.snapshot.paramMap.get('id'));
    this.attackService.get(id).subscribe(attack => {
      this.attack = attack;
      this.types.next(attack.types);
    });
  }

  ngAfterViewInit() {
    this.content.scrollToTop();
  }
}
