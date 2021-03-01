import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, forkJoin } from 'rxjs';
import { ChartComponent } from '../interfaces/chart-component';

import { Option } from '../interfaces/option';
import { OptionIndex } from '../interfaces/option-index';

@Injectable({
  providedIn: 'root'
})
export class OiChartService {
  // ChartContainerReload subject will be used by OIChartsContainerComponent when it should load the entire Chart components from scratch
  private chartContainerReload = new Subject<boolean>();
  chartContainerReload$ = this.chartContainerReload.asObservable();

  private optionsFetched = new Subject<boolean>();
  optionsFetched$ = this.optionsFetched.asObservable();
  
  optionIndices: Array<OptionIndex> = [];
  indexToStrikePricesMap = new Map<String, Map<Number, {'CE': Option, 'PE': Option}>>();
  
  chartComponentsArray: Array<ChartComponent> = [];

  strikePricesFrom: number = 2;
  strikePricesTo: number = 4;

  constructor(private http:HttpClient) {
    console.log(`OI Chart Service : `);
    this.getOptionIndices();
  }

  getOptionIndices(){
    this.http.get('/api/v1/nse-options/option-indices').subscribe((res: any) => {
      // console.log(`NSE Options Indices : `);
      // console.log(res.data);

      this.optionIndices = res.data;

      // console.log(localStorage.getItem("SelectedOptionIndex"));
      
      if(!localStorage.getItem("SelectedOptionIndex")) 
        localStorage.setItem("SelectedOptionIndex", this.optionIndices[0].symbol);

      const selOptIndex = localStorage.getItem("SelectedOptionIndex");

      this.getOptions(this.optionIndices.filter(opt => opt.symbol === selOptIndex)[0], true);
    }, error => {
      console.log("Error fetching Option Indices.");
    });
  }
 
  getOptions(optionIndex: OptionIndex = this.optionIndices[0], chartContainerReload: boolean = false){
    this.http.get(`/api/v1/nse-options/options/${optionIndex.symbol}`).subscribe((res: any) => {
      // console.log(`NSE Options Data : `);
      // console.log(res.data);

      const options = res.data;
      const strikePricesMap = new Map<Number, {'CE': Option, 'PE': Option}>();

      options.forEach((option:Option) => {
        const obj:any = strikePricesMap.get(option.strikePrice) || {};
        obj[option.type] = option;

        strikePricesMap.set(option.strikePrice, obj);
      });

      // console.log(`OI Chart Service => Strike Price Map : `);
      // console.log(strikePricesMap);

      this.indexToStrikePricesMap.set(optionIndex.symbol, strikePricesMap);
      
      if(chartContainerReload) {
        this.chartComponentsArray = [];

        // console.log(`Reloading Charts container / Loading charts for first time : `);

        
        const spFloor = Math.floor(optionIndex.underlyingValue/100)*100;
        const strikePricesArray = Array.from(strikePricesMap.keys());
        let i = 0;
        strikePricesArray.some((sp,ind) =>{ if(sp===spFloor){i=ind; return true;} return false;});

        const nearestStrikePrices = strikePricesArray.slice((i-this.strikePricesFrom < 0) ? 0 : i-this.strikePricesFrom, i+this.strikePricesTo);

        // console.log(`Strike Price floor : `);
        // console.log(spFloor);

        // console.log(`Nearest Strike Prices : `);
        // console.log(nearestStrikePrices);

        nearestStrikePrices.forEach((nsp, ind) => {
          this.chartComponentsArray.unshift({
            id:ind,
            index: optionIndex,
            strikePrice: nsp
          });
        });

        this.chartContainerReload.next(true);
      } else {
        this.optionsFetched.next(true);
      }
    }, error => {
      console.log("Error fetching Options Data.");
    });
  }

  getOptionChainData(selectedOptions:Array<Option>): Observable<any>{
    return forkJoin([
      this.http.get(`/api/v1/nse-options/option-chain-data/${selectedOptions[0]['_id']}`),
      this.http.get(`/api/v1/nse-options/option-chain-data/${selectedOptions[1]['_id']}`)
    ]);
  }

  addChartComponent(chartComp: ChartComponent){
    this.chartComponentsArray.push(chartComp);
  }
}
