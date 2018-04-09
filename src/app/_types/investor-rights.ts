class Right {
  address: string;
  balance: number;
  constructor (_a, _b) {
    this.address = _a;
    this.balance = _b;
  }
}

export class InvestorRights {
  static Right = Right;
  public priorityRights: Right[];
  public subordinatedRights: Right[];
}
