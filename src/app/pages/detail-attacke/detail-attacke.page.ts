import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DbAttackenService } from '../../services/db-attacken.service';

import { Attacke } from "../../interfaces/attacke";

@Component({
  selector: 'app-detail-attacke',
  templateUrl: './detail-attacke.page.html',
  styleUrls: ['./detail-attacke.page.scss'],
})
export class DetailAttackePage implements OnInit {

		attacke: Attacke;
		id: number;
	  constructor(private aRoute: ActivatedRoute,
								private db: DbAttackenService) {
		}

	  ngOnInit() {
			this.initAttacke();
			this.id = parseInt(this.aRoute.snapshot.paramMap.get('id'));
			this.db.getAttacke(this.id).then(data => {
				this.attacke = data;
			});
		}

		initAttacke() {
			this.attacke = {
				id: 0,
				name: "",
				schaden: "",
				beschreibung: "",
				typen: []
			}
		}
	}
