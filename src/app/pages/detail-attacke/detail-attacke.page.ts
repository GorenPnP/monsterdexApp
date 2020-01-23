import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Attacke } from "../../interfaces/attacke";
import { DbMonsterService } from 'src/app/services/db-monster.service';

@Component({
  selector: 'app-detail-attacke',
  templateUrl: './detail-attacke.page.html',
  styleUrls: ['./detail-attacke.page.scss'],
})
export class DetailAttackePage implements OnInit {

		attacke: Attacke;
		id: number;
		att_typen_icons: string[] = [];

		mon_typen = [];

	  constructor(private aRoute: ActivatedRoute,
								private db: DbAttackenService,
								private db_mon: DbMonsterService) {
		}

	  ngOnInit() {
			this.attacke = this.db.defaultAttacke();
			this.id = parseInt(this.aRoute.snapshot.paramMap.get('id'));


			this.db.getDatabaseState().subscribe(rdy => {
	      if (rdy) {
					this.db.getAttacke(this.id).then(att => {
						this.attacke = att;

						// get all icons of attacken typen
						this.db.typIcons(this.attacke.id).then(icons => {this.att_typen_icons = icons;});

						this.db_mon.getDatabaseState().subscribe(rdy => {
				      if (rdy) {

								// get all monsters with typ icons capable of this attack
								this.db_mon.getMonstersByAttacke(this.attacke.id).then(mons => {
									for (let i = 0; i < mons.length; i++) {
										this.db_mon.typIcons(mons[i].id).then(icons => {this.mon_typen.push([mons[i], icons]);});
									}
								});
							}
						});
					});
				}
			});
		}
	}
