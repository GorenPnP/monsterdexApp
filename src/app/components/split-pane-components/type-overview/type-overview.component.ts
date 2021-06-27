import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TypeService } from 'src/app/services/type.service';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-type-overview',
  templateUrl: './type-overview.component.html',
  styleUrls: ['./type-overview.component.scss'],
})
export class TypeOverviewComponent implements OnInit {

  types: BehaviorSubject<Type[]> = new BehaviorSubject<Type[]>(null);
  allTypes: Type[] = [];

  sliderOpts = {
    freeMode: true,
    freeModeMomentumRatio: 0.5,
    slidesPerView: 2.5,
  };

  constructor(private typeService: TypeService) { }

  /**
   * get the type from service -> display minimal information
   */
  ngOnInit(): Promise<void> {
    return this.typeService.getMultiple([]).toPromise()
      .then(types => {
        this.allTypes = types.sort((a, b) => a.name === b.name ? 0 : (a.name < b.name ? -1 : 1));
        this.types.next([types[0]] || null);
      });
  }

  toggleType(t: Type): void {
    let types = this.types.value;

    if (types.includes(t)) {
      this.types.next(types.filter(type => type !== t));
    } else {
      this.types.next([...types, t]);
    }
  }
}
