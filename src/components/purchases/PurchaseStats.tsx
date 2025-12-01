import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './PurchaseStats.css';

interface PurchaseStatsProps {
  totalPurchases: number;
  totalAmount: number;
  thisMonthPurchases: number;
  thisMonthAmount: number;
}

export const PurchaseStats: React.FC<PurchaseStatsProps> = ({
  totalPurchases,
  totalAmount,
  thisMonthPurchases,
  thisMonthAmount,
}) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="purchase-stats">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-content">
          <div className="stat-value">{totalPurchases}</div>
          <div className="stat-label">{t('purchases.totalPurchases')}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <div className="stat-value">
            {formatCurrency(totalAmount, language)}
          </div>
          <div className="stat-label">{t('purchases.totalAmount')}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📅</div>
        <div className="stat-content">
          <div className="stat-value">{thisMonthPurchases}</div>
          <div className="stat-label">{t('purchases.thisMonthPurchases')}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💵</div>
        <div className="stat-content">
          <div className="stat-value">
            {formatCurrency(thisMonthAmount, language)}
          </div>
          <div className="stat-label">{t('purchases.thisMonthAmount')}</div>
        </div>
      </div>
    </div>
  );
};

