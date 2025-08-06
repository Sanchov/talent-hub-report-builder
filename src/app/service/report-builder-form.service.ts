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
  constructor(private fb: FormBuilder) {}
  private narrativeService = inject(NarrativeService);

  // ==================== PUBLIC API ====================
  createReportForm(): FormGroup {
    return this.fb.group({
      sections: this.fb.array([this.createSection(1)]),
    });
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

  createComponent(type: ComponentType): FormGroup {
    return this.fb.group({
      type,
      data: this.createComponentData(type),
      options: this.createComponentOptions(type),
    });
  }

  createComponentOptions(type: ComponentType): FormGroup {
    const creators: Record<ComponentType, () => FormGroup> = {
      CARD: () => this.createCardOptions({}),
      INDICATOR: () => this.createIndicatorOptions({}),
      CHART: () => this.createChartOptions({}),
      TABLE: () => this.createTableOptions({}),
      PROPERTY: () => this.createPropertyOptions({}),
      QUESTION: () => this.createQuestionOptions({}),
      LIST: () => this.createListOptions({}),
      PANEL: () => this.createPanelOptions({}),
      CHIP: () => this.createChipOptions({}),
      CHART_TABLE_INDICATOR: () => this.createChartTableIndicatorOptions({}),
      BAR_INDICATOR: () => this.fb.group({}),
      WRAPPED_ITEMS: () => this.fb.group({}),
      IMAGE: () => this.fb.group({}),
      RANGE: () => this.fb.group({}),
      PDF_BREAK: () => this.fb.group({}),
      PANEL_LAYOUT: () => this.fb.group({}),
    };
    return creators[type]();
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
  createComponentData(type: ComponentType): FormGroup & WithNarrativeMetadata {
    const creators: Record<
      ComponentType,
      () => FormGroup & WithNarrativeMetadata
    > = {
      CARD: () => this.createCardData(),
      INDICATOR: () => this.createIndicatorData(),
      CHART: () => this.createChartData(),
      TABLE: () => this.createTableData(),
      CHIP: () => this.createChipData(),
      PANEL: () => this.createPanelData(),
      PANEL_LAYOUT: () => this.createPanelLayoutData(),
      BAR_INDICATOR: () => this.createBarIndicatorData(),
      WRAPPED_ITEMS: () => this.createWrappedItemsData(),
      PDF_BREAK: () => this.createPdfBreakData(),
      PROPERTY: () => this.createPropertyData(),
      QUESTION: () => this.createQuestionData(),
      LIST: () => this.createListData(),
      CHART_TABLE_INDICATOR: () => this.createChartTableIndicatorData(),
      IMAGE: () => this.createImageData(),
      RANGE: () => this.createRangeData(),
    };
    return creators[type]();
  }

  createCardData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createCardDataset()]),
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
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
      definition: '',
      dataset: this.fb.array([this.createTableRow()]),
      chips: this.fb.array([this.createChipDataset()]),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('headers')!);
    this.markAsNarrative(group.get('header')!);
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

  createPanelLayoutData(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      dataset: this.fb.array([this.createPanelLayoutDataset()]),
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

  private createChartTableIndicatorData(): FormGroup & WithNarrativeMetadata {
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
  createCardDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [this.narrativeService.format('', '')],
      percentage: [''],
      iconUrl: [''],
      progress: [0],
      body: [this.narrativeService.format('', '')],
    }) as FormGroup & WithNarrativeMetadata;
    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('body')!);
    return group;
  }

  createImageDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      url: [''],
      width: [0],
      height: [0],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createIndicatorDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      datasetId: [0],
      name: [this.narrativeService.format('', '')],
      scoringRate: [''],
      valueFrom: [0],
      valueTo: [0],
      isSelected: [false],
      selectedValue: [0],
      backgroundColor: ['#ffffff'],
      color: ['#000000'],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('name')!);
    return group;
  }

  createChartDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      data: this.fb.array([0]),
      backgroundColor: this.fb.array([]),
      color: this.fb.array([]),
      borderRadius: [0],
      barThickness: [0],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createRangeComponentDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      from: 0,
      to: 0,
      color: 0,
      textColor: '',

      rangeFrom: 0,
      rangeTo: 0,
      rangeColor: '',
      rangeTextColor: '',

      score: 0,
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createTableRow(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      Label: [''],
      Score: [0],
      color: [''],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  createChipDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      text: this.narrativeService.format('', ''),
      icon: [''],
      color: ['#000000'],
      backgroundColor: ['#ffffff'],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('text')!);
    return group;
  }

  createPanelDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: this.narrativeService.format('', ''),
      body: this.narrativeService.format('', ''),
      explanations: this.narrativeService.format('', ''),
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('body')!);
    this.markAsNarrative(group.get('explanations')!);
    return group;
  }

  private createPanelLayoutDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      left: this.getComponentDefaults('PANEL'),
      right: this.getComponentDefaults('CARD'),
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createBarIndicatorDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      backgroundColor: ['#ffffff'],
      label: [''],
      value: [0],
      total: [0],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('label')!);
    return group;
  }

  private createPropertyDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      key: [''],
      value: [''],
      color: ['#000000'],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createQuestionDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      question: [''],
      answers: this.fb.array([{ text: '', value: '' }]),
      selectedValues: this.fb.array([]),
      answerText: [''],
      isCorrect: [false],
    }) as FormGroup & WithNarrativeMetadata;
    return group;
  }

  private createListDataset(): FormGroup & WithNarrativeMetadata {
    const group = this.fb.group({
      header: [this.narrativeService.format('', '')],
      definition: [this.narrativeService.format('', '')],
      chips: this.fb.array([this.createChipDataset()]),
      indicator: this.getComponentDefaults('INDICATOR').data,
      barIndicator: this.getComponentDefaults('BAR_INDICATOR').data,
      range: this.getComponentDefaults('RANGE').data,
      body: [''],
      indentation: [0],
      badge: this.fb.group({
        value: [''],
        color: ['#000000'],
        backgroundColor: ['#ffffff'],
      }),
      color: ['#000000'],
      backgroundColor: ['#ffffff'],
    }) as FormGroup & WithNarrativeMetadata;

    this.markAsNarrative(group.get('header')!);
    this.markAsNarrative(group.get('definition')!);
    return group;
  }

  private createChartTableIndicatorDataset(): FormGroup &
    WithNarrativeMetadata {
    const group = this.fb.group({
      chart: this.createChartComponent(),
      table: this.createTableComponent(),
      indicator: this.createIndicatorComponent(),
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
    if (control && this.isNarrativeField(control)) {
      return {
        rawValue: control.value,
        parsedValue: this.narrativeService.parse(control.value),
      };
    }
    return null;
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
          // Preserve narrative metadata - only if the value is an object
          if (this.isNarrativeField(form.controls[key])) {
            // Added missing parenthesis here
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              obj[key].__isNarrative = true;
            }
          }
        });
        return obj;
      } else if (form instanceof FormArray) {
        return form.controls.map((control) => {
          const value = formToObject(control);
          // Preserve narrative metadata - only if the value is an object
          if (this.isNarrativeField(control)) {
            if (typeof value === 'object' && value !== null) {
              value.__isNarrative = true;
            }
          }
          return value;
        });
      } else {
        // For primitive values, just return the value
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
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
