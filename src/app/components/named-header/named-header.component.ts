import { Component, Input } from '@angular/core';
import { SIZE_TO_MEDIA } from '@ionic/core/dist/collection/utils/media';

@Component({
  selector: 'app-named-header',
  templateUrl: './named-header.component.html',
  styleUrls: ['./named-header.component.scss'],
})
export class NamedHeaderComponent {

  @Input() item: {name: string};

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
}
