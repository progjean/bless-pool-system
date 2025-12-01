// Schemas de validação usando Zod
import { z } from 'zod';

// Schema de validação para Customer
export const customerSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres').max(50, 'Sobrenome muito longo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  frequency: z.enum(['Weekly', 'Biweekly']),
  chargePerMonth: z.number().min(0, 'Valor deve ser positivo'),
  typeOfService: z.enum(['POOL', 'POOL + SPA', 'SPA']),
  serviceDay: z.string().optional(),
  startOn: z.string().optional(),
  stopAfter: z.union([z.string(), z.literal('NO END')]).optional(),
  minutesAtStop: z.number().min(0).max(60).optional(),
  assignedTechnician: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

// Schema de validação para Invoice
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Número da invoice é obrigatório'),
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  issueDate: z.string().min(1, 'Data de emissão é obrigatória'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  items: z.array(z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
    unitPrice: z.number().min(0, 'Preço deve ser positivo'),
  })).min(1, 'Adicione pelo menos um item'),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

// Schema de validação para Work Order
export const workOrderSchema = z.object({
  workOrderNumber: z.string().min(1, 'Número da work order é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  assignedTechnician: z.string().optional(),
  estimatedDuration: z.number().min(0).optional(),
});

// Schema de validação para Login
export const loginSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(4, 'Senha deve ter pelo menos 4 caracteres'),
});

// Schema de validação para Service Message
export const serviceMessageSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
});

// Schema de validação para Reading Standard
export const readingSchema = z.object({
  description: z.string().min(3, 'Descrição é obrigatória'),
  readingType: z.string().min(1, 'Tipo de leitura é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  values: z.array(z.string()).optional(),
  selectedValue: z.string().optional(),
});

// Schema de validação para Dosage Standard
export const dosageSchema = z.object({
  description: z.string().min(3, 'Descrição é obrigatória'),
  dosageType: z.string().min(1, 'Tipo de dosagem é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  costPerUOM: z.number().min(0, 'Custo deve ser positivo').optional(),
  pricePerUOM: z.number().min(0, 'Preço deve ser positivo').optional(),
  values: z.array(z.string()).optional(),
  selectedValue: z.string().optional(),
});

// Helper para formatar erros de validação
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  errors.issues.forEach((error) => {
    const path = error.path.join('.');
    formatted[path] = error.message;
  });
  
  return formatted;
};

// Helper para validar e retornar dados ou erros
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: formatValidationErrors(result.error),
  };
};

