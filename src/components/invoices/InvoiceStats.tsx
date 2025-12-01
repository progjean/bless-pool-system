import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './InvoiceStats.css';

interface InvoiceStatsProps {
  totalInvoices: number;
  pendingAmount: number;
  overdueCount: number;
}

export const InvoiceStats: React.FC<InvoiceStatsProps> = ({
  totalInvoices,
  pendingAmount,
  overdueCount,
}) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="invoice-stats">
      <div className="stat-card">
        <div className="stat-icon">📄</div>
        <div className="stat-content">
          <div className="stat-value">{totalInvoices}</div>
          <div className="stat-label">{language === 'pt-BR' ? 'Total de Invoices' : 'Total Invoices'}</div>
        </div>
      </div>

      <div className="stat-card pending">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <div className="stat-value">
            {formatCurrency(pendingAmount, language)}
          </div>
          <div className="stat-label">{language === 'pt-BR' ? 'Pendente de Pagamento' : 'Pending Payment'}</div>
        </div>
      </div>

      <div className="stat-card overdue">
        <div className="stat-icon">⚠️</div>
        <div className="stat-content">
          <div className="stat-value">{overdueCount}</div>
          <div className="stat-label">{language === 'pt-BR' ? 'Invoices em Atraso' : 'Overdue Invoices'}</div>
        </div>
      </div>
    </div>
  );
};

