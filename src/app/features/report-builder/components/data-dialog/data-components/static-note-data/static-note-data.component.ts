import { Component, Input } from '@angular/core';
import { FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { DataComponent } from '../models/data-component.interface';

@Component({
  selector: 'app-static-note-data',
  templateUrl: './static-note-data.component.html',
  styleUrl: './static-note-data.component.scss',
})
export class StaticNoteDataComponent {
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
}
