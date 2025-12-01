import { Customer, CustomerDetails, PaymentHistory, ServiceHistory, SentPDF, ProductHistory, ReadingHistory, CustomerTimelineEvent } from '../types/customer';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    firstName: 'Residência',
    lastName: 'Silva',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    accessCodes: [
      { id: 'ac1', type: 'gate', label: 'Portão Principal', code: '1234' },
      { id: 'ac2', type: 'lock', label: 'Cadeado', code: '5678' },
    ],
    contacts: [
      { id: 'c1', type: 'email', value: 'silva@email.com', tag: 'Owner' },
      { id: 'c2', type: 'phone', value: '(11) 98765-4321', tag: 'Owner' },
      { id: 'c3', type: 'phone', value: '(11) 91234-5678', tag: 'Wife' },
    ],
    frequency: 'Weekly',
    chargePerMonth: 1800.00,
    typeOfService: 'POOL',
    serviceDay: 'Monday',
    startOn: '2023-01-15',
    stopAfter: 'NO END',
    minutesAtStop: 25,
    assignedTechnician: 'João Silva',
    status: 'active',
    autoGenerateInvoices: true,
    invoiceDueDateDays: 30,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    // Legacy fields
    name: 'Residência Silva',
    serviceType: 'Weekly',
    servicePrice: 450.00,
  },
  {
    id: '2',
    firstName: 'Condomínio',
    lastName: 'Vista Mar',
    address: 'Av. Beira Mar, 456',
    city: 'Santos',
    state: 'SP',
    zipCode: '11000-000',
    accessCodes: [
      { id: 'ac3', type: 'gate', label: 'Portão Automático', code: '9999' },
      { id: 'ac4', type: 'other', label: 'Interfone', code: 'Apt 201' },
    ],
    contacts: [
      { id: 'c4', type: 'email', value: 'sindico@vistamar.com', tag: 'Work' },
      { id: 'c5', type: 'phone', value: '(13) 3456-7890', tag: 'Work' },
    ],
    frequency: 'Biweekly',
    chargePerMonth: 2400.00,
    typeOfService: 'POOL + SPA',
    serviceDay: 'Wednesday',
    startOn: '2023-03-20',
    stopAfter: 'NO END',
    minutesAtStop: 30,
    assignedTechnician: 'Maria Santos',
    status: 'active',
    autoGenerateInvoices: true,
    invoiceDueDateDays: 30,
    createdAt: '2023-03-20T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z',
    // Legacy fields
    name: 'Condomínio Vista Mar',
    serviceType: 'Biweekly',
    servicePrice: 1200.00,
  },
];

export const MOCK_PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: 'p1',
    customerId: '1',
    amount: 450.00,
    dueDate: '2024-02-05',
    paidDate: '2024-02-03',
    status: 'paid',
    invoiceNumber: 'INV-2024-001',
    description: 'Serviço semanal - Janeiro',
  },
  {
    id: 'p2',
    customerId: '1',
    amount: 450.00,
    dueDate: '2024-02-12',
    status: 'pending',
    invoiceNumber: 'INV-2024-002',
    description: 'Serviço semanal - Fevereiro',
  },
];

export const MOCK_SERVICE_HISTORY: ServiceHistory[] = [
  {
    id: 's1',
    customerId: '1',
    serviceDate: '2024-02-01',
    technician: 'João Silva',
    serviceType: 'Regular',
    status: 'completed',
    checklistCompleted: 12,
    checklistTotal: 12,
    observations: 'Tudo em ordem',
  },
  {
    id: 's2',
    customerId: '1',
    serviceDate: '2024-01-25',
    technician: 'João Silva',
    serviceType: 'Regular',
    status: 'completed',
    checklistCompleted: 11,
    checklistTotal: 12,
  },
];

export const MOCK_SENT_PDFS: SentPDF[] = [
  {
    id: 'pdf1',
    customerId: '1',
    sentDate: '2024-02-01T14:30:00Z',
    type: 'service_report',
    fileName: 'relatorio_2024-02-01.pdf',
    sentTo: 'silva@email.com',
  },
];

export const MOCK_PRODUCT_HISTORY: ProductHistory[] = [
  {
    id: 'ph1',
    customerId: '1',
    serviceId: 's1',
    productName: 'Cloro Granulado',
    quantity: 2,
    unit: 'kg',
    appliedDate: '2024-02-01',
  },
];

export const MOCK_READING_HISTORY: ReadingHistory[] = [
  {
    id: 'rh1',
    customerId: '1',
    serviceId: 's1',
    chemical: 'Cloro Livre',
    value: 2.5,
    unit: 'ppm',
    readingDate: '2024-02-01',
  },
];

export const MOCK_TIMELINE: CustomerTimelineEvent[] = [
  {
    id: 't1',
    customerId: '1',
    type: 'created',
    title: 'Cliente cadastrado',
    description: 'Cliente criado no sistema',
    date: '2023-01-15T10:00:00Z',
  },
  {
    id: 't2',
    customerId: '1',
    type: 'service',
    title: 'Primeiro serviço realizado',
    description: 'Serviço regular concluído',
    date: '2023-01-22T10:00:00Z',
  },
];

export const getCustomerDetails = (customerId: string): CustomerDetails | null => {
  const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
  if (!customer) return null;

  return {
    ...customer,
    paymentHistory: MOCK_PAYMENT_HISTORY.filter(p => p.customerId === customerId),
    serviceHistory: MOCK_SERVICE_HISTORY.filter(s => s.customerId === customerId),
    sentPDFs: MOCK_SENT_PDFS.filter(p => p.customerId === customerId),
    productHistory: MOCK_PRODUCT_HISTORY.filter(p => p.customerId === customerId),
    readingHistory: MOCK_READING_HISTORY.filter(r => r.customerId === customerId),
    timeline: MOCK_TIMELINE.filter(t => t.customerId === customerId),
  };
};

