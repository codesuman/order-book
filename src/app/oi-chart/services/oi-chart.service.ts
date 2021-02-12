import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Option } from '../interfaces/option';
import { OptionIndex } from '../interfaces/option-index';

@Injectable({
  providedIn: 'root'
})
export class OiChartService {
  // Observable string sources
  private optionIndicesFetched = new Subject<boolean>();
  optionIndicesFetched$ = this.optionIndicesFetched.asObservable();

  optionIndices: Array<OptionIndex> = [];
  indexToStrikePricesMap = new Map<String, Map<Number, {'CE': Option, 'PE': Option}>>();
  
  constructor(private http:HttpClient) { 
    this.getOptionIndices();
  }

  getOptionIndices(){
    this.http.get('/api/v1/nse-options/option-indices').subscribe((res: any) => {
      console.log(`NSE Options Indices : `);
      console.log(res.data);

      this.optionIndices = res.data;

      this.getOptions(this.optionIndices[0]);
    }, error => {
      console.log("Error fetching Option Indices.");
    });
  }

  getOptions(optionIndex: OptionIndex){
    this.http.get(`/api/v1/nse-options/options/${optionIndex.symbol}`).subscribe((res: any) => {
      // console.log(`NSE Options Data : `);
      // console.log(res.data);

      let options = res.data;
      let optionsMap = new Map<Number, {'CE': Option, 'PE': Option}>();

      options.forEach((option:Option) => {
        const obj:any = optionsMap.get(option.strikePrice) || {};
        obj[option.type] = option;

        optionsMap.set(option.strikePrice, obj);
      });

      console.log(`Options Map : `);
      console.log(optionsMap);

      this.indexToStrikePricesMap.set(optionIndex.symbol, optionsMap);

      // this.loadCharts = true;
      // TODO - This where subject next should be called
      this.optionIndicesFetched.next(true);
    }, error => {
      console.log("Error fetching Options Data.");
    });
  }
}
