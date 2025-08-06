import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ReportBuilderFormService } from '../../../../service/report-builder-form.service';
import { MatDialog } from '@angular/material/dialog';
import { OptionsDialogComponent } from '../../components/options-dialog/options-dialog.component';
import { DataDialogComponent } from '../../components/data-dialog/data-dialog.component';
@Component({
  selector: 'app-report-builder',
  templateUrl: './report-builder.component.html',
  styleUrls: ['./report-builder.component.scss'],
})
export class ReportBuilderComponent implements OnInit {
  reportForm!: FormGroup;
  formService = inject(ReportBuilderFormService);
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.reportForm = this.formService.createReportForm();
  }

  get sections(): FormArray {
    return this.formService.getSections(this.reportForm);
  }

  openOptionsDialog(sectionIndex: number, componentIndex: number): void {
    const section = this.sections.at(sectionIndex) as FormGroup;
    const components = this.formService.getComponents(section);
    const component = components.at(componentIndex) as FormGroup;

    this.dialog.open(OptionsDialogComponent, {
      width: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-panel',
      data: {
        type: component.get('type')?.value,
        options: component.get('options')?.value,
        target: component,
      },
    });
  }

  openDataDialog(sectionIndex: number, componentIndex: number): void {
    const section = this.sections.at(sectionIndex) as FormGroup;
    const components = this.formService.getComponents(section);
    const component = components.at(componentIndex) as FormGroup;

    this.dialog.open(DataDialogComponent, {
      width: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-panel',
      data: {
        type: component.get('type')?.value,
        data: component.get('data')?.value,
        target: component,
      },
    });
  }
  getComponents(sectionIndex: number): FormArray {
    const section = this.sections.at(sectionIndex) as FormGroup;
    return this.formService.getComponents(section);
  }

  addSection(): void {
    this.formService.addSection(this.reportForm);
  }
  openSectionOptions(sectionIndex: number): void {
    const section = this.sections.at(sectionIndex) as FormGroup;

    this.dialog.open(OptionsDialogComponent, {
      width: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-panel',
      data: {
        type: 'SECTION',
        options: section.value,
        target: section,
      },
    });
  }

  onDrop(event: DragEvent, sectionIndex: number): void {
    const type = event.dataTransfer?.getData('componentType');
    if (type) {
      this.formService.addComponentToSection(
        this.reportForm,
        type,
        sectionIndex
      );
    }
  }

  dropComponent(event: CdkDragDrop<FormGroup[]>, sectionIndex: number): void {
    const section = this.formService
      .getSections(this.reportForm)
      .at(sectionIndex) as FormGroup;
    const componentsArray = this.formService.getComponents(section);

    if (!componentsArray || componentsArray.length < 2) return;

    const controls = componentsArray.controls;
    moveItemInArray(controls, event.previousIndex, event.currentIndex);

    const reordered = new FormArray<AbstractControl>([]);
    controls.forEach((control) => reordered.push(control));
    section.setControl('components', reordered);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }
  logReport(): void {
    console.log('Report Output:', this.reportForm.value);
  }
  removeComponent(sectionIndex: number, componentIndex: number) {
    const sections = this.formService.getSections(this.reportForm);
    const section = sections.at(sectionIndex);
    if (section instanceof FormGroup) {
      const components = this.formService.getComponents(section);
      components.removeAt(componentIndex);
    }
  }
}
