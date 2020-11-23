import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderDetails } from '../order/interfaces/order-details';
import { OrderService } from '../order/services/order.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  orders:Array<OrderDetails> = [];
  showChangePerUnitChecked: boolean = true;

  constructor(private router: Router, private orderService: OrderService) { }

  ngOnInit(): void {
    this.orders = this.orderService.orders.map(order => Object.assign(order, {showChangePerUnit: this.showChangePerUnitChecked}));
  }

  collapseAll(value: boolean){
    this.orders.forEach(order => order.hideSpreadDetails = value);
  }

  toggleShowChangePerUnit(){
    this.showChangePerUnitChecked = !this.showChangePerUnitChecked;
    this.orders.forEach(order => order.showChangePerUnit = this.showChangePerUnitChecked);
  }

  onDeleteOrder(id: number){
    this.orders = this.orders.filter(order => order.id !== id);
    this.orderService.orders = this.orders;
  }

  onCloneOrder(id: number){
    let maxId = Number.MIN_VALUE;
    let order = null;

    this.orders.forEach(ord => {
      maxId = Math.max(ord.id || 0, maxId);

      if(ord.id === id)
        order = ord;
    });
    
    if(!order) {
      console.log(`Not found a valid order to clone.`);
      return;
    }

    this.orders.unshift(Object.assign({}, order, {id: ++maxId}));
    this.orderService.orders = this.orders;

    this.router.navigateByUrl(`/order-form/`+maxId, { 
      state: { isClone: true } 
    });
  }

}
