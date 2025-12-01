import { Customer } from '../types/customer';
import { Invoice, InvoiceItem, RecurringConfig } from '../types/invoice';

/**
 * Calcula o valor da invoice baseado na frequência e valor mensal
 */
export function calculateInvoiceAmount(
  chargePerMonth: number,
  frequency: 'Weekly' | 'Biweekly'
): number {
  if (frequency === 'Weekly') {
    // Semanal: dividir por ~4.33 semanas no mês (média de semanas por mês)
    return Math.round((chargePerMonth / 4.33) * 100) / 100;
  } else {
    // Quinzenal: dividir por 2
    return Math.round((chargePerMonth / 2) * 100) / 100;
  }
}

/**
 * Gera descrição da invoice baseada no cliente e período
 */
export function generateInvoiceDescription(
  customer: Customer,
  period: string
): string {
  const serviceTypeMap: Record<Customer['typeOfService'], string> = {
    'POOL': 'Piscina',
    'POOL + SPA': 'Piscina + SPA',
    'SPA': 'SPA',
  };

  const frequencyMap: Record<Customer['frequency'], string> = {
    'Weekly': 'semanal',
    'Biweekly': 'quinzenal',
  };

  const serviceType = serviceTypeMap[customer.typeOfService] || 'Piscina';
  const frequency = frequencyMap[customer.frequency] || 'semanal';

  return `Serviço de limpeza ${frequency} - ${serviceType} - ${period}`;
}

/**
 * Converte dia da semana em formato string para número (0-6)
 */
export function getDayOfWeekNumber(day: Customer['serviceDay']): number {
  const dayMap: Record<Customer['serviceDay'], number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
  };
  return dayMap[day] || 1;
}

/**
 * Verifica se deve gerar invoice para um cliente na data especificada
 */
export function shouldGenerateInvoice(
  customer: Customer,
  invoices: Invoice[],
  targetDate: Date = new Date()
): boolean {
  // Cliente deve estar ativo
  if (customer.status !== 'active') return false;

  // Deve ter frequência e valor configurados
  if (!customer.frequency || !customer.chargePerMonth || customer.chargePerMonth <= 0) {
    return false;
  }

  // Verificar se passou da data de início
  const startDate = new Date(customer.startOn);
  if (targetDate < startDate) return false;

  // Verificar se passou da data de término
  if (customer.stopAfter !== 'NO END') {
    const stopDate = new Date(customer.stopAfter);
    if (targetDate > stopDate) return false;
  }

  // Verificar se é o dia correto da semana
  const serviceDayNumber = getDayOfWeekNumber(customer.serviceDay);
  if (targetDate.getDay() !== serviceDayNumber) return false;

  // Para frequência quinzenal, verificar se já passaram 14 dias desde última geração
  if (customer.frequency === 'Biweekly') {
    const customerInvoices = invoices
      .filter(inv => inv.customerId === customer.id && inv.isRecurring)
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    if (customerInvoices.length > 0) {
      const lastInvoice = customerInvoices[0];
      const lastDate = new Date(lastInvoice.issueDate);
      const daysDiff = Math.floor(
        (targetDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff < 14) return false;
    }
  }

  // Verificar se já existe invoice para este período
  const periodStart = getPeriodStart(targetDate, customer.frequency);
  const periodEnd = getPeriodEnd(targetDate, customer.frequency);
  const existingInvoice = invoices.find(inv => {
    if (inv.customerId !== customer.id) return false;
    const invDate = new Date(inv.issueDate);
    return invDate >= periodStart && invDate <= periodEnd;
  });

  if (existingInvoice) return false;

  return true;
}

/**
 * Calcula o início do período baseado na frequência
 */
function getPeriodStart(date: Date, frequency: 'Weekly' | 'Biweekly'): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  if (frequency === 'Weekly') {
    // Início da semana (domingo)
    const day = start.getDay();
    start.setDate(start.getDate() - day);
  } else {
    // Início do período quinzenal (última segunda-feira ou há 14 dias)
    const day = start.getDay();
    const daysToMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - daysToMonday);
    
    // Se não é segunda-feira, voltar para a segunda-feira anterior
    if (day !== 1) {
      start.setDate(start.getDate() - 7);
    }
  }

  return start;
}

