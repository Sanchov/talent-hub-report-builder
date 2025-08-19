import { inject, Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { ReportBuilderFormService } from './report-builder-form.service';
import { ComponentType } from '../models/component-types';
import { ReportBuilderDataService } from './report-builder-data.service';

@Injectable({
  providedIn: 'root',
})
export class JsonParserService {
  formService = inject(ReportBuilderFormService);
  databuilderForm = inject(ReportBuilderDataService);
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
    if (!jsonData || !reportForm) return;

    try {
      this.clearForm(reportForm);

      if (jsonData.competencies && Array.isArray(jsonData.competencies)) {
        this.addCompetencies(reportForm, jsonData.competencies);
      }

      if (jsonData.sections && Array.isArray(jsonData.sections)) {
        this.addSections(reportForm, jsonData.sections);
      }
    } catch (error) {
      console.error('Error applying JSON to form:', error);
    }
  }

  private clearForm(reportForm: FormGroup): void {
    try {
      const sections = this.formService.getSections(reportForm);
      while (sections.length > 0) {
        sections.removeAt(0);
      }

      const competencies = this.formService.getCompetency(reportForm);
      competencies.clear();
    } catch (error) {
      console.error('Error clearing form:', error);
    }
  }

  private addCompetencies(reportForm: FormGroup, competencies: any[]): void {
    if (!competencies || !reportForm) return;

    try {
      const competencyArray = this.formService.getCompetency(reportForm);
      competencies.forEach((competency) => {
        try {
          if (!competency) return;

          this.formService.addCompetency(reportForm);
          const lastIndex = competencyArray.length - 1;
          const competencyGroup = competencyArray.at(lastIndex) as FormGroup;

          const validCompetency = {
            name: competency.name || '',
            equation: competency.equation || '',
          };
          competencyGroup.patchValue(validCompetency);
        } catch (error) {
          console.error('Error adding competency:', competency, error);
        }
      });
    } catch (error) {
      console.error('Error processing competencies:', error);
    }
  }

  private addSections(reportForm: FormGroup, sectionsData: any[]): void {
    if (!sectionsData || !reportForm) return;

    try {
      const sectionsArray = this.formService.getSections(reportForm);

      sectionsData.forEach((sectionData, index) => {
        try {
          if (!sectionData) return;

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
        } catch (error) {
          console.error('Error adding section:', sectionData, error);
        }
      });
    } catch (error) {
      console.error('Error processing sections:', error);
    }
  }

  private addComponentsToSection(
    section: FormGroup,
    componentsData: any[]
  ): void {
    if (!componentsData || !section) return;

    try {
      const componentsArray = this.formService.getComponents(section);

      componentsData.forEach((componentData, index) => {
        try {
          if (!componentData || !componentData.type) {
            console.log('Skipping invalid component - no type defined');
            return;
          }

          // Handle CHART_TABLE_INDICATOR specially
          if (componentData.type === 'CHART_TABLE_INDICATOR') {
            this.addChartTableIndicatorComponent(
              componentsArray,
              componentData
            );
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

          if (
            componentData.data?.dataset &&
            Array.isArray(componentData.data.dataset)
          ) {
            const componentDataset = newComponent.get(
              'data.dataset'
            ) as FormArray;
            componentDataset.clear();

            componentData.data.dataset.forEach((datasetItem: any) => {
              try {
                if (!datasetItem) return;
                const tempComponent = this.formService.createComponent(
                  componentData.type as ComponentType,
                  { data: { dataset: [datasetItem] } }
                );
                const datasetGroup = (
                  tempComponent.get('data.dataset') as FormArray
                ).at(0) as FormGroup;
                componentDataset.push(datasetGroup);
              } catch (error) {
                console.error('Error adding dataset item:', datasetItem, error);
              }
            });
          }

          if (
            componentData.data?.chips &&
            Array.isArray(componentData.data.chips)
          ) {
            const chipsArray = newComponent.get('data.chips') as FormArray;
            chipsArray.clear();

              componentData.data.chips.forEach((chipItem: any) => {
                try {
                if (!chipItem) return;
                const chipGroup = this.databuilderForm.createChipDataset();
                chipGroup.patchValue(chipItem);
                chipsArray.push(chipGroup);
              } catch (error) {
                console.error('Error adding chip item:', chipItem, error);
              }
            });
          }

          componentsArray.push(newComponent);
        } catch (error) {
          console.error('Error adding component:', componentData, error);
        }
      });
    } catch (error) {
      console.error('Error processing components:', error);
    }
  }

  private addChartTableIndicatorComponent(
    componentsArray: FormArray,
    componentData: any
  ): void {
    if (!componentData || !componentsArray) return;

    try {
      const newComponent = this.formService.createComponent(
        'CHART_TABLE_INDICATOR' as ComponentType,
        {
          type: 'CHART_TABLE_INDICATOR',
          data: {},
          options: componentData.options || {},
        }
      );

      if (
        componentData.data?.dataset &&
        Array.isArray(componentData.data.dataset)
      ) {
        const componentDataset = newComponent.get('data.dataset') as FormArray;
        componentDataset.clear();

        componentData.data.dataset.forEach(
          (datasetItem: any, index: number) => {
            try {
              if (!datasetItem) return;

              const newDatasetItem =
                this.databuilderForm.createChartTableIndicatorDataset();

              if (datasetItem.chart?.data) {
                this.populateChartData(
                  newDatasetItem.get('chart.data') as FormGroup,
                  datasetItem.chart.data
                );
              }

              if (datasetItem.table?.data) {
                this.populateTableData(
                  newDatasetItem.get('table.data') as FormGroup,
                  datasetItem.table.data
                );
              }

              if (datasetItem.indicator?.data) {
                this.populateIndicatorData(
                  newDatasetItem.get('indicator.data') as FormGroup,
                  datasetItem.indicator.data
                );
              }

              componentDataset.push(newDatasetItem);
            } catch (error) {
              console.error('Error adding dataset item:', datasetItem, error);
            }
          }
        );
      }

      componentsArray.push(newComponent);
    } catch (error) {
      console.error('Error adding chart-table-indicator component:', error);
    }
  }

  private populateChartData(chartDataGroup: FormGroup, chartData: any): void {
    if (!chartData || !chartDataGroup) return;

    try {
      ['header', 'definition', 'labels'].forEach((field) => {
        if (chartData[field] && chartDataGroup.get(field)) {
          chartDataGroup.get(field)!.setValue(chartData[field]);
        }
      });

      if (chartData.dataset && Array.isArray(chartData.dataset)) {
        const chartDatasetArray = chartDataGroup.get('dataset') as FormArray;
        chartDatasetArray.clear();

        chartData.dataset.forEach((datasetItem: any) => {
          try {
            if (!datasetItem) return;
            const chartDatasetItem = this.databuilderForm.createChartDataset();
            chartDatasetItem.patchValue(datasetItem);
            chartDatasetArray.push(chartDatasetItem);
          } catch (error) {
            console.error(
              'Error adding chart dataset item:',
              datasetItem,
              error
            );
          }
        });
      }
    } catch (error) {
      console.error('Error populating chart data:', error);
    }
  }

  private populateTableData(tableDataGroup: FormGroup, tableData: any): void {
    if (!tableData || !tableDataGroup) return;

    try {
      ['headers', 'header', 'definition'].forEach((field) => {
        if (tableData[field] && tableDataGroup.get(field)) {
          tableDataGroup.get(field)!.setValue(tableData[field]);
        }
      });

      if (tableData.dataset && Array.isArray(tableData.dataset)) {
        const tableDatasetArray = tableDataGroup.get('dataset') as FormArray;
        tableDatasetArray.clear();

        tableData.dataset.forEach((rowItem: any) => {
          try {
            if (!rowItem) return;
            const tableRow = this.databuilderForm.createTableRow();
            tableRow.patchValue(rowItem);
            tableDatasetArray.push(tableRow);
          } catch (error) {
            console.error('Error adding table row:', rowItem, error);
          }
        });
      }

      if (tableData.chips && Array.isArray(tableData.chips)) {
        const chipsArray = tableDataGroup.get('chips') as FormArray;
        chipsArray.clear();

        tableData.chips.forEach((chipItem: any) => {
          try {
            if (!chipItem) return;
            const chipGroup = this.databuilderForm.createChipDataset();
            chipGroup.patchValue(chipItem);
            chipsArray.push(chipGroup);
          } catch (error) {
            console.error('Error adding chip item:', chipItem, error);
          }
        });
      }
    } catch (error) {
      console.error('Error populating table data:', error);
    }
  }

  private populateIndicatorData(
    indicatorDataGroup: FormGroup,
    indicatorData: any
  ): void {
    if (!indicatorData || !indicatorDataGroup) return;

    try {
      ['header', 'definition', 'leftLabel', 'rightLabel'].forEach((field) => {
        if (indicatorData[field] && indicatorDataGroup.get(field)) {
          indicatorDataGroup.get(field)!.setValue(indicatorData[field]);
        }
      });

      if (indicatorData.dataset && Array.isArray(indicatorData.dataset)) {
        const indicatorDatasetArray = indicatorDataGroup.get(
          'dataset'
        ) as FormArray;
        indicatorDatasetArray.clear();

        indicatorData.dataset.forEach((indicatorItem: any) => {
          try {
            if (!indicatorItem) return;
            const indicatorDatasetItem =
              this.databuilderForm.createIndicatorDataset();
            indicatorDatasetItem.patchValue(indicatorItem);
            indicatorDatasetArray.push(indicatorDatasetItem);
          } catch (error) {
            console.error('Error adding indicator item:', indicatorItem, error);
          }
        });
      }
    } catch (error) {
      console.error('Error populating indicator data:', error);
    }
  }

  generateJsonFromForm(reportForm: FormGroup): string {
    if (!reportForm) return '';
    return JSON.stringify(reportForm.value, null, 2);
  }

  private prepareComponentData(type: ComponentType, data: any): any {
    try {
      const dataCopy = { ...data };

      if (type !== 'WRAPPED_ITEMS' && type !== 'CHART_TABLE_INDICATOR') {
        delete dataCopy.dataset;
        delete dataCopy.chips;
      }

      Object.keys(dataCopy).forEach((key) => {
        if (
          typeof dataCopy[key] === 'string' &&
          dataCopy[key].startsWith('$narrative(')
        ) {
          console.log(`Found narrative field ${key}:`, dataCopy[key]);
        }
      });

      return dataCopy;
    } catch (error) {
      console.error('Error preparing component data:', error);
      return {};
    }
  }
}
