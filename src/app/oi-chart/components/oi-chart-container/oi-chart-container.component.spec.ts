import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OiChartContainerComponent } from './oi-chart-container.component';

describe('OiChartContainerComponent', () => {
  let component: OiChartContainerComponent;
  let fixture: ComponentFixture<OiChartContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OiChartContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OiChartContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
