import { Injectable } from '@angular/core';
import { OrderDetails } from '../interfaces/order-details';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private _orders: Array<OrderDetails> = [];

  constructor() { 
    this.orders = JSON.parse(<string>localStorage.getItem("Orders")) || [];
    // console.log(`OrderService -> constructor`);
    // console.log(this.orders.length);
  }

  public createOrder(order: OrderDetails|null){
    if(!order) return;

    this.orders.unshift(order);
    localStorage.setItem("Orders", JSON.stringify(this.orders));
  }

  public updateOrder(order: OrderDetails|null){
    if(!order) return;
    
    let index = 0;
    for (const ord of this.orders) {
      if(ord.id === order.id) break;

      index++;
    }

    this.orders.splice(index, 1);
    
    this.orders.unshift(order);
    localStorage.setItem("Orders", JSON.stringify(this.orders));
  }

  public get orders(): Array<OrderDetails> {
    return this._orders;
  }
  public set orders(value: Array<OrderDetails>) {
    this._orders = value;
    
    // console.log(`Updating Local Storage...`);
    localStorage.setItem("Orders", JSON.stringify(this.orders));
  }
}
