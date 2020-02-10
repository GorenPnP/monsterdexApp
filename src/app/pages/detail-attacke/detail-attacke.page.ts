import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Attacke } from "../../interfaces/attacke";
import { DbMonsterService } from 'src/app/services/db-monster.service';
import { DbTypenService } from 'src/app/services/db-typen.service';
import { Typ } from 'src/app/interfaces/typ';
import { MinimalHeaderService } from 'src/app/services/minimal-header.service';

import { header_popover } from "../../header_popover_content.module";

/**
 * detail page for attacken
 */
@Component({
  selector: 'app-detail-attacke',
  templateUrl: './detail-attacke.page.html',
  styleUrls: ['./detail-attacke.page.scss'],
})
export class DetailAttackePage {

	/**
	 * holds the attack of this page
	 */
	attacke: Attacke;
	/**
	 * all icons of attacken typen
	 */
	att_typen_icons: string[] = [];
	/**
	 * list of monsters with their typ icon names
	 * format: [[Monster, string[]], ..]
	 */
	mon_typen = [];

	/**
	 * list of monster typs this attack is very effective against
	 */
	effectiveAgainst: Typ[] = [];
	/**
	 * list of monster typs this attack is less effective against
	 */
	weakAgainst: Typ[] = [];
	/**
	 * list of monster typs this attack can not hit
	 */
	noEffectAgainst: Typ[] = [];

	/**
	 * [constructor description]
	 * @param aRoute        route to get id from for attack
	 * @param headerService handle header affairs
	 * @param db            db service for attacks
	 * @param db_typ        db service for typs
	 * @param db_mon        db service for monsters
	 */
  constructor(private aRoute: ActivatedRoute,
							private headerService: MinimalHeaderService,
							private db: DbAttackenService,
							private db_typ: DbTypenService,
							private db_mon: DbMonsterService) {

		// setup dummy attack to be able to render the page
		this.attacke = this.db.defaultAttacke();
		let id: number = parseInt(this.aRoute.snapshot.paramMap.get('id'));

		// get attack of this page
		this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
				this.db.getAttacke(id).then(att => {
					this.attacke = att;

					// get all icons of attack typs
					this.db.typIcons(this.attacke.id).then(icons => {this.att_typen_icons = icons;});


					// get all special efficiencies (in types) for this attack
					let ownTypes = this.attacke.typen.map(t => {return t.id});
					let allPromises: Promise<number>[] = [];
					for (let i = 1; i <= this.db_typ.NUM_TYPEN; i++) {
						allPromises.push(new Promise((resolve, _) => {resolve(this.db_typ.getEfficiency(ownTypes, [i]))}));
					}

					// one promise for every single type
					// resolves to efficiency for own types on every inidividual type
					Promise.all(allPromises).then(ret => {

						// sort typs in three lists by their reaction to own typs
						// store typ ids
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

	/**
	 * open popover with link to typ pages (in header)
	 * @param  ev event to the popover, needed for controller
	 * @return    void
	 */
	presentPopover(ev: Event): void {
		this.headerService.presentPopover(ev, header_popover);
	}
}
