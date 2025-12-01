import React from 'react';
import { Purchase, PurchaseFilters } from '../../types/purchase';
import { PurchaseCard } from './PurchaseCard';
import { PurchaseFilters as PurchaseFiltersComponent } from './PurchaseFilters';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../common/PaginationControls';
import { useLanguage } from '../../context/LanguageContext';
import './PurchaseList.css';

interface PurchaseListProps {
  purchases: Purchase[];
  filters: PurchaseFilters;
  onFiltersChange: (filters: PurchaseFilters) => void;
  onEdit: (purchase: Purchase) => void;
}

export const PurchaseList: React.FC<PurchaseListProps> = ({
  purchases,
  filters,
  onFiltersChange,
  onEdit,
}) => {
  const { t } = useLanguage();
  const filteredPurchases = purchases.filter(purchase => {
    if (filters.supplier && purchase.supplier !== filters.supplier) return false;
    if (filters.dateFrom && purchase.purchaseDate < filters.dateFrom) return false;
    if (filters.dateTo && purchase.purchaseDate > filters.dateTo) return false;
    if (filters.minAmount && purchase.totalAmount < filters.minAmount) return false;
    if (filters.maxAmount && purchase.totalAmount > filters.maxAmount) return false;
    return true;
  });

  // Paginação
  const {
    paginatedData,
    paginationInfo,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(filteredPurchases, { itemsPerPage: 12 });

  const suppliers = Array.from(new Set(purchases.map(p => p.supplier)));

  return (
    <div className="purchase-list">
      <PurchaseFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        suppliers={suppliers}
      />

      <div className="purchases-grid">
        {paginatedData.length > 0 ? (
          <>
            {paginatedData.map(purchase => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onEdit={() => onEdit(purchase)}
              />
            ))}
            <PaginationControls
              {...paginationInfo}
              onNext={nextPage}
              onPrevious={previousPage}
              onGoToPage={goToPage}
            />
          </>
        ) : (
          <div className="no-purchases">
            <p>{t('purchases.notFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

