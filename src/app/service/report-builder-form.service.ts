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

  // ==================== PRIVATE MAPPINGS ====================
  private getOptionsCreatorsMap(): Record<
    ComponentType,
    (opts: any) => FormGroup
  > {
    return {
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
  }

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
    return this.fb.group({
      type,
      data: this.fb.group(existingData?.data || {}),
      options: this.createComponentOptions(type, existingData?.options),
    });
  }

  createComponentOptions(type: ComponentType, options: any = {}): FormGroup {
    const creators = this.getOptionsCreatorsMap();
    if (!creators[type]) {
      throw new Error(`No options creator found for component type: ${type}`);
    }
    return creators[type](options);
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


  private createCardOptions(options: any): FormGroup {
    return this.fb.group({
      bodyType: [options.bodyType ?? 'STRING'],
    });
  }

  createIndicatorOptions(options: any): FormGroup {
    return this.fb.group({
      indentationLevel: [options.indentationLevel ?? 0],
      unit: [options.unit ?? 'PERCENTAGE'],
      display: [options.display ?? 'CHIPS'],
    });
  }

  createChartOptions(options: any): FormGroup {
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

  createTableOptions(options: any): FormGroup {
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

  private createStaticTableOptions(options: any = {}): FormGroup {
    return this.fb.group({
      staticTableNumOfRows: [options.staticTableNumOfRows ?? 0],
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

  private getOptionsCreator(type: ComponentType): (options: any) => FormGroup {
    const creators = this.getOptionsCreatorsMap();
    if (!creators[type]) {
      throw new Error(`No options creator found for component type: ${type}`);
    }
    return creators[type];
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
