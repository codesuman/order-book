import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OIChartContainerComponent } from './oi-chart/components/oi-chart-container/oi-chart-container.component';
// import { OIChartComponent } from './oi-chart/oi-chart.component';
import { CreateOrderComponent } from './order/components/create-order/create-order.component';

const routes: Routes = [
  {path:  "", pathMatch:  "full",redirectTo:  "home"},
  {path: "home", component: HomeComponent},
  {path: "order-form", component: CreateOrderComponent},
  {path: "order-form/:id", component: CreateOrderComponent},
  {path: "oi-chart", component: OIChartContainerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
