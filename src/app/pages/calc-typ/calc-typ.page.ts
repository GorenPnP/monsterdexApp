import { Component } from '@angular/core';

import { DbTypenService } from '../../services/db-typen.service';
import { Typ } from '../../interfaces/typ';
import { headerPopoverNotCalc } from 'src/app/header_popover_content.module';
import { MinimalHeaderService } from 'src/app/services/minimal-header.service';

/**
 * page to calculate the effectiveness of every arbitrary combination of typs
 */
@Component({
  selector: 'app-calc-typ',
  templateUrl: './calc-typ.page.html',
  styleUrls: ['./calc-typ.page.scss'],
})
export class CalcTypPage {

  /**
   * list if all typs of a hypothetical attack
   */
  fromTypen = [];
  /**
   * list of all typs of a hypothetical monster
   */
  toTypen = [];

  /**
   * all typs set of attacking party
   */
  setFromTypen: number[] = [];
  /**
   * all types set of attacked party
   */
  setToTypen: number[] = [];

  /**
   * some text as output on effectiveness
   */
  textOutput: string = 'Werte fehlen.';

  /**
   * gather all typs for attacking and attacked part
   * @param dbTypen      DB service to recieve typ information
   * @param headerService handle information-popover in header
   */
  constructor(private dbTypen: DbTypenService,
              private headerService: MinimalHeaderService) {

    this.dbTypen.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.dbTypen.getAllTypen().then(typen => {

          // initialize typ lists
          for (const typ of typen) {
            this.fromTypen.push({id: typ.id, icon: typ.icon, set: false});
            this.toTypen.push({id: typ.id, icon: typ.icon, set: false});
          }
        });
      }
    });
  }

  /**
   * called on toggle of any typ button, updates output information on effectiveness
   * @param  id   id of the specific type
   * @param  from true if origin is from (attacking side), false if origin is to (atacked side)
   * @return      void
   */
  toggleSet(id: number, from: boolean): void {

    // handle toggle in lists local to this page
    const typ = from ? this.fromTypen[id - 1] : this.toTypen[id - 1];
    const newState = !typ.set;

    const setTypenList = from ? this.setFromTypen : this.setToTypen;
    if (newState) {
      // add to list
      setTypenList.push(id);
    } else {
      // remove from list
      setTypenList.splice(setTypenList.indexOf(id), 1);
    }

    typ.set = newState;

    // if a new efficiency should be calculated due to changed selection
    if (this.setFromTypen.length && this.setToTypen.length) {

      // let db service calculate new efficiency
      this.dbTypen.getEfficiency(this.setFromTypen, this.setToTypen).then(eff => {

        if (eff === 0) {this.textOutput = 'wirkungslos'; return;}

        if (eff === 1) {this.textOutput = 'normaleffektiv'; return;}

        if (eff < 0) {
          this.textOutput = 'nicht sehr effektiv. 1/' + (Math.pow(2, eff * (-1))).toString() + ' x';
          return;
        }

        // if eff > 2
        this.textOutput = 'sehr effektiv. ' + eff.toString() + ' x';
      });

    // if none in from and/or to is not set
    } else {
      this.textOutput = 'Werte fehlen.';
    }
  }

  /**
   * open popover with link to typ list (in header)
   * @param  ev event to the popover, needed for controller
   * @return    void
   */
  presentPopover(ev: Event): void {
      this.headerService.presentPopover(ev, headerPopoverNotCalc);
  }
}
