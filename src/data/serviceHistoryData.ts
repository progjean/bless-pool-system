import { ChemicalReading, Dosage } from '../types/route';

export interface ServiceHistory {
  id: string;
  clientId: string;
  serviceDate: string;
  readings: ChemicalReading[];
  dosages: Dosage[];
  completedAt: string;
}

// Mock de histórico de serviços - em produção viria de uma API
export const MOCK_SERVICE_HISTORY: ServiceHistory[] = [
  {
    id: 'hist1',
    clientId: '1',
    serviceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    readings: [
      { id: 'r1', chemical: 'Chlorine', value: 2.5, unit: 'ppm', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'r2', chemical: 'PH', value: 7.4, unit: '', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'r3', chemical: 'Alkalinity', value: 100, unit: 'ppm', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    dosages: [
      { id: 'd1', chemical: 'Liquid Chlorine', amount: 1.5, unit: 'gal', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist2',
    clientId: '1',
    serviceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    readings: [
      { id: 'r1', chemical: 'Chlorine', value: 2.0, unit: 'ppm', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'r2', chemical: 'PH', value: 7.5, unit: '', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    dosages: [
      { id: 'd1', chemical: 'Liquid Chlorine', amount: 1.0, unit: 'gal', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'd2', chemical: 'Muriatic Acid', amount: 500, unit: 'ml', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

