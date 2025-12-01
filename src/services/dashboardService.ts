// Serviço para calcular estatísticas do dashboard
import { customersService } from './customersService';
import { invoicesService } from './invoicesService';
import { workOrdersService } from './workOrdersService';
import { servicesService } from './servicesService';
import { DashboardStats, PeriodVariation, OverdueInvoice, MonthlyRevenue } from '../types/dashboard';
import { Invoice } from '../types/invoice';
import { Customer } from '../types/customer';
import { WorkOrder } from '../types/workOrder';

// Calcular estatísticas do dashboard
export const dashboardService = {
  // Obter estatísticas principais
  async getStats(): Promise<DashboardStats> {
    const [customersResult, invoicesResult, workOrdersResult] = await Promise.all([
      customersService.list(),
      invoicesService.list(),
      workOrdersService.list(),
    ]);

    const customers = customersResult || [];
    const invoices = invoicesResult || [];
    const workOrders = workOrdersResult || [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Clientes
    const activeClients = customers.filter(c => c.status === 'active');
    const inactiveClients = customers.filter(c => c.status === 'inactive');
    const newClientsThisMonth = customers.filter(c => {
      const createdAt = new Date(c.createdAt || '');
      return createdAt >= startOfMonth;
    }).length;
    const lostClientsThisMonth = customers.filter(c => {
      const updatedAt = new Date(c.updatedAt || '');
      return updatedAt >= startOfMonth && c.status === 'inactive';
    }).length;

    // Invoices
    const overdueInvoices = invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      return inv.status !== 'paid' && dueDate < now;
    });
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalBilledThisMonth = invoices
      .filter(inv => {
        const issueDate = new Date(inv.issueDate);
        return issueDate >= startOfMonth && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + inv.total, 0);
    const totalBilledThisYear = invoices
      .filter(inv => {
        const issueDate = new Date(inv.issueDate);
        return issueDate >= startOfYear && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    // Work Orders
    const workOrdersOpen = workOrders.filter(wo => wo.status === 'open').length;
    const workOrdersInProgress = workOrders.filter(wo => wo.status === 'in_progress').length;
    const workOrdersCompleted = workOrders.filter(wo => wo.status === 'completed').length;

    // Alertas (baseado em serviços com leituras fora do padrão)
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];
    const alertsCount = services.filter(s => {
      // Verificar se há leituras fora do padrão
      return s.readings?.some(r => {
        // Valores padrão aproximados (pode ser melhorado)
        const value = typeof r.value === 'string' ? parseFloat(r.value) : r.value;
        if (r.chemical.toLowerCase().includes('ph')) {
          return value < 7.2 || value > 7.6;
        }
        if (r.chemical.toLowerCase().includes('chlorine') || r.chemical.toLowerCase().includes('cloro')) {
          return value < 1 || value > 3;
        }
        return false;
      });
    }).length;

    return {
      totalActiveClients: activeClients.length,
      inactiveClients: inactiveClients.length,
      newClientsThisMonth,
      lostClientsThisMonth,
      overdueInvoices: overdueInvoices.length,
      overdueAmount,
      totalBilledThisMonth,
      totalBilledThisYear,
      workOrdersOpen,
      workOrdersInProgress,
      workOrdersCompleted,
      alertsCount,
    };
  },

  // Obter variações por período
  async getPeriodVariations(): Promise<PeriodVariation[]> {
    const customersResult = await customersService.list();
    const customers = customersResult || [];
    const activeClients = customers.filter(c => c.status === 'active').length;

    const now = new Date();
    const periods = [
      { days: 30, key: '30days' as const },
      { days: 90, key: '3months' as const },
      { days: 180, key: '6months' as const },
      { days: 365, key: '1year' as const },
    ];

    return periods.map(period => {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - period.days);
      
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - period.days);

      const currentPeriodActive = customers.filter(c => {
        const createdAt = new Date(c.createdAt || '');
        return c.status === 'active' && createdAt >= startDate;
      }).length;

      const previousPeriodActive = customers.filter(c => {
        const createdAt = new Date(c.createdAt || '');
        return c.status === 'active' && createdAt >= previousStartDate && createdAt < startDate;
      }).length;

      const variation = previousPeriodActive > 0
        ? ((currentPeriodActive - previousPeriodActive) / previousPeriodActive) * 100
        : currentPeriodActive > 0 ? 100 : 0;

      return {
        period: period.key,
        activeClients,
        variation: Math.abs(variation),
        trend: variation >= 0 ? 'up' : 'down',
      };
    });
  },

  // Obter invoices em atraso
  async getOverdueInvoices(): Promise<OverdueInvoice[]> {
    const invoicesResult = await invoicesService.list();
    const invoices = invoicesResult || [];

    const now = new Date();
    const overdue = invoices
      .filter(inv => {
        const dueDate = new Date(inv.dueDate);
        return inv.status !== 'paid' && dueDate < now;
      })
      .map(inv => {
        const dueDate = new Date(inv.dueDate);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientName: inv.customerName,
          amount: inv.total,
          dueDate: inv.dueDate,
          daysOverdue,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    return overdue;
  },

  // Obter receita mensal
  async getMonthlyRevenue(months: number = 12): Promise<MonthlyRevenue[]> {
    const invoicesResult = await invoicesService.list();
    const invoices = invoicesResult || [];

    const now = new Date();
    const monthsData: MonthlyRevenue[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthInvoices = invoices.filter(inv => {
        const issueDate = new Date(inv.issueDate);
        return issueDate >= monthStart && issueDate <= monthEnd && inv.status === 'paid';
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

      monthsData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
      });
    }

    return monthsData;
  },

  // Obter work orders para dashboard
  async getWorkOrdersForDashboard(limit: number = 10): Promise<WorkOrder[]> {
    const workOrdersResult = await workOrdersService.list();
    const workOrders = workOrdersResult || [];

    return workOrders
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  },

  // Obter alertas de parâmetros de água
  async getWaterAlerts(): Promise<any[]> {
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];
    const customersResult = await customersService.list();
    const customers = customersResult || [];

    const alerts: any[] = [];

    services.forEach(service => {
      const customer = customers.find(c => c.id === service.clientId);
      if (!customer || !service.readings) return;

      service.readings.forEach(reading => {
        const value = typeof reading.value === 'string' ? parseFloat(reading.value) : reading.value;
        let standard = '';
        let severity: 'low' | 'medium' | 'high' = 'low';

        if (reading.chemical.toLowerCase().includes('ph')) {
          standard = '7.2-7.6';
          if (value < 6.8 || value > 8.0) severity = 'high';
          else if (value < 7.0 || value > 7.8) severity = 'medium';
        } else if (reading.chemical.toLowerCase().includes('chlorine') || reading.chemical.toLowerCase().includes('cloro')) {
          standard = '1.0-3.0 ppm';
          if (value < 0.5 || value > 5.0) severity = 'high';
          else if (value < 0.8 || value > 4.0) severity = 'medium';
        } else {
          return; // Skip unknown parameters
        }

        if (severity !== 'low') {
          alerts.push({
            id: `${(service as any).id}-${reading.chemical}`,
            clientName: customer.name,
            parameter: reading.chemical,
            value,
            standard,
            severity,
            detectedAt: service.completedAt || (service as any).createdAt || '',
          });
        }
      });
    });

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  },

  // Obter performance de técnicos
  async getTechnicianPerformance(): Promise<any[]> {
    const servicesResult = await servicesService.list();
    const services = servicesResult.data || [];
    const invoicesResult = await invoicesService.list();
    const invoices = invoicesResult || [];

    const technicianMap = new Map<string, {
      name: string;
      completedServices: number;
      totalRating: number;
      ratingCount: number;
      onTimeCount: number;
      totalCount: number;
      revenue: number;
    }>();

    services.forEach(service => {
      const technician = (service as any).technician;
      if (!technician) return;

      const tech = technicianMap.get(technician) || {
        name: technician,
        completedServices: 0,
        totalRating: 0,
        ratingCount: 0,
        onTimeCount: 0,
        totalCount: 0,
        revenue: 0,
      };

      tech.completedServices++;
      tech.totalCount++;

      // Assumir que serviços completados são pontuais (pode ser melhorado)
      if (service.completedAt) {
        tech.onTimeCount++;
      }

      technicianMap.set(technician, tech);
    });

    // Adicionar receita por técnico
    invoices.forEach(invoice => {
      // Assumir que invoices estão associados a técnicos via serviços
      // Isso pode ser melhorado com uma relação mais direta
    });

    return Array.from(technicianMap.values()).map(tech => ({
      id: tech.name.toLowerCase().replace(/\s+/g, '-'),
      name: tech.name,
      completedServices: tech.completedServices,
      averageRating: tech.ratingCount > 0 ? tech.totalRating / tech.ratingCount : 4.5,
      onTimePercentage: tech.totalCount > 0 ? Math.round((tech.onTimeCount / tech.totalCount) * 100) : 100,
      totalRevenue: tech.revenue || 0,
    })).sort((a, b) => b.completedServices - a.completedServices);
  },
};

