// Serviço para gerenciar Work Orders usando Supabase
import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import { WorkOrder } from '../types/workOrder';
import { showToast } from '../utils/toast';
import { dataCache, createCacheKey, cachedAsync } from '../utils/cache';

// Converter WorkOrder para formato Supabase
const workOrderToSupabase = (workOrder: WorkOrder) => ({
  work_order_number: workOrder.workOrderNumber,
  type: workOrder.type,
  title: workOrder.title,
  description: workOrder.description,
  priority: workOrder.priority,
  status: workOrder.status,
  customer_id: workOrder.customerId,
  customer_name: workOrder.customerName,
  customer_address: workOrder.customerAddress,
  assigned_technician: workOrder.assignedTechnician || null,
  assigned_technician_id: workOrder.assignedTechnicianId || null,
  created_by: workOrder.createdBy,
  created_by_role: workOrder.createdByRole,
  started_at: workOrder.startedAt || null,
  completed_at: workOrder.completedAt || null,
  completed_by: workOrder.completedBy || null,
  notes: workOrder.notes || null,
  estimated_duration: workOrder.estimatedDuration || null,
  actual_duration: workOrder.actualDuration || null,
  company_id: null, // Será preenchido pelo RLS
});

// Converter do formato Supabase para WorkOrder
const supabaseToWorkOrder = (row: any): WorkOrder => ({
  id: row.id,
  workOrderNumber: row.work_order_number,
  type: row.type as WorkOrder['type'],
  title: row.title,
  description: row.description,
  priority: row.priority as WorkOrder['priority'],
  status: row.status as WorkOrder['status'],
  customerId: row.customer_id,
  customerName: row.customer_name,
  customerAddress: row.customer_address,
  assignedTechnician: row.assigned_technician || undefined,
  assignedTechnicianId: row.assigned_technician_id || undefined,
  createdBy: row.created_by,
  createdByRole: row.created_by_role as WorkOrder['createdByRole'],
  createdAt: row.created_at,
  startedAt: row.started_at || undefined,
  completedAt: row.completed_at || undefined,
  completedBy: row.completed_by || undefined,
  photos: [], // Fotos serão gerenciadas separadamente via storage
  notes: row.notes || undefined,
  estimatedDuration: row.estimated_duration || undefined,
  actualDuration: row.actual_duration || undefined,
});

export const workOrdersService = {
  // Listar todas as work orders
  async list(): Promise<WorkOrder[]> {
    const cacheKey = createCacheKey('workOrders', 'list');
    
    return cachedAsync(cacheKey, async () => {
      if (!isSupabaseConfigured()) {
        const saved = localStorage.getItem('workOrders');
        return saved ? JSON.parse(saved) : [];
      }

      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(row => supabaseToWorkOrder(row));
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        showToast.error(`Erro ao carregar work orders: ${errorMessage}`);
        throw error;
      }
    }, 5 * 60 * 1000); // Cache por 5 minutos
  },

  // Buscar work order por ID
  async get(id: string): Promise<WorkOrder | null> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('workOrders');
      const workOrders = saved ? JSON.parse(saved) : [];
      return workOrders.find((wo: WorkOrder) => wo.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return supabaseToWorkOrder(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar work order: ${errorMessage}`);
      throw error;
    }
  },

  // Criar nova work order
  async create(workOrder: WorkOrder): Promise<WorkOrder> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('workOrders');
      const workOrders = saved ? JSON.parse(saved) : [];
      const newWO = { ...workOrder, id: `wo_${Date.now()}` };
      workOrders.push(newWO);
      localStorage.setItem('workOrders', JSON.stringify(workOrders));
      return newWO;
    }

    try {
      const supabaseData = workOrderToSupabase(workOrder);
      
      const { data, error } = await supabase
        .from('work_orders')
          .insert(supabaseData as any)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache
      dataCache.invalidatePattern('^workOrders:');

      showToast.success('Work Order criada com sucesso!');
      return supabaseToWorkOrder(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao criar work order: ${errorMessage}`);
      throw error;
    }
  },

  // Atualizar work order
  async update(id: string, workOrder: WorkOrder): Promise<WorkOrder> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('workOrders');
      const workOrders = saved ? JSON.parse(saved) : [];
      const index = workOrders.findIndex((wo: WorkOrder) => wo.id === id);
      if (index !== -1) {
        workOrders[index] = { ...workOrder, id, updatedAt: new Date().toISOString() };
        localStorage.setItem('workOrders', JSON.stringify(workOrders));
        return workOrders[index];
      }
      throw new Error('Work Order não encontrada');
    }

    try {
      const supabaseData = workOrderToSupabase(workOrder);
      
      const { data, error } = await supabase
        .from('work_orders')
          .update(supabaseData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache
      dataCache.invalidatePattern('^workOrders:');
      dataCache.invalidate(createCacheKey('workOrders', id));

      showToast.success('Work Order atualizada com sucesso!');
      return supabaseToWorkOrder(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao atualizar work order: ${errorMessage}`);
      throw error;
    }
  },

  // Deletar work order
  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('workOrders');
      const workOrders = saved ? JSON.parse(saved) : [];
      const filtered = workOrders.filter((wo: WorkOrder) => wo.id !== id);
      localStorage.setItem('workOrders', JSON.stringify(filtered));
      return;
    }

    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidar cache
      dataCache.invalidatePattern('^workOrders:');
      dataCache.invalidate(createCacheKey('workOrders', id));

      showToast.success('Work Order deletada com sucesso!');
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao deletar work order: ${errorMessage}`);
      throw error;
    }
  },
};

