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
  // OptionIndicesFetched subject will be used by OIChartsContainerComponent when it should load the Chart components for first time
  private optionIndicesFetched = new Subject<boolean>();
  optionIndicesFetched$ = this.optionIndicesFetched.asObservable();

  private optionsFetched = new Subject<boolean>();
  optionsFetched$ = this.optionsFetched.asObservable();
  
  optionIndices: Array<OptionIndex> = [];
  indexToStrikePricesMap = new Map<String, Map<Number, {'CE': Option, 'PE': Option}>>();
  
  chartComponentsArray: Array<ChartComponent> = [];

  constructor(private http:HttpClient) {
    console.log(`OI Chart Service : `);
    this.getOptionIndices();
  }

  getOptionIndices(){
    this.http.get('/api/v1/nse-options/option-indices').subscribe((res: any) => {
      console.log(`NSE Options Indices : `);
      console.log(res.data);

      this.optionIndices = res.data;

      this.getOptions();
    }, error => {
      console.log("Error fetching Option Indices.");
    });
  }

  // optionIndex : will be null of first time, when its called in the service constructor
  // Rest it will be called from OI Chart Component's 
  getOptions(optionIndex?: OptionIndex){
    this.http.get(`/api/v1/nse-options/options/${(optionIndex) ? optionIndex.symbol : this.optionIndices[0].symbol}`).subscribe((res: any) => {
      // console.log(`NSE Options Data : `);
      // console.log(res.data);

      let options = res.data;
      let strikePricesMap = new Map<Number, {'CE': Option, 'PE': Option}>();

      options.forEach((option:Option) => {
        const obj:any = strikePricesMap.get(option.strikePrice) || {};
        obj[option.type] = option;

        strikePricesMap.set(option.strikePrice, obj);
      });

      console.log(`OI Chart Service => Strike Price Map : `);
      console.log(strikePricesMap);

      this.indexToStrikePricesMap.set((optionIndex) ? optionIndex.symbol : this.optionIndices[0].symbol, strikePricesMap);

      if(optionIndex) this.optionsFetched.next(true);
      else {
        console.log(`Loading charts for first time : `);
        this.chartComponentsArray.push({
          id:1,
          index: this.optionIndices[0],
          strikePrice: strikePricesMap.entries().next().value[0]
        });

        this.optionIndicesFetched.next(true);
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
