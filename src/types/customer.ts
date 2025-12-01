export interface Contact {
  id: string;
  type: 'email' | 'phone';
  value: string;
  tag: 'Owner' | 'Wife' | 'Work' | 'Other';
}

export interface AccessCode {
  id: string;
  type: 'gate' | 'lock' | 'other';
  label: string;
  code: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  accessCodes: AccessCode[];
  contacts: Contact[];
  frequency: 'Weekly' | 'Biweekly';
  chargePerMonth: number;
  typeOfService: 'POOL' | 'POOL + SPA' | 'SPA';
  serviceDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startOn: string; // ISO date string
  stopAfter: string | 'NO END'; // ISO date string or 'NO END'
  minutesAtStop: number; // Default 25
  assignedTechnician: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  companyId?: string;
  // Invoice generation fields
  autoGenerateInvoices?: boolean; // Se deve gerar invoices automaticamente
  lastInvoiceGeneratedDate?: string; // Data da última invoice gerada
  nextInvoiceGenerationDate?: string; // Próxima data de geração
  invoiceDueDateDays?: number; // Dias para vencimento (padrão 30)
  // Legacy fields for backward compatibility
  name?: string; // Computed: firstName + lastName
  serviceType?: 'Weekly' | 'Biweekly'; // Legacy: use frequency
  servicePrice?: number; // Legacy: use chargePerMonth
}

export interface PaymentHistory {
  id: string;
  customerId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  invoiceNumber: string;
  description?: string;
}

export interface ServiceHistory {
  id: string;
  customerId: string;
  serviceDate: string;
  technician: string;
  serviceType: string;
  status: 'completed' | 'skipped';
  checklistCompleted: number;
  checklistTotal: number;
  observations?: string;
}

export interface SentPDF {
  id: string;
  customerId: string;
  sentDate: string;
  type: 'service_report' | 'invoice' | 'other';
  fileName: string;
  sentTo: string; // email
}

export interface ProductHistory {
  id: string;
  customerId: string;
  serviceId: string;
  productName: string;
  quantity: number;
  unit: string;
  appliedDate: string;
}

export interface ReadingHistory {
  id: string;
  customerId: string;
  serviceId: string;
  chemical: string;
  value: number;
  unit: string;
  readingDate: string;
}

export interface CustomerTimelineEvent {
  id: string;
  customerId: string;
  type: 'created' | 'service' | 'payment' | 'status_change' | 'contact_update' | 'other';
  title: string;
  description: string;
  date: string;
  userId?: string;
}

export interface CustomerDetails extends Customer {
  paymentHistory: PaymentHistory[];
  serviceHistory: ServiceHistory[];
  sentPDFs: SentPDF[];
  productHistory: ProductHistory[];
  readingHistory: ReadingHistory[];
  timeline: CustomerTimelineEvent[];
}

