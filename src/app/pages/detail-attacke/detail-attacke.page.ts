import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Attacke } from "../../interfaces/attacke";
import { DbMonsterService } from 'src/app/services/db-monster.service';
import { DbTypenService } from 'src/app/services/db-typen.service';
import { Typ } from 'src/app/interfaces/typ';
import { MinimalHeaderService } from 'src/app/services/minimal-header.service';

import { header_popover } from "../../header_popover_content.module";

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

		effectiveAgainst: Typ[] = [];
		weakAgainst: Typ[] = [];
		noEffectAgainst: Typ[] = [];

	  constructor(private aRoute: ActivatedRoute,
								private headerService: MinimalHeaderService,
								private db: DbAttackenService,
								private db_typ: DbTypenService,
								private db_mon: DbMonsterService) {}

	  ngOnInit() {
			this.attacke = this.db.defaultAttacke();
			this.id = parseInt(this.aRoute.snapshot.paramMap.get('id'));


			this.db.getDatabaseState().subscribe(rdy => {
	      if (rdy) {
					this.db.getAttacke(this.id).then(att => {
						this.attacke = att;

						// get all icons of attacken typen
						this.db.typIcons(this.attacke.id).then(icons => {this.att_typen_icons = icons;});


						// get all special efficiencies (in types) for this attack
						let ownTypes = this.attacke.typen.map(t => {return t.id});
						let allPromises: Promise<number>[] = [];
						for (let i = 1; i <= this.db_typ.NUM_TYPEN; i++) {
							allPromises.push(new Promise((resolve, _) => {resolve(this.db_typ.getEfficiency(ownTypes, [i]))}));
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

		presentPopover(ev: Event) {
			this.headerService.presentPopover(ev, header_popover);
		}
	}
