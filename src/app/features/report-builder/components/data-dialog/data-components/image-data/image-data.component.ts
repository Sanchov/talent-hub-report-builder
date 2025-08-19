import { Component, inject, Input } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { ReportBuilderFormService } from '../../../../../../service/report-builder-form.service';
import { ReportBuilderDataService } from '../../../../../../service/report-builder-data.service';

@Component({
  selector: 'app-image-data',
  templateUrl: './image-data.component.html',
  styleUrl: './image-data.component.scss',
})
export class ImageDataComponent {
  private formService = inject(ReportBuilderFormService);
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
  databuilderForm = inject(ReportBuilderDataService);

  getDatasetControls(): FormGroup[] {
    return (this.form.get('data.dataset') as FormArray).controls as FormGroup[];
  }

  getImageDatasetControls(): AbstractControl[] {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    return datasetArray.controls;
  }

  addImageDatasetItem(): void {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    datasetArray.push(this.databuilderForm.createImageDataset());
  }

  removeImageDatasetItem(index: number): void {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    datasetArray.removeAt(index);
  }
}
