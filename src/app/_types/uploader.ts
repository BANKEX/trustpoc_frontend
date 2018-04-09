import { Observable, BehaviorSubject } from 'rxjs/Rx';

export enum UploaderStatus {
  Idle = 1, Busy, Success, Error
}

export class Uploader extends BehaviorSubject<UploaderStatus> {

  static Status = UploaderStatus;

  public constructor (public id, private disable$, private callback) {
    super(UploaderStatus.Idle);
    disable$.subscribe(isTrue => isTrue && this.next(UploaderStatus.Success));
  }
  /**
   * ng2FileDrop directive will call this method on filedrop
   * @param  {} files
   * @param  {} options
   * @param  {} filters
   */
  public addToQueue(files, options, filters) {
    // disable filedrop when transaction is pending
    if (this.value === UploaderStatus.Busy) { return; }
    this.next(UploaderStatus.Busy);
    let file = files[0];
    let reader = new FileReader();
    if (file.size > 100000) {
      alert('File is too big!');
      return;
    }
    reader.onload = () => {
      console.log(reader.result);
      this.callback(this.id, reader.result)
        .then((success) => {
          this.next(UploaderStatus.Success)
          console.log('success', success)
        })
        .catch((err) => {
          this.next(UploaderStatus.Idle);
          if ((err.message as string).indexOf('User denied transaction signature') > -1) {
            console.log('Transaction was canceled.')
          } else {
            this.next(UploaderStatus.Error);
            console.log('err', err)
          }
        });
    }
    reader.readAsText(file);
  };
}
