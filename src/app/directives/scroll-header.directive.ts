import { AfterViewInit, Directive, HostListener, Input, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appScrollHeader]'
})
export class ScrollHeaderDirective implements AfterViewInit {

  @Input('appScrollHeader') private scrollHeader: any;
  private children: any[];

  private headerHeight: number;



  @Input('appStickyHeader') private stickyHeader: any;

  constructor(private renderer: Renderer2,
              private domCtrl: DomController) { }


  ngAfterViewInit(): void {

    this.scrollHeader = this.scrollHeader.el;
    this.children = Array.from(this.scrollHeader.children);
    this.headerHeight = this.scrollHeader.clientHeight;

    this.stickyHeader = this.stickyHeader.el;
  }

  @HostListener('ionScroll', ['$event']) onIonContentScroll($event: any) {

    this.headerHeight = this.scrollHeader.clientHeight;
    const scrollTop: number = $event.detail.scrollTop;

    const newPosition = -scrollTop < -this.headerHeight ? -this.headerHeight : -scrollTop;
    const opacity = 1 - (newPosition / -this.headerHeight);

    this.domCtrl.write(() => {
      this.renderer.setStyle(this.scrollHeader, 'top', `${newPosition}px`);
      this.renderer.setStyle(this.stickyHeader, 'top', `${newPosition}px`);
      this.children.forEach(child => this.renderer.setStyle(child, 'opacity', opacity));
    })
  }
}
