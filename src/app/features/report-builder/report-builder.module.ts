import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatOptionModule } from '@angular/material/core';

import { ReportBuilderComponent } from './containers/report-builder/report-builder.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ReportComponent } from './components/report/report.component';
import { SectionComponent } from './components/section/section.component';
import { ControlToFormGroupPipe } from '../../pipes/control-to-form-group.pipe';
import { ControlArrayToFormGroupsPipe } from '../../pipes/control-array-to-form-groups.pipe';
import { OptionsDialogComponent } from './components/options-dialog/options-dialog.component';
import { DataDialogComponent } from './components/data-dialog/data-dialog.component';
import { ChartDataComponent } from './components/data-dialog/data-components/chart-data/chart-data.component';
import { TableDataComponent } from './components/data-dialog/data-components/table-data/table-data.component';
import { CardDataComponent } from './components/data-dialog/data-components/card-data/card-data.component';
import { ChipDataComponent } from './components/data-dialog/data-components/chip-data/chip-data.component';
import { IndicatorDataComponent } from './components/data-dialog/data-components/indicator-data/indicator-data.component';
import { PropertyDataComponent } from './components/data-dialog/data-components/property-data/property-data.component';
import { ListDataComponent } from './components/data-dialog/data-components/list-data/list-data.component';
import { ChartTableIndicatorDataComponent } from './components/data-dialog/data-components/chart-table-indicator-data/chart-table-indicator-data.component';
import { QuestionDataComponent } from './components/data-dialog/data-components/question-data/question-data.component';
import { RangeDataComponent } from './components/data-dialog/data-components/range-data/range-data.component';
import { PdfBreakDataComponent } from './components/data-dialog/data-components/pdf-break-data/pdf-break-data.component';
import { ImageDataComponent } from './components/data-dialog/data-components/image-data/image-data.component';
import { BarIndicatorDataComponent } from './components/data-dialog/data-components/bar-indicator-data/bar-indicator-data.component';
import { PanelDataComponent } from './components/data-dialog/data-components/panel-data/panel-data.component';
import { PanelLayoutDataComponent } from './components/data-dialog/data-components/panel-layout-data/panel-layout-data.component';
import { WrappedItemsDataComponent } from './components/data-dialog/data-components/wrapped-items-data/wrapped-items-data.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    ReportBuilderComponent,
    SidebarComponent,
    ReportComponent,
    SectionComponent,
    ControlToFormGroupPipe,
    ControlArrayToFormGroupsPipe,
    OptionsDialogComponent,
    DataDialogComponent,
    ChartDataComponent,
    TableDataComponent,
    CardDataComponent,
    ChipDataComponent,
    IndicatorDataComponent,
    PropertyDataComponent,
    ListDataComponent,
    ChartTableIndicatorDataComponent,
    QuestionDataComponent,
    RangeDataComponent,
    PdfBreakDataComponent,
    ImageDataComponent,
    BarIndicatorDataComponent,
    PanelDataComponent,
    PanelLayoutDataComponent,
    WrappedItemsDataComponent,
  ],
  imports: [
    MatCheckboxModule,
    CommonModule,
    ReactiveFormsModule,

    // Material Modules
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
    MatOptionModule,
    ReactiveFormsModule,
    // CDK Modules
    DragDropModule,
  ],
  exports: [
    ReportBuilderComponent,
    ControlToFormGroupPipe,
    ControlArrayToFormGroupsPipe,
  ],
})
export class ReportBuilderModule {}
