import { Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { ReportBuilderFormService } from './report-builder-form.service';
import { ComponentType } from '../models/component-types';

@Injectable({
  providedIn: 'root',
})
export class JsonParserService {
  constructor(private formService: ReportBuilderFormService) {}

  parseJsonInput(jsonString: string): { data: any; error: string | null } {
    try {
      const parsedData = JSON.parse(jsonString);
      return { data: parsedData, error: null };
    } catch (error) {
      return {
        data: null,
        error: 'Invalid JSON format. Please check your input.',
      };
    }
  }

  applyJsonToForm(reportForm: FormGroup, jsonData: any): void {
    if (!jsonData) return;

    this.clearForm(reportForm);

    if (jsonData.competencies && Array.isArray(jsonData.competencies)) {
      this.addCompetencies(reportForm, jsonData.competencies);
    }

    if (jsonData.sections && Array.isArray(jsonData.sections)) {
      this.addSections(reportForm, jsonData.sections);
    }
  }

  private clearForm(reportForm: FormGroup): void {
    const sections = this.formService.getSections(reportForm);
    while (sections.length > 0) {
      sections.removeAt(0);
    }

    const competencies = this.formService.getCompetency(reportForm);
    competencies.clear();
  }

  private addCompetencies(reportForm: FormGroup, competencies: any[]): void {
    const competencyArray = this.formService.getCompetency(reportForm);
    competencies.forEach((competency) => {
      this.formService.addCompetency(reportForm);
      const lastIndex = competencyArray.length - 1;
      const competencyGroup = competencyArray.at(lastIndex) as FormGroup;

      const validCompetency = {
        name: competency.name || '',
        equation: competency.equation || '',
      };
      competencyGroup.patchValue(validCompetency);
    });
  }

  private addSections(reportForm: FormGroup, sectionsData: any[]): void {
    const sectionsArray = this.formService.getSections(reportForm);

    sectionsData.forEach((sectionData, index) => {
      this.formService.addSection(reportForm);
      const newSection = sectionsArray.at(index) as FormGroup;

      const sectionDataCopy = { ...sectionData };
      delete sectionDataCopy.components;

      newSection.patchValue({
        id: sectionDataCopy.id || '',
        header: sectionDataCopy.header || '',
        subHeader: sectionDataCopy.subHeader || '',
        description: sectionDataCopy.description || '',
        badge: sectionDataCopy.badge || '',
        order: sectionDataCopy.order || index + 1,
        indicators: sectionDataCopy.indicators || { label: '', color: '' },
        chip: sectionDataCopy.chip || {
          label: '',
          color: '#000000',
          backgroundColor: '#ffffff',
        },
        imageUrl: sectionDataCopy.imageUrl || '',
      });

      if (sectionData.components && Array.isArray(sectionData.components)) {
        this.addComponentsToSection(newSection, sectionData.components);
      }
    });
  }

  private addComponentsToSection(
    section: FormGroup,
    componentsData: any[]
  ): void {
    console.log('=== Adding components to section ===');
    const componentsArray = this.formService.getComponents(section);

    componentsData.forEach((componentData, index) => {
      console.log(`Processing component ${index}:`, componentData);

      if (!componentData.type) {
        console.log('Skipping component - no type defined');
        return;
      }

      // Handle CHART_TABLE_INDICATOR specially
      if (componentData.type === 'CHART_TABLE_INDICATOR') {
        this.addChartTableIndicatorComponent(componentsArray, componentData);
        return;
      }

      const newComponent = this.formService.createComponent(
        componentData.type as ComponentType,
        {
          type: componentData.type,
          data: this.prepareComponentData(
            componentData.type,
            componentData.data || {}
          ),
          options: componentData.options || {},
        }
      );

      console.log('Created new component:', newComponent.value);

      if (
        componentData.data?.dataset &&
        Array.isArray(componentData.data.dataset)
      ) {
        console.log('Processing dataset for component');
        const componentDataset = newComponent.get('data.dataset') as FormArray;
        componentDataset.clear();

        componentData.data.dataset.forEach((datasetItem: any) => {
          console.log('Adding dataset item:', datasetItem);
          const tempComponent = this.formService.createComponent(
            componentData.type as ComponentType,
            { data: { dataset: [datasetItem] } }
          );
          const datasetGroup = (
            tempComponent.get('data.dataset') as FormArray
          ).at(0) as FormGroup;
          componentDataset.push(datasetGroup);
        });
      }

      if (
        componentData.data?.chips &&
        Array.isArray(componentData.data.chips)
      ) {
        console.log('Processing chips for component');
        const chipsArray = newComponent.get('data.chips') as FormArray;
        chipsArray.clear();

        componentData.data.chips.forEach((chipItem: any) => {
          console.log('Adding chip item:', chipItem);
          const chipGroup = this.formService.createChipDataset();
          chipGroup.patchValue(chipItem);
          chipsArray.push(chipGroup);
        });
      }

      componentsArray.push(newComponent);
    });
  }

  private addChartTableIndicatorComponent(
    componentsArray: FormArray,
    componentData: any
  ): void {
    console.log('Processing CHART_TABLE_INDICATOR component:', componentData);

    // Create the base component
    const newComponent = this.formService.createComponent(
      'CHART_TABLE_INDICATOR' as ComponentType,
      {
        type: 'CHART_TABLE_INDICATOR',
        data: {},
        options: componentData.options || {},
      }
    );

    console.log(
      'Created base CHART_TABLE_INDICATOR component:',
      newComponent.value
    );

    // Handle the dataset array
    if (
      componentData.data?.dataset &&
      Array.isArray(componentData.data.dataset)
    ) {
      const componentDataset = newComponent.get('data.dataset') as FormArray;
      componentDataset.clear();

      componentData.data.dataset.forEach((datasetItem: any, index: number) => {
        console.log(`Processing dataset item ${index}:`, datasetItem);

        // Create a new chart-table-indicator dataset item
        const newDatasetItem =
          this.formService.createChartTableIndicatorDataset();

        // Populate chart data
        if (datasetItem.chart?.data) {
          this.populateChartData(
            newDatasetItem.get('chart.data') as FormGroup,
            datasetItem.chart.data
          );
        }

        // Populate table data
        if (datasetItem.table?.data) {
          this.populateTableData(
            newDatasetItem.get('table.data') as FormGroup,
            datasetItem.table.data
          );
        }

        // Populate indicator data
        if (datasetItem.indicator?.data) {
          this.populateIndicatorData(
            newDatasetItem.get('indicator.data') as FormGroup,
            datasetItem.indicator.data
          );
        }

        componentDataset.push(newDatasetItem);
      });
    }

    componentsArray.push(newComponent);
    console.log('Added CHART_TABLE_INDICATOR component to array');
  }

  private populateChartData(chartDataGroup: FormGroup, chartData: any): void {
    console.log('Populating chart data:', chartData);

    // Handle narrative fields
    ['header', 'definition', 'labels'].forEach((field) => {
      if (chartData[field] && chartDataGroup.get(field)) {
        chartDataGroup.get(field)!.setValue(chartData[field]);
      }
    });

    // Handle chart dataset
    if (chartData.dataset && Array.isArray(chartData.dataset)) {
      const chartDatasetArray = chartDataGroup.get('dataset') as FormArray;
      chartDatasetArray.clear();

      chartData.dataset.forEach((datasetItem: any) => {
        const chartDatasetItem = this.formService.createChartDataset();
        chartDatasetItem.patchValue(datasetItem);
        chartDatasetArray.push(chartDatasetItem);
      });
    }
  }

  private populateTableData(tableDataGroup: FormGroup, tableData: any): void {
    console.log('Populating table data:', tableData);

    // Handle narrative fields
    ['headers', 'header', 'definition'].forEach((field) => {
      if (tableData[field] && tableDataGroup.get(field)) {
        tableDataGroup.get(field)!.setValue(tableData[field]);
      }
    });

    // Handle table dataset (rows)
    if (tableData.dataset && Array.isArray(tableData.dataset)) {
      const tableDatasetArray = tableDataGroup.get('dataset') as FormArray;
      tableDatasetArray.clear();

      tableData.dataset.forEach((rowItem: any) => {
        const tableRow = this.formService.createTableRow();
        tableRow.patchValue(rowItem);
        tableDatasetArray.push(tableRow);
      });
    }

    // Handle chips
    if (tableData.chips && Array.isArray(tableData.chips)) {
      const chipsArray = tableDataGroup.get('chips') as FormArray;
      chipsArray.clear();

      tableData.chips.forEach((chipItem: any) => {
        const chipGroup = this.formService.createChipDataset();
        chipGroup.patchValue(chipItem);
        chipsArray.push(chipGroup);
      });
    }
  }

  private populateIndicatorData(
    indicatorDataGroup: FormGroup,
    indicatorData: any
  ): void {
    console.log('Populating indicator data:', indicatorData);

    // Handle narrative fields
    ['header', 'definition', 'leftLabel', 'rightLabel'].forEach((field) => {
      if (indicatorData[field] && indicatorDataGroup.get(field)) {
        indicatorDataGroup.get(field)!.setValue(indicatorData[field]);
      }
    });

    // Handle indicator dataset
    if (indicatorData.dataset && Array.isArray(indicatorData.dataset)) {
      const indicatorDatasetArray = indicatorDataGroup.get(
        'dataset'
      ) as FormArray;
      indicatorDatasetArray.clear();

      indicatorData.dataset.forEach((indicatorItem: any) => {
        const indicatorDatasetItem = this.formService.createIndicatorDataset();
        indicatorDatasetItem.patchValue(indicatorItem);
        indicatorDatasetArray.push(indicatorDatasetItem);
      });
    }
  }

  private prepareComponentData(type: ComponentType, data: any): any {
    const dataCopy = { ...data };

    // Only strip dataset/chips for the types that handle them specially
    if (type !== 'WRAPPED_ITEMS' && type !== 'CHART_TABLE_INDICATOR') {
      delete dataCopy.dataset;
      delete dataCopy.chips;
    }

    // Debug narratives
    Object.keys(dataCopy).forEach((key) => {
      if (
        typeof dataCopy[key] === 'string' &&
        dataCopy[key].startsWith('$narrative(')
      ) {
        console.log(`Found narrative field ${key}:`, dataCopy[key]);
      }
    });

    return dataCopy;
  }
}
