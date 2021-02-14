import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChartComponent } from '../../interfaces/chart-component';

import { Option } from '../../interfaces/option';
import { OptionIndex } from '../../interfaces/option-index';
import { OiChartService } from '../../services/oi-chart.service';

@Component({
  selector: 'oi-chart-container',
  templateUrl: './oi-chart-container.component.html',
  styleUrls: ['./oi-chart-container.component.css']
})
export class OIChartContainerComponent implements OnDestroy {
  optionIndices: Array<OptionIndex> = [];
  selectedOptionIndex: OptionIndex | null = null;

  indexToStrikePricesMap = new Map<String, Map<Number, {'CE': Option, 'PE': Option}>>();
  optionIndicesFetchedSubscription: Subscription;

  chartComponentsArray: Array<ChartComponent> = [];

  constructor(private oiChartService: OiChartService) {
    this.optionIndicesFetchedSubscription = this.oiChartService.chartContainerReload$.subscribe(val => {
      this.optionIndices = this.oiChartService.optionIndices;
      if(!this.selectedOptionIndex) this.selectedOptionIndex = this.optionIndices[0];

      this.indexToStrikePricesMap = this.oiChartService.indexToStrikePricesMap;
      this.chartComponentsArray = this.oiChartService.chartComponentsArray;
    });
  }

  onOptionIndexChange(oi: OptionIndex){
    console.log('Chart Container => OptionIndexChange : ');
    console.log(oi);

    this.selectedOptionIndex = oi;

    this.chartComponentsArray = [];
    this.oiChartService.getOptions(this.selectedOptionIndex, true);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.optionIndicesFetchedSubscription.unsubscribe();
  }
}
