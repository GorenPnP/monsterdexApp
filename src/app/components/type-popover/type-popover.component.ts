import { AfterViewInit, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TypeService } from 'src/app/services/type.service';

import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-type-popover',
  templateUrl: './type-popover.component.html',
  styleUrls: ['./type-popover.component.scss'],
})
export class TypePopoverComponent implements AfterViewInit {

  @Input() type: Type;
  types$: BehaviorSubject<Type[]> = new BehaviorSubject<Type[]>(null);
  displayEfficiencies: boolean = false;

  constructor(private typeService: TypeService) { }

  async ngAfterViewInit(): Promise<void> {
    if (!this.type.name) {
      await this.typeService.get(this.type.id).toPromise()
        .then(type => { this.type = type; });
    }
    this.types$.next([this.type]);
  }
}
