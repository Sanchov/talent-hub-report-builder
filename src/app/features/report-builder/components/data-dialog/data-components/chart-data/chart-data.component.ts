import { Component, inject, Input } from '@angular/core';
import {
  FormGroup,
  FormArray,
  AbstractControl,
  FormControl,
  FormBuilder,
} from '@angular/forms';

@Component({
  selector: 'app-chart-data',
  templateUrl: './chart-data.component.html',
  styleUrl: './chart-data.component.scss',
})
export class ChartDataComponent {
  @Input() form!: FormGroup;
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
  private fb = inject(FormBuilder);
  getDatasetControls(): FormGroup[] {
    return (this.form.get('data.dataset') as FormArray).controls as FormGroup[];
  }

  get datasetArray(): FormArray | null {
    return this.form?.get('data.dataset') as FormArray | null;
  }
  getChartDataPoints(formGroup: AbstractControl): FormArray {
    return formGroup.get('data') as FormArray;
  }

  getChartBackgroundColors(formGroup: AbstractControl): FormArray {
    return formGroup.get('backgroundColor') as FormArray;
  }

  getChartColors(formGroup: AbstractControl): FormArray {
    return formGroup.get('color') as FormArray;
  }
  addDataPoint(datasetItem: AbstractControl) {
    const dataArray = datasetItem.get('data') as FormArray;
    dataArray.push(this.fb.control(0));
  }

  removeDataPoint(datasetItem: AbstractControl, index: number) {
    const dataArray = datasetItem.get('data') as FormArray;
    dataArray.removeAt(index);
  }
  getFormControlFromArray(formArray: FormArray, index: number): FormControl {
    return formArray.at(index) as FormControl;
  }
  addBackgroundColor(datasetItem: AbstractControl) {
    const bgColorArray = datasetItem.get('backgroundColor') as FormArray;
    bgColorArray.push(this.fb.control('#ffffff'));
  }

  removeBackgroundColor(datasetItem: AbstractControl, index: number) {
    const bgColorArray = datasetItem.get('backgroundColor') as FormArray;
    bgColorArray.removeAt(index);
  }

  addColor(datasetItem: AbstractControl) {
    const colorArray = datasetItem.get('color') as FormArray;
    colorArray.push(this.fb.control('#000000'));
  }

  removeColor(datasetItem: AbstractControl, index: number) {
    const colorArray = datasetItem.get('color') as FormArray;
    colorArray.removeAt(index);
  }
}
