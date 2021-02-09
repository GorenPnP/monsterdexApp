import { AfterViewInit, Directive, ElementRef, HostListener, Input, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appScrollHeader]'
})
export class ScrollHeaderDirective implements AfterViewInit {

  // Cannot pass over the angular way (<div #stickyHeader></div> ...) because the used component is loaded after this directive.
  // So pass html-ids to important elements and collect them in ngAfterViewInit(), when they exist
  @Input() private stickyHeaderId: string;
  @Input() private scrollHeaderId: string;

  // Element (References) to be filled with the html-ids
  private stickyHeader: any;
  private scrollHeader: any;

  // other vals
  private scrollHeaderChildren: any[];

  constructor(private renderer: Renderer2,
              private domCtrl: DomController) { }


  /**
   * get all needed elements
   */
  ngAfterViewInit(): void {
    this.stickyHeader = document.querySelector(`#${this.stickyHeaderId}`);
    this.scrollHeader = document.querySelector(`#${this.scrollHeaderId}`);

    this.scrollHeaderChildren = Array.from(this.scrollHeader.children);
  }

  @HostListener('ionScroll', ['$event']) onIonContentScroll($event: any) {

    // get conditions (in px)
    const scrollHeaderHeight = this.scrollHeader.clientHeight;
    const scrollTop: number = $event.detail.scrollTop;

    // calc new position & opacity
    const newPosition = scrollTop >= scrollHeaderHeight ? -scrollHeaderHeight : -scrollTop; // in px
    const opacity = 1 + (newPosition / scrollHeaderHeight); // between 0 and 1

    // set it
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.scrollHeader, 'top', `${newPosition}px`);
      this.renderer.setStyle(this.stickyHeader, 'top', `${newPosition}px`);
      this.scrollHeaderChildren.forEach(child => this.renderer.setStyle(child, 'opacity', opacity));
    })
  }
}
