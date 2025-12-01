import React from 'react';
import { PeriodVariation } from '../../types/dashboard';
import { useLanguage } from '../../context/LanguageContext';
import './ClientsVariation.css';

interface ClientsVariationProps {
  variations: PeriodVariation[];
}

export const ClientsVariation: React.FC<ClientsVariationProps> = ({ variations }) => {
  const { t } = useLanguage();
  
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '30days':
        return t('dashboard.period.30days');
      case '3months':
        return t('dashboard.period.3months');
      case '6months':
        return t('dashboard.period.6months');
      case '1year':
        return t('dashboard.period.1year');
      default:
        return period;
    }
  };

  return (
    <div className="clients-variation">
      {variations.map((variation, index) => (
        <div key={index} className="variation-item">
          <div className="variation-header">
            <span className="variation-period">{getPeriodLabel(variation.period)}</span>
            <span className={`variation-badge ${variation.trend}`}>
              {variation.trend === 'up' ? '📈' : variation.trend === 'down' ? '📉' : '➡️'}
              {variation.variation > 0 ? '+' : ''}{variation.variation.toFixed(1)}%
            </span>
          </div>
          <div className="variation-value">{variation.activeClients} {t('dashboard.clients')}</div>
          <div className="variation-bar">
            <div 
              className={`variation-bar-fill ${variation.trend}`}
              style={{ width: `${Math.min(variation.variation * 2, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

