import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

import { DbMonsterService } from '../../services/db-monster.service';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Monster } from "../../interfaces/monster";
import { Image } from 'src/app/interfaces/image';
import { DbImageService } from 'src/app/services/db-image.service';
import { DbTypenService } from 'src/app/services/db-typen.service';
import { Typ } from 'src/app/interfaces/typ';

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

	effectiveAgainst: Typ[] = [];
	weakAgainst: Typ[] = [];
	noEffectAgainst: Typ[] = [];

	evolution = [[], []];

  constructor(private aRoute: ActivatedRoute,
							private db: DbMonsterService,
							private db_att: DbAttackenService,
							private db_img: DbImageService,
							private db_typ: DbTypenService
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


					// get all special efficiencies (in types) of attacks hitting this monster
					let ownTypes = this.monster.typen.map(t => {return t.id});
					let allPromises: Promise<number>[] = [];
					for (let i = 1; i <= this.db_typ.NUM_TYPEN; i++) {
						allPromises.push(new Promise((resolve, _) => {resolve(this.db_typ.getEfficiency([i], ownTypes))}));
					}
					Promise.all(allPromises).then(ret => {

						let effectiveIds: number[] = [];
						let weakIds: number[] = [];
						let noEffectIds: number[] = [];
						for (let i = 0; i < ret.length; i++) {
							if (ret[i] > 1) {effectiveIds.push(i+1);}
							if (ret[i] < 0) {weakIds.push(i+1);}
							if (ret[i] === 0) {noEffectIds.push(i+1);}
						}

						// get types to gathered ids
						this.db_typ.getTypen(effectiveIds).then(typs => {this.effectiveAgainst = typs})
						this.db_typ.getTypen(weakIds).then(typs => {this.weakAgainst = typs})
						this.db_typ.getTypen(noEffectIds).then(typs => {this.noEffectAgainst = typs})
					});


					// get all icons of monster typen
					this.db.typIcons(this.monster.id).then(icons => {this.mon_typen_icons = icons;});

					// get all attacken of monster with their typen
					this.db_att.getDatabaseState().subscribe(rdy => {
			      if (rdy) {
							this.db_att.getAttackenByList(this.monster.attacken).then(atts => {

								for (let i = 0; i < atts.length; i++) {
									this.db_att.typIcons(atts[i].id).then(icons => {this.att_typen.push([atts[i], icons])});
								}
							});
						}
					});
				});
			}
		});
	}
}
