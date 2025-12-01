export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplier: string;
  purchaseDate: string;
  totalAmount: number;
  items: PurchaseItem[];
  receipt?: string; // URL ou base64 da imagem do comprovante
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseFilters {
  supplier?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

