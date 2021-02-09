import { Component, Input } from '@angular/core';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-filter-list-item',
  templateUrl: './filter-list-item.component.html',
  styleUrls: ['./filter-list-item.component.scss'],
})
export class FilterListItemComponent {

  @Input() item;

  constructor() {}

  /**
   * 
   * @param event click-event fired
   * @param type  the type to display information for
   */
  openTypeDescription(event: Event, type: Type) {

    // stop routing to detail page
    event.preventDefault();
    event.stopImmediatePropagation();

    // open popover with type information
    // TODO
    console.log(event, type)
  }
}
