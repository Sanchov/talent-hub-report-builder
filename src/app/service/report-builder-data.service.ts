import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { ComponentType } from '../models/component-types';
import { NarrativeService } from './narrative.service';
import { ReportBuilderFormService } from './report-builder-form.service';

interface NarrativeField {
  rawValue: string;
  parsedValue?: {
    title?: string;
    traitName?: string;
    traitValue?: string;
  };
}

interface WithNarrativeMetadata {
  __isNarrative?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ReportBuilderDataService {
  fb = inject(FormBuilder);
  narrativeService = inject(NarrativeService);
  formService = inject(ReportBuilderFormService);

  // ==================== COMPONENT DATA CREATORS ====================
  createComponentData(
    type: ComponentType,
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const creators = {
      CARD: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createCardDataset(existingData?.dataset?.[0]),
          ]),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        return group;
      },

      INDICATOR: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createIndicatorDataset(existingData?.dataset?.[0]),
          ]),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
          leftLabel: [
            existingData?.leftLabel || this.narrativeService.format('', ''),
          ],
          rightLabel: [
            existingData?.rightLabel || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        this.markAsNarrative(group.get('leftLabel')!);
        this.markAsNarrative(group.get('rightLabel')!);
        return group;
      },

      CHART: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createChartDataset(existingData?.dataset?.[0]),
          ]),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
          labels: [
            existingData?.labels || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        this.markAsNarrative(group.get('labels')!);
        return group;
      },

      TABLE: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createTableRow(existingData?.dataset?.[0]),
          ]),
          chips: this.fb.array(
            existingData?.chips?.map((chip: any) =>
              this.createChipDataset(chip)
            ) || [this.createChipDataset()]
          ),
          headers: [
            existingData?.headers || this.narrativeService.format('', ''),
          ],
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('headers')!);
        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        return group;
      },

      CHIP: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createChipDataset(existingData?.dataset?.[0]),
          ]),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        return group;
      },

      PANEL: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createPanelDataset(existingData?.dataset?.[0]),
          ]),
        }) as FormGroup & WithNarrativeMetadata;
        return group;
      },

      PANEL_LAYOUT: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createPanelLayoutDataset(existingData?.dataset?.[0]),
          ]),
        }) as FormGroup & WithNarrativeMetadata;
        return group;
      },

      BAR_INDICATOR: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createBarIndicatorDataset(existingData?.dataset?.[0]),
          ]),
          header: [existingData?.header || ''],
          definition: [existingData?.definition || ''],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        return group;
      },
      WRAPPED_ITEMS: (existingData?: any) => {
        let datasetValue: string;

        if (typeof existingData?.dataset === 'string') {
          datasetValue = existingData.dataset;
        } else if (
          existingData?.dataset &&
          typeof existingData.dataset === 'object'
        ) {
          datasetValue = this.narrativeService.format(
            existingData.dataset.title || '',
            existingData.dataset.traitName || '',
            existingData.dataset.traitValue || ''
          );
        } else {
          // Default blank
          datasetValue = this.narrativeService.format('', '', '');
        }

        const group = this.fb.group({
          dataset: [datasetValue],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('dataset')!);

        return group;
      },

      PROPERTY: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createPropertyDataset(existingData?.dataset?.[0]),
          ]),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        return group;
      },

      QUESTION: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createQuestionDataset(existingData?.dataset?.[0]),
          ]),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        return group;
      },

      LIST: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createListDataset(existingData?.dataset?.[0]),
          ]),
          chips: this.fb.array(
            existingData?.chips?.map((chip: any) =>
              this.createChipDataset(chip)
            ) || [this.createChipDataset()]
          ),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        return group;
      },
      CHART_TABLE_INDICATOR: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createChartTableIndicatorDataset(existingData?.dataset?.[0]),
          ]),
        }) as FormGroup & WithNarrativeMetadata;

        return group;
      },

      IMAGE: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createImageDataset(existingData?.dataset?.[0]),
          ]),
        }) as FormGroup & WithNarrativeMetadata;
        return group;
      },

      RANGE: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createRangeComponentDataset(existingData?.dataset?.[0]),
          ]),
        }) as FormGroup & WithNarrativeMetadata;
        return group;
      },

      STATIC_TABLE: () => {
        const group = this.fb.group({
          dataset: this.fb.array([]),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
          headers: [
            existingData?.headers || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        this.markAsNarrative(group.get('headers')!);
        return group;
      },

      GRADE_INDICATOR: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createGradeIndicatorDataset(existingData?.dataset?.[0]),
          ]),
        }) as FormGroup & WithNarrativeMetadata;
        return group;
      },

      STATIC_NOTE: () => {
        const group = this.fb.group({
          dataset: this.fb.array([
            this.createStaticNoteDataset(existingData?.dataset?.[0]),
          ]),
          header: [
            existingData?.header || this.narrativeService.format('', ''),
          ],
          definition: [
            existingData?.definition || this.narrativeService.format('', ''),
          ],
        }) as FormGroup & WithNarrativeMetadata;

        this.markAsNarrative(group.get('header')!);
        this.markAsNarrative(group.get('definition')!);
        return group;
      },
    } as Record<ComponentType, () => FormGroup & WithNarrativeMetadata> & {
      default?: () => FormGroup & WithNarrativeMetadata;
    };

    creators.default = () => {
      const group = this.fb.group({
        dataset: this.fb.array([]),
      }) as FormGroup & WithNarrativeMetadata;
      return group;
    };

    return (creators[type] || creators.default)();
  }

  // ==================== DATASET CREATORS ====================
  createCardDataset(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [existingData?.header || this.narrativeService.format('', '')],
      percentage: [existingData?.percentage || ''],
      iconUrl: [existingData?.iconUrl || ''],
      progress: [existingData?.progress || 0],
      body: [existingData?.body || this.narrativeService.format('', '')],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('body')!);
    return group;
  }

  createImageDataset(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      url: [existingData?.url || ''],
      width: [existingData?.width || 0],
      height: [existingData?.height || 0],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createGradeIndicatorDataset(
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      type: [existingData?.type || 'HIGH'],
      label: [existingData?.label || this.narrativeService.format('', '')],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('label')!);
    return group;
  }

  createIndicatorDataset(
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      datasetId: [existingData?.datasetId || 0],
      name: [existingData?.name || this.narrativeService.format('', '')],
      scoringRate: [existingData?.scoringRate || ''],
      valueFrom: [existingData?.valueFrom || 0],
      valueTo: [existingData?.valueTo || 0],
      isSelected: [existingData?.isSelected || false],
      selectedValue: [existingData?.selectedValue || 0],
      backgroundColor: [existingData?.backgroundColor || '#ffffff'],
      color: [existingData?.color || '#000000'],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('name')!);
    return group;
  }

  createWarpedItemsDatasetItem(
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: [
        existingData?.dataset || this.narrativeService.format('', '', ''),
      ],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('dataset')!);
    return group;
  }

  createWarpedItemsDataset(
    existingData?: any[]
  ): FormArray & WithNarrativeMetadata {
    const array = this.fb.array([]) as FormArray & WithNarrativeMetadata;
    this.markAsNarrative(array);

    if (existingData?.length) {
      existingData.forEach((item: any) => {
        array.push(this.createWarpedItemsDatasetItem(item));
      });
    } else {
      array.push(this.createWarpedItemsDatasetItem());
    }

    return array;
  }

  createChartDataset(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      data: this.fb.array(existingData?.data || [0]),
      backgroundColor: this.fb.array(existingData?.backgroundColor || []),
      color: this.fb.array(existingData?.color || []),
      borderRadius: [existingData?.borderRadius || 0],
      barThickness: [existingData?.barThickness || 0],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createRangeComponentDataset(
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      from: [existingData?.from || 0],
      to: [existingData?.to || 0],
      color: [existingData?.color || 0],
      textColor: [existingData?.textColor || ''],

      rangeFrom: [existingData?.rangeFrom || 0],
      rangeTo: [existingData?.rangeTo || 0],
      rangeColor: [existingData?.rangeColor || ''],
      rangeTextColor: [existingData?.rangeTextColor || ''],

      score: [existingData?.score || 0],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createTableRow(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      Label: [existingData?.Label || ''],
      Score: [existingData?.Score || 0],
      color: [existingData?.color || ''],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createStaticNoteDataset(
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      label: [existingData?.label || this.narrativeService.format('', '')],
      value: [existingData?.value || this.narrativeService.format('', '')],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('label')!);
    this.markAsNarrative(group.get('value')!);
    return group;
  }

  createChipDataset(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      text: [existingData?.text || this.narrativeService.format('', '')],
      icon: [existingData?.icon || ''],
      color: [existingData?.color || '#000000'],
      backgroundColor: [existingData?.backgroundColor || '#ffffff'],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('text')!);
    return group;
  }

  createPanelDataset(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [existingData?.header || this.narrativeService.format('', '')],
      body: [existingData?.body || this.narrativeService.format('', '')],
      explanations: [
        existingData?.explanations || this.narrativeService.format('', ''),
      ],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('body')!);
    this.markAsNarrative(group.get('explanations')!);
    return group;
  }

  createDatasetForType(type: ComponentType, data: any): FormGroup {
    switch (type) {
      case 'PANEL':
        return this.createPanelDataset(data);
      case 'CARD':
        return this.createCardDataset(data);
      default:
        return this.fb.group(data);
    }
  }

  private createNestedComponentWithData(
    type: ComponentType,
    existingComponentData?: any,
    existingDataset?: any
  ): FormGroup {
    const component = this.formService.createComponent(
      type,
      existingComponentData
    );

    if (existingDataset && component.get('data.dataset')) {
      const datasetArray = component.get('data.dataset') as FormArray;
      datasetArray.clear();

      if (Array.isArray(existingDataset)) {
        existingDataset.forEach((datasetItem) => {
          datasetArray.push(this.createDatasetForType(type, datasetItem));
        });
      } else if (existingDataset) {
        datasetArray.push(this.createDatasetForType(type, existingDataset));
      }
    }

    return component;
  }

  createPanelLayoutDataset(
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      left: this.createNestedComponentWithData(
        'PANEL',
        existingData?.left,
        existingData?.left?.dataset?.[0]
      ),
      right: this.createNestedComponentWithData(
        'CARD',
        existingData?.right,
        existingData?.right?.dataset?.[0]
      ),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createBarIndicatorDataset(
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      backgroundColor: [existingData?.backgroundColor || '#ffffff'],
      label: [existingData?.label || ''],
      value: [existingData?.value || 0],
      total: [existingData?.total || 0],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('label')!);
    return group;
  }

  createPropertyDataset(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      key: [existingData?.key || ''],
      value: [existingData?.value || ''],
      color: [existingData?.color || '#000000'],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createQuestionDataset(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      question: [existingData?.question || ''],
      answers: this.fb.array(
        existingData?.answers?.map((answer: any) =>
          this.createAnswerGroup(answer)
        ) || [this.createAnswerGroup()]
      ),
      selectedValues: this.fb.array(existingData?.selectedValues || []),
      answerText: [existingData?.answerText || ''],
      isCorrect: [existingData?.isCorrect || false],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createAnswerGroup(existingData?: any): FormGroup {
    return this.fb.group({
      text: [existingData?.text || ''],
      value: [existingData?.value || ''],
    });
  }

  createListDataset(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [existingData?.header || this.narrativeService.format('', '')],
      definition: [
        existingData?.definition || this.narrativeService.format('', ''),
      ],
      chips: this.fb.array(
        existingData?.chips?.map((chip: any) =>
          this.createChipDataset(chip)
        ) || [this.createChipDataset()]
      ),
      indicator:
        existingData?.indicator || this.getComponentDefaults('INDICATOR').data,
      barIndicator:
        existingData?.barIndicator ||
        this.getComponentDefaults('BAR_INDICATOR').data,
      range: existingData?.range || this.getComponentDefaults('RANGE').data,
      body: [existingData?.body || ''],
      indentation: [existingData?.indentation || 0],
      badge: this.fb.group({
        value: [existingData?.badge?.value || ''],
        color: [existingData?.badge?.color || '#000000'],
        backgroundColor: [existingData?.badge?.backgroundColor || '#ffffff'],
      }),
      color: [existingData?.color || '#000000'],
      backgroundColor: [existingData?.backgroundColor || '#ffffff'],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    return group;
  }

  createChartTableIndicatorDataset(
    existingData?: any
  ): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      chart: existingData?.chart || this.createChartComponent(),
      table: existingData?.table || this.createTableComponent(),
      indicator: existingData?.indicator || this.createIndicatorComponent(),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createIndicatorData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createIndicatorDataset()]),
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
      leftLabel: [this.narrativeService.format('', '')],
      rightLabel: [this.narrativeService.format('', '')],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    this.markAsNarrative(group.get('leftLabel')!);
    this.markAsNarrative(group.get('rightLabel')!);
    return group;
  }

  createChartData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
      labels: [this.narrativeService.format('', '')],
      dataset: this.fb.array([this.createChartDataset()]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    this.markAsNarrative(group.get('labels')!);
    return group;
  }

  createTableData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      headers: [this.narrativeService.format('', '')],
      header: this.narrativeService.format('', ''),
      definition: this.narrativeService.format('', ''),
      dataset: this.fb.array([this.createTableRow()]),
      chips: this.fb.array([this.createChipDataset()]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('headers')!);
    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition'));
    return group;
  }

  // ==================== COMPONENT BUILDERS ====================
  private createChartComponent(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      type: 'CHART',
      data: this.createChartData(),
      options: this.formService.createChartOptions({}),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createTableComponent(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      type: 'TABLE',
      data: this.createTableData(),
      options: this.formService.createTableOptions({}),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createIndicatorComponent(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      type: 'INDICATOR',
      data: this.createIndicatorData(),
      options: this.formService.createIndicatorOptions({}),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  // ==================== HELPER METHODS ====================
  isNarrativeField(control: AbstractControl | null): boolean {
    return control
      ? !!(control as any & WithNarrativeMetadata).__isNarrative
      : false;
  }

  markAsNarrative(control: AbstractControl | null): void {
    if (control) {
      (control as any & WithNarrativeMetadata).__isNarrative = true;
    }
  }

  getNarrativeValue(control: AbstractControl | null): NarrativeField | null {
    if (!control || !this.isNarrativeField(control)) {
      return null;
    }

    const value = control.value;
    if (value === null || value === undefined) {
      return {
        rawValue: '',
        parsedValue: { title: '', traitName: '', traitValue: '' },
      };
    }

    return {
      rawValue: value,
      parsedValue: this.narrativeService.parse(String(value)),
    };
  }

  private getComponentDefaults(type: ComponentType): any {
    const componentForm = this.formService.createComponent(type);
    const dataForm = componentForm.get('data') as FormGroup;
    const optionsForm = componentForm.get('options') as FormGroup;

    const formToObject = (form: AbstractControl): any => {
      if (form instanceof FormGroup) {
        const obj: any = {};
        Object.keys(form.controls).forEach((key) => {
          obj[key] = formToObject(form.controls[key]);

          if (this.isNarrativeField(form.controls[key])) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              obj[key].__isNarrative = true;
            }
          }
        });
        return obj;
      } else if (form instanceof FormArray) {
        return form.controls.map((control) => {
          const value = formToObject(control);

          if (this.isNarrativeField(control)) {
            if (typeof value === 'object' && value !== null) {
              value.__isNarrative = true;
            }
          }
          return value;
        });
      } else {
        return form.value;
      }
    };

    return {
      type,
      data: formToObject(dataForm),
      options: formToObject(optionsForm),
    };
  }

  // ==================== UTILITIES ====================
  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
