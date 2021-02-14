import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-topping',
  templateUrl: './list-topping.component.html',
  styleUrls: ['./list-topping.component.scss'],
})
export class ListToppingComponent {

  @Input() title: string;
}