/**
 * Calcula o fim do período baseado na frequência
 */
function getPeriodEnd(date: Date, frequency: 'Weekly' | 'Biweekly'): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  if (frequency === 'Weekly') {
    // Fim da semana (sábado)
    const day = end.getDay();
    const daysToSaturday = 6 - day;
    end.setDate(end.getDate() + daysToSaturday);
  } else {
    // Fim do período quinzenal (próxima segunda-feira ou +14 dias)
    const day = end.getDay();
    const daysToMonday = day === 0 ? 1 : 8 - day;
    end.setDate(end.getDate() + daysToMonday);
  }

  return end;
}

/**
 * Calcula a próxima data de geração baseada na frequência
 */
export function calculateNextGenerationDate(
  customer: Customer,
  lastGeneratedDate?: Date
): Date {
  const baseDate = lastGeneratedDate || new Date(customer.startOn);
  const nextDate = new Date(baseDate);

  if (customer.frequency === 'Weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else {
    nextDate.setDate(nextDate.getDate() + 14);
  }

  // Ajustar para o dia da semana correto
  const targetDay = getDayOfWeekNumber(customer.serviceDay);
  const currentDay = nextDate.getDay();
  const diff = targetDay - currentDay;
  nextDate.setDate(nextDate.getDate() + diff);

  return nextDate;
}

/**
 * Gera invoice a partir dos dados do cliente
 */
export function createInvoiceFromCustomer(
  customer: Customer,
  invoiceNumber: string,
  issueDate: Date = new Date(),
  dueDateDays: number = 30
): Invoice {
  const customerName = customer.name || `${customer.firstName} ${customer.lastName}`.trim();
  
  // Calcular valor da invoice
  const invoiceAmount = calculateInvoiceAmount(customer.chargePerMonth, customer.frequency);
  
  // Gerar descrição
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const period = `${monthNames[issueDate.getMonth()]} ${issueDate.getFullYear()}`;
  const description = generateInvoiceDescription(customer, period);

  // Calcular data de vencimento
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + dueDateDays);

  // Criar item da invoice
  const item: InvoiceItem = {
    id: `item_${Date.now()}`,
    description,
    quantity: 1,
    unitPrice: invoiceAmount,
    total: invoiceAmount,
  };

  // Criar configuração recorrente
  const recurringConfig: RecurringConfig = {
    frequency: customer.frequency.toLowerCase() as 'weekly' | 'biweekly',
    startDate: customer.startOn,
    endDate: customer.stopAfter !== 'NO END' ? customer.stopAfter : undefined,
    dayOfWeek: getDayOfWeekNumber(customer.serviceDay),
    autoGenerate: true,
    lastGenerated: issueDate.toISOString().split('T')[0],
    nextGenerationDate: calculateNextGenerationDate(customer, issueDate).toISOString().split('T')[0],
  };

  // Criar invoice
  const invoice: Invoice = {
    id: `inv_${Date.now()}`,
    invoiceNumber,
    customerId: customer.id,
    customerName,
    issueDate: issueDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    status: 'draft',
    subtotal: invoiceAmount,
    total: invoiceAmount,
    items: [item],
    isRecurring: true,
    recurringConfig,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return invoice;
}

/**
 * Gera invoices automáticas para todos os clientes elegíveis
 */
export function generateRecurringInvoices(
  customers: Customer[],
  existingInvoices: Invoice[],
  targetDate: Date = new Date()
): Invoice[] {
  const newInvoices: Invoice[] = [];
  let invoiceCounter = existingInvoices.length + 1;

  for (const customer of customers) {
    if (shouldGenerateInvoice(customer, existingInvoices, targetDate)) {
      const invoiceNumber = `INV-${targetDate.getFullYear()}-${String(invoiceCounter).padStart(3, '0')}`;
      const invoice = createInvoiceFromCustomer(customer, invoiceNumber, targetDate);
      newInvoices.push(invoice);
      invoiceCounter++;
    }
  }

  return newInvoices;
}

/**
 * Obtém o nome do mês formatado
 */
export function getFormattedMonth(date: Date, language: 'pt-BR' | 'en-US' = 'pt-BR'): string {
  if (language === 'pt-BR') {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  } else {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }
}

