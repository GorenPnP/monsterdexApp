import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import { DbMonsterService } from '../../services/db-monster.service';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Monster } from '../../interfaces/monster';
import { Image } from 'src/app/interfaces/image';
import { DbImageService } from 'src/app/services/db-image.service';
import { DbTypenService } from 'src/app/services/db-typen.service';
import { Typ } from 'src/app/interfaces/typ';
import { MinimalHeaderService } from 'src/app/services/minimal-header.service';

import { headerPopover } from '../../header_popover_content.module';
import { TypPopupService } from 'src/app/services/typ-popup.service';

/**
 * detail page for monsters
 */
@Component({
  selector: 'app-detail-monster',
  templateUrl: './detail-monster.page.html',
  styleUrls: ['./detail-monster.page.scss'],
})
export class DetailMonsterPage {

  /**
   * holds monster of this page
   */
  monster: Monster;
  /**
   * all icons of monster typen
   */
  monTypenIcons: string[] = [];
  /**
   * list of attacks with their typ icon names
   * format: [[Attack, string[]], ..]
   */
  attTypen = [];

  /**
   * the image to this monster
   */
  image: Image;

  /**
   * list of attack typs this monster is very weak against
   */
  effectiveAgainst: Typ[] = [];
  /**
   * list of attack typs this monster is very resistant against
   */
  weakAgainst: Typ[] = [];
  /**
   * list of attack typs that can not hit this monster
   */
  noEffectAgainst: Typ[] = [];

  /**
   * direct ancestors and predecessors of this monster
   * format: : [[ [anchestorMonster, [icon: string, ..]], ..], [ [predMonster, [icon: string, ..]], ...]]
   */
  evolution = [[], []];
  /**
   * list of all gegenteilmonster with their typ icons (as strings to show them in the view)
   * format: [[Monster, [icon; string,...]], ...]
   */
  gegenteilmonster = [];
  /**
   * list of all related forms with their typ icons (as strings to show them in the view)
   * format: [[Monster, [icon; string,...]], ...]
   */
  aehnlicheFormen = [];

  /**
   * initialize all needed values
   * @param aRoute        route to get id from for monster
   * @param headerService handle header affairs
   * @param db            db service for monsters
   * @param dbAtt        db service for attacks
   * @param dbImg        db service to retrieve the monster's image
   * @param dbTyp        db service for typs
   */
  constructor(private aRoute: ActivatedRoute,
              private headerService: MinimalHeaderService,
              private db: DbMonsterService,
              private dbAtt: DbAttackenService,
              private dbImg: DbImageService,
              private dbTyp: DbTypenService,
              private typPopup: TypPopupService
            ) {

    // set default monster to start correctly
    this.monster = this.db.defaultMonster();
    const id: number = parseInt(this.aRoute.snapshot.paramMap.get('id'), 10);

    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {

        // get monster
        this.db.getMonster(id).then(data => {
          this.monster = data;

          // get direct anchestor and predecessor
          this.db.getEvolution(id).then(ev => {
            for (let k = 0; k < 2; k++) {
              for (const mon of ev[k]) {
                // get all [monster, icons] of anchestors (k=0) and predecessors (k=1)
                this.db.typIcons(mon.id).then(icons => this.evolution[k].push([mon, icons]));
              }
            }
          });

          // get monster image
          this.dbImg.getImage(this.monster.id).then(image => this.image = image);


          // get all special efficiencies (in types) of attacks hitting this monster
          const ownTypes = this.monster.typen.map(t => t.id);
          const allPromises: Promise<number>[] = [];
          for (let i = 1; i <= this.dbTyp.NUM_TYPEN; i++) {
            allPromises.push(this.dbTyp.getEfficiency([i], ownTypes));
          }

          // one promise for every single type
          // resolves to efficiency for every inidividual type on own typs
          Promise.all(allPromises).then(ret => {

            // sort typs in three lists by the reaction of own typs
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


          // get all icons of monster typen
          this.db.typIcons(this.monster.id).then(icons => this.monTypenIcons = icons);

          // get all gegenteilmonster
          if (this.monster.gegenteilmonster.length) {
            this.db.getMonstersByList(this.monster.gegenteilmonster).then(mons => {
              for (const mon of mons) {
                // get all [monster, icons] of gegenteilmonster
                this.db.typIcons(mon.id).then(icons => this.gegenteilmonster.push([mon, icons]));
              }
            });
          }

          // get all aehnliche formen
          if (this.monster.aehnlicheFormen.length) {
            this.db.getMonstersByList(this.monster.aehnlicheFormen).then(mons => {
              for (const mon of mons) {
                // get all [monster, icons] of aehnliche formen
                this.db.typIcons(mon.id).then(icons => this.aehnlicheFormen.push([mon, icons]));
              }
            });
          }

          // get all attacken of monster with their typen
          this.dbAtt.getDatabaseState().subscribe(ready => {
            if (ready) {
              this.dbAtt.getAttackenByList(this.monster.attacken).then(atts => {

                for (const att of atts) {
                  this.dbAtt.typIcons(att.id).then(icons => this.attTypen.push([att, icons]));
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
  presentPopover(ev: Event) {
    this.headerService.presentPopover(ev, headerPopover);
  }

  typInfo(icon: string) {
    this.typPopup.show(this.monster.typen.filter(typ => typ.icon === icon)[0]);
  }
}
