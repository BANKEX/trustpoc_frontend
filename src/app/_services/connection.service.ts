import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import { Connection, InitializationProgress } from '../_types/';
import { Account, Contract, Tx } from 'web3/types';
import { BigNumber } from 'bignumber.js'
import Web3 from 'web3';
import to from 'await-to-js';
declare const require: any;

const contractABI = require('../_data/Fund.json').abi;
const contractData = require('../_data/Contract.json');
const RELOAD_STATUS_TRANSACTION = 5000;
@Injectable()
export class ConnectionService extends BehaviorSubject < Connection > {
  /**
   * Service for Connection to Blockchain
   */
  public contractAddress;
  public cryptoYenAddress;
  public initStatus: InitializationProgress; // 'initializationProgress' property of the contract
  public isRinkeby: boolean;
  public obkStatus$: BehaviorSubject<boolean> = new BehaviorSubject(undefined);
  public obkUploaded$: Subject<boolean> = new Subject();
  public timenow$: BehaviorSubject<number> = new BehaviorSubject(undefined);
  public web3: any;

  public busy$: Subject<boolean> = new Subject();
  public contract: Contract;
  public contractStates: number;
  private account: string;
  private fileMaps = contractData.maps;
  private utils = (Web3 as any).utils;

  constructor() {
    super(Connection.None); // set initial connection state
    this.web3 = this.checkAndInstantiateWeb3();
    this.contract = new this.web3.eth.Contract(contractABI);
    this.obkStatus$.subscribe(val => console.warn('obkStatus:', val))
  }

  public async connect(contractHash) {
    this.next(Connection.InProcess);
    try {
      this.contract.options.address = contractHash;
      await this.init();
      await this.checkInitializationProgress();
      this.contractStates = await this.contract.methods.getStateLength().call();
      this.cryptoYenAddress = await this.contract.methods.cryptoYen().call();
      if (this.contractStates > 1) { this.obkStatus$.next(true) }
      // this.startLoops();
      this.next(Connection.Estableshed);
    } catch (e) {
      alert('Please check the contract address and try again.');
      this.next(Connection.None);
      console.error(e);
    }
  };

  public setDate(date: Date): Promise<boolean> {
    this.busy$.next(true);
    return new Promise(async (resolve, reject) => {
      const [err, res] = await to(this.contract.methods.setTimenow(date.getTime() / 1000).send({from: this.account}));
      this.busy$.next(false);
      if (err) { reject(err); return; };
      resolve(res);
    })
  }

  private init = () => {
    return new Promise((resolve, reject) => {
      const x = this.web3
      if (!this.web3) {
        alert('No Metamask');
        return reject('No Metamask');
      }
      this.web3.eth.getAccounts((err, acc) => {
        if (err) {
          reject(err);
        }
        if (!acc[0]) {
          alert('Metamask Locked');
          return reject('Metamask Locked');
        }
        this.account = acc[0]; // save account data
        this.web3.eth.net.getNetworkType((e, net) => {
          if (e) { reject(e); return; }
          if (net !== 'rinkeby' && net !== 'private') {
            alert('Choose Rinkeby Network');
            return reject('Choose Rinkeby Network');
          } else {
            this.isRinkeby = net === 'rinkeby' ? true : false;
          }
          resolve();
        });
      });
    });
  };

  public loadInitialization = async (_type, _csv, _cb = this.checkInitializationProgress) => {
    const parsed = this.parseCSV(_csv, _type);
    return new Promise((resolve, reject) => {
      this.log('Sending', parsed[0]);
      this.contract.methods[_type].apply(null, parsed).send({from: this.account}, (e, _hash) => {
        // no hash means transaction was canceled
        if (e) { return reject(e); }
        const int = setInterval((hash, cb) => {
          this.web3.eth.getTransaction(hash, (err, res) => {
            if (res.blockNumber === null) {
              console.log(hash + ' - pending');
            } else {
              clearInterval(int);
              cb(res);
              resolve(res);
            }
          });
        }, RELOAD_STATUS_TRANSACTION, _hash, _cb);
      });
    });
  };

  private checkInitializationProgress = async () => {
    this.initStatus = Number(await this.contract.methods.initializationProgress().call());
    console.log('initializationProgress - ' + this.initStatus);
    return this.initStatus;
  };

  private parseCSV = (csv, type) => {
    const toBN = this.web3.utils.toBN;
    if (csv.length > 5000) { return false; }
    const rows = csv.split('\n');
    const mapFields = this.fileMaps[type];
    const pole = mapFields.map((el, i) => (i));
    const ret = [];
    let flagError = false;
    if (type === 'initBeneficiary') {
      ret[0] = [];
      ret[1] = [];
      rows.forEach((el) => {
        const cols = el.trim().split(',');
        if (cols.length !== 3) { flagError = true; }
        const index = mapFields.indexOf(cols[0]);
        if (index !== -1) {
          ret[index].push(new BigNumber(cols[1]));
         ret[index].push(new BigNumber(1e18 * Number(cols[2])));
        } else {
          flagError = true;
        }
      });
    } else {
      ret[0] = [];
      rows.forEach((el) => {
        const cols = el.trim().split(',');
        if (cols.length !== 2) { flagError = true; };
        const index = mapFields.indexOf(cols[0]);
        if (index !== -1 && pole.indexOf(index) !== -1) {
          ret[0][index] =
            (cols[1].indexOf('/') !== -1) ? new Date(cols[1]).getTime() / 1000 :
                    cols[0].indexOf('#') !== -1 ? +cols[1] : new BigNumber(1e18 * Number(cols[1]));
          pole[index] = 'x';
        } else {
          flagError = true;
        }
      });
    }
    return (flagError) ? false : ret;
  };

  private startLoops() {
    setInterval(() => this.getTimenow.call(this), 1000);
  }

  private async getTimenow() {
    const [err, date] = await to(this.contract.methods.timenow().call());
    if (err) { console.error(err); return; }
    this.timenow$.next(date * 1000);
    console.log(date)
  }

  private checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof (window as any).web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // Use Mist/MetaMask's provider
      return new Web3((window as any).web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      return new Web3(/*new Web3.providers.HttpProvider(environment.rpcProviderUrl)*/);
    }
  };

  public log (title, data: any[]) {
    console.warn(title, ':');
    if (data.length) {
      data.forEach(el => {
        el.div ?
          console.log(el.toString(10)) :
          console.log(el);
      })
    } else if (typeof data === 'object') {
      console.log(data);
    } else {
      console.error('No data to logging!')
    }
  }
}
