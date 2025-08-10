import { Component, inject, Input } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { ReportBuilderFormService } from '../../../../../../service/report-builder-form.service';

@Component({
  selector: 'app-panel-data',
  templateUrl: './panel-data.component.html',
  styleUrl: './panel-data.component.scss',
})
export class PanelDataComponent {
  @Input() form!: FormGroup;
  private formService = inject(ReportBuilderFormService);
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
  get datasetArray() {
    return this.form?.get('data.dataset') as FormArray | null;
  }
  getPanelDatasetControls(): AbstractControl[] {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    return datasetArray.controls;
  }

  addPanelDatasetItem(): void {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    datasetArray.push(this.formService.createPanelDataset());
  }

  removePanelDatasetItem(index: number): void {
    const datasetArray = this.form.get('data.dataset') as FormArray;
    datasetArray.removeAt(index);
  }
}
