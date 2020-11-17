export interface OrderDetails {
    id?: number;
    name: string;
    price: number;
    quantity: number;
  
    rangeStart: number;
    rangeEnd: number;
    interval: number;

    hideSpreadDetails?: boolean;
    showChangePerUnit?: boolean;
}
