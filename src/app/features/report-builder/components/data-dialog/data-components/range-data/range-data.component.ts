import { Component, inject, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { ReportBuilderFormService } from '../../../../../../service/report-builder-form.service';
import { ReportBuilderDataService } from '../../../../../../service/report-builder-data.service';

@Component({
  selector: 'app-range-data',
  templateUrl: './range-data.component.html',
  styleUrl: './range-data.component.scss',
})
export class RangeDataComponent {
  @Input() form!: FormGroup;
  private formService = inject(ReportBuilderFormService);
  @Input() data: any;
  @Input() isNarrativeField!: (controlName: string) => boolean;
  @Input() getNarrativeFields!: (controlName: string) => any;
  @Input() onNarrativeInput!: (
    event: Event,
    controlName: string,
    field: string
  ) => void;
  @Input() isNarrativeFieldFromControl!: (control: any) => boolean;
  @Input() getNarrativeFieldsFromControl!: (control: any) => any;

  @Input() onDatasetNarrativeInput!: (
    event: Event,
    index: number,
    controlName: string,
    field: string
  ) => void;
  @Input() removeDatasetItem!: (controlName: string, index: number) => void;
  @Input() addDatasetItem!: (controlName: string) => void;
  databuilderForm = inject(ReportBuilderDataService);

  get datasetArray(): FormArray | null {
    return this.form?.get('data.dataset') as FormArray | null;
  }

  getRangeDatasetControls(): AbstractControl[] {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    return datasetArray.controls;
  }

  addRangeDatasetItem(): void {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    datasetArray.push(this.databuilderForm.createRangeComponentDataset());
  }

  removeRangeDatasetItem(index: number): void {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    datasetArray.removeAt(index);
  }
}
