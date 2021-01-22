import { PriceQuantity } from "./price-quantity-pair";

export interface OrderDetails {
    id?: number;
    name: string;
    price: number;
    quantity: number;
  
    priceQuantityPairs: Array<PriceQuantity>;
    rangeStart: number;
    rangeEnd: number;
    interval: number;

    hideSpreadDetails?: boolean;
    showChangePerUnit?: boolean;
}
