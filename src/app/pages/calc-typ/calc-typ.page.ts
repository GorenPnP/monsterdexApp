import { Component, OnInit } from '@angular/core';

import { DbTypenService } from "../../services/db-typen.service";
import { Typ } from '../../interfaces/typ';

@Component({
  selector: 'app-calc-typ',
  templateUrl: './calc-typ.page.html',
  styleUrls: ['./calc-typ.page.scss'],
})
export class CalcTypPage implements OnInit {

	fromTypen = [];
	toTypen = [];

	setFromTypen: number[] = [];
	setToTypen: number[] = [];

	text_output: string = "Werte fehlen.";

  constructor(private db_typen: DbTypenService) {

		this.db_typen.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				this.db_typen.getAllTypenIcons().then(typen => {

					let typ: Typ;
					for (let i = 0; i < typen.length; i++) {
						typ = typen[i];
						this.fromTypen.push({"id": typ.id, "icon": typ.icon, "set": false});
						this.toTypen.push({"id": typ.id, "icon": typ.icon, "set": false});
					}
				});
			}
		});
	}

  ngOnInit() {}

	toggleSet(id: number, from: boolean) {
		let typ = from? this.fromTypen[id-1] : this.toTypen[id-1];
		let newState = !typ["set"];

		let setTypenList = from? this.setFromTypen : this.setToTypen;
		if (newState) {
			// add to list
			setTypenList.push(id);
		} else {
			// remove from list
			setTypenList.splice(setTypenList.indexOf(id), 1);
		}

		typ["set"] = newState;

		if (this.setFromTypen.length && this.setToTypen.length) {
			// selection changed and valid for a search
			this.db_typen.getEfficiency(this.setFromTypen, this.setToTypen).then(eff => {

				if (eff === 0) {
					this.text_output = "wirkungslos";
					return;
				}

				if (eff === 1) {
					this.text_output = "normaleffektiv";
					return;
				}

				if (eff < 0) {
					this.text_output = "nicht sehr effektiv. 1/" + (Math.pow(2, eff*(-1))).toString() + " x";
					return;
				}

				// if eff > 2
				this.text_output = "sehr effektiv. " + eff.toString() + " x";


			});
		} else {
			this.text_output = "Werte fehlen.";
		}
	}

}
