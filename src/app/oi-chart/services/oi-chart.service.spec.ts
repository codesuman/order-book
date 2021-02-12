import { TestBed } from '@angular/core/testing';

import { OiChartService } from './oi-chart.service';

describe('OiChartService', () => {
  let service: OiChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OiChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
