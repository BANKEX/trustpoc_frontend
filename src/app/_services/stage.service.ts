import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Stage, Connection, InitializationProgress } from '../_types';
import { ConnectionService } from './index';

@Injectable()
export class StageService extends BehaviorSubject<Stage> {
  /**
   * Service for managing Application Stages
   */
  constructor (
    public $connection: ConnectionService
  ) {
    super(Stage.Connection);
    $connection.subscribe((state: Connection) => {
      switch (state) {
        case Connection.Estableshed:
          if ($connection.initStatus !== InitializationProgress.AllDataLoaded) {
            this.next(Stage.Initialization);
          } else {
            this.next(Stage.Presentation);
          }
          break;
      }
    })
  }

  public up() {
    this.next(this.value + 1);
  }
}
