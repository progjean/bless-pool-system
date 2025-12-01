// Cliente Supabase
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key não configurados. Usando modo mock.');
}

export const supabase = createClient<Database>(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper para verificar se Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';
};

// Helper para tratamento de erros do Supabase
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido';
  
  // Erro específico de tabela não encontrada
  if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
    return 'Tabela não encontrada no banco de dados. Execute o schema SQL no Supabase Dashboard.';
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error_description) {
    return error.error_description;
  }
  
  return 'Erro ao processar requisição';
};

// Helper para verificar se o erro é de tabela não encontrada
export const isTableNotFoundError = (error: any): boolean => {
  return error?.code === 'PGRST205' || error?.message?.includes('Could not find the table');
};
