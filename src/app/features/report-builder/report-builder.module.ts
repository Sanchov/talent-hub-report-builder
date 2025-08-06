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
  ],
  imports: [
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
