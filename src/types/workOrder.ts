export type WorkOrderType = 
  | 'leak_check' 
  | 'filter_clean' 
  | 'green_pool' 
  | 'equipment_repair' 
  | 'chemical_adjustment' 
  | 'other';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type WorkOrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface WorkOrderTypeConfig {
  id: WorkOrderType;
  label: string;
  color: string;
  icon: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  type: WorkOrderType;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  customerId: string;
  customerName: string;
  customerAddress: string;
  assignedTechnician?: string;
  assignedTechnicianId?: string;
  createdBy: string;
  createdByRole: 'admin' | 'supervisor' | 'customer';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
  photos: string[]; // URLs ou base64
  notes?: string;
  estimatedDuration?: number; // em minutos
  actualDuration?: number; // em minutos
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus;
  type?: WorkOrderType;
  priority?: WorkOrderPriority;
  assignedTechnician?: string;
  customerId?: string;
}

export const WORK_ORDER_TYPES: WorkOrderTypeConfig[] = [
  {
    id: 'leak_check',
    label: 'Verificação de Vazamento',
    color: '#4facfe',
    icon: '💧',
  },
  {
    id: 'filter_clean',
    label: 'Limpeza de Filtro',
    color: '#43e97b',
    icon: '🔧',
  },
  {
    id: 'green_pool',
    label: 'Piscina Verde',
    color: '#fa709a',
    icon: '🟢',
  },
  {
    id: 'equipment_repair',
    label: 'Reparo de Equipamento',
    color: '#fee140',
    icon: '⚙️',
  },
  {
    id: 'chemical_adjustment',
    label: 'Ajuste Químico',
    color: '#30cfd0',
    icon: '🧪',
  },
  {
    id: 'other',
    label: 'Outro',
    color: '#a8edea',
    icon: '📋',
  },
];

export const getWorkOrderTypeConfig = (type: WorkOrderType): WorkOrderTypeConfig => {
  return WORK_ORDER_TYPES.find(t => t.id === type) || WORK_ORDER_TYPES[WORK_ORDER_TYPES.length - 1];
};

