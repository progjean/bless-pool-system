// Serviço para gerenciar Settings usando Supabase
import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import { ReadingStandard, DosageStandard, ChecklistItem } from '../types/settings';
import { ServiceMessage } from '../types/serviceMessages';
import { showToast } from '../utils/toast';
import { DEFAULT_CHECKLIST } from '../data/settingsData';

// Converter ReadingStandard para formato Supabase
const readingToSupabase = (reading: ReadingStandard) => ({
  description: reading.description,
  reading_type: reading.readingType,
  unit: reading.unit,
  values: reading.values || null,
  selected_value: reading.selectedValue || null,
  order: reading.order || 0,
  company_id: null, // Será preenchido pelo RLS
});

// Converter do formato Supabase para ReadingStandard
const supabaseToReading = (row: any): ReadingStandard => ({
  id: row.id,
  name: row.reading_type, // Para compatibilidade
  description: row.description,
  readingType: row.reading_type,
  unit: row.unit,
  minValue: row.min_value || 0,
  maxValue: row.max_value || 14,
  category: (row.category || 'other') as ReadingStandard['category'],
  values: row.values || [],
  selectedValue: row.selected_value || undefined,
  order: row.order || 0,
});

// Converter DosageStandard para formato Supabase
const dosageToSupabase = (dosage: DosageStandard) => ({
  description: dosage.description,
  dosage_type: dosage.dosageType,
  unit: dosage.unit,
  cost_per_uom: dosage.costPerUOM || null,
  price_per_uom: dosage.pricePerUOM || null,
  can_include_with_service: dosage.canIncludeWithService || false,
  values: dosage.values || null,
  selected_value: dosage.selectedValue || null,
  order: dosage.order || 0,
  company_id: null, // Será preenchido pelo RLS
});

// Converter do formato Supabase para DosageStandard
const supabaseToDosage = (row: any): DosageStandard => ({
  id: row.id,
  name: row.dosage_type, // Para compatibilidade
  description: row.description,
  dosageType: row.dosage_type,
  unit: row.unit,
  defaultAmount: row.default_amount || 1,
  costPerUOM: row.cost_per_uom || undefined,
  pricePerUOM: row.price_per_uom || undefined,
  canIncludeWithService: row.can_include_with_service || false,
  values: row.values || [],
  selectedValue: row.selected_value || undefined,
  order: row.order || 0,
});

// Converter ServiceMessage para formato Supabase
const messageToSupabase = (message: ServiceMessage) => ({
  title: message.title,
  content: message.content,
  is_default: message.isDefault || false,
  company_id: null, // Será preenchido pelo RLS
});

