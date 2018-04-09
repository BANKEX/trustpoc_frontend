import { Component, OnInit, Input, Output, AfterViewInit } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { NeatComponent } from '../_common';
import { ConnectionService } from '../_services'
import * as moment from 'moment';

@Component({
  selector: 'alj-date',
  templateUrl: './date-control.component.pug',
})
export class DateControlComponent extends NeatComponent implements AfterViewInit {

  public contractDate: Date;
  public disabled = false;
  public displayDate: Date;

  @Input() disabled$: Observable<boolean>;
  @Input() reset$: Observable<any>;
  @Output() date$: Subject<Date> = new Subject();

  constructor($connection: ConnectionService) {
    super();
    // Set initial value
    $connection.timenow$.filter(x => !!x).take(1).subscribe(date => this.displayDate = new Date(date));
    $connection.timenow$.takeUntil(this.ngUnsubscribe).subscribe(date => this.contractDate = new Date(date));
    this.date$.subscribe(date => this.displayDate = date);
  }

  public click(days) {
    if (this.disabled) { return };
    let m = moment(this.displayDate);
    m.add(days, 'days');
    this.date$.next(m.toDate());
  }

  ngAfterViewInit() {
    this.disabled$.subscribe(disable => this.disabled = disable);
    this.reset$.takeUntil(this.ngUnsubscribe)
      .subscribe(reset => this.displayDate = this.contractDate);
  }
}
