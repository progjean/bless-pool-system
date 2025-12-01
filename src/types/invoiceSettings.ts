/**
 * Configurações globais de invoices
 */
export interface InvoiceSettings {
  id: string;
  // Configurações de envio
  sendDayOfWeek?: number; // 0-6 (domingo-sábado) - dia da semana para enviar invoices
  sendDayOfMonth?: number; // 1-31 - dia do mês para enviar invoices mensais
  dueDateDays: number; // Dias após emissão para vencimento (padrão 30)
  
  // Configurações de taxa de atraso
  lateFeeEnabled: boolean;
  lateFeeType: 'fixed' | 'percentage';
  lateFeeValue: number; // Valor fixo ou percentual
  lateFeeApplyAfterDays: number; // Aplicar após X dias de atraso
  
  // Múltiplas cobranças de atraso
  multipleLateFeeReminders: boolean;
  lateFeeReminders: LateFeeReminder[]; // Array de lembretes (3 dias, 7 dias, 15 dias)
  
  // Aviso de taxa de atraso
  lateFeeWarningEnabled: boolean;
  lateFeeWarningDaysBefore: number; // Avisar X dias antes de aplicar taxa
  
  // Impostos
  taxesEnabled: boolean;
  taxes: Tax[];
  
  // Configurações gerais
  companyName: string;
  companyAddress: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxId?: string; // CNPJ/CPF
  footerMessage?: string; // Mensagem no rodapé da invoice
  termsAndConditions?: string; // Termos e condições
}

export interface LateFeeReminder {
  id: string;
  daysAfterDue: number; // Dias após vencimento (ex: 3, 7, 15)
  sendReminder: boolean; // Se deve enviar lembrete
  applyLateFee: boolean; // Se deve aplicar taxa neste momento
  lateFeeAmount?: number; // Valor da taxa neste momento (se diferente da padrão)
  message?: string; // Mensagem personalizada para este lembrete
}

export interface Tax {
  id: string;
  name: string; // Ex: "ISS", "ICMS", "Tax"
  type: 'percentage' | 'fixed';
  value: number; // Percentual ou valor fixo
  applyTo: 'subtotal' | 'total'; // Aplicar sobre subtotal ou total
  description?: string;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  id: 'default',
  dueDateDays: 30,
  lateFeeEnabled: true,
  lateFeeType: 'percentage',
  lateFeeValue: 2, // 2%
  lateFeeApplyAfterDays: 5,
  multipleLateFeeReminders: false,
  lateFeeReminders: [
    { id: 'reminder1', daysAfterDue: 3, sendReminder: true, applyLateFee: false },
    { id: 'reminder2', daysAfterDue: 7, sendReminder: true, applyLateFee: true },
    { id: 'reminder3', daysAfterDue: 15, sendReminder: true, applyLateFee: true },
  ],
  lateFeeWarningEnabled: true,
  lateFeeWarningDaysBefore: 2,
  taxesEnabled: false,
  taxes: [],
  companyName: 'BLESS POOL SYSTEM',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyTaxId: '',
  footerMessage: '',
  termsAndConditions: '',
};

