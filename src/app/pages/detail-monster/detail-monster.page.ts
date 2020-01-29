import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

import { DbMonsterService } from '../../services/db-monster.service';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Monster } from "../../interfaces/monster";
import { Attacke } from '../../interfaces/attacke';
import { Image } from 'src/app/interfaces/image';
import { DbImageService } from 'src/app/services/db-image.service';

@Component({
  selector: 'app-detail-monster',
  templateUrl: './detail-monster.page.html',
  styleUrls: ['./detail-monster.page.scss'],
})
export class DetailMonsterPage implements OnInit {

	id: number;
	monster: Monster;
	att_typen = [];

	image: Image;

	mon_typen_icons: string[] = [];

	evolution = [[], []];

  constructor(private aRoute: ActivatedRoute,
							private db: DbMonsterService,
							private db_att: DbAttackenService,
							private db_img: DbImageService,
						) {}

  ngOnInit() {
		// set default monster to start correctly
		this.monster = this.db.defaultMonster();
		this.id = parseInt(this.aRoute.snapshot.paramMap.get('id'));

		this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {

				// get monster
				this.db.getMonster(this.id).then(data => {
					this.monster = data;

					// get direct anchestor and predecessor
					this.db.getEvolution(this.id).then(ev => {
						for (let k = 0; k < 2; k++) {
							for (let i = 0; i < ev[k].length; i++) {
								// get all [monster, icons] of anchestors (k=0) and predecessors (k=1)
								this.db.typIcons(ev[k][i].id).then(icons => {this.evolution[k].push([ev[k][i], icons]);});
							}
						}
					});

					// get monster image
					this.db_img.getImage(this.monster.id).then(image => {this.image = image;})

					// get all icons of monster typen
					this.db.typIcons(this.monster.id).then(icons => {this.mon_typen_icons = icons;});

					// get all attacken of monster with their typen
					this.db_att.getDatabaseState().subscribe(rdy => {
			      if (rdy) {
							this.db_att.getAttackenByList(this.monster.attacken).then(atts => {

								for (let i = 0; i < atts.length; i++) {
									this.db.typIcons(atts[i].id).then(icons => {this.att_typen.push([atts[i], icons])});
								}
							});
						}
					});
				});
			}
		});
	}
}
