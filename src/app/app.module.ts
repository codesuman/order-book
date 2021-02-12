import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { CreateOrderComponent } from './order/components/create-order/create-order.component';
import { PNLComponent } from './order/components/pnl/pnl.component';
// import { OIChartComponentOld } from './oi-chart/oi-chart.component';
import { OIChartContainerComponent } from './oi-chart/components/oi-chart-container/oi-chart-container.component';
import { OIChartComponent } from './oi-chart/components/oi-chart/oi-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    CreateOrderComponent,
    PNLComponent,
    // OIChartComponentOld,
    OIChartContainerComponent,
    OIChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
