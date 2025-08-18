import { Component, inject, Input } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';

@Component({
  selector: 'app-wrapped-items-data',
  templateUrl: './wrapped-items-data.component.html',
  styleUrl: './wrapped-items-data.component.scss',
})
export class WrappedItemsDataComponent {
  @Input() form!: FormGroup;
  @Input() data: any;
  fb = inject(FormBuilder);
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

  get datasetControl(): AbstractControl | null {
    return this.form?.get('data.dataset') ?? null;
  }
}
