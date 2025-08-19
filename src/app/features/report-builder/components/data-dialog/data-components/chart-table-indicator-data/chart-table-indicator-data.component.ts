import {
  FormGroup,
  FormArray,
  AbstractControl,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import { ReportBuilderFormService } from '../../../../../../service/report-builder-form.service';
import { ComponentType } from '../../../../../../models/component-types';
import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportBuilderDataService } from '../../../../../../service/report-builder-data.service';

@Component({
  selector: 'app-chart-table-indicator-data',
  templateUrl: './chart-table-indicator-data.component.html',
  styleUrls: ['./chart-table-indicator-data.component.scss'],
})
export class ChartTableIndicatorDataComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() data!: {
    type: ComponentType;
    data: any;
    target: FormGroup;
  };
  fb = inject(FormBuilder);
  formService = inject(ReportBuilderFormService);
  databuilderForm = inject(ReportBuilderDataService);

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Don't create a new form, work directly with the provided form
    if (!this.form) {
      console.error('No form provided to ChartTableIndicatorDataComponent');
      return;
    }

    // Ensure we have the data structure
    if (!this.form.get('data')) {
      this.form.addControl(
        'data',
        this.databuilderForm.createComponentData(this.data.type, this.data.data)
      );
    }

    const dataGroup = this.form.get('data') as FormGroup;
    if (dataGroup && !dataGroup.get('dataset')) {
      dataGroup.addControl(
        'dataset',
        this.fb.array([this.databuilderForm.createChartTableIndicatorDataset()])
      );
    }

    // Apply the existing data
    this.applyExistingData();

    // Set up form value changes subscription to sync with target
    if (this.data.target) {
      const formValueChanges = this.form.valueChanges.subscribe((value) => {
        // Sync changes back to the target form
        this.data.target
          .get('data')
          ?.setValue(value.data, { emitEvent: false });
      });
      this.subscriptions.push(formValueChanges);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private applyExistingData() {
    if (!this.data.data) return;

    const dataControl = this.form.get('data');
    if (!dataControl) return;

    // Handle the complex nested structure for CHART_TABLE_INDICATOR
    if (this.data.data.dataset && Array.isArray(this.data.data.dataset)) {
      const datasetArray = dataControl.get('dataset') as FormArray;
      datasetArray.clear();

      this.data.data.dataset.forEach((datasetItem: any) => {
        const newDatasetItem =
          this.databuilderForm.createChartTableIndicatorDataset();

        // Apply chart data
        if (datasetItem.chart?.data) {
          const chartDataControl = newDatasetItem.get(
            'chart.data'
          ) as FormGroup;
          this.applyNestedData(chartDataControl, datasetItem.chart.data);
        }

        // Apply table data
        if (datasetItem.table?.data) {
          const tableDataControl = newDatasetItem.get(
            'table.data'
          ) as FormGroup;
          this.applyNestedData(tableDataControl, datasetItem.table.data);
        }

        // Apply indicator data
        if (datasetItem.indicator?.data) {
          const indicatorDataControl = newDatasetItem.get(
            'indicator.data'
          ) as FormGroup;
          this.applyNestedData(
            indicatorDataControl,
            datasetItem.indicator.data
          );
        }

        datasetArray.push(newDatasetItem);
      });
    } else {
      // For simpler structures, just patch the value
      dataControl.patchValue(this.data.data);
    }
  }

  private applyNestedData(control: FormGroup, data: any) {
    if (!control || !data) return;

    // Handle narrative fields first
    Object.keys(data).forEach((key) => {
      const fieldControl = control.get(key);
      if (fieldControl && this.formService.isNarrativeField(fieldControl)) {
        fieldControl.setValue(data[key]);
      } else if (fieldControl && !(data[key] instanceof Array)) {
        fieldControl.setValue(data[key]);
      }
    });

    // Handle array fields (like dataset, chips)
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        const arrayControl = control.get(key) as FormArray;
        if (arrayControl) {
          arrayControl.clear();
          data[key].forEach((item: any) => {
            let newItem: FormGroup;

            // Create appropriate form group based on the key
            switch (key) {
              case 'dataset':
                if (control.parent?.get('type')?.value === 'CHART') {
                  newItem = this.databuilderForm.createChartDataset();
                } else if (control.parent?.get('type')?.value === 'TABLE') {
                  newItem = this.databuilderForm.createTableRow();
                } else if (control.parent?.get('type')?.value === 'INDICATOR') {
                  newItem = this.databuilderForm.createIndicatorDataset();
                } else {
                  newItem = this.fb.group(item);
                }
                break;
              case 'chips':
                newItem = this.databuilderForm.createChipDataset();
                break;
              default:
                newItem = this.fb.group(item);
                break;
            }

            newItem.patchValue(item);
            arrayControl.push(newItem);
          });
        }
      }
    });
  }

  get datasetArray(): FormArray {
    const dataGroup = this.form.get('data');
    if (!dataGroup) {
      console.warn('Data group not found, creating empty array');
      return this.fb.array([]);
    }
    const dataset = dataGroup.get('dataset');
    return dataset instanceof FormArray ? dataset : this.fb.array([]);
  }

  getDatasetControls(): FormGroup[] {
    return this.datasetArray.controls.filter(
      (control) => control instanceof FormGroup
    ) as FormGroup[];
  }

  getChartControls(): FormGroup[] {
    return this.getDatasetControls().map((item) => {
      const chart = item.get('chart');
      return chart instanceof FormGroup ? chart : this.fb.group({});
    });
  }

  getTableControls(): FormGroup[] {
    return this.getDatasetControls().map((item) => {
      const table = item.get('table');
      return table instanceof FormGroup ? table : this.fb.group({});
    });
  }

  getIndicatorControls(): FormGroup[] {
    return this.getDatasetControls().map((item) => {
      const indicator = item.get('indicator');
      return indicator instanceof FormGroup ? indicator : this.fb.group({});
    });
  }

  getChartDataPoints(formGroup: AbstractControl): FormArray {
    if (!(formGroup instanceof FormGroup)) {
      return this.fb.array([]);
    }
    const dataGroup = formGroup.get('data');
    if (!(dataGroup instanceof FormGroup)) {
      return this.fb.array([]);
    }
    const dataset = dataGroup.get('dataset');
    return dataset instanceof FormArray ? dataset : this.fb.array([]);
  }

  getTableRows(formGroup: AbstractControl): FormArray {
    if (!(formGroup instanceof FormGroup)) {
      return this.fb.array([]);
    }
    const dataGroup = formGroup.get('data');
    if (!(dataGroup instanceof FormGroup)) {
      return this.fb.array([]);
    }
    const dataset = dataGroup.get('dataset');
    return dataset instanceof FormArray ? dataset : this.fb.array([]);
  }

  getIndicatorDataset(formGroup: AbstractControl): FormArray {
    if (!(formGroup instanceof FormGroup)) {
      return this.fb.array([]);
    }
    const dataGroup = formGroup.get('data');
    if (!(dataGroup instanceof FormGroup)) {
      return this.fb.array([]);
    }
    const dataset = dataGroup.get('dataset');
    return dataset instanceof FormArray ? dataset : this.fb.array([]);
  }

  addDatasetItem() {
    this.datasetArray.push(
      this.databuilderForm.createChartTableIndicatorDataset()
    );
  }

  removeDatasetItem(index: number) {
    this.datasetArray.removeAt(index);
  }

  addChartDataPoint(chartControl: AbstractControl) {
    const dataArray = this.getChartDataPoints(chartControl)
      .at(0)
      ?.get('data') as FormArray;
    if (dataArray instanceof FormArray) {
      dataArray.push(this.fb.control(0));
    }
  }

  removeChartDataPoint(chartControl: AbstractControl, index: number) {
    const dataArray = this.getChartDataPoints(chartControl)
      .at(0)
      ?.get('data') as FormArray;
    if (dataArray instanceof FormArray) {
      dataArray.removeAt(index);
    }
  }

  addTableRow(tableControl: AbstractControl) {
    const rowsArray = this.getTableRows(tableControl);
    rowsArray.push(this.databuilderForm.createTableRow());
  }

  removeTableRow(tableControl: AbstractControl, index: number) {
    const rowsArray = this.getTableRows(tableControl);
    rowsArray.removeAt(index);
  }

  addIndicatorItem(indicatorControl: AbstractControl) {
    const datasetArray = this.getIndicatorDataset(indicatorControl);
    datasetArray.push(this.databuilderForm.createIndicatorDataset());
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
    control: AbstractControl | null,
    field: 'title' | 'traitName' | 'traitValue'
  ) {
    if (!control) return;

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

  getSafeControl(
    formGroup: AbstractControl,
    path: string
  ): AbstractControl | null {
    if (!formGroup) {
      console.warn(`FormGroup is null for path: ${path}`);
      return null;
    }

    const control = formGroup.get(path);
    if (!control) {
      console.warn(`Control at path ${path} not found in`, formGroup);
      return null;
    }
    return control;
  }

  getSafeArray(formGroup: AbstractControl, path: string): FormArray {
    if (!formGroup) {
      return this.fb.array([]);
    }
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
    if (!control) {
      return this.fb.array([]);
    }
    const array = control.get(path);
    if (!array || !(array instanceof FormArray)) {
      return this.fb.array([]);
    }
    return array;
  }
}
