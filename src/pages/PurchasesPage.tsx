import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Purchase, PurchaseFilters } from '../types/purchase';
import { purchasesService } from '../services/purchasesService';
import { usePagination } from '../hooks/usePagination';
import { PurchaseStats } from '../components/purchases/PurchaseStats';
import { PurchaseList } from '../components/purchases/PurchaseList';
import { PurchaseFormModal } from '../components/purchases/PurchaseFormModal';
import { PaginationControls } from '../components/common/PaginationControls';
import { showToast } from '../utils/toast';
import './PurchasesPage.css';

export const PurchasesPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filters, setFilters] = useState<PurchaseFilters>({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        setLoading(true);
        const data = await purchasesService.list();
        setPurchases(data);
      } catch (error) {
        console.error('Erro ao carregar compras:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewPurchase = () => {
    setEditingPurchase(null);
    setShowFormModal(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setShowFormModal(true);
  };

  const handleSavePurchase = async (purchase: Purchase) => {
    try {
      if (editingPurchase) {
        await purchasesService.update(purchase.id, purchase);
      } else {
        await purchasesService.create(purchase);
      }
      
      // Recarregar lista
      const data = await purchasesService.list();
      setPurchases(data);
      
      setShowFormModal(false);
      setEditingPurchase(null);
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      // Toast já é mostrado pelo serviço
    }
  };

  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const thisMonthPurchases = purchases.filter(p => {
    const purchaseDate = new Date(p.purchaseDate);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
  });
  const thisMonthAmount = thisMonthPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="purchases-page">
      <header className="purchases-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('nav.purchases')}</h1>
          </div>
        </div>
      </header>

      <main className="purchases-main">
        <PurchaseStats
          totalPurchases={totalPurchases}
          totalAmount={totalAmount}
          thisMonthPurchases={thisMonthPurchases.length}
          thisMonthAmount={thisMonthAmount}
        />

        <div className="purchases-controls">
          <button onClick={handleNewPurchase} className="new-purchase-button">
            + {t('purchases.newPurchase')}
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <p>{t('common.loading') || 'Carregando...'}</p>
          </div>
        ) : (
          <PurchaseList
            purchases={purchases}
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={handleEditPurchase}
          />
        )}

        {showFormModal && (
          <PurchaseFormModal
            purchase={editingPurchase || undefined}
            onClose={() => {
              setShowFormModal(false);
              setEditingPurchase(null);
            }}
            onSave={handleSavePurchase}
          />
        )}
      </main>
    </div>
  );
};

