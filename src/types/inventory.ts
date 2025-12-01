export type InventoryTransactionType = 'entry' | 'exit' | 'adjustment' | 'consumption';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: InventoryTransactionType;
  quantity: number;
  unit?: string;
  date: string;
  technicianId?: string;
  technicianName?: string;
  serviceId?: string;
  workOrderId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  stock: number;
  minStock?: number;
  unitPrice?: number;
  internalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryProduct {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  currentStock: number;
  minStock: number;
  category: string;
  lastUpdated: string;
  totalEntries: number;
  totalExits: number;
}

export interface InventoryFilters {
  productId?: string;
  category?: string;
  lowStock?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

