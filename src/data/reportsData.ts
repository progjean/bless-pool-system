import {
  ChemicalConsumptionByCustomer,
  ChemicalConsumptionByTechnician,
  MonthlyExpenses,
  ServiceTimeStats,
  ServicesByTechnician,
  ChemicalHistory,
  MonthlyComparison,
} from '../types/reports';

export const MOCK_CHEMICAL_CONSUMPTION_BY_CUSTOMER: ChemicalConsumptionByCustomer[] = [
  {
    customerId: '1',
    customerName: 'Residência Silva',
    totalConsumption: 15.5,
    products: [
      { productName: 'Cloro Granulado', quantity: 10, unit: 'kg' },
      { productName: 'Algicida', quantity: 5.5, unit: 'litros' },
    ],
  },
  {
    customerId: '2',
    customerName: 'Condomínio Vista Mar',
    totalConsumption: 25.0,
    products: [
      { productName: 'Cloro Líquido', quantity: 20, unit: 'litros' },
      { productName: 'Cloro Granulado', quantity: 5, unit: 'kg' },
    ],
  },
];

export const MOCK_CHEMICAL_CONSUMPTION_BY_TECHNICIAN: ChemicalConsumptionByTechnician[] = [
  {
    technicianId: 't1',
    technicianName: 'João Silva',
    totalConsumption: 45.5,
    servicesCount: 25,
    products: [
      { productName: 'Cloro Granulado', quantity: 30, unit: 'kg' },
      { productName: 'Algicida', quantity: 15.5, unit: 'litros' },
    ],
  },
  {
    technicianId: 't2',
    technicianName: 'Maria Santos',
    totalConsumption: 38.0,
    servicesCount: 20,
    products: [
      { productName: 'Cloro Líquido', quantity: 25, unit: 'litros' },
      { productName: 'Cloro Granulado', quantity: 13, unit: 'kg' },
    ],
  },
];

export const MOCK_MONTHLY_EXPENSES: MonthlyExpenses[] = [
  {
    month: 'Janeiro',
    year: 2024,
    totalAmount: 3500.00,
    purchasesCount: 8,
    categories: [
      { category: 'Químicos', amount: 2500.00 },
      { category: 'Equipamentos', amount: 1000.00 },
    ],
  },
  {
    month: 'Fevereiro',
    year: 2024,
    totalAmount: 4200.00,
    purchasesCount: 10,
    categories: [
      { category: 'Químicos', amount: 3200.00 },
      { category: 'Equipamentos', amount: 1000.00 },
    ],
  },
];

export const MOCK_SERVICE_TIME_STATS: ServiceTimeStats[] = [
  {
    serviceType: 'Limpeza Semanal',
    averageTime: 45,
    totalServices: 120,
    minTime: 30,
    maxTime: 60,
  },
  {
    serviceType: 'Limpeza Quinzenal',
    averageTime: 60,
    totalServices: 80,
    minTime: 45,
    maxTime: 90,
  },
];

export const MOCK_SERVICES_BY_TECHNICIAN: ServicesByTechnician[] = [
  {
    technicianId: 't1',
    technicianName: 'João Silva',
    totalServices: 45,
    completedServices: 42,
    averageTime: 48,
    totalHours: 33.6,
  },
  {
    technicianId: 't2',
    technicianName: 'Maria Santos',
    totalServices: 38,
    completedServices: 36,
    averageTime: 52,
    totalHours: 31.2,
  },
];

export const MOCK_CHEMICAL_HISTORY: ChemicalHistory[] = [
  {
    customerId: '1',
    customerName: 'Residência Silva',
    readings: [
      {
        date: '2024-02-01',
        readings: [
          { name: 'Chlorine', value: 2.0, unit: 'ppm', status: 'normal' },
          { name: 'PH', value: 7.4, unit: '', status: 'normal' },
          { name: 'Alkalinity', value: 100, unit: 'ppm', status: 'normal' },
        ],
      },
      {
        date: '2024-01-25',
        readings: [
          { name: 'Chlorine', value: 1.5, unit: 'ppm', status: 'low' },
          { name: 'PH', value: 7.2, unit: '', status: 'normal' },
          { name: 'Alkalinity', value: 90, unit: 'ppm', status: 'normal' },
        ],
      },
    ],
  },
];

export const MOCK_MONTHLY_COMPARISON: MonthlyComparison[] = [
  {
    month: 'Janeiro',
    year: 2024,
    services: 150,
    revenue: 22500.00,
    expenses: 3500.00,
    profit: 19000.00,
    customers: 45,
  },
  {
    month: 'Fevereiro',
    year: 2024,
    services: 165,
    revenue: 24750.00,
    expenses: 4200.00,
    profit: 20550.00,
    customers: 48,
  },
];

