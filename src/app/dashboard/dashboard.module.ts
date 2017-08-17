import { AggregateModalComponent } from './../grid/aggregate-modal/aggregate-modal.component';
import { FormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule as KendoLayoutModule } from '@progress/kendo-angular-layout';
import { GridODataComponent } from './../grid/grid.component';
import { LayoutModule } from './../layout/layout.module';
import { CommonModule } from '@angular/common';
import { NgModule }                 from '@angular/core';
import { ChartsModule }             from 'ng2-charts/ng2-charts';

import { DashboardComponent }       from './dashboard.component';
import { DashboardRoutingModule }   from './dashboard-routing.module';


import { IonicModule } from 'ionic-angular';

@NgModule({
    imports: [
        CommonModule,
        DashboardRoutingModule,
        IonicModule,
        ChartsModule,
        LayoutModule,
        GridModule,
        FormsModule,
        KendoLayoutModule
    ],
    declarations: [ DashboardComponent, GridODataComponent ]
})
export class DashboardModule { }
