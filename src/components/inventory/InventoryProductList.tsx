import React from 'react';
import { InventoryProduct, InventoryFilters } from '../../types/inventory';
import { InventoryProductCard } from './InventoryProductCard';
import { InventoryFilters as InventoryFiltersComponent } from './InventoryFilters';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../common/PaginationControls';
import { useLanguage } from '../../context/LanguageContext';
import './InventoryProductList.css';

interface InventoryProductListProps {
  products: InventoryProduct[];
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  onNewTransaction: (product?: InventoryProduct) => void;
}

export const InventoryProductList: React.FC<InventoryProductListProps> = ({
  products,
  filters,
  onFiltersChange,
  onNewTransaction,
}) => {
  const { t } = useLanguage();
  const filteredProducts = products.filter(product => {
    if (filters.productId && product.productId !== filters.productId) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.lowStock && product.currentStock >= product.minStock) return false;
    return true;
  });

  // Paginação
  const {
    paginatedData,
    paginationInfo,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(filteredProducts, { itemsPerPage: 12 });

  return (
    <div className="inventory-product-list">
      <InventoryFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        categories={Array.from(new Set(products.map(p => p.category)))}
      />

      <div className="products-grid">
        {paginatedData.length > 0 ? (
          <>
            {paginatedData.map(product => (
              <InventoryProductCard
                key={product.id}
                product={product}
                onTransaction={() => onNewTransaction(product)}
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
          <div className="no-products">
            <p>{t('inventory.notFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

