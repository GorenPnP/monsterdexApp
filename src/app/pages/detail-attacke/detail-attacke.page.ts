import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Attacke } from '../../interfaces/attacke';
import { DbMonsterService } from 'src/app/services/db-monster.service';
import { DbTypenService } from 'src/app/services/db-typen.service';
import { Typ } from 'src/app/interfaces/typ';
import { MinimalHeaderService } from 'src/app/services/minimal-header.service';

import { headerPopover } from '../../header_popover_content.module';
import { TypPopupService } from 'src/app/services/typ-popup.service';

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
  attTypenIcons: string[] = [];
  /**
   * list of monsters with their typ icon names
   * format: [[Monster, string[]], ..]
   */
  monTypen = [];

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
   * @param dbTyp        db service for typs
   * @param dbMon        db service for monsters
   */
  constructor(private aRoute: ActivatedRoute,
              private headerService: MinimalHeaderService,
              private typPopup: TypPopupService,
              private db: DbAttackenService,
              private dbTyp: DbTypenService,
              private dbMon: DbMonsterService) {

    // setup dummy attack to be able to render the page
    this.attacke = this.db.defaultAttacke();
    const id: number = parseInt(this.aRoute.snapshot.paramMap.get('id'), 10);

    // get attack of this page
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.db.getAttacke(id).then(att => {
          this.attacke = att;

          // get all icons of attack typs
          this.db.typIcons(this.attacke.id).then(icons => this.attTypenIcons = icons);


          // get all special efficiencies (in types) for this attack
          const ownTypes = this.attacke.typen.map(t => t.id);
          const allPromises: Promise<number>[] = [];
          for (let i = 1; i <= this.dbTyp.NUM_TYPEN; i++) {
            allPromises.push(this.dbTyp.getEfficiency(ownTypes, [i]));
          }

          // one promise for every single type
          // resolves to efficiency for own types on every inidividual type
          Promise.all(allPromises).then(ret => {

            // sort typs in three lists by their reaction to own typs
            // store typ ids
            const effectiveIds: number[] = [];
            const weakIds: number[] = [];
            const noEffectIds: number[] = [];
            for (let i = 0; i < ret.length; i++) {
              if (ret[i] > 1) { effectiveIds.push(i + 1); }
              if (ret[i] < 0) { weakIds.push(i + 1); }
              if (ret[i] === 0) { noEffectIds.push(i + 1); }
            }

            // get types to gathered ids
            this.dbTyp.getTypen(effectiveIds).then(typs => this.effectiveAgainst = typs);
            this.dbTyp.getTypen(weakIds).then(typs => this.weakAgainst = typs);
            this.dbTyp.getTypen(noEffectIds).then(typs => this.noEffectAgainst = typs);
          });

          this.dbMon.getDatabaseState().subscribe(ready => {
            if (ready) {

              // get all monsters with typ icons capable of this attack
              this.dbMon.getMonstersByAttacke(this.attacke.id).then(mons => {
                for (const mon of mons) {
                  this.dbMon.typIcons(mon.id).then(icons => this.monTypen.push([mon, icons]));
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
    this.headerService.presentPopover(ev, headerPopover);
  }

  typInfo(icon: string) {
    this.typPopup.show(this.attacke.typen.filter(typ => typ.icon === icon)[0]);
  }
}
