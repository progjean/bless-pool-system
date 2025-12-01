import { Purchase } from '../types/purchase';

export const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'pur1',
    purchaseNumber: 'PUR-2024-001',
    supplier: 'Fornecedor A',
    purchaseDate: '2024-02-01',
    totalAmount: 1250.00,
    items: [
      {
        id: 'i1',
        productId: 'p1',
        productName: 'Cloro Granulado',
        unit: 'kg',
        quantity: 20,
        unitPrice: 25.00,
        totalPrice: 500.00,
      },
      {
        id: 'i2',
        productId: 'p2',
        productName: 'Cloro Líquido',
        unit: 'litros',
        quantity: 30,
        unitPrice: 15.00,
        totalPrice: 450.00,
      },
      {
        id: 'i3',
        productId: 'p3',
        productName: 'Algicida',
        unit: 'litros',
        quantity: 10,
        unitPrice: 30.00,
        totalPrice: 300.00,
      },
    ],
    notes: 'Compra mensal de químicos',
    createdBy: 'Admin',
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'pur2',
    purchaseNumber: 'PUR-2024-002',
    supplier: 'Fornecedor B',
    purchaseDate: '2024-01-25',
    totalAmount: 850.00,
    items: [
      {
        id: 'i4',
        productId: 'p3',
        productName: 'Algicida',
        unit: 'litros',
        quantity: 15,
        unitPrice: 30.00,
        totalPrice: 450.00,
      },
      {
        id: 'i5',
        productId: 'p1',
        productName: 'Cloro Granulado',
        unit: 'kg',
        quantity: 10,
        unitPrice: 25.00,
        totalPrice: 250.00,
      },
    ],
    receipt: undefined,
    notes: 'Compra emergencial',
    createdBy: 'Admin',
    createdAt: '2024-01-25T14:00:00Z',
  },
];

export const generateNextPurchaseNumber = (): string => {
  const year = new Date().getFullYear();
  const lastNumber = MOCK_PURCHASES.length;
  return `PUR-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
};

