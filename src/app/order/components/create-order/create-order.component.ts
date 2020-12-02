import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRoute} from "@angular/router";
import { Subscriber } from 'rxjs';

import { OrderDetails } from '../../interfaces/order-details';
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

        this.order = {id: maxId, name: "", price: 0, quantity: 25, rangeStart: 0, rangeEnd: 3, interval: 0.5};
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
}
