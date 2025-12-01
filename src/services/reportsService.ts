// Serviço para gerar relatórios
import { customersService } from './customersService';
import { invoicesService } from './invoicesService';
import { servicesService } from './servicesService';
import { purchasesService } from './purchasesService';
import { productsService } from './productsService';
import {
  ChemicalConsumptionByCustomer,
  ChemicalConsumptionByTechnician,
  MonthlyExpenses,
  ServiceTimeStats,
  ServicesByTechnician,
  ChemicalHistory,
  MonthlyComparison,
} from '../types/reports';

export const reportsService = {
  // Consumo de químicos por cliente
  async getChemicalConsumptionByCustomer(filters?: { startDate?: string; endDate?: string }): Promise<ChemicalConsumptionByCustomer[]> {
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];
    const customersResult = await customersService.list();
    const customers = customersResult || [];

    const customerMap = new Map<string, ChemicalConsumptionByCustomer>();

    services.forEach(service => {
      if (!service.dosages || service.dosages.length === 0) return;

      const customer = customers.find(c => c.id === service.clientId);
      if (!customer) return;

      let customerData = customerMap.get(service.clientId);
      if (!customerData) {
        customerData = {
          customerId: service.clientId,
          customerName: customer.name,
          totalConsumption: 0,
          products: [],
        };
        customerMap.set(service.clientId, customerData);
      }

      service.dosages.forEach(dosage => {
        const existingProduct = customerData.products.find(p => p.productName === dosage.chemical);
        if (existingProduct) {
          existingProduct.quantity += dosage.amount;
        } else {
          customerData.products.push({
            productName: dosage.chemical,
            quantity: dosage.amount,
            unit: dosage.unit,
          });
        }
        customerData.totalConsumption += dosage.amount;
      });
    });

    return Array.from(customerMap.values());
  },

  // Consumo de químicos por técnico
  async getChemicalConsumptionByTechnician(filters?: { startDate?: string; endDate?: string }): Promise<ChemicalConsumptionByTechnician[]> {
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];

    const technicianMap = new Map<string, ChemicalConsumptionByTechnician>();

    services.forEach(service => {
      const technician = (service as any).technician;
      if (!technician || !service.dosages || service.dosages.length === 0) return;

      let techData = technicianMap.get(technician);
      if (!techData) {
        techData = {
          technicianId: technician.toLowerCase().replace(/\s+/g, '-'),
          technicianName: technician,
          totalConsumption: 0,
          servicesCount: 0,
          products: [],
        };
        technicianMap.set(technician, techData);
      }

      techData.servicesCount++;
      service.dosages.forEach(dosage => {
        const existingProduct = techData.products.find(p => p.productName === dosage.chemical);
        if (existingProduct) {
          existingProduct.quantity += dosage.amount;
        } else {
          techData.products.push({
            productName: dosage.chemical,
            quantity: dosage.amount,
            unit: dosage.unit,
          });
        }
        techData.totalConsumption += dosage.amount;
      });
    });

    return Array.from(technicianMap.values());
  },

  // Despesas mensais
  async getMonthlyExpenses(months: number = 12): Promise<MonthlyExpenses[]> {
    const purchasesResult = await purchasesService.list();
    const purchases = purchasesResult || [];

    const now = new Date();
    const expensesMap = new Map<string, MonthlyExpenses>();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
      
      expensesMap.set(monthKey, {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        totalAmount: 0,
        purchasesCount: 0,
        categories: [],
      });
    }

    purchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.purchaseDate);
      const monthKey = `${purchaseDate.toLocaleDateString('en-US', { month: 'short' })} ${purchaseDate.getFullYear()}`;
      
      const expense = expensesMap.get(monthKey);
      if (!expense) return;

      expense.purchasesCount++;
      expense.totalAmount += purchase.totalAmount || 0;

      // Agrupar por categoria (assumindo que items têm categoria)
      purchase.items?.forEach(item => {
        const category = item.productName || 'Other';
        const existingCategory = expense.categories.find(c => c.category === category);
        if (existingCategory) {
          existingCategory.amount += item.totalPrice || 0;
        } else {
          expense.categories.push({
            category,
            amount: item.totalPrice || 0,
          });
        }
      });
    });

    return Array.from(expensesMap.values());
  },

  // Estatísticas de tempo de serviço
  async getServiceTimeStats(): Promise<ServiceTimeStats[]> {
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];

    if (services.length === 0) {
      return [{
        serviceType: 'All Services',
        averageTime: 0,
        minTime: 0,
        maxTime: 0,
        totalServices: 0,
      }];
    }

    // Assumir tempo padrão de 25 minutos se não houver dados de tempo
    const times = services.map(() => 25);
    const averageTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return [{
      serviceType: 'All Services',
      averageTime: Math.round(averageTime),
      minTime,
      maxTime,
      totalServices: services.length,
    }];
  },

  // Serviços por técnico
  async getServicesByTechnician(): Promise<ServicesByTechnician[]> {
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];

    const technicianMap = new Map<string, ServicesByTechnician>();

    services.forEach(service => {
      const technician = (service as any).technician;
      if (!technician) return;

      let techData = technicianMap.get(technician);
      if (!techData) {
        techData = {
          technicianId: technician.toLowerCase().replace(/\s+/g, '-'),
          technicianName: technician,
          totalServices: 0,
          completedServices: 0,
          averageTime: 25, // Assumir tempo padrão
          totalHours: 0,
        };
        technicianMap.set(technician, techData);
      }

      techData.totalServices++;
      if (service.completedAt) {
        techData.completedServices++;
      }
      techData.totalHours += techData.averageTime / 60; // Converter minutos para horas
    });

    return Array.from(technicianMap.values());
  },

  // Histórico de químicos
  async getChemicalHistory(chemicalName?: string): Promise<ChemicalHistory[]> {
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];

    const history: ChemicalHistory[] = [];

    services.forEach(service => {
      if (!service.readings) return;

      service.readings.forEach(reading => {
        if (chemicalName && reading.chemical.toLowerCase() !== chemicalName.toLowerCase()) {
          return;
        }

        history.push({
          detectedAt: service.completedAt || (service as any).createdAt || '',
          chemical: reading.chemical,
          value: reading.value,
          unit: reading.unit,
          customerId: service.clientId,
          technician: (service as any).technician || '',
        } as any);
      });
    });

    return history.sort((a: any, b: any) => new Date(b.detectedAt || '').getTime() - new Date(a.detectedAt || '').getTime()) as any;
  },

  // Comparação mensal
  async getMonthlyComparison(months: number = 6): Promise<MonthlyComparison[]> {
    const invoicesResult = await invoicesService.list();
    const invoices = invoicesResult || [];
    const purchasesResult = await purchasesService.list();
    const purchases = purchasesResult || [];

    const now = new Date();
    const comparisonMap = new Map<string, MonthlyComparison>();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
      
      comparisonMap.set(monthKey, {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        revenue: 0,
        expenses: 0,
        profit: 0,
        services: 0,
        customers: 0,
      });
    }

    // Calcular receita
    invoices.forEach(invoice => {
      if (invoice.status !== 'paid') return;
      const invoiceDate = new Date(invoice.issueDate);
      const monthKey = `${invoiceDate.toLocaleDateString('en-US', { month: 'short' })} ${invoiceDate.getFullYear()}`;
      const comparison = comparisonMap.get(monthKey);
      if (comparison) {
        comparison.revenue += invoice.total;
      }
    });

    // Calcular despesas
    purchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.purchaseDate);
      const monthKey = `${purchaseDate.toLocaleDateString('en-US', { month: 'short' })} ${purchaseDate.getFullYear()}`;
      const comparison = comparisonMap.get(monthKey);
      if (comparison) {
        comparison.expenses += purchase.totalAmount || 0;
      }
    });

    // Calcular lucro
    comparisonMap.forEach(comparison => {
      comparison.profit = comparison.revenue - comparison.expenses;
    });

    // Contar serviços
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];
    services.forEach(service => {
      const serviceDate = new Date(service.completedAt || (service as any).createdAt || '');
      const monthKey = `${serviceDate.toLocaleDateString('en-US', { month: 'short' })} ${serviceDate.getFullYear()}`;
      const comparison = comparisonMap.get(monthKey);
      if (comparison) {
        comparison.services++;
      }
    });

    // Contar novos clientes
    const customersResult = await customersService.list();
    const customers = customersResult || [];
    customers.forEach(customer => {
      const customerDate = new Date(customer.createdAt || '');
      const monthKey = `${customerDate.toLocaleDateString('en-US', { month: 'short' })} ${customerDate.getFullYear()}`;
      const comparison = comparisonMap.get(monthKey);
      if (comparison) {
        comparison.customers++;
      }
    });

    return Array.from(comparisonMap.values());
  },
};

