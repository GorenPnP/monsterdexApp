import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Filter } from 'src/app/types/filter';
import { SIZE_TO_MEDIA } from '@ionic/core/dist/collection/utils/media';

@Component({
  selector: 'app-sticky-header',
  templateUrl: './sticky-header.component.html',
  styleUrls: ['./sticky-header.component.scss'],
})
export class StickyHeaderComponent {

  @Input() filter: Filter;
  @Input() headerIsExpanded: boolean;
  @Output() headerIsExpandedChange = new EventEmitter<boolean>();
  @Output() searchbarChanged = new EventEmitter<string>();


  /**
   * 
   * @param event click-event fired
   */
  openTypeOverview(): void {

    const splitPane = document.querySelector('ion-split-pane');
    
    if (window.matchMedia(SIZE_TO_MEDIA[splitPane.when] || splitPane.when).matches) {
      splitPane.classList.toggle('split-pane-visible');
    }
  }

  toggleHeaderIsExpanded() {
    this.headerIsExpanded = !this.headerIsExpanded;
    this.headerIsExpandedChange.emit(this.headerIsExpanded);
  }
}
