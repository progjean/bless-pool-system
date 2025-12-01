// Serviço para gerenciar Products (Inventário) usando Supabase
import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import { Product, InventoryTransaction } from '../types/inventory';
import { showToast } from '../utils/toast';
import { dataCache, createCacheKey, cachedAsync } from '../utils/cache';

// Converter Product para formato Supabase
const productToSupabase = (product: Product) => ({
  name: product.name,
  description: product.description || null,
  unit: product.unit,
  stock: product.stock,
  min_stock: product.minStock || 0,
  unit_price: product.unitPrice || null,
  internal_price: product.internalPrice || null,
  company_id: null, // Será preenchido pelo RLS
});

// Converter do formato Supabase para Product
const supabaseToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  unit: row.unit,
  stock: parseFloat(row.stock),
  minStock: row.min_stock || 0,
  unitPrice: row.unit_price ? parseFloat(row.unit_price) : undefined,
  internalPrice: row.internal_price ? parseFloat(row.internal_price) : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Converter InventoryTransaction para formato Supabase
const transactionToSupabase = (transaction: InventoryTransaction) => ({
  product_id: transaction.productId,
  type: transaction.type,
  quantity: transaction.quantity,
  date: transaction.date || new Date().toISOString().split('T')[0],
  technician_id: transaction.technicianId || null,
  notes: transaction.notes || null,
  company_id: null, // Será preenchido pelo RLS
});

// Converter do formato Supabase para InventoryTransaction
const supabaseToTransaction = (row: any, productName?: string): InventoryTransaction => ({
  id: row.id,
  productId: row.product_id,
  productName: productName || '',
  type: row.type as InventoryTransaction['type'],
  quantity: parseFloat(row.quantity),
  date: row.date,
  technicianId: row.technician_id || undefined,
  notes: row.notes || undefined,
  createdBy: row.created_by || '',
  createdAt: row.created_at,
});

export const productsService = {
  // Listar todos os produtos
  async list(): Promise<Product[]> {
    const cacheKey = createCacheKey('products', 'list');
    
    return cachedAsync(cacheKey, async () => {
      if (!isSupabaseConfigured()) {
        const saved = localStorage.getItem('products');
        return saved ? JSON.parse(saved) : [];
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        return (data || []).map(row => supabaseToProduct(row));
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        showToast.error(`Erro ao carregar produtos: ${errorMessage}`);
        throw error;
      }
    }, 5 * 60 * 1000); // Cache por 5 minutos
  },

  // Buscar produto por ID
  async get(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('products');
      const products = saved ? JSON.parse(saved) : [];
      return products.find((p: Product) => p.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return supabaseToProduct(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar produto: ${errorMessage}`);
      throw error;
    }
  },

  // Criar novo produto
  async create(product: Product): Promise<Product> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('products');
      const products = saved ? JSON.parse(saved) : [];
      const newProduct = { ...product, id: `product_${Date.now()}` };
      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      return newProduct;
    }

    try {
      const supabaseData = productToSupabase(product);
      
      const { data, error } = await supabase
        .from('products')
          .insert(supabaseData as any)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache
      dataCache.invalidatePattern('^products:');

      showToast.success('Produto criado com sucesso!');
      return supabaseToProduct(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao criar produto: ${errorMessage}`);
      throw error;
    }
  },

  // Atualizar produto
  async update(id: string, product: Product): Promise<Product> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('products');
      const products = saved ? JSON.parse(saved) : [];
      const index = products.findIndex((p: Product) => p.id === id);
      if (index !== -1) {
        products[index] = { ...product, id, updatedAt: new Date().toISOString() };
        localStorage.setItem('products', JSON.stringify(products));
        return products[index];
      }
      throw new Error('Produto não encontrado');
    }

    try {
      const supabaseData = productToSupabase(product);
      
      const { data, error } = await supabase
        .from('products')
          .update(supabaseData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache
      dataCache.invalidatePattern('^products:');
      dataCache.invalidate(createCacheKey('products', id));

      showToast.success('Produto atualizado com sucesso!');
      return supabaseToProduct(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao atualizar produto: ${errorMessage}`);
      throw error;
    }
  },

  // Deletar produto
  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('products');
      const products = saved ? JSON.parse(saved) : [];
      const filtered = products.filter((p: Product) => p.id !== id);
      localStorage.setItem('products', JSON.stringify(filtered));
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidar cache
      dataCache.invalidatePattern('^products:');
      dataCache.invalidate(createCacheKey('products', id));

      showToast.success('Produto deletado com sucesso!');
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao deletar produto: ${errorMessage}`);
      throw error;
    }
  },

  // Criar transação de inventário
  async createTransaction(transaction: InventoryTransaction): Promise<InventoryTransaction> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('inventoryTransactions');
      const transactions = saved ? JSON.parse(saved) : [];
      const newTransaction = { ...transaction, id: `trans_${Date.now()}` };
      transactions.push(newTransaction);
      localStorage.setItem('inventoryTransactions', JSON.stringify(transactions));
      
      // Atualizar estoque do produto
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const productIndex = products.findIndex((p: Product) => p.id === transaction.productId);
      if (productIndex !== -1) {
        if (transaction.type === 'entry') {
          products[productIndex].stock += transaction.quantity;
        } else if (transaction.type === 'exit' || transaction.type === 'consumption') {
          products[productIndex].stock -= transaction.quantity;
        }
        localStorage.setItem('products', JSON.stringify(products));
      }
      
      return newTransaction;
    }

    try {
      const supabaseData = transactionToSupabase(transaction);
      
      const { data, error } = await supabase
        .from('inventory_transactions')
          .insert(supabaseData as any)
        .select()
        .single();

      if (error) throw error;

      // Atualizar estoque do produto
      const product = await this.get(transaction.productId);
      if (product) {
        let newStock = product.stock;
        if (transaction.type === 'entry') {
          newStock += transaction.quantity;
        } else if (transaction.type === 'exit' || transaction.type === 'consumption') {
          newStock -= transaction.quantity;
        }
        
        await this.update(transaction.productId, { ...product, stock: newStock });
      }

      showToast.success('Transação registrada com sucesso!');
      return supabaseToTransaction(data);
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao registrar transação: ${errorMessage}`);
      throw error;
    }
  },

  // Listar transações
  async listTransactions(productId?: string): Promise<InventoryTransaction[]> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('inventoryTransactions');
      const transactions = saved ? JSON.parse(saved) : [];
      return productId 
        ? transactions.filter((t: InventoryTransaction) => t.productId === productId)
        : transactions;
    }

    try {
      let query = supabase
        .from('inventory_transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(row => supabaseToTransaction(row));
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar transações: ${errorMessage}`);
      throw error;
    }
  },
};

