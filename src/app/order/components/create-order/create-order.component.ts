import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
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
  showAdditionalDetailsForm: boolean = true;
  updateOrder:boolean = false;
  cloneOrder: boolean = false;

  public orderForm: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
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

        if(this.order) {
          this.orderForm = this.fb.group({
            id: [this.order.id, Validators.required],
            name: [this.order.name, Validators.required],
            price: [this.order.price, Validators.required],
            quantity: [this.order.quantity, Validators.required],
            rangeStart: [this.order.rangeStart, Validators.required],
            rangeEnd: [this.order.rangeEnd, Validators.required],
            interval: [this.order.interval, Validators.required],
            priceQuantityPairs: this.fb.array([])
          });

          this.order.priceQuantityPairs.forEach(pqPair => this.addPQPair(null, pqPair));
        }

        if(!this.order) console.log(`Order not found for Update`);
      } else {
        // Create
        let maxId = Number.MIN_VALUE;
        orders.forEach(order => maxId = Math.max(order.id || 0, maxId));
        maxId++;
        
        this.orderForm = this.fb.group({
          id: [maxId, Validators.required],
          name: ['', Validators.required],
          price: [0, Validators.required],
          quantity: [0, Validators.required],
          rangeStart: [0, Validators.required],
          rangeEnd: [10, Validators.required],
          interval: [0.5, Validators.required],
          priceQuantityPairs: this.fb.array([])
        });

        this.addPQPair(null, null);
      }
    });

    if(this.router.getCurrentNavigation()?.extras.state?.isClone) this.cloneOrder = true;
  }

  createOrUpdateOrder(){
    this.order = this.orderForm.value;
    
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

  reconcileAveragePrice(){
    console.log(`ReconcileAveragePrice`);
    
    let totalPrice = 0;
    let totalQty = 0;

    this.orderForm?.value.priceQuantityPairs.forEach((pqPair:any) => {
      totalPrice += (pqPair.price * pqPair.quantity);
      totalQty += Number.parseInt(pqPair.quantity);
    });

    this.orderForm.patchValue({
      price: totalPrice / totalQty,
      quantity: totalQty
    });
  }

  removePQPair(i: number) {
    let usersArray = this.orderForm.get('priceQuantityPairs') as FormArray;
    usersArray.removeAt(i);

    this.reconcileAveragePrice();
  }

  addPQPair(event: Event|null, pqPair: PriceQuantity | null) {
    if(event) event.preventDefault();

    let priceQuantityPairs = this.orderForm.get('priceQuantityPairs') as FormArray;
    let arraylen = priceQuantityPairs.length;

    let newPQGroup: FormGroup = this.fb.group({
      price: [(pqPair)?pqPair.price : 0, Validators.required],
      quantity: [(pqPair)?pqPair.quantity : 100, Validators.required]
    })

    priceQuantityPairs.insert(arraylen, newPQGroup);
  }

  getControls() {
    return (this.orderForm.get('priceQuantityPairs') as FormArray).controls as Array<FormGroup>;
  }    
}
