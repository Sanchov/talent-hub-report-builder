// Component type constant
export const COMPONENT_TYPES = [
  'INDICATOR',
  'PROPERTY',
  'CHART',
  'TABLE',
  'LIST',
  'CHIP',
  'CHART_TABLE_INDICATOR',
  'QUESTION',
  'RANGE',
  'PDF_BREAK',
  'IMAGE',
  'BAR_INDICATOR',
  'PANEL',
  'PANEL_LAYOUT',
  'WRAPPED_ITEMS',
  'CARD',
  'STATIC_TABLE',
  'GRADE_INDICATOR',
  'STATIC_NOTE',
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

// Shared types
export type ComponentBodyType = 'STRING' | 'HTML';
export type ListComponentOrderType =
  | 'BULLET'
  | 'NUMERIC'
  | 'ALPHABET'
  | 'PLAIN';
export type ComponentPositionType = 'LEFT' | 'CENTER' | 'RIGHT';
export type ComponentAxisType = 'x' | 'y';
export type ChartComponentType =
  | 'BAR'
  | 'BUBBLE'
  | 'LINE'
  | 'PIE'
  | 'POLARAREA'
  | 'DOUGHNUT'
  | 'RADAR'
  | 'SCATTER';
export type TableComponentType = 'VERTICAL' | 'HORIZONTAL';
export type PropertyComponentType = 'PLAIN' | 'BADGE';
export type QuestionComponentType = 'SINGLE_CHOICE' | 'MULTI_CHOICES' | 'TEXT';
export type IndicatorComponentUnitType = 'PERCENTAGE' | 'ABSOLUTE';
export type IndicatorComponentDisplayType =
  | 'CHIPS'
  | 'BAR'
  | 'BALANCE'
  | 'BULLETS';

export type ChartTableIndicatorComponentDisplayOrderType =
  | 'CHART'
  | 'TABLE'
  | 'INDICATOR'
  | 'WRAP';
export type ComponentBorderType = 'NONE' | 'SOLID' | 'DASHED';

// Dataset interfaces
export type ChipComponentDatasetType = {
  text?: string;
  icon?: string;
  color: string;
  backgroundColor: string;
};

export type CardDatasetType = {
  header: string;
  percentage: string;
  iconUrl?: string;
  progress?: number;
  body: string;
};

export type PanelDatasetType = {
  header: string;
  body: string;
  explanations?: string[];
};

export type IndicatorComponentDatasetType = {
  datasetId: number;
  name: string;
  scoringRate?: string;
  valueFrom?: number;
  valueTo?: number;
  isSelected?: boolean;
  selectedValue?: number;
  backgroundColor: string;
  color: string;
};

export type BarIndicatorComponentDatasetType = {
  backgroundColor: string;
  label: string;
  value: number;
  total: number;
};

export type PanelLayoutDatasetType = {
  left: IComponent<'PANEL'> | IComponent<'CARD'>;
  right?: IComponent<'PANEL'> | IComponent<'CARD'>;
};

export interface ChartTableIndicatorComponentDatasetType {
  chart?: {
    type: 'CHART';
    data: {
      labels: string[];
      dataset: {
        data: number[];
        backgroundColor: string[];
      }[];
    };
    options: ChartComponentOptions;
  };
  table?: {
    type: 'TABLE';
    data: {
      headers: string[];
      dataset: TableComponentDatasetType[];
    };
    options: TableComponentOptions;
  };
  indicator?: {
    type: 'INDICATOR';
    options: IndicatorComponentOptions;
    data: {
      dataset: IndicatorComponentDatasetType[];
    };
  };
}

export interface ChartTableIndicatorComponentOptions {
  indentationLevel: number;
  displayOrder?: ChartTableIndicatorComponentDisplayOrderType[];
}

export type ListComponentDatasetType = {
  header?: string;
  definition?: string;
  chips?: ChipComponentDatasetType[];
  indicator?: IndicatorComponentResponse;
  barIndicator?: BarIndicatorComponentResponse;
  range?: RangeComponentResponse;
  body?: string;
  indentation?: number;
  badge?: {
    value: string;
    color: string;
    backgroundColor: string;
  };
  color?: string;
  backgroundColor?: string;
};

export type PropertyDatasetType = {
  key: string;
  value: string;
  color?: string;
};

export type QuestionComponentDatasetType = {
  question: string;
  answers?: {
    text: string;
    value?: string | number;
  }[];
  selectedValues?: (string | number)[];
  answerText?: string;
  isCorrect?: boolean;
};

export type TableComponentDatasetType = {
  [key: string]: any & {
    indentation?: number;
    color?: string;
  };
};

// === Component Options interfaces ===
export interface CardComponentOptions {
  bodyType?: ComponentBodyType;
}
export interface ChartTableIndicatorComponentOptions {
  indentationLevel: number;
  position?: ComponentPositionType;
  indexAxis?: ComponentAxisType;
  bodyType?: ComponentBodyType;
  border?: ComponentBorderType;
  scroll?: boolean;

  listOrderType?: ListComponentOrderType;
  chartType?: ChartComponentType;
  chartMaxAxis?: number;
  chartStepSize?: number;
  chartShowChartPlugins?: boolean;

  displayOrder?: ChartTableIndicatorComponentDisplayOrderType[];

  unit?: IndicatorComponentUnitType;
  display?: IndicatorComponentDisplayType;

  questionType?: QuestionComponentType;

  propertyType?: PropertyComponentType;

  tableType?: TableComponentType;
  isHeaderVisible?: boolean;

  hasSideBorder?: boolean;
  listColor?: string;
  listBackgroundColor?: string;
}

export interface IndicatorComponentOptions {
  indentationLevel: number;
  unit: IndicatorComponentUnitType;
  display: IndicatorComponentDisplayType;
}

export interface ChartComponentOptions {
  indentationLevel: number;
  position: ComponentPositionType;
  indexAxis?: ComponentAxisType;
  chartType: ChartComponentType;
  chartMaxAxis?: number;
  chartMinAxis?: number;
  showValues?: boolean;
  chartStepSize?: number;
  chartShowChartPlugins?: boolean;
}

export interface TableComponentOptions {
  tableType: TableComponentType;
  isHeaderVisible: boolean;
  indentationLevel: number;
  coloredColumn?: string;
  isSecondaryTable?: boolean;
}

export interface PropertyComponentOptions {
  indentationLevel: number;
  propertyType?: PropertyComponentType;
  scroll: boolean;
}

export interface QuestionComponentOptions {
  questionType: QuestionComponentType;
  indentationLevel: number;
}

export interface ListComponentOptions {
  indentationLevel: number;
  bodyType: ComponentBodyType;
  listOrderType: ListComponentOrderType;
  hasSideBorder?: boolean;
}

export interface PanelComponentOptions {
  bodyType?: ComponentBodyType;
}

// Empty options interfaces
export interface PdfBreakComponentOptions {}
export interface PanelLayoutComponentOptions {}
export interface BarIndicatorComponentOptions {}
export interface WrappedItemsComponentOptions {}
export interface ImageComponentOptions {}
export interface RangeComponentOptions {}
export interface ChartTableIndicatorComponentOptions {
  indentationLevel: number;
  displayOrder?: ChartTableIndicatorComponentDisplayOrderType[];
  chart?: {
    options: {
      position: ComponentPositionType;
      indexAxis: ComponentAxisType;
      chartType: ChartComponentType;
      chartMaxAxis?: number;
      showValues?: boolean;
    };
  };
  table?: {
    options: {
      tableType: TableComponentType;
      isHeaderVisible: boolean;
      coloredColumn?: string;
    };
  };
  indicator?: {
    options: {
      unit: IndicatorComponentUnitType;
      display: IndicatorComponentDisplayType;
    };
  };
}

// === Component Data Mapping ===
type ComponentData<T extends ComponentType> = T extends 'CARD'
  ? { dataset: CardDatasetType[] }
  : T extends 'INDICATOR'
  ? {
      header?: string;
      definition?: string;
      leftLabel?: string;
      rightLabel?: string;
      dataset: IndicatorComponentDatasetType[];
    }
  : T extends 'CHIP'
  ? { dataset: ChipComponentDatasetType[] }
  : T extends 'PANEL'
  ? { dataset: PanelDatasetType[] }
  : T extends 'PANEL_LAYOUT'
  ? { dataset: PanelLayoutDatasetType[] }
  : T extends 'BAR_INDICATOR'
  ? {
      header?: string;
      definition?: string;
      dataset: BarIndicatorComponentDatasetType[];
    }
  : T extends 'WRAPPED_ITEMS'
  ? { dataset: string[] }
  : T extends 'PDF_BREAK'
  ? { dataset: unknown[] }
  : T extends 'PROPERTY'
  ? { dataset: PropertyDatasetType[] }
  : T extends 'QUESTION'
  ? { dataset: QuestionComponentDatasetType[] }
  : T extends 'TABLE'
  ? { dataset: TableComponentDatasetType[] }
  : T extends 'LIST'
  ? { dataset: ListComponentDatasetType[] }
  : T extends 'CHART_TABLE_INDICATOR'
  ? { dataset: ChartTableIndicatorComponentDatasetType[] }
  : T extends 'IMAGE' | 'RANGE'
  ? { dataset: unknown[] }
  : any;

// === Component Options Mapping ===
type ComponentOptions<T extends ComponentType> = T extends 'CARD'
  ? CardComponentOptions
  : T extends 'INDICATOR'
  ? IndicatorComponentOptions
  : T extends 'CHART'
  ? ChartComponentOptions
  : T extends 'TABLE'
  ? TableComponentOptions
  : T extends 'PROPERTY'
  ? PropertyComponentOptions
  : T extends 'QUESTION'
  ? QuestionComponentOptions
  : T extends 'LIST'
  ? ListComponentOptions
  : T extends 'PANEL'
  ? PanelComponentOptions
  : T extends 'PDF_BREAK'
  ? PdfBreakComponentOptions
  : T extends 'PANEL_LAYOUT'
  ? PanelLayoutComponentOptions
  : T extends 'BAR_INDICATOR'
  ? BarIndicatorComponentOptions
  : T extends 'WRAPPED_ITEMS'
  ? WrappedItemsComponentOptions
  : T extends 'IMAGE'
  ? ImageComponentOptions
  : T extends 'RANGE'
  ? RangeComponentOptions
  : T extends 'CHART_TABLE_INDICATOR'
  ? ChartTableIndicatorComponentOptions
  : never;

// === Main Component Interface ===
export interface IComponent<T extends ComponentType = ComponentType> {
  type: T;
  data: ComponentData<T>;
  options: ComponentOptions<T>;
}

// === Section Interface ===
export interface ISection {
  id: string;
  order: string;
  components?: IComponent[];
}

// === Derived ComponentResponse Types ===
// These are purely for frontend convenience — they reuse existing option or dataset types
export interface PropertyComponentResponse extends PropertyComponentOptions {}

export interface ChartComponentResponse extends ChartComponentOptions {}
export interface TableComponentResponse extends TableComponentOptions {}
export interface IndicatorComponentResponse extends IndicatorComponentOptions {}
export interface BarIndicatorComponentResponse
  extends BarIndicatorComponentDatasetType {}
export interface RangeComponentResponse extends RangeComponentOptions {}
export interface ChartTableIndicatorComponentResponse
  extends ChartTableIndicatorComponentOptions {}
