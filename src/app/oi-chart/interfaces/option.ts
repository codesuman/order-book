export interface Option {
    _id: string,
    underlying: string;
    strikePrice: number;
    type: string;
    expiryDate: string;
    // data: Array<OIData>
  }