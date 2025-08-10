import { Component, inject, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { ReportBuilderFormService } from '../../../../../../service/report-builder-form.service';

@Component({
  selector: 'app-bar-indicator-data',
  templateUrl: './bar-indicator-data.component.html',
  styleUrl: './bar-indicator-data.component.scss',
})
export class BarIndicatorDataComponent {
  @Input() form!: FormGroup;
  @Input() data: any;
  private formService = inject(ReportBuilderFormService);
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

  get datasetArray(): FormArray | null {
    return this.form?.get('data.dataset') as FormArray | null;
  }

  getBarIndicatorDatasetControls(): AbstractControl[] {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    return datasetArray.controls;
  }

  addBarIndicatorDatasetItem(): void {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    datasetArray.push(
      this.formService.createBarIndicatorDataset()
    );
  }

  removeBarIndicatorDatasetItem(index: number): void {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    datasetArray.removeAt(index);
  }
}
