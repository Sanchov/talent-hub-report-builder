import { Component, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-property-data',
  templateUrl: './property-data.component.html',
  styleUrl: './property-data.component.scss',
})
export class PropertyDataComponent {
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

  get datasetArray(): FormArray | null {
    return this.form?.get('data.dataset') as FormArray | null;
  }
  getDatasetControls(): FormGroup[] {
    return (this.form.get('data.dataset') as FormArray).controls as FormGroup[];
  }
}
