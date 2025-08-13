import { inject, Injectable } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { ComponentType } from '../models/component-types';
import { NarrativeService } from './narrative.service';

// Interface to mark narrative fields
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
export class ReportBuilderFormService {
  constructor(public fb: FormBuilder) {}
  private narrativeService = inject(NarrativeService);

  // ==================== PUBLIC API ====================
  createReportForm(): FormGroup {
    return this.fb.group({
      competencies: this.fb.array([this.createCompetencyItem()]),
      sections: this.fb.array([this.createSection(1)]),
    });
  }

  addComponentToSectionDirectly(
    section: FormGroup,
    type: ComponentType,
    existingData?: any
  ): void {
    const components = this.getComponents(section);
    const newComponent = this.createComponent(type, existingData);
    components.push(newComponent);
  }

  getCompetency(form: FormGroup): FormArray {
    return form.get('competencies') as FormArray;
  }
  createCompetencyItem(): FormGroup {
    return this.fb.group({
      name: '',
      equation: '',
    });
  }

  addCompetency(form: FormGroup): void {
    const competency = this.getCompetency(form);
    competency.push(this.createCompetencyItem());
  }

  createSection(order: number): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      id: this.generateId(),
      header: '',
      subHeader: '',
      description: '',
      badge: '',
      order,
      components: this.fb.array([]),
      indicators: this.fb.group({
        label: '',
        color: '',
      }),
      chip: this.fb.group({
        label: '',
        color: '#000000',
        backgroundColor: '#ffffff',
      }),
      imageUrl: '',
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('subHeader')!);
    this.markAsNarrative(group.get('description')!);
    this.markAsNarrative(group.get('badge')!);
    this.markAsNarrative(group.get('indicators.label')!);
    this.markAsNarrative(group.get('chip.label')!);

    return group;
  }

  createSectionOptionsForm(sectionData: any): FormGroup {
    const header = this.narrativeService.parse(sectionData.header || '');
    const subHeader = this.narrativeService.parse(sectionData.subHeader || '');
    const description = this.narrativeService.parse(
      sectionData.description || ''
    );
    const badge = this.narrativeService.parse(sectionData.badge || '');

    const indicator = sectionData.indicator;
    const parsedIndicatorLabel = this.narrativeService.parse(
      indicator?.label || ''
    );

    const chip = sectionData.chip;
    const parsedChipLabel = this.narrativeService.parse(chip?.label || '');

    return this.fb.group({
      order: [sectionData.order || 0],
      header: [sectionData.header || ''],
      subHeader: [sectionData.subHeader || ''],
      description: [sectionData.description || ''],
      badge: [sectionData.badge || ''],
      imageUrl: [sectionData.imageUrl || ''],

      headerTitle: [header.title],
      headerTraitName: [header.traitName],
      headerTraitValue: [header.traitValue],

      subHeaderTitle: [subHeader.title],
      subHeaderTraitName: [subHeader.traitName],
      subHeaderTraitValue: [subHeader.traitValue],

      descriptionTitle: [description.title],
      descriptionTraitName: [description.traitName],
      descriptionTraitValue: [description.traitValue],

      badgeTitle: [badge.title],
      badgeTraitName: [badge.traitName],
      badgeTraitValue: [badge.traitValue],

      indicator: this.fb.group({
        label: [indicator?.label || ''],
        color: [indicator?.color || '#000000'],
        labelTitle: [parsedIndicatorLabel.title],
        labelTraitName: [parsedIndicatorLabel.traitName],
        labelTraitValue: [parsedIndicatorLabel.traitValue],
      }),

      chip: this.fb.group({
        label: [chip?.label || ''],
        labelTitle: [parsedChipLabel.title],
        labelTraitName: [parsedChipLabel.traitName],
        labelTraitValue: [parsedChipLabel.traitValue],
        color: [chip?.color || '#000000'],
        backgroundColor: [chip?.backgroundColor || '#ffffff'],
      }),
    });
  }

  createComponent(type: ComponentType, existingData?: any): FormGroup {
    const componentGroup = this.fb.group({
      type,
      data: this.createComponentData(type, existingData?.data),
      options: this.createComponentOptions(type, existingData?.options),
    });

    // Special handling for narrative fields in data
    if (existingData?.data) {
      const dataGroup = componentGroup.get('data') as FormGroup;
      Object.keys(existingData.data).forEach((key) => {
        const control = dataGroup.get(key);
        if (control) {
          // Only set the value if it's a narrative field or if the control is empty
          if (this.isNarrativeField(control)) {
            control.setValue(existingData.data[key]);
          } else if (!control.value) {
            control.setValue(existingData.data[key]);
          }
        }
      });
    }

    return componentGroup;
  }

  createComponentOptions(type: ComponentType, options: any = {}): FormGroup {
    const creators: Record<ComponentType, (opts: any) => FormGroup> = {
      CARD: (opts) => this.createCardOptions(opts),
      INDICATOR: (opts) => this.createIndicatorOptions(opts),
      CHART: (opts) => this.createChartOptions(opts),
      TABLE: (opts) => this.createTableOptions(opts),
      PROPERTY: (opts) => this.createPropertyOptions(opts),
      QUESTION: (opts) => this.createQuestionOptions(opts),
      LIST: (opts) => this.createListOptions(opts),
      PANEL: (opts) => this.createPanelOptions(opts),
      CHIP: (opts) => this.createChipOptions(opts),
      CHART_TABLE_INDICATOR: (opts) =>
        this.createChartTableIndicatorOptions(opts),
      BAR_INDICATOR: () => this.fb.group({}),
      WRAPPED_ITEMS: () => this.fb.group({}),
      IMAGE: () => this.fb.group({}),
      RANGE: () => this.fb.group({}),
      PDF_BREAK: () => this.fb.group({}),
      PANEL_LAYOUT: () => this.fb.group({}),
      STATIC_TABLE: (opts) => this.createStaticTableOptions(opts),
      GRADE_INDICATOR: () => this.fb.group({}),
      STATIC_NOTE: () => this.fb.group({}),
    };
    return creators[type](options);
  }
  private createStaticTableOptions(options: any = {}): FormGroup {
    return this.fb.group({
      staticTableNumOfRows: [options.staticTableNumOfRows ?? 0],
    });
  }
  createOptionsForm(type: ComponentType, options: any = {}): FormGroup {
    return this.getOptionsCreator(type)(options);
  }

  getSections(form: FormGroup): FormArray {
    return form.get('sections') as FormArray;
  }

  getComponents(section: FormGroup): FormArray {
    return section.get('components') as FormArray;
  }

  addSection(form: FormGroup): void {
    const sections = this.getSections(form);
    sections.push(this.createSection(sections.length + 1));
  }

  addComponentToSection(
    form: FormGroup,
    type: string,
    sectionIndex: number
  ): void {
    const sections = this.getSections(form);
    const components = this.getComponents(
      sections.at(sectionIndex) as FormGroup
    );
    components.push(this.createComponent(type as ComponentType));
  }

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
    const component = this.createComponent(type, existingComponentData);

    // Handle dataset initialization if it exists
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
  createNestedComponent(type: ComponentType): FormGroup {
    return this.fb.group({
      type,
      data: this.createComponentData(type),
      options: this.createComponentOptions(type),
    });
  }
  private createStaticNoteData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
      dataset: this.fb.array([this.createStaticNoteDataset()]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    return group;
  }

  private createGradeIndicatorData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createGradeIndicatorDataset()]),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createStaticTableData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
      headers: [this.narrativeService.format('', '')],
      dataset: this.fb.array([]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    this.markAsNarrative(group.get('headers')!);
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

  createChipData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: this.narrativeService.format('', ''),
      definition: this.narrativeService.format('', ''),
      dataset: this.fb.array([this.createChipDataset()]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    return group;
  }

  createPanelData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createPanelDataset()]),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createPanelLayoutData(existingData?: any): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([
        this.createPanelLayoutDataset(existingData?.dataset?.[0]),
      ]),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createBarIndicatorData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createBarIndicatorDataset()]),
      header: [''],
      definition: [''],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    return group;
  }

  createWrappedItemsData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.narrativeService.format('', ''),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('dataset')!);
    return group;
  }

  createPdfBreakData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([]),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createPropertyData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
      dataset: this.fb.array([this.createPropertyDataset()]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    return group;
  }

  private createQuestionData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
      dataset: this.fb.array([this.createQuestionDataset()]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    return group;
  }

  private createListData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
      chips: this.fb.array([this.createChipDataset()]),
      dataset: this.fb.array([this.createListDataset()]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    return group;
  }

  createChartTableIndicatorData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createChartTableIndicatorDataset()]),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createImageData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createImageDataset()]),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createRangeData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createRangeComponentDataset()]),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
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
  // ==================== COMPONENT BUILDERS ====================
  private createChartComponent(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      type: 'CHART',
      data: this.createChartData(),
      options: this.createChartOptions({}),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createTableComponent(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      type: 'TABLE',
      data: this.createTableData(),
      options: this.createTableOptions({}),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createIndicatorComponent(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      type: 'INDICATOR',
      data: this.createIndicatorData(),
      options: this.createIndicatorOptions({}),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  // ==================== OPTIONS CREATORS ====================
  private getOptionsCreator(type: ComponentType): (options: any) => FormGroup {
    const creators: Record<ComponentType, (options: any) => FormGroup> = {
      CARD: (opts) => this.createCardOptions(opts),
      INDICATOR: (opts) => this.createIndicatorOptions(opts),
      CHART: (opts) => this.createChartOptions(opts),
      TABLE: (opts) => this.createTableOptions(opts),
      PROPERTY: (opts) => this.createPropertyOptions(opts),
      QUESTION: (opts) => this.createQuestionOptions(opts),
      LIST: (opts) => this.createListOptions(opts),
      PANEL: (opts) => this.createPanelOptions(opts),
      CHIP: (opts) => this.createChipOptions(opts),
      CHART_TABLE_INDICATOR: (opts) =>
        this.createChartTableIndicatorOptions(opts),
      BAR_INDICATOR: () => this.fb.group({}),
      WRAPPED_ITEMS: () => this.fb.group({}),
      IMAGE: () => this.fb.group({}),
      RANGE: () => this.fb.group({}),
      PDF_BREAK: () => this.fb.group({}),
      PANEL_LAYOUT: () => this.fb.group({}),
      STATIC_TABLE: (opts) => this.createStaticTableOptions(opts),
      GRADE_INDICATOR: () => this.fb.group({}),
      STATIC_NOTE: () => this.fb.group({}),
    };
    return creators[type];
  }

  private createCardOptions(options: any): FormGroup {
    return this.fb.group({
      bodyType: [options.bodyType ?? 'STRING'],
    });
  }

  private createIndicatorOptions(options: any): FormGroup {
    return this.fb.group({
      indentationLevel: [options.indentationLevel ?? 0],
      unit: [options.unit ?? 'PERCENTAGE'],
      display: [options.display ?? 'CHIPS'],
    });
  }

  private createChartOptions(options: any): FormGroup {
    return this.fb.group({
      indentationLevel: [options.indentationLevel ?? 0],
      position: [options.position ?? 'CENTER'],
      indexAxis: [options.indexAxis ?? 'x'],
      chartType: [options.chartType ?? 'BAR'],
      chartMaxAxis: [options.chartMaxAxis ?? null],
      chartMinAxis: [options.chartMinAxis ?? null],
      showValues: [options.showValues ?? false],
      chartStepSize: [options.chartStepSize ?? null],
      chartShowChartPlugins: [options.chartShowChartPlugins ?? false],
    });
  }

  private createTableOptions(options: any): FormGroup {
    return this.fb.group({
      tableType: [options.tableType ?? 'VERTICAL'],
      isHeaderVisible: [options.isHeaderVisible ?? true],
      indentationLevel: [options.indentationLevel ?? 0],
      coloredColumn: [options.coloredColumn ?? null],
      isSecondaryTable: [options.isSecondaryTable ?? false],
    });
  }

  private createPropertyOptions(options: any): FormGroup {
    return this.fb.group({
      indentationLevel: [options.indentationLevel ?? 0],
      propertyType: [options.propertyType ?? 'PLAIN'],
      scroll: [options.scroll ?? false],
    });
  }

  private createQuestionOptions(options: any): FormGroup {
    return this.fb.group({
      questionType: [options.questionType ?? 'TEXT'],
      indentationLevel: [options.indentationLevel ?? 0],
    });
  }

  private createListOptions(options: any): FormGroup {
    return this.fb.group({
      indentationLevel: [options.indentationLevel ?? 0],
      bodyType: [options.bodyType ?? 'STRING'],
      listOrderType: [options.listOrderType ?? 'PLAIN'],
      hasSideBorder: [options.hasSideBorder ?? false],
      listColor: [options.listColor ?? '#000000'],
      listBackgroundColor: [options.listBackgroundColor ?? '#ffffff'],
      showBadge: [!!options.badge],
      badgeValue: [options.badge?.value ?? ''],
      badgeColor: [options.badge?.color ?? '#000000'],
      badgeBackgroundColor: [options.badge?.backgroundColor ?? '#ffffff'],
      showIndicator: [!!options.indicator],
      showBarIndicator: [!!options.barIndicator],
      showRange: [!!options.range],
    });
  }

  private createPanelOptions(options: any): FormGroup {
    return this.fb.group({
      bodyType: [options.bodyType ?? 'STRING'],
    });
  }

  private createChipOptions(options: any): FormGroup {
    return this.fb.group({
      indentationLevel: [options.indentationLevel ?? 0],
      listOrderType: [options.listOrderType ?? 'PLAIN'],
    });
  }

  private createChartTableIndicatorOptions(options: any): FormGroup {
    return this.fb.group({
      indentationLevel: [options.indentationLevel ?? 0],
      displayOrder: [
        options.displayOrder ?? ['CHART', 'TABLE', 'INDICATOR', 'WRAP'],
      ],
      chartPosition: [options.chart?.options?.position ?? 'CENTER'],
      chartIndexAxis: [options.chart?.options?.indexAxis ?? 'x'],
      chartType: [options.chart?.options?.chartType ?? 'BAR'],
      chartMaxAxis: [options.chart?.options?.chartMaxAxis ?? null],
      chartShowValues: [options.chart?.options?.showValues ?? false],
      tableType: [options.table?.options?.tableType ?? 'VERTICAL'],
      isHeaderVisible: [options.table?.options?.isHeaderVisible ?? true],
      coloredColumn: [options.table?.options?.coloredColumn ?? null],
      indicatorUnit: [options.indicator?.options?.unit ?? 'PERCENTAGE'],
      indicatorDisplay: [options.indicator?.options?.display ?? 'CHIPS'],
    });
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
    const componentForm = this.createComponent(type);
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
