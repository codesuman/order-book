import { Component, OnInit } from '@angular/core';
import { OrderDetails } from '../order/interfaces/order-details';
import { OrderService } from '../order/services/order.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  orders:Array<OrderDetails> = [];
  showChangePerUnitChecked: boolean = false;

  constructor(private orderService: OrderService) { }

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
    console.log(`Delete Order...`);
    
    this.orders = this.orders.filter(order => order.id !== id);
    this.orderService.orders = this.orders;
  }
}
