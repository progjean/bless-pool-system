import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './InventoryStats.css';

interface InventoryStatsProps {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({
  totalProducts,
  lowStockCount,
  totalValue,
}) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="inventory-stats">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-content">
          <div className="stat-value">{totalProducts}</div>
          <div className="stat-label">{t('inventory.totalProducts')}</div>
        </div>
      </div>

      <div className={`stat-card ${lowStockCount > 0 ? 'alert' : ''}`}>
        <div className="stat-icon">⚠️</div>
        <div className="stat-content">
          <div className="stat-value">{lowStockCount}</div>
          <div className="stat-label">{t('inventory.lowStock')}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <div className="stat-value">
            {formatCurrency(totalValue, language)}
          </div>
          <div className="stat-label">{t('inventory.totalValue')}</div>
        </div>
      </div>
    </div>
  );
};

