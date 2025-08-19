import { Component, Input, OnInit } from '@angular/core';
import {
  FormGroup,
  FormArray,
  AbstractControl,
  FormBuilder,
} from '@angular/forms';
import { ComponentType } from '../../../../../../models/component-types';
import { NarrativeService } from '../../../../../../service/narrative.service';
import { ReportBuilderFormService } from '../../../../../../service/report-builder-form.service';
import { ReportBuilderDataService } from '../../../../../../service/report-builder-data.service';

@Component({
  selector: 'app-panel-data',
  templateUrl: './panel-data.component.html',
  styleUrls: ['./panel-data.component.scss'],
})
export class PanelDataComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() data!: {
    type: ComponentType;
    data: any;
    target: FormGroup;
  };

  constructor(
    private fb: FormBuilder,
    private formService: ReportBuilderFormService,
    private narrativeService: NarrativeService,
    private databuilderForm: ReportBuilderDataService
  ) {}

  ngOnInit() {
    if (!this.form) {
      this.form = this.fb.group({
        data: this.databuilderForm.createComponentData(this.data.type),
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

  onNarrativeInput(
    event: Event,
    controlName: string,
    field: 'title' | 'traitName' | 'traitValue'
  ) {
    const input = event.target as HTMLInputElement;
    const control = this.form.get(`data.${controlName}`);
    if (control) {
      this.updateNarrativeFieldInControl(control, field, input.value);
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

  addPanelItem() {
    this.datasetArray.push(this.databuilderForm.createPanelDataset());
  }

  removePanelItem(index: number) {
    this.datasetArray.removeAt(index);
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

  isNarrativeFieldFromControl(control: AbstractControl | null): boolean {
    return this.formService.isNarrativeField(control);
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
}
