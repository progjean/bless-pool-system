export interface ChemicalConsumptionByCustomer {
  customerId: string;
  customerName: string;
  totalConsumption: number;
  products: {
    productName: string;
    quantity: number;
    unit: string;
  }[];
}

export interface ChemicalConsumptionByTechnician {
  technicianId: string;
  technicianName: string;
  totalConsumption: number;
  servicesCount: number;
  products: {
    productName: string;
    quantity: number;
    unit: string;
  }[];
}

export interface MonthlyExpenses {
  month: string;
  year: number;
  totalAmount: number;
  purchasesCount: number;
  categories: {
    category: string;
    amount: number;
  }[];
}

export interface ServiceTimeStats {
  serviceType: string;
  averageTime: number;
  totalServices: number;
  minTime: number;
  maxTime: number;
}

export interface ServicesByTechnician {
  technicianId: string;
  technicianName: string;
  totalServices: number;
  completedServices: number;
  averageTime: number;
  totalHours: number;
}

export interface ChemicalHistory {
  customerId: string;
  customerName: string;
  readings: {
    date: string;
    readings: {
      name: string;
      value: number;
      unit: string;
      status: 'normal' | 'low' | 'high';
    }[];
  }[];
}

export interface MonthlyComparison {
  month: string;
  year: number;
  services: number;
  revenue: number;
  expenses: number;
  profit: number;
  customers: number;
}

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  technicianId?: string;
  productId?: string;
}

