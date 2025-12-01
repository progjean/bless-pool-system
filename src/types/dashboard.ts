export interface DashboardStats {
  totalActiveClients: number;
  inactiveClients: number;
  newClientsThisMonth: number;
  lostClientsThisMonth: number;
  overdueInvoices: number;
  overdueAmount: number;
  totalBilledThisMonth: number;
  totalBilledThisYear: number;
  workOrdersOpen: number;
  workOrdersInProgress: number;
  workOrdersCompleted: number;
  alertsCount: number;
}

export interface PeriodVariation {
  period: '30days' | '3months' | '6months' | '1year';
  activeClients: number;
  variation: number; // porcentagem
  trend: 'up' | 'down' | 'stable';
}

export interface OverdueInvoice {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface WorkOrder {
  id: string;
  clientName: string;
  serviceType: string;
  status: 'open' | 'in_progress' | 'completed';
  assignedTo: string;
  createdAt: string;
  scheduledDate?: string;
}

export interface WaterParameterAlert {
  id: string;
  clientName: string;
  parameter: string;
  value: number;
  standard: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
}

export interface TechnicianPerformance {
  id: string;
  name: string;
  completedServices: number;
  averageRating: number;
  onTimePercentage: number;
  totalRevenue: number;
  clientsServed: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

