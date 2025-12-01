import { DashboardStats, PeriodVariation, OverdueInvoice, WorkOrder, WaterParameterAlert, TechnicianPerformance, MonthlyRevenue } from '../types/dashboard';

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalActiveClients: 245,
  inactiveClients: 32,
  newClientsThisMonth: 18,
  lostClientsThisMonth: 5,
  overdueInvoices: 12,
  overdueAmount: 45230.50,
  totalBilledThisMonth: 187450.75,
  totalBilledThisYear: 2156780.25,
  workOrdersOpen: 8,
  workOrdersInProgress: 15,
  workOrdersCompleted: 142,
  alertsCount: 7,
};

export const MOCK_PERIOD_VARIATIONS: PeriodVariation[] = [
  { period: '30days', activeClients: 245, variation: 5.2, trend: 'up' },
  { period: '3months', activeClients: 238, variation: 8.7, trend: 'up' },
  { period: '6months', activeClients: 225, variation: 12.3, trend: 'up' },
  { period: '1year', activeClients: 198, variation: 23.7, trend: 'up' },
];

export const MOCK_OVERDUE_INVOICES: OverdueInvoice[] = [
  { id: '1', clientName: 'Residência Silva', amount: 450.00, dueDate: '2024-01-15', daysOverdue: 20 },
  { id: '2', clientName: 'Condomínio Vista Mar', amount: 1200.00, dueDate: '2024-01-20', daysOverdue: 15 },
  { id: '3', clientName: 'Hotel Paradise', amount: 3500.00, dueDate: '2024-01-10', daysOverdue: 25 },
  { id: '4', clientName: 'Casa da Praia', amount: 280.00, dueDate: '2024-01-25', daysOverdue: 10 },
];

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  { id: 'wo1', clientName: 'Residência Silva', serviceType: 'Regular', status: 'open', assignedTo: 'João Silva', createdAt: '2024-02-01', scheduledDate: '2024-02-05' },
  { id: 'wo2', clientName: 'Condomínio Vista Mar', serviceType: 'Deep Clean', status: 'in_progress', assignedTo: 'Maria Santos', createdAt: '2024-01-28', scheduledDate: '2024-02-03' },
  { id: 'wo3', clientName: 'Hotel Paradise', serviceType: 'Repair', status: 'completed', assignedTo: 'Pedro Costa', createdAt: '2024-01-25', scheduledDate: '2024-01-30' },
];

export const MOCK_WATER_ALERTS: WaterParameterAlert[] = [
  { id: 'a1', clientName: 'Residência Silva', parameter: 'Cloro Livre', value: 0.5, standard: '1-3 ppm', severity: 'high', detectedAt: '2024-02-01T10:30:00' },
  { id: 'a2', clientName: 'Condomínio Vista Mar', parameter: 'pH', value: 8.2, standard: '7.2-7.6', severity: 'medium', detectedAt: '2024-02-01T14:15:00' },
  { id: 'a3', clientName: 'Hotel Paradise', parameter: 'Alcalinidade', value: 60, standard: '80-120 ppm', severity: 'medium', detectedAt: '2024-01-31T09:00:00' },
];

export const MOCK_TECHNICIAN_PERFORMANCE: TechnicianPerformance[] = [
  { id: 't1', name: 'João Silva', completedServices: 45, averageRating: 4.8, onTimePercentage: 92, totalRevenue: 22500, clientsServed: 38 },
  { id: 't2', name: 'Maria Santos', completedServices: 52, averageRating: 4.9, onTimePercentage: 95, totalRevenue: 26800, clientsServed: 42 },
  { id: 't3', name: 'Pedro Costa', completedServices: 38, averageRating: 4.7, onTimePercentage: 88, totalRevenue: 19200, clientsServed: 32 },
  { id: 't4', name: 'Ana Oliveira', completedServices: 41, averageRating: 4.8, onTimePercentage: 90, totalRevenue: 21000, clientsServed: 35 },
];

export const MOCK_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'Ago', revenue: 165000 },
  { month: 'Set', revenue: 172000 },
  { month: 'Out', revenue: 185000 },
  { month: 'Nov', revenue: 178000 },
  { month: 'Dez', revenue: 195000 },
  { month: 'Jan', revenue: 187450 },
];

