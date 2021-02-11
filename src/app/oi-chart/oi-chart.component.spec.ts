import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OiChartComponent } from './oi-chart.component';

describe('OiChartComponent', () => {
  let component: OiChartComponent;
  let fixture: ComponentFixture<OiChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OiChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OiChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
