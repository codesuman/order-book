import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

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
  indexToStrikePricesMap = new Map<String, Map<Number, {'CE': Option, 'PE': Option}>>();
  loadCharts: boolean = false;
  optionIndicesFetchedSubscription: Subscription;

  constructor(private oiChartService: OiChartService) {
    this.optionIndicesFetchedSubscription = this.oiChartService.optionIndicesFetched$.subscribe(val => {
      this.optionIndices = this.oiChartService.optionIndices;
      this.indexToStrikePricesMap = this.oiChartService.indexToStrikePricesMap;

      this.loadCharts = val;
    });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.optionIndicesFetchedSubscription.unsubscribe();
  }
}
