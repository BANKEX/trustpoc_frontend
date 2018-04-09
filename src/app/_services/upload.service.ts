import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Rx";

@Injectable()
export class UploadService {
  /**
   * Service for file upload to blockchain
   */
  public upload(file) {
    return Observable.timer(1000).take(1)
  }
}
