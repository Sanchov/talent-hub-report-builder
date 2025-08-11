import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '../../../../models/component-types';
import { ReportBuilderFormService } from '../../../../service/report-builder-form.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NarrativeService } from '../../../../service/narrative.service';

@Component({
  selector: 'app-options-dialog',
  templateUrl: './options-dialog.component.html',
})
export class OptionsDialogComponent implements OnInit {
  form!: FormGroup;
  allDisplayOptions = ['CHART', 'TABLE', 'INDICATOR', 'WRAP'];
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<OptionsDialogComponent>);
  private formService = inject(ReportBuilderFormService);
  private narrativeService = inject(NarrativeService);
  isSectionOptions = false;
  data = inject(MAT_DIALOG_DATA) as {
    type: ComponentType | 'SECTION';
    options: any;
    target: FormGroup;
  };

  ngOnInit() {
    console.log('Dialog data:', this.data);

    if (!this.data?.target) {
      console.error('No target form group provided');
      this.dialogRef.close();
      return;
    }

    this.isSectionOptions = this.data.type === 'SECTION';

    if (this.isSectionOptions) {
      this.form = this.formService.createSectionOptionsForm(
        this.data.target.value
      );
    } else {
      this.form = this.formService.createOptionsForm(
        this.data.type as ComponentType,
        this.data.options || {}
      );
    }
  }

  onDrop(event: CdkDragDrop<string[]>) {
    if (this.isSectionOptions) return;

    const control = this.form.get('displayOrder');
    const current = control?.value;
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    control?.setValue([...current]);
  }

  removeDisplayOrderItem(item: string) {
    if (this.isSectionOptions) return;

    const control = this.form.get('displayOrder');
    control?.setValue(control.value.filter((i: string) => i !== item));
  }

  addDisplayOrderItem(item: string) {
    if (this.isSectionOptions) return;

    const control = this.form.get('displayOrder');
    control?.setValue([...control.value, item]);
  }

  save() {
    if (this.form.invalid) return;

    if (this.isSectionOptions) {
      const formValue = this.form.value;

      const indicatorLabel = this.narrativeService.format(
        formValue.indicator.labelTitle,
        formValue.indicator.labelTraitName,
        formValue.indicator.labelTraitValue
      );

      const chipLabel = this.narrativeService.format(
        formValue.chip.labelTitle,
        formValue.chip.labelTraitName,
        formValue.chip.labelTraitValue
      );

      const patchedValue = {
        header: this.narrativeService.format(
          formValue.headerTitle,
          formValue.headerTraitName,
          formValue.headerTraitValue
        ),
        subHeader: this.narrativeService.format(
          formValue.subHeaderTitle,
          formValue.subHeaderTraitName,
          formValue.subHeaderTraitValue
        ),
        description: this.narrativeService.format(
          formValue.descriptionTitle,
          formValue.descriptionTraitName,
          formValue.descriptionTraitValue
        ),
        badge: this.narrativeService.format(
          formValue.badgeTitle,
          formValue.badgeTraitName,
          formValue.badgeTraitValue
        ),
        indicators: {
          label: indicatorLabel,
          color: formValue.indicator.color,
        },
        chip: {
          label: chipLabel,
          color: formValue.chip.color,
          backgroundColor: formValue.chip.backgroundColor,
        },
        imageUrl: formValue.imageUrl,
        order: formValue.order,
        components: this.data.target.value.components || [],
      };

      this.data.target.patchValue(patchedValue);
    } else {
      const formValue = this.form.value;
      const type = this.data.type as ComponentType;

      if (!this.data.target) {
        console.error('Target form group is undefined');
        return;
      }

      if (type !== 'CHART_TABLE_INDICATOR') {
        const currentData =
          this.data.target.get('data')?.value ||
          this.formService.createComponentData(type).value;

        this.data.target.patchValue({
          type: type,
          options: formValue,
          data: currentData,
        });
      } else {
        const currentData =
          this.data.target.get('data')?.value ||
          this.formService.createComponentData(type).value;

        const updatedDataset = currentData.dataset.map((datasetItem: any) => {
          const updatedItem = { ...datasetItem };

          if (updatedItem.chart) {
            updatedItem.chart.options = {
              ...updatedItem.chart.options,
              indentationLevel: formValue.indentationLevel,
              position: formValue.chartPosition,
              indexAxis: formValue.chartIndexAxis,
              chartType: formValue.chartType,
              chartMaxAxis: formValue.chartMaxAxis,
              showValues: formValue.chartShowValues,
            };
          }

          if (updatedItem.table) {
            updatedItem.table.options = {
              ...updatedItem.table.options,
              tableType: formValue.tableType,
              isHeaderVisible: formValue.isHeaderVisible,
              coloredColumn: formValue.coloredColumn,
              indentationLevel: formValue.indentationLevel,
            };
          }

          if (updatedItem.indicator) {
            updatedItem.indicator.options = {
              ...updatedItem.indicator.options,
              unit: formValue.indicatorUnit,
              display: formValue.indicatorDisplay,
              indentationLevel: formValue.indentationLevel,
            };
          }

          return updatedItem;
        });

        const updatedData = {
          ...currentData,
          dataset: updatedDataset,
        };
        const options = {
          indentationLevel: formValue.indentationLevel,
          displayOrder: formValue.displayOrder,
        };

        this.data.target.patchValue({
          type: type,
          options: options,
          data: updatedData,
        });
      }
    }

    this.dialogRef.close(true);
  }
}
