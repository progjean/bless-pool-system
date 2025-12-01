import { InventoryProduct, InventoryTransaction } from '../types/inventory';

export const MOCK_INVENTORY_PRODUCTS: InventoryProduct[] = [
  {
    id: 'inv1',
    productId: 'p1',
    productName: 'Cloro Granulado',
    unit: 'kg',
    currentStock: 15,
    minStock: 20,
    category: 'Químicos',
    lastUpdated: '2024-02-01T10:00:00Z',
    totalEntries: 50,
    totalExits: 35,
  },
  {
    id: 'inv2',
    productId: 'p2',
    productName: 'Cloro Líquido',
    unit: 'litros',
    currentStock: 25,
    minStock: 10,
    category: 'Químicos',
    lastUpdated: '2024-02-02T14:00:00Z',
    totalEntries: 30,
    totalExits: 5,
  },
  {
    id: 'inv3',
    productId: 'p3',
    productName: 'Algicida',
    unit: 'litros',
    currentStock: 8,
    minStock: 10,
    category: 'Químicos',
    lastUpdated: '2024-01-30T09:00:00Z',
    totalEntries: 25,
    totalExits: 17,
  },
];

export const MOCK_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 't1',
    productId: 'p1',
    productName: 'Cloro Granulado',
    type: 'entry',
    quantity: 20,
    date: '2024-02-01T10:00:00Z',
    notes: 'Compra de fornecedor',
    createdBy: 'Admin',
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 't2',
    productId: 'p1',
    productName: 'Cloro Granulado',
    type: 'consumption',
    quantity: 5,
    date: '2024-02-01T15:00:00Z',
    technicianId: 't1',
    technicianName: 'João Silva',
    serviceId: 's1',
    notes: 'Uso em serviço',
    createdBy: 'João Silva',
    createdAt: '2024-02-01T15:00:00Z',
  },
  {
    id: 't3',
    productId: 'p2',
    productName: 'Cloro Líquido',
    type: 'entry',
    quantity: 30,
    date: '2024-02-02T14:00:00Z',
    notes: 'Compra',
    createdBy: 'Admin',
    createdAt: '2024-02-02T14:00:00Z',
  },
];

export const generateNextPurchaseNumber = (): string => {
  const year = new Date().getFullYear();
  return `PUR-${year}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
};