// Converter do formato Supabase para ServiceMessage
const supabaseToMessage = (row: any): ServiceMessage => ({
  id: row.id,
  title: row.title,
  content: row.content,
  isDefault: row.is_default || false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const settingsService = {
  // ========== READING STANDARDS ==========
  
  async getReadings(): Promise<ReadingStandard[]> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('readingsSettings');
      return saved ? JSON.parse(saved) : [];
    }

    try {
      const { data, error } = await supabase
        .from('reading_standards')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      return (data || []).map(row => supabaseToReading(row));
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar padrões de leitura: ${errorMessage}`);
      throw error;
    }
  },

  async saveReading(reading: ReadingStandard): Promise<ReadingStandard> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('readingsSettings');
      const readings = saved ? JSON.parse(saved) : [];
      const index = readings.findIndex((r: ReadingStandard) => r.id === reading.id);
      
      if (index !== -1) {
        readings[index] = reading;
      } else {
        readings.push(reading);
      }
      
      localStorage.setItem('readingsSettings', JSON.stringify(readings));
      return reading;
    }

    try {
      const supabaseData = readingToSupabase(reading);
      
      // Verificar se é um UUID válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const isValidUUID = reading.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reading.id);
      
      if (isValidUUID) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('reading_standards')
          .update(supabaseData as any)
          .eq('id', reading.id)
          .select()
          .single();

        if (error) throw error;
        return supabaseToReading(data);
      } else {
        // Criar novo registro (banco gerará UUID automaticamente)
        const { data, error } = await supabase
          .from('reading_standards')
          .insert(supabaseData as any)
          .select()
          .single();

        if (error) throw error;
        return supabaseToReading(data);
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao salvar padrão de leitura: ${errorMessage}`);
      throw error;
    }
  },

  async deleteReading(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('readingsSettings');
      const readings = saved ? JSON.parse(saved) : [];
      const filtered = readings.filter((r: ReadingStandard) => r.id !== id);
      localStorage.setItem('readingsSettings', JSON.stringify(filtered));
      return;
    }

    try {
      const { error } = await supabase
        .from('reading_standards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao deletar padrão de leitura: ${errorMessage}`);
      throw error;
    }
  },

  async saveReadings(readings: ReadingStandard[]): Promise<void> {
    if (!isSupabaseConfigured()) {
      localStorage.setItem('readingsSettings', JSON.stringify(readings));
      return;
    }

    try {
      // Deletar todos e recriar (simples para sincronização)
      await supabase.from('reading_standards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      const supabaseData = readings.map(r => readingToSupabase(r));
      const { error } = await supabase.from('reading_standards').insert(supabaseData as any);
      
      if (error) throw error;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao salvar padrões de leitura: ${errorMessage}`);
      throw error;
    }
  },

  // ========== DOSAGE STANDARDS ==========

  async getDosages(): Promise<DosageStandard[]> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('dosagesSettings');
      return saved ? JSON.parse(saved) : [];
    }

    try {
      const { data, error } = await supabase
        .from('dosage_standards')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      return (data || []).map(row => supabaseToDosage(row));
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar padrões de dosagem: ${errorMessage}`);
      throw error;
    }
  },

  async saveDosage(dosage: DosageStandard): Promise<DosageStandard> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('dosagesSettings');
      const dosages = saved ? JSON.parse(saved) : [];
      const index = dosages.findIndex((d: DosageStandard) => d.id === dosage.id);
      
      if (index !== -1) {
        dosages[index] = dosage;
      } else {
        dosages.push(dosage);
      }
      
      localStorage.setItem('dosagesSettings', JSON.stringify(dosages));
      return dosage;
    }

    try {
      const supabaseData = dosageToSupabase(dosage);
      
      // Verificar se é um UUID válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const isValidUUID = dosage.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dosage.id);
      
      if (isValidUUID) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('dosage_standards')
          .update(supabaseData as any)
          .eq('id', dosage.id)
          .select()
          .single();

        if (error) throw error;
        return supabaseToDosage(data);
      } else {
        // Criar novo registro (banco gerará UUID automaticamente)
        const { data, error } = await supabase
          .from('dosage_standards')
          .insert(supabaseData as any)
          .select()
          .single();

        if (error) throw error;
        return supabaseToDosage(data);
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao salvar padrão de dosagem: ${errorMessage}`);
      throw error;
    }
  },

  async deleteDosage(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('dosagesSettings');
      const dosages = saved ? JSON.parse(saved) : [];
      const filtered = dosages.filter((d: DosageStandard) => d.id !== id);
      localStorage.setItem('dosagesSettings', JSON.stringify(filtered));
      return;
    }

    try {
      const { error } = await supabase
        .from('dosage_standards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao deletar padrão de dosagem: ${errorMessage}`);
      throw error;
    }
  },

  async saveDosages(dosages: DosageStandard[]): Promise<void> {
    if (!isSupabaseConfigured()) {
      localStorage.setItem('dosagesSettings', JSON.stringify(dosages));
      return;
    }

    try {
      await supabase.from('dosage_standards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      const supabaseData = dosages.map(d => dosageToSupabase(d));
      const { error } = await supabase.from('dosage_standards').insert(supabaseData as any);
      
      if (error) throw error;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao salvar padrões de dosagem: ${errorMessage}`);
      throw error;
    }
  },

  // ========== SERVICE MESSAGES ==========

  async getServiceMessages(): Promise<ServiceMessage[]> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('serviceMessages');
      return saved ? JSON.parse(saved) : [];
    }

    try {
      const { data, error } = await supabase
        .from('service_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => supabaseToMessage(row));
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar mensagens: ${errorMessage}`);
      throw error;
    }
  },

  async saveServiceMessage(message: ServiceMessage): Promise<ServiceMessage> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('serviceMessages');
      const messages = saved ? JSON.parse(saved) : [];
      const index = messages.findIndex((m: ServiceMessage) => m.id === message.id);
      
      if (index !== -1) {
        messages[index] = message;
      } else {
        messages.push(message);
      }
      
      localStorage.setItem('serviceMessages', JSON.stringify(messages));
      return message;
    }

    try {
      const supabaseData = messageToSupabase(message);
      
      if (message.id && message.id.startsWith('msg_')) {
        const { data, error } = await supabase
          .from('service_messages')
          .update(supabaseData as any)
          .eq('id', message.id)
          .select()
          .single();

        if (error) throw error;
        return supabaseToMessage(data);
      } else {
        const { data, error } = await supabase
          .from('service_messages')
          .insert(supabaseData as any)
          .select()
          .single();

        if (error) throw error;
        return supabaseToMessage(data);
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao salvar mensagem: ${errorMessage}`);
      throw error;
    }
  },

  async deleteServiceMessage(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('serviceMessages');
      const messages = saved ? JSON.parse(saved) : [];
      const filtered = messages.filter((m: ServiceMessage) => m.id !== id);
      localStorage.setItem('serviceMessages', JSON.stringify(filtered));
      return;
    }

    try {
      const { error } = await supabase
        .from('service_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao deletar mensagem: ${errorMessage}`);
      throw error;
    }
  },

  // ========== CHECKLIST ==========
  
  async getChecklist(): Promise<ChecklistItem[]> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('checklistSettings');
      return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST;
    }

    try {
      const { data, error } = await supabase
        .from('checklist_standards')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        // Se a tabela não existe, usar fallback
        const saved = localStorage.getItem('checklistSettings');
        return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST;
      }

      return (data || []).map((row: any): ChecklistItem => ({
        id: row.id,
        label: row.label,
        category: row.category,
        order: row.order || 0,
        active: row.active !== false,
      }));
    } catch (error) {
      console.error('Erro ao carregar checklist:', error);
      const saved = localStorage.getItem('checklistSettings');
      return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST;
    }
  },

  async saveChecklist(checklist: ChecklistItem[]): Promise<void> {
    if (!isSupabaseConfigured()) {
      localStorage.setItem('checklistSettings', JSON.stringify(checklist));
      return;
    }

    try {
      // Deletar todos e recriar (simples para sincronização)
      await supabase.from('checklist_standards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      const itemsToInsert = checklist.map(item => ({
        label: item.label,
        category: item.category,
        order: item.order || 0,
        active: item.active !== false,
      }));

      const { error } = await supabase
        .from('checklist_standards')
        .insert(itemsToInsert as any);

      if (error) throw error;

      localStorage.setItem('checklistSettings', JSON.stringify(checklist));
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      // Fallback para localStorage
      localStorage.setItem('checklistSettings', JSON.stringify(checklist));
    }
  },
};

