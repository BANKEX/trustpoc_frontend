import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NeatComponent } from '../_common';
import { StageService, ConnectionService } from '../_services';
import { Stage, Uploader, Connection } from '../_types';
import { ModalComponent } from '../modal';
import { BehaviorSubject, Subject } from 'rxjs/Rx';

@Component({
  selector: 'alj-main',
  templateUrl: './main.component.pug',
})
export class MainComponent extends NeatComponent {

  public Uploader = Uploader;
  public Stage = Stage;
  public stage: Stage;
  public date: Date;
  public activeTab$: BehaviorSubject<number> = new BehaviorSubject(1);
  public hasDropZone1Over = false;
  public hasDropZone2Over = false;
  public hasDropZone3Over = false;
  public sendingData$ = new Subject(); // Signaling outgoing data transfer
  public reset$ = new Subject(); // Observable for presenting reset button clicks
  public uploader1: Uploader = this.newUploader('initData');
  public uploader2: Uploader = this.newUploader('initBeneficiary');
  public uploader3: Uploader = this.newUploader('setInformationFromOBK');

  constructor(
    public $connection: ConnectionService,
    private $modal: NgbModal,
    private $stage: StageService,
  ) {
    super();
    $stage
      .takeUntil(this.ngUnsubscribe)
      .subscribe((stage: Stage) => this.stage = stage)
      this.uploader1.merge(this.uploader2).subscribe(_ => {
        if (this.uploader1.value === Uploader.Status.Success
                && this.uploader2.value === Uploader.Status.Success) {
          this.$stage.up(); // move to next (final) stage
        }
      });
      this.uploader3.subscribe(status => {
        if (status === Uploader.Status.Success) {
          this.$connection.obkUploaded$.next(true);
        }
      });
      this.$connection.obkUploaded$.subscribe(_ => {
        this.activeTab$.next(1) // = 1;
      })
      this.$connection.obkStatus$.subscribe(isOk => {
        this.activeTab$.next(isOk ? 1 : 2)
      });
  }

  public fileOverBase1(e: any): void {
    this.hasDropZone1Over = e;
  }

  public fileOverBase2(e: any): void {
    this.hasDropZone2Over = e;
  }

  public fileOverBase3(e: any): void {
    this.hasDropZone3Over = e;
  }

  public showBalanceSheetClick() {
    const modalInstanse =
      this.$modal.open(ModalComponent, {size: 'lg'}).componentInstance;
    modalInstanse.tableId = 4;
    modalInstanse.out.subscribe((boom) => {
    })
  }

  public showBalanceForEachInvestorClick() {
    const modalInstanse =
      this.$modal.open(ModalComponent, {size: 'lg'}).componentInstance;
    modalInstanse.tableId = 5;
    modalInstanse.out.subscribe((boom) => {
    })
  }

  public resetClick() {
    this.date = undefined;
    this.reset$.next();
  }

  public setDate(date: Date) {this.date = date};

  public sendDateToBlockcheinClick() {
    this.$connection.setDate(this.date);
  }

  private newUploader(id) {
    return new Uploader(id, this.getDisabler(id), this.$connection.loadInitialization);
  }
  /**
   * Returns observable emitting true if csecified data already loaded in the contract
   * @param  {string} id - initData/initBeneficiary/OBC
   */
  private getDisabler(id) {
    const disabled$: Subject<boolean> = new Subject();
    this.$connection.takeUntil(this.ngUnsubscribe).subscribe((status: Connection) => {
      switch (this.$connection.initStatus) {
        case 0:
          disabled$.next(false);
          break;
        case 1:
          disabled$.next(id === 'initData');
          break;
        case 2:
          disabled$.next(id === 'initBeneficiary');
          break;
        default:
          return true;
      }
    });
    return disabled$;
  }
}
