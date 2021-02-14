import { Component, Input, OnInit } from '@angular/core';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-filter-list-item',
  templateUrl: './filter-list-item.component.html',
  styleUrls: ['./filter-list-item.component.scss'],
})
export class FilterListItemComponent implements OnInit {

  @Input() item: {id: number, name: string, showThumbnail?: string, types: Type[]};
  @Input() routerLink: (string | number)[];

  ngOnInit() {
    // set default here, because this.item has to be set first
    this.routerLink = this.routerLink || ['/monster-detail', this.item.id];
  }
}
