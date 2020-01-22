import { Component, OnInit } from '@angular/core';
import { DbTypenService } from 'src/app/services/db-typen.service';
import { Typ } from 'src/app/interfaces/typ';

@Component({
  selector: 'app-dummy',
  templateUrl: './dummy.page.html',
  styleUrls: ['./dummy.page.scss'],
})
export class DummyPage implements OnInit {

	test_typen: Typ[] = [null, null, null, null, null]

  constructor(private typDB: DbTypenService) {
		this.typDB.getDatabaseState().subscribe(rdy => {
			if (rdy) {
				this.typDB.getTyp(2).then(typ => {
					this.test_typen[1] = typ;
				});
				this.typDB.getTyp(5).then(typ => {
					this.test_typen[4] = typ;
				});
			}
		});
	}

  ngOnInit() {
  }

}
