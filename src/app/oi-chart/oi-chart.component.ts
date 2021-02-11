import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';

export interface Option {
  underlying: string;
  strikePrice: number;
  type: string;
  expiryDate: string;
  data: Array<OIData>
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
  selector: 'app-oi-chart',
  templateUrl: './oi-chart.component.html',
  styleUrls: ['./oi-chart.component.css']
})
export class OIChartComponent implements OnInit {
  // Charts - START
  public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: ChartOptions = {
    responsive: true,
  };
  public lineChartColors: Color[] = [];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];
  // Charts - END

  optionIndices: Array<any> = [];
  selectedOptionIndex: any = null;

  options: Array<any> = [];
  selectedOption: any = null;
  selectedOptions: Array<any> = [];
  // optionsMap = new Map<Number, Object>();
  optionsMap = {};

  // oiDates = new Set<String>();
  // oiDatesArray: Array<String> = [];
  // selectedOCDate: String = '';

  public optionChainData: ChartDataSets[] = [
    { data: [], label: 'Change in OI' },
  ];
  public oiChartLabels: Label[] = [];

  constructor(private http:HttpClient) {}

  ngOnInit(): void {
    this.getOptionIndices();
  }

  getOptionIndices(){
    this.http.get('/api/v1/nse-options/option-indices').subscribe((res: any) => {
      console.log(res.data);
      this.optionIndices = res.data;
      this.selectedOptionIndex = this.optionIndices[0];

      this.getOptions();
    }, error => {
      console.log("Error fetching Option Indices.");
    });
  }

  getOptions(){
    this.http.get(`/api/v1/nse-options/options/${this.selectedOptionIndex['symbol']}`).subscribe((res: any) => {
      console.log(`NSE Options Data : `);
      console.log(res.data);

      this.options = res.data;

      // res.data.forEach((element: any) => {
        // this.optionsMap.set(element['strikePrice'], {element.type: element});
        // let optionObj: Object = this.optionsMap[element['strikePrice']]
      // });

      // if(JSON.parse(<string>localStorage.getItem("SelectedOptions"))){
      //   this.selectedOptions = JSON.parse(<string>localStorage.getItem("SelectedOptions")) || [this.selectedOption];
      // } else{
      //   this.selectedOptions = [this.selectedOption];
      // }

      this.selectedOptions = JSON.parse(<string>localStorage.getItem("SelectedOptions")) || [this.selectedOption];
      this.selectedOption = this.selectedOptions[0];

      this.getOptionChainData();
    }, error => {
      console.log("Error fetching Options Data.");
    });
  }

  getOptionChainData(){
    this.optionChainData = [];
    this.lineChartColors = [];
    // let index = 0;

    let selectedOptions:Array<any> = JSON.parse(<string>localStorage.getItem("SelectedOptions")) || this.selectedOptions;

    // selectedOptions.forEach((opt) =>  {
    //   this.optionChainData.push({ data: [], label: `${opt.strikePrice} ${opt.type}` });
    //   this.lineChartColors.push({
    //     backgroundColor: 'rgba(0,0,0,0)'
    //   })
    // });

    for (const selectedOption of selectedOptions) {
      this.http.get(`/api/v1/nse-options/option-chain-data/${selectedOption['_id']}`).subscribe((res: any) => {
        console.log(`NSE Options Chain Data : `);
        console.log(res.data);
        this.optionChainData.push({ data: res.data.map((val:any) => val.changeinOpenInterest), label: `${selectedOption.strikePrice} ${selectedOption.type}` });
        
        this.lineChartColors.push({
          borderColor: (selectedOption.type === 'CE') ? '#fcba03' : '#ffffff',
          backgroundColor: 'rgba(0,0,0,0)'
        })

        // this.optionChainData[index++]['data'] = res.data.map((val:any) => {
          // this.oiDates.add(val.lastUpdatedTime.split(' ')[0]);
          // this.oiChartLabels.push(val.lastUpdatedTime.split(' ')[1]);
          // return val.changeinOpenInterest;
        // });
        
        this.oiChartLabels = res.data.map((val:any) => val.lastUpdatedTime.split(" ")[1]);

        // this.oiDatesArray = Array.from(this.oiDates);
        // this.selectedOCDate = this.oiDatesArray[0];
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

  onOptionChange(option: any){
    console.log('OptionChange');
    console.log(option);

    this.selectedOption = option;
    this.selectedOptions.push(this.selectedOption);

    localStorage.setItem("SelectedOptions", JSON.stringify(this.selectedOptions));
    this.getOptionChainData();
  }

  // onOCDateChange(date: String){
  //   this.selectedOCDate = date;
  // }

  removeSelectedOption(option: any){
    let ind = -1;

    this.selectedOptions.some((opt:any, index) => {
      if(opt._id === option.id){
        ind = index;
        return true;
      }

      return false;
    });

    this.selectedOptions.splice(ind, 1);

    localStorage.setItem("SelectedOptions", JSON.stringify(this.selectedOptions));
    this.getOptionChainData();
  }

  downloadCanvas(event: any) {
    let anchor = event.target;
    // get the canvas
    anchor.href = document.getElementsByTagName('canvas')[0].toDataURL();
    anchor.download = "test.png";
  }
}
