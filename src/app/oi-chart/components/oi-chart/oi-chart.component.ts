import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';
import { OptionIndex } from '../../interfaces/option-index';
import { Option } from '../../interfaces/option';
import { OiChartService } from '../../services/oi-chart.service';

@Component({
  selector: 'oi-chart',
  templateUrl: './oi-chart.component.html',
  styleUrls: ['./oi-chart.component.css']
})
export class OIChartComponent implements OnInit, OnDestroy {
  // Charts - START
  public optionChainData: ChartDataSets[] = [
    { data: [], label: 'CE' },
    { data: [], label: 'PE' }
  ];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 0
    },
    hover: {
        animationDuration: 0
    },
    responsiveAnimationDuration: 0
  };
  
  public lineChartColors: Color[] = [
    {
      borderColor: '#f73131', // #f73131 - Red, #00ad00 - Green, #fcba03 - Yellow
      backgroundColor: 'rgba(0,0,0,0)'
    },
    {
      borderColor: '#00ad00', 
      backgroundColor: 'rgba(0,0,0,0)'
    }
  ];

  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];
  public oiChartLabels: Label[] = [];

  @ViewChild('linechart') linechart: BaseChartDirective | undefined;
  // Charts - END

  // OPTION INDEX CHANGE - Variables - START
  optionsRequested: boolean = false;
  optionsRequestedSubscription: Subscription;
  // OPTION INDEX CHANGE - Variables - END

  // INDEX - Select Box - START
  optionIndices: Array<OptionIndex> = [];
  @Input() selectedOptionIndex: OptionIndex | null = null;
  // INDEX - Select Box - END

  // STRIKE PRICE - Select Box - START
  strikePrices: Array<Number> = [];
  @Input() selectedStrikePrice: Number = 0;
  // STRIKE PRICE - Select Box - END

  indexToStrikePricesMap = new Map<String, Map<Number, {'CE': Option, 'PE': Option}>>();

  constructor(private oiChartService: OiChartService) {
    this.optionsRequestedSubscription = this.oiChartService.optionsFetched$.subscribe(val => {
      if(this.optionsRequested) this.setStrikePrices();
    });
  }

  ngOnInit(): void {
    console.log(`OI Chart : Ng On Init :`);
    
    this.optionIndices = this.oiChartService.optionIndices;
    this.indexToStrikePricesMap = this.oiChartService.indexToStrikePricesMap;

    if(!this.selectedOptionIndex) this.selectedOptionIndex = this.optionIndices[0];

    this.setStrikePrices();
  }

  setStrikePrices(){
    this.optionsRequested = false;

    if(!this.selectedOptionIndex) return;

    const strikePricesMap = this.indexToStrikePricesMap.get(this.selectedOptionIndex.symbol);

    console.log(`Strike Prices Map : `);
    console.log(strikePricesMap);

    if(!strikePricesMap) return;

    this.strikePrices =[...strikePricesMap.keys()];
    console.log(this.strikePrices);
    
    if(!this.selectedStrikePrice) this.selectedStrikePrice = this.strikePrices[0];

    this.getOptionChainData();
  }

  getOptionChainData(){
    if(!this.selectedOptionIndex) {
      alert('Option Index is not selected.');
      return;
    }
    
    const strikePricesMap = this.indexToStrikePricesMap.get(this.selectedOptionIndex.symbol);

    if(!strikePricesMap || this.strikePrices.length===0) {
      console.log('Strike Prices not present for selected OptionIndex.');
      return;
    }

    const strikePriceVal = strikePricesMap.get(this.selectedStrikePrice);
    const selectedOptions:Array<Option> = [];

    if(strikePriceVal){
      selectedOptions.push(strikePriceVal['CE']);
      selectedOptions.push(strikePriceVal['PE']);
    }

    this.oiChartService.getOptionChainData(selectedOptions).subscribe(response => {
      console.log(`NSE Options Chain Data : `);
      
      for (let i=0; i<response.length; i++) {
      // console.log(selectedOptions[i].strikePrice +' - '+selectedOptions[i].type);
      // console.log(response[i].data);

        this.optionChainData[i] = { 
          data: response[i].data.map((val:any) => val.changeinOpenInterest), 
          label: `${selectedOptions[i].strikePrice} ${selectedOptions[i].type}` 
        };

        this.lineChartColors[i] = {
          borderColor: (i===0) ? '#00ad00' : '#f73131', // #f73131 - Red, #00ad00 - Green, #fcba03 - Yellow
          backgroundColor: 'rgba(0,0,0,0)'
        }
      }
      
      this.oiChartLabels = response[0].data.map((val:any) => val.lastUpdatedTime.split(" ")[1]);

      if(this.linechart) 
        setTimeout(() => {
          this.linechart?.getChartBuilder(this.linechart.ctx);
        }, 10);
      // else console.log(`Only happens first time chart is rendered`);
    }, error => {
      console.log("Error fetching Options Data.");
    });
  }

  onOptionIndexChange(oi: OptionIndex){
    console.log('OptionIndexChange : ');
    console.log(oi);

    this.selectedOptionIndex = oi;

    console.log(this.indexToStrikePricesMap.get(this.selectedOptionIndex.symbol));
    
    this.selectedStrikePrice = 0;

    if(this.indexToStrikePricesMap.get(this.selectedOptionIndex.symbol))
      this.setStrikePrices();
    else {
      this.optionsRequested = true;
      this.oiChartService.getOptions(this.selectedOptionIndex);
    }
  }

  onStrikePriceChange(sp: any){
    console.log('onStrikePriceChange');
    console.log(sp);

    this.selectedStrikePrice = sp;

    console.log(this.selectedStrikePrice);

    this.getOptionChainData();
  }

  downloadCanvas(event: any) {
    let d = new Date();
    let [day, ...date] = d.toDateString().split(' ');
    let dateString: String = date.join(" ");
    
    let anchor = event.target;
    // get the canvas
    anchor.href = document.getElementsByTagName('canvas')[0].toDataURL();
    anchor.download = `${this.selectedOptionIndex?.symbol} ${this.selectedStrikePrice} - ${dateString} ${d.toLocaleTimeString()}.png`;
  }

  cloneOIChart(event: any){
    if(event) event.preventDefault();

    console.log(`Clone OI Chart : `);
    console.log(event);

    if(this.selectedOptionIndex && this.selectedStrikePrice)
      this.oiChartService.addChartComponent({
        id: this.oiChartService.chartComponentsArray.length+1,
        index: this.selectedOptionIndex,
        strikePrice: this.selectedStrikePrice
      });
  }
  
  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.optionsRequestedSubscription.unsubscribe();
  }
}
