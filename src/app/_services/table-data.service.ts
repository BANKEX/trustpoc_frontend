// tslint:disable:whitespace
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject, BehaviorSubject } from 'rxjs/Rx';
import { FundInitialState, InvestorRights, InformationObk, FundState } from '../_types';
import { ConnectionService } from './connection.service';
import to from 'await-to-js';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

export class BalanceSheet {
  Assets: {};
  Liabilities: {}
}

@Injectable()
export class TableDataService extends BehaviorSubject<any> {

  private utils = (Web3 as any).utils;

  constructor(private $connection: ConnectionService) {
    super(undefined);
    // $connection.obkUploaded$.subscribe(_ => this.getInformationObk());
  }

  public async getInitialData(): Promise<FundInitialState>  {
    const toBN = this.utils.toBN;
    const [err, terms] = await to(this.$connection.contract.methods.getInitialTerm().call());
    this.$connection.log('Initial data', terms);
    const fund = new FundInitialState();
    fund.totalPriorityRights = terms[0]/1e18;
    fund.totalSubordinatedRights = terms[1]/1e18;
    fund.totalRights = terms[2]/1e18;
    fund.cashReserves = toBN(terms[3])/1e18;
    fund.priorityDividendsRate = toBN(terms[4])/1e18;
    fund.trustFeeRate = toBN(terms[5])/1e18;
    fund.dividendsCalculationTermBeginnig = new Date(terms[6]*1000);
    fund.trustFeesCalculationTermBeginnig = new Date(terms[7]*1000);
    this.next(fund);
    return fund;
  }

  public async getInvestorRights(): Promise<InvestorRights>  {
    const [err, data] = await to(this.$connection.contract.methods.getRightsOfEachInvestor().call());
    this.$connection.log('Investor Rights', data);
    const rights = new InvestorRights();
    rights.priorityRights = []; // new InvestorRights.Right();
    rights.subordinatedRights = []; // new InvestorRights.Right();
    for (let i = 0; i < data.length; i += 3) {
      if (+data[i]===1) {
        rights.priorityRights.push(new InvestorRights.Right(this.utils.numberToHex(data[i+1]), Math.round(data[i+2]/1e18)));
      } else if (+data[i]===2) {
        rights.subordinatedRights.push(new InvestorRights.Right(this.utils.numberToHex(data[i+1]), Math.round(data[i+2]/1e18)));
      } else { console.error('Wrong data format!'); return; }
    }
    this.next(rights);
    return rights;
  }

  public async getInformationObk(noEmit: boolean): Promise<any>  {
    const toBN = this.utils.toBN;
    let err, res;
    let len = await this.$connection.contract.methods.getStateLength().call();
    [err, res] = await to(this.$connection.contract.methods.fundStates(len-1).call());
    if (err != null) { console.error(err); return; };
    // this.$connection.obkStatus$.next(true);
    this.$connection.log('OBK', res);
    const state = new FundState();
    state.principalCollected = this.convert(res[0]);
    state.interestCollected = this.convert(res[1]);
    state.bankInterest = this.convert(res[2]);
    state.expenses = this.convert(res[3]);
    state.trustFees = this.convert(res[4]);
    state.dividendsNotDistributed = this.convert(res[8]);
    state.principalNotDistributed = this.convert(res[9]);
    state.calculationDate = +res[11] ? new Date(res[11]*1000) : undefined;
    if (!noEmit) { this.next(state); }
    return state;
  }

  public async getBalanceSheet(): Promise<any> {
    const [err, data] = await to(this.$connection.contract.methods.getBalanceSheet().call());
    this.$connection.log('Balance sheet', data);
    if (err != null) { console.error(err); return; };
    for(let i=0; i<data.length; i+=1) {
      data[i] = Math.round(data[i]/1e18)
    }
    this.next(data);
    return data;
  }

  public async getBalanceForEachInvestor(): Promise<any> {
    const titles = [null, 'AAA', 'N/A', 'Credits for automobile loan', 'Dividends reserving account', 'Principal reserving account', 'Cash reserving account'];
    const [err, data] = await to(this.$connection.contract.methods.getBalanceForEachInvestor().call());
    if (err != null) { console.error(err); return; };
    this.$connection.log('Balance for investors', data);
    let rows = [], chunk;
    while (data.length > 0) {
      chunk = data.splice(0, 5);
      chunk[0] = +chunk[0];
      chunk[1] = this.utils.numberToHex(chunk[1]);
      chunk[2] = this.convert(chunk[2]);
      chunk[3] = this.convert(chunk[3]);
      chunk[4] = this.convert(chunk[4]);
      rows.push(chunk);
    }
    this.next({titles, rows});
    return {titles, rows};
  }

  private convert = (input) => Math.round(this.utils.toBN(input)/1e18);
}
