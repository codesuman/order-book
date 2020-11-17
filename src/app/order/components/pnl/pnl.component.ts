import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { OrderDetails } from '../../interfaces/order-details';
import { Spread } from '../../interfaces/spread';

@Component({
  selector: 'pnl-component',
  templateUrl: './pnl.component.html',
  styleUrls: ['./pnl.component.css']
})
export class PNLComponent implements OnInit {
  pnlSpreads:Array<Spread> = [];

  @Input() order!:OrderDetails;
  @Output() deleteOrder = new EventEmitter<number>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log(`PNLComponent -> ngOnInit`);
    
    if(this.order) {
      const hues = [145, 6];
      let saturation = 45;
      let light = 94;

      let i = -1;

      let currRange = this.order.rangeStart;
      
      // currRange += this.order.interval;

      do {
        i++;
        currRange += this.order.interval;
        this.pnlSpreads.push(
          new Spread(
            this.order.price, 
            this.order.quantity, 
            currRange, 
            {hues, saturation : (i<=4) ? saturation : saturation+5, light: light - (i*7)}
          )
        );
      } while (currRange<this.order.rangeEnd);

      // while(currRange<=this.order.rangeEnd){
      //   this.pnlSpreads.push(new Spread(this.order.price, this.order.quantity, currRange));
      //   currRange += this.order.interval;
      // }
    }
  }

  editClick(event: MouseEvent){
    event.stopPropagation();
    console.log(`Edit Clicked`);

    this.router.navigateByUrl(`/order-form/`+this.order.id);
  }

  cloneClick(event: MouseEvent){
    event.stopPropagation();
    console.log(`Clone Clicked`);
  }

  deleteClick(event: MouseEvent){
    event.stopPropagation();
    console.log(`Delete Clicked`);

    this.deleteOrder.emit(this.order.id);
  }
}
