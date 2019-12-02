import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

import { DbMonsterService } from '../../services/db-monster.service';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Monster } from "../../interfaces/monster";
import { Attacke } from '../../interfaces/attacke';

@Component({
  selector: 'app-detail-monster',
  templateUrl: './detail-monster.page.html',
  styleUrls: ['./detail-monster.page.scss'],
})
export class DetailMonsterPage implements OnInit {

	id: number;
	monster: Monster;
	attacken: Attacke[] = [];
	mon_typen_icons: string[] = [];

  constructor(private aRoute: ActivatedRoute,
							private db: DbMonsterService,
							private db_att: DbAttackenService,
						) {}

  ngOnInit() {
		this.monster = this.db.defaultMonster();
		this.id = parseInt(this.aRoute.snapshot.paramMap.get('id'));


		this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
				this.db.getMonster(this.id).then(data => {
					this.monster = data;

					// get all icons of monster typen
					this.db.typIcons(this.monster.id).then(icons => {this.mon_typen_icons = icons;});

					this.db_att.getDatabaseState().subscribe(rdy => {
			      if (rdy) {
							this.db_att.getAttackenByList(this.monster.attacken).then(atts => {
								this.attacken = atts;
							});
						}
					});
				});
			}
		});
	}
}
