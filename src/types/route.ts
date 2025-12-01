export interface Client {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  serviceType: 'regular' | 'deep' | 'repair';
  status: 'pending' | 'completed' | 'skipped';
  scheduledTime?: string;
  estimatedDuration?: number; // em minutos
}

export interface Route {
  id: string;
  date: string;
  technicianId?: string;
  clients: Client[];
  optimizedOrder?: number[]; // índices dos clientes na ordem otimizada
}

export interface ServiceData {
  clientId: string;
  checklist: ChecklistItem[];
  readings: ChemicalReading[];
  dosages: Dosage[];
  products: Product[];
  photos: string[];
  observations: string;
  completedAt?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  category: 'pool' | 'equipment' | 'safety' | 'other';
}

export interface ChemicalReading {
  id: string;
  chemical: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface Dosage {
  id: string;
  chemical: string;
  amount: number;
  unit: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface SkipReason {
  clientId: string;
  reason: string;
  timestamp: string;
  sentVia: 'email' | 'sms' | 'whatsapp';
}

