import { Component, inject, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { ReportBuilderFormService } from '../../../../../../service/report-builder-form.service';
import { NarrativeService } from '../../../../../../service/narrative.service';

@Component({
  selector: 'app-table-data',
  templateUrl: './table-data.component.html',
  styleUrl: './table-data.component.scss',
})
export class TableDataComponent {
  @Input() form!: FormGroup;

  @Input() data: any;
  @Input() isNarrativeField!: (controlName: string) => boolean;
  @Input() getNarrativeFields!: (controlName: string) => any;
  @Input() onNarrativeInput!: (
    event: Event,
    controlName: string,
    field: string
  ) => void;

  @Input() getNarrativeFieldsFromControl!: (control: any) => any;
  @Input() onDatasetNarrativeInput!: (
    event: Event,
    index: number,
    controlName: string,
    field: string
  ) => void;
  @Input() removeDatasetItem!: (controlName: string, index: number) => void;
  @Input() addDatasetItem!: (controlName: string) => void;
  private formService = inject(ReportBuilderFormService);
  getDatasetControls(): FormGroup[] {
    return (this.form.get('data.dataset') as FormArray).controls as FormGroup[];
  }
  private narrativeService = inject(NarrativeService);

  addChipItem() {
    const chipsArray = this.form.get('data.chips') as FormArray;
    chipsArray.push(this.formService.createChipDataset());
  }

  removeChipItem(index: number) {
    const chipsArray = this.form.get('data.chips') as FormArray;
    chipsArray.removeAt(index);
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
  getChipControls(): FormGroup[] {
    return (this.form.get('data.chips') as FormArray).controls as FormGroup[];
  }

  get datasetArray(): FormArray | null {
    return this.form?.get('data.dataset') as FormArray | null;
  }
}
