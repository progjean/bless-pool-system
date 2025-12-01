import { Invoice, Payment, LateFee } from '../types/invoice';

export const DEFAULT_LATE_FEE: LateFee = {
  id: 'default',
  type: 'percentage',
  value: 2, // 2% ao mês
  applyAfterDays: 5, // após 5 dias de atraso
  description: 'Taxa de atraso padrão',
};

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    customerName: 'Residência Silva',
    issueDate: '2024-01-15',
    dueDate: '2024-02-05',
    paidDate: '2024-02-03',
    status: 'paid',
    subtotal: 450.00,
    total: 450.00,
    items: [
      {
        id: 'item1',
        description: 'Serviço de limpeza semanal - Janeiro',
        quantity: 4,
        unitPrice: 112.50,
        total: 450.00,
      },
    ],
    isRecurring: true,
    recurringConfig: {
      frequency: 'weekly',
      startDate: '2024-01-15',
      dayOfWeek: 1, // Monday
      autoGenerate: true,
      lastGenerated: '2024-01-15',
      nextGenerationDate: '2024-01-22',
    },
    emailSent: true,
    emailSentDate: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-03T14:30:00Z',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    customerId: '1',
    customerName: 'Residência Silva',
    issueDate: '2024-02-01',
    dueDate: '2024-02-12',
    status: 'overdue',
    subtotal: 450.00,
    lateFee: 9.00,
    lateFeeApplied: true,
    lateFeeAppliedDate: '2024-02-18',
    total: 459.00,
    items: [
      {
        id: 'item2',
        description: 'Serviço de limpeza semanal - Fevereiro',
        quantity: 4,
        unitPrice: 112.50,
        total: 450.00,
      },
    ],
    isRecurring: true,
    recurringConfig: {
      frequency: 'weekly',
      startDate: '2024-01-15',
      dayOfWeek: 1,
      autoGenerate: true,
      lastGenerated: '2024-02-01',
      nextGenerationDate: '2024-02-08',
    },
    emailSent: true,
    emailSentDate: '2024-02-01T10:00:00Z',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-18T10:00:00Z',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2024-003',
    customerId: '2',
    customerName: 'Condomínio Vista Mar',
    issueDate: '2024-02-01',
    dueDate: '2024-02-15',
    status: 'sent',
    subtotal: 1200.00,
    total: 1200.00,
    items: [
      {
        id: 'item3',
        description: 'Serviço quinzenal - Fevereiro',
        quantity: 1,
        unitPrice: 1200.00,
        total: 1200.00,
      },
    ],
    isRecurring: true,
    recurringConfig: {
      frequency: 'biweekly',
      startDate: '2024-02-01',
      dayOfWeek: 3, // Wednesday
      autoGenerate: true,
      lastGenerated: '2024-02-01',
      nextGenerationDate: '2024-02-15',
    },
    emailSent: true,
    emailSentDate: '2024-02-01T10:00:00Z',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay1',
    invoiceId: 'inv1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    customerName: 'Residência Silva',
    amount: 450.00,
    paymentDate: '2024-02-03',
    paymentMethod: 'bank_transfer',
    reference: 'TED-123456',
    recordedBy: 'Admin',
    createdAt: '2024-02-03T14:30:00Z',
  },
];

export const calculateLateFee = (
  invoice: Invoice,
  lateFeeConfig: LateFee,
  currentDate: Date = new Date()
): number => {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return 0;
  }

  const dueDate = new Date(invoice.dueDate);
  const daysOverdue = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysOverdue < lateFeeConfig.applyAfterDays) {
    return 0;
  }

  if (lateFeeConfig.type === 'fixed') {
    return lateFeeConfig.value;
  } else {
    // Percentual: calcular baseado no subtotal
    const percentage = lateFeeConfig.value / 100;
    // Calcular proporcional aos dias (ex: 2% ao mês = 0.067% ao dia)
    const daysInMonth = 30;
    const dailyRate = percentage / daysInMonth;
    return invoice.subtotal * dailyRate * daysOverdue;
  }
};

export const applyLateFeeToInvoice = (
  invoice: Invoice,
  lateFeeConfig: LateFee
): Invoice => {
  if (invoice.lateFeeApplied) {
    return invoice;
  }

  const lateFee = calculateLateFee(invoice, lateFeeConfig);
  
  if (lateFee > 0) {
    return {
      ...invoice,
      lateFee,
      lateFeeApplied: true,
      lateFeeAppliedDate: new Date().toISOString(),
      total: invoice.subtotal + lateFee,
      status: invoice.status === 'sent' ? 'overdue' : invoice.status,
    };
  }

  return invoice;
};

export const generateNextInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const lastInvoice = MOCK_INVOICES[MOCK_INVOICES.length - 1];
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    return `INV-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
  }
  return `INV-${year}-001`;
};

