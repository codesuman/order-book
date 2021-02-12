import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';

export interface OptionIndex {
  _id: string,
  symbol: string;
  upcomingExpiryDate: string;
  lastUpdatedTime: string;
}

export interface Option {
  _id: string,
  underlying: string;
  strikePrice: number;
  type: string;
  expiryDate: string;
  // data: Array<OIData>
}

export interface OIData {
  change: number;
  changeinOpenInterest: number;
  impliedVolatility: number;
  lastPrice: number;
  lastUpdatedTime: string;
  openInterest: number;
  pChange: number;
  pchangeinOpenInterest: number;
}

@Component({
  selector: 'oi-chart',
  templateUrl: './oi-chart.component.html',
  styleUrls: ['./oi-chart.component.css']
})
export class OIChartComponent implements OnInit {
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

  @ViewChild('linechart') linechart: BaseChartDirective | undefined;
  // Charts - END

  optionIndices: Array<OptionIndex> = [];
  selectedOptionIndex: OptionIndex | null = null;

  options: Array<Option> = [];
  strikePrices: Array<Number> = [];
  selectedStrikePrice: Number = 0;

  // selectedOptions: Array<any> = [];
  optionsMap = new Map<Number, {'CE': Option, 'PE': Option}>();

  // oiDates = new Set<String>();
  // oiDatesArray: Array<String> = [];
  // selectedOCDate: String = '';

  // public optionChainData: ChartDataSets[] = [
  //   { data: [], label: 'Change in OI' },
  // ];
  public oiChartLabels: Label[] = [];

  constructor(private http:HttpClient) {}

  ngOnInit(): void {
    this.getOptionIndices();
  }

  getOptionIndices(){
    this.http.get('/api/v1/nse-options/option-indices').subscribe((res: any) => {
      // console.log(`NSE Options Indices : `);
      // console.log(res.data);

      this.optionIndices = res.data;
      this.selectedOptionIndex = this.optionIndices[0];

      this.getOptions();
    }, error => {
      console.log("Error fetching Option Indices.");
    });
  }

  getOptions(){
    if(!this.selectedOptionIndex) return;

    this.http.get(`/api/v1/nse-options/options/${this.selectedOptionIndex.symbol}`).subscribe((res: any) => {
      // console.log(`NSE Options Data : `);
      // console.log(res.data);

      this.options = res.data;
      this.optionsMap = new Map<Number, {'CE': Option, 'PE': Option}>();

      this.options.forEach((option:Option) => {
        const obj:any = this.optionsMap.get(option.strikePrice) || {};
        obj[option.type] = option;

        this.optionsMap.set(option.strikePrice, obj);
      });

      console.log(`Options Map : `);
      console.log(this.optionsMap);

      this.strikePrices =[...this.optionsMap.keys()];
      console.log(this.strikePrices);
      
      this.selectedStrikePrice = this.strikePrices[0];

      this.getOptionChainData();
    }, error => {
      console.log("Error fetching Options Data.");
    });
  }

  getOptionChainData(){
    let selectedOptions:Array<any> = [];

    const strikePriceVal = this.optionsMap.get(this.selectedStrikePrice);

    if(strikePriceVal){
      selectedOptions.push(strikePriceVal['CE']);
      selectedOptions.push(strikePriceVal['PE']);
    }

    for (const selectedOption of selectedOptions) {
      console.log('/api/v1/nse-options/option-chain-data');
      console.log(selectedOption);
      
      this.http.get(`/api/v1/nse-options/option-chain-data/${selectedOption['_id']}`).subscribe((res: any) => {
        console.log(`NSE Options Chain Data : `);
        console.log(res.data);
        
        console.log(selectedOption.strikePrice +' - '+selectedOption.type);
        let chartData: ChartDataSets = { data: res.data.map((val:any) => val.changeinOpenInterest), label: `${selectedOption.strikePrice} ${selectedOption.type}` };

        if(selectedOption.type === 'CE') {
          this.optionChainData[0] = chartData;
          this.lineChartColors[0] = {
            borderColor: '#f73131', // #f73131 - Red, #00ad00 - Green, #fcba03 - Yellow
            backgroundColor: 'rgba(0,0,0,0)'
          }
        }
        else {
          this.optionChainData[1] = chartData;
          this.lineChartColors[1] = {
            borderColor: ['#00ad00'], // #f73131 - Red, #00ad00 - Green, #fcba03 - Yellow
            backgroundColor: ['rgba(0,0,0,0)']
          }
        }
        
        this.oiChartLabels = res.data.map((val:any) => val.lastUpdatedTime.split(" ")[1]);

        if(this.linechart) {
          console.log(`Chart re-rendering`);
          
          setTimeout(() => {
            this.linechart?.getChartBuilder(this.linechart.ctx);
          }, 10);
        } else {
          console.log(`only happens first time chart is rendered`);
          
        }
      }, error => {
        console.log("Error fetching Options Data.");
      });

    }
  }

  onOptionIndexChange(oi: any){
    console.log('onOptionIndexChange');
    console.log(oi);

    this.selectedOptionIndex = oi;

    this.getOptions();
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
}
