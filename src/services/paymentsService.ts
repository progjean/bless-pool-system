// Serviço para gerenciar Payments usando Supabase
import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import { Payment } from '../types/invoice';
import { showToast } from '../utils/toast';
import { dataCache, createCacheKey } from '../utils/cache';

// Converter Payment para formato Supabase
const paymentToSupabase = (payment: Payment) => ({
  invoice_id: payment.invoiceId,
  amount: payment.amount,
  payment_date: payment.paymentDate,
  payment_method: payment.paymentMethod,
  reference_number: payment.reference || null,
  notes: payment.notes || null,
  company_id: null, // Será preenchido pelo RLS
});

// Converter do formato Supabase para Payment
// Nota: Payment precisa de invoiceNumber, customerId, customerName, recordedBy que não estão no banco
// Esses dados serão buscados da invoice relacionada
const supabaseToPayment = (row: any, invoice?: any, recordedBy?: string): Payment => ({
  id: row.id,
  invoiceId: row.invoice_id,
  invoiceNumber: invoice?.invoice_number || '',
  customerId: invoice?.customer_id || '',
  customerName: invoice?.customer_name || '',
  amount: parseFloat(row.amount),
  paymentDate: row.payment_date,
  paymentMethod: row.payment_method as Payment['paymentMethod'],
  reference: row.reference_number || undefined,
  notes: row.notes || undefined,
  recordedBy: recordedBy || 'System',
  createdAt: row.created_at,
});

export const paymentsService = {
  // Listar pagamentos de uma invoice
  async listByInvoice(invoiceId: string): Promise<Payment[]> {
    const cacheKey = createCacheKey('payments', 'invoice', invoiceId);
    
    if (!isSupabaseConfigured()) {
      // Fallback para localStorage
      const saved = localStorage.getItem('payments');
      const payments = saved ? JSON.parse(saved) : [];
      return payments.filter((p: Payment) => p.invoiceId === invoiceId);
    }

    try {
      const cached = dataCache.get<Payment[]>(cacheKey);
      if (cached) return cached;

      // Buscar invoice para obter dados adicionais
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      const payments = (data || []).map(row => supabaseToPayment(row, invoiceData, 'System'));
      dataCache.set(cacheKey, payments, 2 * 60 * 1000); // Cache por 2 minutos
      return payments;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar pagamentos: ${errorMessage}`);
      throw error;
    }
  },

  // Buscar pagamento por ID
  async get(id: string): Promise<Payment | null> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('payments');
      const payments = saved ? JSON.parse(saved) : [];
      return payments.find((p: Payment) => p.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return supabaseToPayment(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar pagamento: ${errorMessage}`);
      throw error;
    }
  },

  // Criar novo pagamento
  async create(payment: Payment): Promise<Payment> {
    try {
      let newPayment: Payment;

      if (!isSupabaseConfigured()) {
        // Fallback para localStorage
        const saved = localStorage.getItem('payments');
        const payments = saved ? JSON.parse(saved) : [];
        newPayment = { ...payment, id: `payment_${Date.now()}` };
        payments.push(newPayment);
        localStorage.setItem('payments', JSON.stringify(payments));
      } else {
        const supabaseData = paymentToSupabase(payment);
        
        const { data, error } = await supabase
          .from('payments')
          .insert(supabaseData as any)
          .select()
          .single();

      if (error) throw error;
      // Buscar invoice para preencher campos adicionais
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', payment.invoiceId)
        .single();
      newPayment = supabaseToPayment(data, invoiceData, payment.recordedBy);
      }

      // Invalidar cache
      dataCache.invalidate(createCacheKey('payments', 'invoice', payment.invoiceId));
      dataCache.invalidatePattern('^invoices:');

      showToast.success('Pagamento registrado com sucesso!');
      return newPayment;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao registrar pagamento: ${errorMessage}`);
      throw error;
    }
  },

  // Atualizar pagamento
  async update(id: string, payment: Payment): Promise<Payment> {
    try {
      let updatedPayment: Payment;

      if (!isSupabaseConfigured()) {
        const saved = localStorage.getItem('payments');
        const payments = saved ? JSON.parse(saved) : [];
        const index = payments.findIndex((p: Payment) => p.id === id);
        if (index !== -1) {
          updatedPayment = { ...payment, id };
          payments[index] = updatedPayment;
          localStorage.setItem('payments', JSON.stringify(payments));
        } else {
          throw new Error('Pagamento não encontrado');
        }
      } else {
        const supabaseData = paymentToSupabase(payment);
        
        const { data, error } = await supabase
          .from('payments')
          .update(supabaseData as any)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        // Buscar invoice para preencher campos adicionais
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', payment.invoiceId)
          .single();
        updatedPayment = supabaseToPayment(data, invoiceData, payment.recordedBy);
      }

      // Invalidar cache
      dataCache.invalidate(createCacheKey('payments', 'invoice', payment.invoiceId));
      dataCache.invalidatePattern('^invoices:');

      showToast.success('Pagamento atualizado com sucesso!');
      return updatedPayment;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao atualizar pagamento: ${errorMessage}`);
      throw error;
    }
  },

  // Deletar pagamento
  async delete(id: string, invoiceId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('payments');
      const payments = saved ? JSON.parse(saved) : [];
      const filtered = payments.filter((p: Payment) => p.id !== id);
      localStorage.setItem('payments', JSON.stringify(filtered));
    } else {
      try {
        const { error } = await supabase
          .from('payments')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        showToast.error(`Erro ao deletar pagamento: ${errorMessage}`);
        throw error;
      }
    }

    // Invalidar cache
    dataCache.invalidate(createCacheKey('payments', 'invoice', invoiceId));
    dataCache.invalidatePattern('^invoices:');

    showToast.success('Pagamento deletado com sucesso!');
  },
};

