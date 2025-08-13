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
          const datasetGroup = this.createDatasetForType(
            componentData.type,
            datasetItem
          );
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
      console.log('Added component to section');
    });
    console.log('=== Finished adding components ===');
  }

  private prepareComponentData(type: ComponentType, data: any): any {
    console.log('=== Preparing component data ===');
    console.log('Type:', type);
    console.log('Original data:', data);

    const dataCopy = { ...data };
    delete dataCopy.dataset;
    delete dataCopy.chips;

    // Handle narrative fields
    Object.keys(dataCopy).forEach((key) => {
      if (
        typeof dataCopy[key] === 'string' &&
        dataCopy[key].startsWith('$narrative(')
      ) {
        console.log(`Found narrative field ${key}:`, dataCopy[key]);
        // Keep the narrative string as is - it will be parsed in the dialog
      }
    });

    console.log('Prepared data:', dataCopy);
    return dataCopy;
  }

  private createDatasetForType(type: ComponentType, data: any): FormGroup {
    switch (type) {
      case 'CARD':
        return this.formService.createCardDataset(data);
      case 'INDICATOR':
        const indicatorDataset = this.formService.createIndicatorDataset();
        indicatorDataset.patchValue(data);
        return indicatorDataset;
      case 'CHART':
        const chartDataset = this.formService.createChartDataset();
        chartDataset.patchValue(data);
        return chartDataset;
      case 'TABLE':
        const tableRow = this.formService.createTableRow();
        tableRow.patchValue(data);
        return tableRow;
      case 'CHIP':
        const chipDataset = this.formService.createChipDataset();
        chipDataset.patchValue(data);
        return chipDataset;
      case 'PANEL':
        return this.formService.createPanelDataset(data);
      case 'PANEL_LAYOUT':
        return this.formService.createPanelLayoutDataset(data);
      case 'BAR_INDICATOR':
        const barIndicatorDataset =
          this.formService.createBarIndicatorDataset();
        barIndicatorDataset.patchValue(data);
        return barIndicatorDataset;
      case 'PROPERTY':
        const propertyDataset = this.formService.createPropertyDataset();
        propertyDataset.patchValue(data);
        return propertyDataset;
      case 'QUESTION':
        const questionDataset = this.formService.createQuestionDataset();
        questionDataset.patchValue(data);
        return questionDataset;
      case 'LIST':
        const listDataset = this.formService.createListDataset();
        listDataset.patchValue(data);
        return listDataset;
      case 'CHART_TABLE_INDICATOR':
        const chartTableDataset =
          this.formService.createChartTableIndicatorDataset();
        chartTableDataset.patchValue(data);
        return chartTableDataset;
      case 'IMAGE':
        const imageDataset = this.formService.createImageDataset();
        imageDataset.patchValue(data);
        return imageDataset;
      case 'RANGE':
        const rangeDataset = this.formService.createRangeComponentDataset();
        rangeDataset.patchValue(data);
        return rangeDataset;
      case 'STATIC_TABLE':
        const staticTableRow = this.formService.createTableRow();
        staticTableRow.patchValue(data);
        return staticTableRow;
      case 'GRADE_INDICATOR':
        const gradeIndicatorDataset =
          this.formService.createGradeIndicatorDataset();
        gradeIndicatorDataset.patchValue(data);
        return gradeIndicatorDataset;
      case 'STATIC_NOTE':
        const staticNoteDataset = this.formService.createStaticNoteDataset();
        staticNoteDataset.patchValue(data);
        return staticNoteDataset;
      default:
        const defaultDataset = this.formService.createPanelDataset(data);
        defaultDataset.patchValue(data);
        return defaultDataset;
    }
  }
}
