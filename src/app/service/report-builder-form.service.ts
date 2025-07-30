import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ComponentType } from '../models/component-types';

@Injectable({
  providedIn: 'root',
})
export class ReportBuilderFormService {
  constructor(private fb: FormBuilder) {}

  createReportForm(): FormGroup {
    return this.fb.group({
      sections: this.fb.array([this.createSection(1)]),
    });
  }

  createSection(order: number): FormGroup {
    return this.fb.group({
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
    });
  }

  createSectionOptionsForm(sectionData: any): FormGroup {
    const header = this.parseNarrative(sectionData.header || '');
    const subHeader = this.parseNarrative(sectionData.subHeader || '');
    const description = this.parseNarrative(sectionData.description || '');
    const badge = this.parseNarrative(sectionData.badge || '');

    const indicator = sectionData.indicator;
    const parsedIndicatorLabel = this.parseNarrative(indicator?.label || '');

    const chip = sectionData.chip;
    const parsedChipLabel = this.parseNarrative(chip?.label || '');

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

      // Chip group
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
      data: this.createInitialData(type),
      options: this.createInitialOptions(type),
    });
  }

  createOptionsForm(type: ComponentType, options: any = {}): FormGroup {
    const optionCreators: Record<ComponentType, () => FormGroup> = {
      CARD: () => this.createCardOptions(options),
      INDICATOR: () => this.createIndicatorOptions(options),
      CHART: () => this.createChartOptions(options),
      TABLE: () => this.createTableOptions(options),
      PROPERTY: () => this.createPropertyOptions(options),
      QUESTION: () => this.createQuestionOptions(options),
      LIST: () => this.createListOptions(options),
      PANEL: () => this.createPanelOptions(options),
      CHIP: () => this.createChipOptions(options),
      CHART_TABLE_INDICATOR: () =>
        this.createChartTableIndicatorOptions(options),
      BAR_INDICATOR: () => this.fb.group({}),
      WRAPPED_ITEMS: () => this.fb.group({}),
      IMAGE: () => this.fb.group({}),
      RANGE: () => this.fb.group({}),
      PDF_BREAK: () => this.fb.group({}),
      PANEL_LAYOUT: () => this.fb.group({}),
    };

    return optionCreators[type]();
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

  createChartTableIndicatorDatasetGroup(): FormGroup {
    return this.fb.group({
      chart: this.createChartDatasetGroup(),
      table: this.createTableDatasetGroup(),
      indicator: this.createIndicatorDatasetGroup(),
    });
  }

  createInitialData(type: ComponentType): FormGroup {
    if (type === 'CHART_TABLE_INDICATOR') {
      return this.fb.group({
        dataset: this.fb.array([this.createChartTableIndicatorDatasetGroup()]),
      });
    }

    return this.fb.group({
      dataset: this.fb.array([]),
    });
  }

  private createInitialOptions(type: ComponentType): FormGroup {
    return this.createOptionsForm(type);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
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

  private createChartDatasetGroup(): FormGroup {
    return this.fb.group({
      type: ['CHART'],
      data: this.fb.group({
        labels: this.fb.array([]),
        dataset: this.fb.array([
          this.fb.group({
            data: this.fb.array([]),
            backgroundColor: this.fb.array([]),
          }),
        ]),
      }),
      options: this.createChartOptions({}),
    });
  }
  private parseNarrative(narrative: string): {
    title: string;
    traitName: string;
    traitValue?: string;
  } {
    if (
      !narrative ||
      !narrative.startsWith('$narrative(') ||
      !narrative.endsWith(')')
    ) {
      return { title: '', traitName: '', traitValue: '' };
    }

    const content = narrative.substring(11, narrative.length - 1);
    const parts = content.split(',');

    return {
      title: parts[0] || '',
      traitName: parts[1] || '',
      traitValue: parts[2] || undefined,
    };
  }

  private createTableDatasetGroup(): FormGroup {
    return this.fb.group({
      type: ['TABLE'],
      data: this.fb.group({
        headers: this.fb.array([]),
        dataset: this.fb.array([]),
      }),
      options: this.createTableOptions({}),
    });
  }

  private createIndicatorDatasetGroup(): FormGroup {
    return this.fb.group({
      type: ['INDICATOR'],
      options: this.createIndicatorOptions({}),
      data: this.fb.group({
        dataset: this.fb.array([]),
      }),
    });
  }
}
