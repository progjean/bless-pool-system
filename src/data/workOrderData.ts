import { WorkOrder } from '../types/workOrder';

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1',
    workOrderNumber: 'WO-2024-001',
    type: 'leak_check',
    title: 'Verificação de vazamento na piscina',
    description: 'Cliente relatou possível vazamento na área da bomba. Verificar toda a tubulação e equipamentos.',
    priority: 'high',
    status: 'open',
    customerId: '1',
    customerName: 'Residência Silva',
    customerAddress: 'Rua das Flores, 123, São Paulo - SP',
    assignedTechnician: 'João Silva',
    assignedTechnicianId: 't1',
    createdBy: 'Admin',
    createdByRole: 'admin',
    createdAt: '2024-02-01T10:00:00Z',
    photos: [],
    estimatedDuration: 120,
  },
  {
    id: 'wo2',
    workOrderNumber: 'WO-2024-002',
    type: 'filter_clean',
    title: 'Limpeza completa do filtro',
    description: 'Filtro precisa de limpeza completa e verificação de componentes.',
    priority: 'medium',
    status: 'in_progress',
    customerId: '2',
    customerName: 'Condomínio Vista Mar',
    customerAddress: 'Av. Beira Mar, 456, Santos - SP',
    assignedTechnician: 'Maria Santos',
    assignedTechnicianId: 't2',
    createdBy: 'Supervisor',
    createdByRole: 'supervisor',
    createdAt: '2024-01-28T14:00:00Z',
    startedAt: '2024-02-01T09:00:00Z',
    photos: [],
    estimatedDuration: 90,
  },
  {
    id: 'wo3',
    workOrderNumber: 'WO-2024-003',
    type: 'green_pool',
    title: 'Tratamento de piscina verde',
    description: 'Piscina está completamente verde. Necessário tratamento emergencial.',
    priority: 'urgent',
    status: 'completed',
    customerId: '1',
    customerName: 'Residência Silva',
    customerAddress: 'Rua das Flores, 123, São Paulo - SP',
    assignedTechnician: 'Pedro Costa',
    assignedTechnicianId: 't3',
    createdBy: 'Admin',
    createdByRole: 'admin',
    createdAt: '2024-01-25T08:00:00Z',
    startedAt: '2024-01-25T10:00:00Z',
    completedAt: '2024-01-25T14:30:00Z',
    completedBy: 'Pedro Costa',
    photos: [],
    estimatedDuration: 240,
    actualDuration: 270,
    notes: 'Tratamento realizado com sucesso. Água já está clara. Cliente orientado sobre manutenção.',
  },
  {
    id: 'wo4',
    workOrderNumber: 'WO-2024-004',
    type: 'equipment_repair',
    title: 'Reparo na bomba',
    description: 'Bomba não está ligando. Verificar motor e componentes elétricos.',
    priority: 'high',
    status: 'open',
    customerId: '3',
    customerName: 'Hotel Paradise',
    customerAddress: 'Rua do Comércio, 789, Guarujá - SP',
    createdBy: 'Admin',
    createdByRole: 'admin',
    createdAt: '2024-02-02T11:00:00Z',
    photos: [],
    estimatedDuration: 180,
  },
];

export const generateNextWorkOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const lastWO = MOCK_WORK_ORDERS[MOCK_WORK_ORDERS.length - 1];
  if (lastWO) {
    const lastNumber = parseInt(lastWO.workOrderNumber.split('-')[2]);
    return `WO-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
  }
  return `WO-${year}-001`;
};

