import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NeatComponent } from '../_common';
import { ConnectionService } from '../_services';
import { Connection } from '../_types';

@Component({
  selector: 'alj-connect',
  templateUrl: './connect.component.pug',
})
export class ConnectComponent extends NeatComponent {

  public Connection = Connection;
  public state: Connection;

  constructor(
    public $connection: ConnectionService,
    private $router: Router,
    private $route: ActivatedRoute,
  ) {
    super();
    $connection
      .takeUntil(this.ngUnsubscribe)
      .subscribe(state => this.state = state);
    $route.queryParams.subscribe(params => {
      console.log(params)
      if (params.contract) { // take contract address from query string
        $connection.contractAddress = params.contract;
        this.onSubmit();
      }
    });
  }

  onSubmit() {
    this.$connection.connect(this.$connection.contractAddress);
    this.$router.navigate(['../'], { queryParams: {contract: this.$connection.contractAddress}});
  }
}
