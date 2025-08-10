import { Component, input, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-indicator-data',
  templateUrl: './indicator-data.component.html',
  styleUrl: './indicator-data.component.scss',
})
export class IndicatorDataComponent {
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
  
  getDatasetControls(): FormGroup[] {
    return (this.form.get('data.dataset') as FormArray).controls as FormGroup[];
  }

  get datasetArray(): FormArray | null {
    return this.form?.get('data.dataset') as FormArray | null;
  }
}
