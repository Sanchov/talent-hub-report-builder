import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '../../../../models/component-types';
import { ReportBuilderFormService } from '../../../../service/report-builder-form.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
        this.data.target.value // ✅ CORRECT
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

      const indicatorLabel = this.formatNarrative(
        formValue.indicator.labelTitle,
        formValue.indicator.labelTraitName,
        formValue.indicator.labelTraitValue
      );

      const chipLabel = this.formatNarrative(
        formValue.chip.labelTitle,
        formValue.chip.labelTraitName,
        formValue.chip.labelTraitValue
      );

      const patchedValue = {
        header: this.formatNarrative(
          formValue.headerTitle,
          formValue.headerTraitName,
          formValue.headerTraitValue
        ),
        subHeader: this.formatNarrative(
          formValue.subHeaderTitle,
          formValue.subHeaderTraitName,
          formValue.subHeaderTraitValue
        ),
        description: this.formatNarrative(
          formValue.descriptionTitle,
          formValue.descriptionTraitName,
          formValue.descriptionTraitValue
        ),
        badge: this.formatNarrative(
          formValue.badgeTitle,
          formValue.badgeTraitName,
          formValue.badgeTraitValue
        ),

        // ✅ Correct name for section-level field
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
        this.data.target.patchValue({
          type: type,
          options: formValue,
          data:
            this.data.target.value.data ||
            this.formService.createInitialData(type).value,
        });
      } else {
        const options = {
          indentationLevel: formValue.indentationLevel,
          displayOrder: formValue.displayOrder,
          ...(formValue.displayOrder.includes('CHART') && {
            chart: {
              options: {
                position: formValue.chartPosition,
                indexAxis: formValue.chartIndexAxis,
                chartType: formValue.chartType,
                chartMaxAxis: formValue.chartMaxAxis,
                showValues: formValue.chartShowValues,
                indentationLevel: 0,
              },
            },
          }),
          ...(formValue.displayOrder.includes('TABLE') && {
            table: {
              options: {
                tableType: formValue.tableType,
                isHeaderVisible: formValue.isHeaderVisible,
                coloredColumn: formValue.coloredColumn,
                indentationLevel: 0,
              },
            },
          }),
          ...(formValue.displayOrder.includes('INDICATOR') && {
            indicator: {
              options: {
                unit: formValue.indicatorUnit,
                display: formValue.indicatorDisplay,
                indentationLevel: 0,
              },
            },
          }),
        };

        this.data.target.patchValue({
          type: type,
          options: options,
          data:
            this.data.target.value.data ||
            this.formService.createInitialData(type).value,
        });
      }
    }

    this.dialogRef.close(true);
  }

  private formatNarrative(
    title: string,
    traitName: string,
    traitValue?: string
  ): string {
    if (!title && !traitName) return '';
    return `$narrative(${title || ''},${traitName || ''}${
      traitValue ? `,${traitValue}` : ''
    })`;
  }
}
