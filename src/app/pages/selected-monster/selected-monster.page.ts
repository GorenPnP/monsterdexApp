import { Component, OnInit } from '@angular/core';

import { DbMonsterService } from '../../services/db-monster.service';

import { Monster } from "../../interfaces/monster";

@Component({
  selector: 'app-selected-monster',
  templateUrl: './selected-monster.page.html',
  styleUrls: ['./selected-monster.page.scss'],
})
export class SelectedMonsterPage implements OnInit {

	private selectedMonsters: Monster[] = [];
  constructor(private db: DbMonsterService) { }

  ngOnInit() {
		this.db.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				this.db.getSelectedMonsters().subscribe(monsters => {
					this.selectedMonsters = monsters;
				});
			}
		});
  }

	toggleIsSelected(id: number) {
		this.db.getMonster(id).then(data => {
			this.db.toggleIsSelected(data);
		});
	}
}
