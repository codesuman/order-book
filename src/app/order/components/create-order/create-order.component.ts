import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRoute} from "@angular/router";
import { Subscriber } from 'rxjs';

import { OrderDetails } from '../../interfaces/order-details';
import { PriceQuantity } from '../../interfaces/price-quantity-pair';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent implements OnInit {
  order:OrderDetails|null = null;
  showAdditionalDetailsForm: boolean = false;
  updateOrder:boolean = false;
  cloneOrder: boolean = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private orderService: OrderService) {}

  ngOnInit(): void {
    this.subscribeToRoutes();
  }
  
  subscribeToRoutes() {
    this.route.params.subscribe(params => {
      console.log(params);

      let orders:Array<OrderDetails> = JSON.parse(<string>localStorage.getItem("Orders")) || [];

      if(params.id){
        // Update / Clone
        this.updateOrder = true;

        orders.some(order => {
          if(order.id == params.id){
            this.order = order;
            return true;
          }
          return false;
        });

        if(!this.order) console.log(`Order not found for Update`);
      } else{
        // Create
        let maxId = Number.MIN_VALUE;
        orders.forEach(order => maxId = Math.max(order.id || 0, maxId));
        maxId++;

        this.order = {id: maxId, name: "", price: 0, quantity: 25, rangeStart: 0, rangeEnd: 10, interval: 0.5, priceQuantityPairs: [
            {id: 0, price: 0, quantity: 2}, 
            // {id: 1, price: 10, quantity: 25}, 
            // {id: 2, price: 20, quantity: 50}
          ]
        };
        
        // this.reconcileAveragePrice();
      }
    });

    if(this.router.getCurrentNavigation()?.extras.state?.isClone) this.cloneOrder = true;
  }

  createOrUpdateOrder(){
    if(this.updateOrder) this.orderService.updateOrder(this.order);
    else this.orderService.createOrder(this.order);
    
    this.router.navigateByUrl('/home');
  }

  cancelAction(){
    if(this.cloneOrder) {
      let orders = this.orderService.orders.filter(order => order.id !== this.order?.id);
      this.orderService.orders = orders;
    }

    this.router.navigateByUrl('/home');
  }

  addPriceQuantityPair(){
    console.log(`ADD PRICE QUANTITY PAIR : `);
    
    let maxId = -1;
    this.order?.priceQuantityPairs.forEach(pqPair => maxId = Math.max(pqPair.id || 0, maxId));

    this.order?.priceQuantityPairs.push({id: ++maxId, price: 1, quantity: 100});
  }

  removePriceQuantityPair(id: number){
    console.log(`RemovePriceQuantityPair : ${id}`);
    
    let index = -1;

    this.order?.priceQuantityPairs.some((pq, i) => {
      if(pq.id === id) {
        index = i;
        return true;
      }

      return false;
    });

    if(index !== -1) this.order?.priceQuantityPairs.splice(index, 1);
  }

  pqPairPriceChange(){
    console.log(`PQ PairPriceChange`);
    this.reconcileAveragePrice();
  }

  pqPairQtyChange(){
    console.log(`PQ PairQtyChange`);
    this.reconcileAveragePrice();
  }

  reconcileAveragePrice(){
    console.log(`ReconcileAveragePrice`);
    
    if(!this.order) return;

    let totalPrice = 0;
    let totalQty = 0;

    this.order?.priceQuantityPairs.forEach(pqPair => {
      totalPrice += (pqPair.price * pqPair.quantity);
      totalQty += pqPair.quantity;
    });

    this.order.price = totalPrice / totalQty;
    this.order.quantity = totalQty;
  }
}
