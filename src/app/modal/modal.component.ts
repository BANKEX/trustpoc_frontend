import { Component, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.pug'
})
export class ModalComponent {

  @Input() tableId: number;
  @Output() out = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}

  submit() {
    this.out.emit(true);
    this.activeModal.close('Close click')
  }

  ngAfterViewInit() {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }
}
