import {
  FormGroup,
  FormArray,
  AbstractControl,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import { ReportBuilderFormService } from '../../../../../../service/report-builder-form.service';
import { ComponentType } from '../../../../../../models/component-types';
import { Component, inject, Input } from '@angular/core';

@Component({
  selector: 'app-chart-table-indicator-data',
  templateUrl: './chart-table-indicator-data.component.html',
  styleUrls: ['./chart-table-indicator-data.component.scss'],
})
export class ChartTableIndicatorDataComponent {
  @Input() form!: FormGroup;
  @Input() data!: {
    type: ComponentType;
    data: any;
    target: FormGroup;
  };
  fb = inject(FormBuilder);
  formService = inject(ReportBuilderFormService);

  ngOnInit() {
    if (!this.form) {
      this.form = this.fb.group({
        data: this.formService.createComponentData(this.data.type),
      });
      this.form.get('data')?.patchValue(this.data.data || {});
    }
  }

  get datasetArray(): FormArray {
    return this.form.get('data.dataset') as FormArray;
  }

  getDatasetControls(): FormGroup[] {
    return this.datasetArray.controls as FormGroup[];
  }

  getChartControls(): FormGroup[] {
    return this.getDatasetControls().map(
      (item) => item.get('chart') as FormGroup
    );
  }

  getTableControls(): FormGroup[] {
    return this.getDatasetControls().map(
      (item) => item.get('table') as FormGroup
    );
  }

  getIndicatorControls(): FormGroup[] {
    return this.getDatasetControls().map(
      (item) => item.get('indicator') as FormGroup
    );
  }

  getChartDataPoints(formGroup: AbstractControl): FormArray {
    const dataGroup = (formGroup as FormGroup).get('data') as FormGroup;
    return dataGroup.get('dataset') as FormArray;
  }

  getTableRows(formGroup: AbstractControl): FormArray {
    const dataGroup = (formGroup as FormGroup).get('data') as FormGroup;
    return dataGroup.get('dataset') as FormArray;
  }

  getIndicatorDataset(formGroup: AbstractControl): FormArray {
    const dataGroup = (formGroup as FormGroup).get('data') as FormGroup;
    return dataGroup.get('dataset') as FormArray;
  }

  addDatasetItem() {
    this.datasetArray.push(this.formService.createChartTableIndicatorDataset());
  }

  removeDatasetItem(index: number) {
    this.datasetArray.removeAt(index);
  }

  addChartDataPoint(chartControl: AbstractControl) {
    const dataArray = this.getChartDataPoints(chartControl)
      .at(0)
      ?.get('data') as FormArray;
    dataArray.push(this.fb.control(0));
  }

  removeChartDataPoint(chartControl: AbstractControl, index: number) {
    const dataArray = this.getChartDataPoints(chartControl)
      .at(0)
      ?.get('data') as FormArray;
    dataArray.removeAt(index);
  }

  addTableRow(tableControl: AbstractControl) {
    const rowsArray = this.getTableRows(tableControl);
    rowsArray.push(this.formService.createTableRow());
  }

  removeTableRow(tableControl: AbstractControl, index: number) {
    const rowsArray = this.getTableRows(tableControl);
    rowsArray.removeAt(index);
  }

  addIndicatorItem(indicatorControl: AbstractControl) {
    const datasetArray = this.getIndicatorDataset(indicatorControl);
    datasetArray.push(this.formService.createIndicatorDataset());
  }

  removeIndicatorItem(indicatorControl: AbstractControl, index: number) {
    const datasetArray = this.getIndicatorDataset(indicatorControl);
    datasetArray.removeAt(index);
  }

  isNarrativeField(control: AbstractControl | null): boolean {
    return this.formService.isNarrativeField(control);
  }

  getNarrativeFields(control: AbstractControl | null): {
    title: string;
    traitName: string;
    traitValue: string;
  } {
    const narrativeValue = this.formService.getNarrativeValue(control);
    return {
      title: narrativeValue?.parsedValue?.title || '',
      traitName: narrativeValue?.parsedValue?.traitName || '',
      traitValue: narrativeValue?.parsedValue?.traitValue || '',
    };
  }

  onNarrativeInput(
    event: Event,
    control: AbstractControl | null, // Make it accept null
    field: 'title' | 'traitName' | 'traitValue'
  ) {
    if (!control) return; // Add null check

    const input = event.target as HTMLInputElement;
    this.updateNarrativeFieldInControl(control, field, input.value);
  }

  private updateNarrativeFieldInControl(
    control: AbstractControl,
    field: 'title' | 'traitName' | 'traitValue',
    value: string
  ) {
    const currentValue = control.value || '';
    const narrativeValue = this.formService.getNarrativeValue(control) || {
      rawValue: currentValue,
      parsedValue: { title: '', traitName: '', traitValue: '' },
    };

    narrativeValue.parsedValue = narrativeValue.parsedValue || {
      title: '',
      traitName: '',
      traitValue: '',
    };
    narrativeValue.parsedValue[field] = value;

    const newValue = (this.formService as any).narrativeService.format(
      narrativeValue.parsedValue.title ?? '',
      narrativeValue.parsedValue.traitName ?? '',
      narrativeValue.parsedValue.traitValue ?? ''
    );

    control.setValue(newValue);
  }

  getSafeControl(formGroup: AbstractControl, path: string): AbstractControl {
    const control = formGroup.get(path);
    if (!control) {
      throw new Error(`Control at path ${path} not found`);
    }
    return control;
  }

  getSafeArray(formGroup: AbstractControl, path: string): FormArray {
    const array = formGroup.get(path);
    if (!array || !(array instanceof FormArray)) {
      return this.fb.array([]);
    }
    return array as FormArray;
  }

  getSafeDataPoints(datasetItem: AbstractControl): FormArray {
    return this.getSafeArray(datasetItem, 'data');
  }

  getSafeBackgroundColors(datasetItem: AbstractControl): FormArray {
    return this.getSafeArray(datasetItem, 'backgroundColor');
  }

  getSafeNarrativeFields(control: AbstractControl | null) {
    if (!control) {
      return { title: '', traitName: '', traitValue: '' };
    }
    return this.getNarrativeFields(control);
  }

  getFormControl(control: AbstractControl): FormControl {
    if (!(control instanceof FormControl)) {
      throw new Error('Control is not a FormControl');
    }
    return control as FormControl;
  }

  getAsFormControl(control: AbstractControl): FormControl {
    if (!(control instanceof FormControl)) {
      return this.fb.control(null);
    }
    return control as FormControl;
  }

  getSafeFormArray(control: AbstractControl, path: string): FormArray {
    const array = control.get(path);
    if (!array || !(array instanceof FormArray)) {
      return this.fb.array([]);
    }
    return array;
  }
}
