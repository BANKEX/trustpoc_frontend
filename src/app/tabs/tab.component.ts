import { Component, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'tab',
  templateUrl: 'tab.component.pug'
})
export class TabComponent implements AfterViewInit {
  @Input('tabTitle') title: string;
  @Input() active = false;

  constructor (private $cdr: ChangeDetectorRef) {}
  ngAfterViewInit() {
    this.$cdr.detectChanges();
  }
}
