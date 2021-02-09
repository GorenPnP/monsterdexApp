import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Filter } from 'src/app/types/filter';
import { RankOrdering } from 'src/app/types/rank-ordering';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-expanded-header',
  templateUrl: './expanded-header.component.html',
  styleUrls: ['./expanded-header.component.scss'],
})
export class ExpandedHeaderComponent {

  @Input() filter: Filter;
  @Input() allTypes: Type[];
  
  @Output() typeToggled = new EventEmitter<Type>();
  @Output() typeAndToggled = new EventEmitter<null>();
  @Output() rankOrderingChanged = new EventEmitter<RankOrdering>();
  RankOrdering = RankOrdering; // make enum RankOrdering visible in html template

  constructor() { }
}
