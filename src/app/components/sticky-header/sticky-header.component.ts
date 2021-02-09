import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Filter } from 'src/app/types/filter';

@Component({
  selector: 'app-sticky-header',
  templateUrl: './sticky-header.component.html',
  styleUrls: ['./sticky-header.component.scss'],
})
export class StickyHeaderComponent {

  @Input() filter: Filter;
  @Output() searchbarChanged = new EventEmitter<string>();

  headerIsExpanded = true;

  constructor() { }

  presentTypePopover(ev) {
    // TODO
    console.log(ev)
  }
}
