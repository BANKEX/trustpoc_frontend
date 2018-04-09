import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { TableDataService } from '../_services/table-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { NeatComponent } from '../_common';
import { ConnectionService } from '../_services';

@Component({
  selector: 'alj-table',
  templateUrl: './table.component.pug',
  providers: [TableDataService]
})
export class TableComponent extends NeatComponent implements AfterViewInit {

  public scrollCallback;
  public data: any = [];
  public JSON = JSON;

  @Input('tableId') tableId: any; // Id of table calling
  constructor(
    private $cdr: ChangeDetectorRef,
    private $data: TableDataService,
    private $modal: NgbModal,
    public $connection: ConnectionService,
  ) {
    super();
    this.scrollCallback = () => true; // this.getData.bind(this);
    $data.takeUntil(this.ngUnsubscribe)
      .filter(data => data) // filter initial value (empty)
      .subscribe(data => {
        this.data = data;
        console.log(data)
      });
   }

  getData() {
    switch (this.tableId) {
      case '1':
        this.$data.getInitialData();
        break;
      case '2':
        this.$data.getInvestorRights();
        break;
      case '3':
        this.$data.getInformationObk(false);
        break;
      case '4':
        this.$data.getBalanceSheet();
        break;
      case '5':
        this.$data.getBalanceForEachInvestor();
        break;
    }
  }

  ngAfterViewInit() {
    this.getData();
    this.$cdr.detectChanges();
    if (+this.tableId === 3) {
      this.$connection.obkUploaded$.subscribe(val =>
        this.data = this.$data.getInformationObk(true)
          .then(data => {
            this.data = data;
            console.warn('New data!')
          })
      )
    }
  }
}
