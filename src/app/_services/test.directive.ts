import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class TestDirective {
  constructor(private el: ElementRef) { }

  @Input('color') color: string;

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.color || 'red');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(null);
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }

  ngAfterViewInit() {
  }
}
