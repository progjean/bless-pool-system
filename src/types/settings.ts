export interface ReadingStandard {
  id: string;
  name: string;
  unit: string;
  minValue: number;
  maxValue: number;
  idealValue?: number;
  description?: string;
  category: 'chlorine' | 'ph' | 'alkalinity' | 'hardness' | 'other';
  readingType?: string; // Tipo de leitura (ex: pH, Chlorine)
  values?: string[]; // Valores pré-definidos (ex: ['6.5', '7.0', '7.2', ...])
  selectedValue?: string; // Valor padrão selecionado
  order?: number; // Ordem de exibição
}

export interface DosageStandard {
  id: string;
  name: string;
  unit: string;
  defaultAmount: number;
  description?: string;
  applicationNotes?: string;
  dosageType?: string; // Tipo de dosagem (ex: Liquid Chlorine, Muriatic Acid)
  costPerUOM?: number; // Custo por unidade de medida
  pricePerUOM?: number; // Preço por unidade de medida
  canIncludeWithService?: boolean; // Pode incluir com serviço
  values?: string[]; // Valores pré-definidos (ex: ['½', '1', '1½', '2', ...])
  selectedValue?: string; // Valor padrão selecionado
  order?: number; // Ordem de exibição
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'pool' | 'equipment' | 'safety' | 'chemical' | 'other';
  order: number;
  active: boolean;
}

export interface WorkOrderTypeSetting {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock?: number;
  category: string;
  internalPrice: number;
  supplier?: string;
  barcode?: string;
  active: boolean;
}

export interface Settings {
  readings: ReadingStandard[];
  dosages: DosageStandard[];
  checklist: ChecklistItem[];
  workOrderTypes: WorkOrderTypeSetting[];
  products: Product[];
}

