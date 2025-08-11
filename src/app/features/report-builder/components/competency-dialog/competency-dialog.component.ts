// competency-dialog.component.ts
import { Component, inject } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReportBuilderFormService } from '../../../../service/report-builder-form.service';

@Component({
  selector: 'app-competency-dialog',
  templateUrl: './competency-dialog.component.html',
  styleUrls: ['./competency-dialog.component.scss'],
})
export class CompetencyDialogComponent {
  dialogRef = inject(MatDialogRef<CompetencyDialogComponent>);
  private reportBuilderService = inject(ReportBuilderFormService);
  private data = inject<{ form: FormGroup }>(MAT_DIALOG_DATA);

  form: FormGroup =
    this.data.form || this.reportBuilderService.createReportForm();

  // Getter for the competencies FormArray
  get competencies(): FormArray {
    return this.reportBuilderService.getCompetency(this.form);
  }

  addCompetency(): void {
    this.reportBuilderService.addCompetency(this.form);
  }

  removeCompetency(index: number): void {
    this.competencies.removeAt(index);
  }

  save(): void {
    this.dialogRef.close(this.competencies.getRawValue());
  }
}
