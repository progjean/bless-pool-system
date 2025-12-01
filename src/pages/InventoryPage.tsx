import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Product, InventoryTransaction, InventoryProduct } from '../types/inventory';
import { productsService } from '../services/productsService';
import { usePagination } from '../hooks/usePagination';
import { InventoryStats } from '../components/inventory/InventoryStats';
import { InventoryProductList } from '../components/inventory/InventoryProductList';
import { InventoryTransactions } from '../components/inventory/InventoryTransactions';
import { InventoryTransactionModal } from '../components/inventory/InventoryTransactionModal';
import { PaginationControls } from '../components/common/PaginationControls';
import { showToast } from '../utils/toast';
import './InventoryPage.css';

export const InventoryPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, transactionsData] = await Promise.all([
          productsService.list(),
          productsService.listTransactions(),
        ]);
        // Converter Product[] para InventoryProduct[]
        const inventoryProducts: InventoryProduct[] = productsData.map(p => ({
          id: p.id,
          productId: p.id,
          productName: p.name,
          unit: p.unit,
          currentStock: p.stock,
          minStock: p.minStock || 0,
          category: 'other', // Pode ser melhorado
          lastUpdated: p.updatedAt || p.createdAt || new Date().toISOString(),
          totalEntries: 0,
          totalExits: 0,
        }));
        setProducts(inventoryProducts);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewTransaction = (product?: InventoryProduct) => {
    setSelectedProduct(product || null);
    setShowTransactionModal(true);
  };

  const lowStockProducts = products.filter(p => p.currentStock < p.minStock);
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * 0), 0); // Ajustar quando tiver preço

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('nav.inventory')}</h1>
          </div>
        </div>
      </header>

      <main className="inventory-main">
        <InventoryStats
          totalProducts={totalProducts}
          lowStockCount={lowStockProducts.length}
          totalValue={totalValue}
        />

        <div className="inventory-controls">
          <button onClick={() => handleNewTransaction()} className="new-transaction-button">
            + {t('inventory.newTransaction')}
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <p>{t('common.loading') || 'Carregando...'}</p>
          </div>
        ) : (
          <div className="inventory-sections">
            <section className="products-section">
              <h2>{t('inventory.productsInStock')}</h2>
              <InventoryProductList
                products={products}
                filters={filters}
                onFiltersChange={setFilters}
                onNewTransaction={handleNewTransaction}
              />
            </section>

            <section className="transactions-section">
              <h2>{t('inventory.recentMovements')}</h2>
              <InventoryTransactions transactions={transactions} />
            </section>
          </div>
        )}

        {showTransactionModal && (
          <InventoryTransactionModal
            product={selectedProduct}
            products={products}
            onClose={() => {
              setShowTransactionModal(false);
              setSelectedProduct(null);
            }}
            onSave={async (transaction) => {
              try {
                await productsService.createTransaction(transaction);
                // Recarregar dados
                const [productsData, transactionsData] = await Promise.all([
                  productsService.list(),
                  productsService.listTransactions(),
                ]);
                // Converter Product[] para InventoryProduct[]
                const inventoryProducts: InventoryProduct[] = productsData.map(p => ({
                  id: p.id,
                  productId: p.id,
                  productName: p.name,
                  unit: p.unit,
                  currentStock: p.stock,
                  minStock: p.minStock || 0,
                  category: 'other',
                  lastUpdated: p.updatedAt || p.createdAt || new Date().toISOString(),
                  totalEntries: 0,
                  totalExits: 0,
                }));
                setProducts(inventoryProducts);
                setTransactions(transactionsData);
                setShowTransactionModal(false);
                setSelectedProduct(null);
              } catch (error) {
                console.error('Erro ao salvar transação:', error);
              }
            }}
          />
        )}
      </main>
    </div>
  );
};

