import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '../../../../models/component-types';
import { ReportBuilderFormService } from '../../../../service/report-builder-form.service';
import { NarrativeService } from '../../../../service/narrative.service';

@Component({
  selector: 'app-data-dialog',
  templateUrl: './data-dialog.component.html',
  styleUrls: ['./data-dialog.component.scss'],
})
export class DataDialogComponent implements OnInit {
  form!: FormGroup;
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DataDialogComponent>);
  private formService = inject(ReportBuilderFormService);
  private narrativeService = inject(NarrativeService);

  data = inject(MAT_DIALOG_DATA) as {
    type: ComponentType;
    data: any;
    target: FormGroup;
  };

  ngOnInit() {
    if (!this.data?.target) {
      console.error('No target form group provided');
      this.dialogRef.close();
      return;
    }

    this.form = this.fb.group({
      data: this.formService.createComponentData(this.data.type),
    });

    this.patchFormWithData();
  }
  private patchFormWithData(): void {
    if (!this.data?.data) return;

    const dataControl = this.form.get('data');
    if (dataControl) {
      // First patch the basic values
      dataControl.patchValue(this.data.data);

      // Then handle narrative fields specifically
      Object.keys(this.data.data).forEach((key) => {
        const control = dataControl.get(key);
        if (control && this.formService.isNarrativeField(control)) {
          const value = this.data.data[key];
          if (
            typeof value === 'string' &&
            this.narrativeService.isNarrative(value)
          ) {
            control.setValue(value);
          }
        }
      });
    }

    // Handle dataset and other nested structures
    if (this.data.data?.dataset) {
      const datasetArray = dataControl?.get('dataset') as FormArray;
      datasetArray.clear();
      this.data.data.dataset.forEach((item: any) => {
        const datasetGroup = this.formService.createDatasetForType(
          this.data.type,
          item
        );
        datasetArray.push(datasetGroup);
      });
    }
  }

  getDatasetControls(): FormGroup[] {
    return (
      ((this.form.get('data.dataset') as FormArray)?.controls as FormGroup[]) ||
      []
    );
  }

  save() {
    if (this.form.invalid) return;

    this.data.target.get('data')?.patchValue(this.form.get('data')?.value);
    this.dialogRef.close(true);
  }

  isNarrativeField(controlName: string): boolean {
    const control = this.form.get(`data.${controlName}`);
    return this.formService.isNarrativeField(control);
  }

  getNarrativeFields(controlName: string): {
    title: string;
    traitName: string;
    traitValue: string;
  } {
    const control = this.form.get(`data.${controlName}`);
    const narrativeValue = this.formService.getNarrativeValue(control);
    return {
      title: narrativeValue?.parsedValue?.title || '',
      traitName: narrativeValue?.parsedValue?.traitName || '',
      traitValue: narrativeValue?.parsedValue?.traitValue || '',
    };
  }

  getNarrativeFieldsFromControl(control: AbstractControl | null): {
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

  onDatasetNarrativeInput(
    event: Event,
    index: number,
    controlName: string,
    field: string
  ) {
    if (field === 'title' || field === 'traitName' || field === 'traitValue') {
      const input = event.target as HTMLInputElement | null;
      if (input && this.datasetArray) {
        const item = this.datasetArray.at(index) as FormGroup;
        const control = item.get(controlName);
        if (control) {
          this.updateNarrativeFieldInControl(
            control,
            field as 'title' | 'traitName' | 'traitValue',
            input.value
          );
        }
      }
    }
  }

  updateNarrativeFieldInControl(
    control: AbstractControl,
    field: 'title' | 'traitName' | 'traitValue',
    value: string
  ) {
    const currentValue = control.value || '';
    const narrativeValue = this.formService.getNarrativeValue(control) || {
      rawValue: currentValue,
      parsedValue: { title: '', traitName: '', traitValue: '' },
    };

    if (!narrativeValue.parsedValue) {
      narrativeValue.parsedValue = { title: '', traitName: '', traitValue: '' };
    }

    narrativeValue.parsedValue[field] = value;

    const newValue = this.narrativeService.format(
      narrativeValue.parsedValue.title ?? '',
      narrativeValue.parsedValue.traitName ?? '',
      narrativeValue.parsedValue.traitValue ?? ''
    );

    control.setValue(newValue);
  }

  isNarrativeFieldFromControl(control: AbstractControl | null): boolean {
    return this.formService.isNarrativeField(control);
  }

  updateNarrativeField(
    controlName: string,
    field: 'title' | 'traitName' | 'traitValue',
    value: string
  ) {
    const control = this.form.get(`data.${controlName}`);
    if (!control) return;

    const currentValue = control.value || '';
    const narrativeValue = this.formService.getNarrativeValue(control) || {
      rawValue: currentValue,
      parsedValue: { title: '', traitName: '', traitValue: '' },
    };

    if (!narrativeValue.parsedValue) {
      narrativeValue.parsedValue = { title: '', traitName: '', traitValue: '' };
    }

    narrativeValue.parsedValue[field] = value;

    const newValue = this.narrativeService.format(
      narrativeValue.parsedValue.title ?? '',
      narrativeValue.parsedValue.traitName ?? '',
      narrativeValue.parsedValue.traitValue ?? ''
    );

    control.setValue(newValue);
  }

  get datasetArray() {
    return this.form?.get('data.dataset') as FormArray | null;
  }

  onNarrativeInput(event: Event, controlName: string, field: string) {
    if (field === 'title' || field === 'traitName' || field === 'traitValue') {
      this.updateNarrativeField(
        controlName,
        field as 'title' | 'traitName' | 'traitValue',
        (event.target as HTMLInputElement).value
      );
    }
  }

  getChipControls(): FormGroup[] {
    return (
      ((this.form.get('data.chips') as FormArray)?.controls as FormGroup[]) ||
      []
    );
  }

  addChipItem() {
    const chipsArray = this.form.get('data.chips') as FormArray;
    chipsArray.push(this.formService.createChipDataset());
  }

  removeChipItem(index: number) {
    const chipsArray = this.form.get('data.chips') as FormArray;
    chipsArray.removeAt(index);
  }

  onChipNarrativeInput(
    event: Event,
    index: number,
    controlName: string,
    field: 'title' | 'traitName' | 'traitValue'
  ) {
    const input = event.target as HTMLInputElement | null;
    if (input && this.form.get('data.chips')) {
      const chipsArray = this.form.get('data.chips') as FormArray;
      const chip = chipsArray.at(index) as FormGroup;
      const control = chip.get(controlName);
      if (control) {
        this.updateNarrativeFieldInControl(control, field, input.value);
      }
    }
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

  getChartDataPoints(formGroup: AbstractControl): FormArray {
    return formGroup.get('data') as FormArray;
  }

  getChartBackgroundColors(formGroup: AbstractControl): FormArray {
    return formGroup.get('backgroundColor') as FormArray;
  }

  getChartColors(formGroup: AbstractControl): FormArray {
    return formGroup.get('color') as FormArray;
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

  addDatasetItem(controlName: string) {
    const dataset = this.form.get(`data.${controlName}`) as FormArray;
    let newItem: FormGroup;

    switch (this.data.type) {
      case 'CARD':
        newItem = this.formService.createCardDataset();
        break;
      case 'INDICATOR':
        newItem = this.formService.createIndicatorDataset();
        break;
      case 'CHART':
        newItem = this.formService.createChartDataset();
        break;
      case 'TABLE':
        newItem = this.formService.createTableRow();
        break;
      case 'CHIP':
        newItem = this.formService.createChipDataset();
        break;
      case 'GRADE_INDICATOR':
        newItem = this.formService.createGradeIndicatorDataset();
        break;
      case 'STATIC_NOTE':
        newItem = this.formService.createStaticNoteDataset();
        break;

      default:
        newItem = this.fb.group({});
    }

    dataset.push(newItem);
  }

  removeDatasetItem(controlName: string, index: number) {
    const dataset = this.form.get(`data.${controlName}`) as FormArray;
    dataset.removeAt(index);
  }
}
