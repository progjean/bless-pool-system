// Serviço para gerenciar Purchases usando Supabase
import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import { Purchase, PurchaseItem } from '../types/purchase';
import { showToast } from '../utils/toast';
import { dataCache, createCacheKey, cachedAsync } from '../utils/cache';

// Converter Purchase para formato Supabase
const purchaseToSupabase = (purchase: Purchase) => ({
  purchase_number: purchase.purchaseNumber,
  supplier: purchase.supplier,
  purchase_date: purchase.purchaseDate,
  total_amount: purchase.totalAmount,
  company_id: null, // Será preenchido pelo RLS
});

// Converter do formato Supabase para Purchase
const supabaseToPurchase = (row: any, items: any[] = []): Purchase => ({
  id: row.id,
  purchaseNumber: row.purchase_number,
  supplier: row.supplier,
  purchaseDate: row.purchase_date,
  totalAmount: parseFloat(row.total_amount),
  items: items.map(item => ({
    id: item.id,
    productId: item.product_id || '',
    productName: item.product_name,
    quantity: parseFloat(item.quantity),
    unit: item.unit,
    unitPrice: parseFloat(item.unit_price),
    totalPrice: parseFloat(item.total_price),
  })),
  createdAt: row.created_at,
  createdBy: row.created_by || '',
});

export const purchasesService = {
  // Listar todas as compras
  async list(): Promise<Purchase[]> {
    const cacheKey = createCacheKey('purchases', 'list');
    
    return cachedAsync(cacheKey, async () => {
      if (!isSupabaseConfigured()) {
        const saved = localStorage.getItem('purchases');
        return saved ? JSON.parse(saved) : [];
      }

      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .order('purchase_date', { ascending: false });

        if (error) throw error;

        // Buscar items para cada compra
        const purchases = await Promise.all(
          (data || []).map(async (purchase) => {
            const { data: items } = await supabase
              .from('purchase_items')
              .select('*')
              .eq('purchase_id', purchase.id);
            
            return supabaseToPurchase(purchase, items || []);
          })
        );

        return purchases;
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        showToast.error(`Erro ao carregar compras: ${errorMessage}`);
        throw error;
      }
    }, 5 * 60 * 1000); // Cache por 5 minutos
  },

  // Buscar compra por ID
  async get(id: string): Promise<Purchase | null> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('purchases');
      const purchases = saved ? JSON.parse(saved) : [];
      return purchases.find((p: Purchase) => p.id === id) || null;
    }

    try {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('id', id)
        .single();

      if (purchaseError) throw purchaseError;
      if (!purchase) return null;

      const { data: items } = await supabase
        .from('purchase_items')
        .select('*')
        .eq('purchase_id', id);

      return supabaseToPurchase(purchase, items || []);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar compra: ${errorMessage}`);
      throw error;
    }
  },

  // Criar nova compra
  async create(purchase: Purchase): Promise<Purchase> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('purchases');
      const purchases = saved ? JSON.parse(saved) : [];
      const newPurchase = { ...purchase, id: `purchase_${Date.now()}` };
      purchases.push(newPurchase);
      localStorage.setItem('purchases', JSON.stringify(purchases));
      return newPurchase;
    }

    try {
      const supabaseData = purchaseToSupabase(purchase);
      
      // Criar compra
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
          .insert(supabaseData as any)
        .select()
        .single();

      if (purchaseError) throw purchaseError;
      if (!purchaseData) throw new Error('Purchase data is null');

      // Criar items
      if (purchase.items && purchase.items.length > 0) {
        const itemsData = purchase.items.map(item => ({
          purchase_id: (purchaseData as any).id,
          product_name: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(itemsData as any);

        if (itemsError) throw itemsError;
      }

      // Invalidar cache
      dataCache.invalidatePattern('^purchases:');

      showToast.success('Compra registrada com sucesso!');
      return await this.get((purchaseData as any).id);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao registrar compra: ${errorMessage}`);
      throw error;
    }
  },

  // Atualizar compra
  async update(id: string, purchase: Purchase): Promise<Purchase> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('purchases');
      const purchases = saved ? JSON.parse(saved) : [];
      const index = purchases.findIndex((p: Purchase) => p.id === id);
      if (index !== -1) {
        purchases[index] = { ...purchase, id };
        localStorage.setItem('purchases', JSON.stringify(purchases));
        return purchases[index];
      }
      throw new Error('Compra não encontrada');
    }

    try {
      const supabaseData = purchaseToSupabase(purchase);
      
      // Atualizar compra
      const { error: purchaseError } = await supabase
        .from('purchases')
          .update(supabaseData as any)
        .eq('id', id);

      if (purchaseError) throw purchaseError;

      // Deletar items antigos e criar novos
      await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', id);

      if (purchase.items && purchase.items.length > 0) {
        const itemsData = purchase.items.map(item => ({
          purchase_id: id,
          product_name: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(itemsData as any);

        if (itemsError) throw itemsError;
      }

      // Invalidar cache
      dataCache.invalidatePattern('^purchases:');
      dataCache.invalidate(createCacheKey('purchases', id));

      showToast.success('Compra atualizada com sucesso!');
      return await this.get(id);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao atualizar compra: ${errorMessage}`);
      throw error;
    }
  },

  // Deletar compra
  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('purchases');
      const purchases = saved ? JSON.parse(saved) : [];
      const filtered = purchases.filter((p: Purchase) => p.id !== id);
      localStorage.setItem('purchases', JSON.stringify(filtered));
      return;
    }

    try {
      // Deletar items primeiro
      await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', id);

      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidar cache
      dataCache.invalidatePattern('^purchases:');
      dataCache.invalidate(createCacheKey('purchases', id));

      showToast.success('Compra deletada com sucesso!');
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao deletar compra: ${errorMessage}`);
      throw error;
    }
  },
};

