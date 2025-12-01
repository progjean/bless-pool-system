// Serviço para gerenciar Customers usando Supabase
import { supabase, isSupabaseConfigured, handleSupabaseError, isTableNotFoundError } from './supabase';
import { Customer } from '../types/customer';
import { showToast } from '../utils/toast';
import { dataCache, createCacheKey, cachedAsync } from '../utils/cache';

// Converter Customer para formato Supabase
const customerToSupabase = (customer: Customer) => ({
  first_name: customer.firstName,
  last_name: customer.lastName,
  email: customer.contacts?.find(c => c.type === 'email')?.value || null,
  phone: customer.contacts?.find(c => c.type === 'phone')?.value || null,
  address: customer.address,
  city: customer.city || null,
  state: customer.state || null,
  zip_code: customer.zipCode || null,
  frequency: customer.frequency,
  charge_per_month: customer.chargePerMonth,
  type_of_service: customer.typeOfService,
  service_day: customer.serviceDay || null,
  start_on: customer.startOn || null,
  stop_after: customer.stopAfter || null,
  minutes_at_stop: customer.minutesAtStop || 25,
  assigned_technician: customer.assignedTechnician || null,
  status: customer.status,
  company_id: customer.companyId || null,
});

// Converter do formato Supabase para Customer
const supabaseToCustomer = (row: any, contacts: any[] = [], accessCodes: any[] = []): Customer => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  address: row.address,
  city: row.city || '',
  state: row.state || '',
  zipCode: row.zip_code || '',
  // email e phone são extraídos de contacts abaixo
  accessCodes: accessCodes.map(ac => ({
    id: ac.id,
    type: ac.type,
    label: ac.label,
    code: ac.code,
  })),
  contacts: contacts.map(c => ({
    id: c.id,
    type: c.type,
    value: c.value,
    tag: c.tag,
  })),
  frequency: row.frequency,
  chargePerMonth: parseFloat(row.charge_per_month),
  typeOfService: row.type_of_service,
  serviceDay: row.service_day,
  startOn: row.start_on || '',
  stopAfter: row.stop_after || 'NO END',
  minutesAtStop: row.minutes_at_stop || 25,
  assignedTechnician: row.assigned_technician || '',
  status: row.status,
  companyId: row.company_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  name: `${row.first_name} ${row.last_name}`.trim(),
});

export const customersService = {
  // Listar todos os clientes
  async list(): Promise<Customer[]> {
    const cacheKey = createCacheKey('customers', 'list');
    
    return cachedAsync(cacheKey, async () => {
      if (!isSupabaseConfigured()) {
        // Fallback para localStorage
        const saved = localStorage.getItem('customers');
        return saved ? JSON.parse(saved) : [];
      }

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Converter para formato Customer
        return (data || []).map(row => supabaseToCustomer(row));
      } catch (error: any) {
        // Se a tabela não existe, usar fallback para localStorage
        if (isTableNotFoundError(error)) {
          console.warn('⚠️ Tabela customers não encontrada no Supabase. Usando fallback para localStorage.');
          console.warn('📋 Para resolver: Execute o arquivo supabase/schema.sql no SQL Editor do Supabase Dashboard.');
          const saved = localStorage.getItem('customers');
          return saved ? JSON.parse(saved) : [];
        }
        const errorMessage = handleSupabaseError(error);
        showToast.error(`Erro ao carregar clientes: ${errorMessage}`);
        throw error;
      }
    }, 5 * 60 * 1000); // Cache por 5 minutos
  },

  // Buscar cliente por ID
  async get(id: string): Promise<Customer | null> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('customers');
      const customers = saved ? JSON.parse(saved) : [];
      return customers.find((c: Customer) => c.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return supabaseToCustomer(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar cliente: ${errorMessage}`);
      throw error;
    }
  },

  // Criar novo cliente
  async create(customer: Customer): Promise<Customer> {
    let newCustomer: Customer;
    
    try {
      if (!isSupabaseConfigured()) {
        // Fallback para localStorage
        const saved = localStorage.getItem('customers');
        const customers = saved ? JSON.parse(saved) : [];
        newCustomer = { ...customer, id: `customer_${Date.now()}` };
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));
      } else {
        const supabaseData = customerToSupabase(customer);
        
        const { data, error } = await supabase
          .from('customers')
          .insert(supabaseData as any)
          .select()
          .single();

        if (error) throw error;
        newCustomer = supabaseToCustomer(data);
      }

      // Invalidar cache
      dataCache.invalidatePattern('^customers:');
      
      showToast.success('Cliente criado com sucesso!');
      return newCustomer;
    } catch (error: any) {
      // Se a tabela não existe, usar fallback para localStorage
      if (isTableNotFoundError(error)) {
        console.warn('⚠️ Tabela customers não encontrada no Supabase. Usando fallback para localStorage.');
        console.warn('📋 Para resolver: Execute o arquivo supabase/schema.sql no SQL Editor do Supabase Dashboard.');
        const saved = localStorage.getItem('customers');
        const customers = saved ? JSON.parse(saved) : [];
        newCustomer = { ...customer, id: `customer_${Date.now()}` };
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));
        dataCache.invalidatePattern('^customers:');
        showToast.success('Cliente criado com sucesso! (modo offline)');
        return newCustomer;
      }
      const errorMessage = handleSupabaseError(error);
        showToast.error(`Erro ao criar cliente: ${errorMessage}`);
        throw error;
      }
  },

  // Atualizar cliente
  async update(id: string, customer: Customer): Promise<Customer> {
    try {
      let updatedCustomer: Customer;
      
      if (!isSupabaseConfigured()) {
        const saved = localStorage.getItem('customers');
        const customers = saved ? JSON.parse(saved) : [];
        const index = customers.findIndex((c: Customer) => c.id === id);
        if (index !== -1) {
          updatedCustomer = { ...customer, id, updatedAt: new Date().toISOString() };
          customers[index] = updatedCustomer;
          localStorage.setItem('customers', JSON.stringify(customers));
        } else {
          throw new Error('Cliente não encontrado');
        }
      } else {
        const supabaseData = customerToSupabase(customer);
        
        const { data, error } = await supabase
          .from('customers')
          .update(supabaseData as unknown as any)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        updatedCustomer = supabaseToCustomer(data);
      }

      // Invalidar cache
      dataCache.invalidatePattern('^customers:');
      dataCache.invalidate(createCacheKey('customers', id));

      showToast.success('Cliente atualizado com sucesso!');
      return updatedCustomer;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao atualizar cliente: ${errorMessage}`);
      throw error;
    }
  },

  // Deletar cliente
  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('customers');
      const customers = saved ? JSON.parse(saved) : [];
      const filtered = customers.filter((c: Customer) => c.id !== id);
      localStorage.setItem('customers', JSON.stringify(filtered));
    } else {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        showToast.error(`Erro ao deletar cliente: ${errorMessage}`);
        throw error;
      }
    }

    // Invalidar cache
    dataCache.invalidatePattern('^customers:');
    dataCache.invalidate(createCacheKey('customers', id));

    showToast.success('Cliente deletado com sucesso!');
  },
};

