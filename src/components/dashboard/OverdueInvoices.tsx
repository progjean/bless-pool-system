import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { OverdueInvoice } from '../../types/dashboard';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import { showToast } from '../../utils/toast';
import './OverdueInvoices.css';

export const OverdueInvoices: React.FC = () => {
  const { t, language } = useLanguage();
  const [invoices, setInvoices] = useState<OverdueInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverdueInvoices = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getOverdueInvoices();
        setInvoices(data);
      } catch (error) {
        console.error('Erro ao carregar invoices em atraso:', error);
        showToast.error('Erro ao carregar invoices em atraso');
      } finally {
        setLoading(false);
      }
    };

    loadOverdueInvoices();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}...</div>;
  }

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="overdue-invoices">
      <div className="invoices-summary">
        <div className="summary-item">
          <span className="summary-label">{t('dashboard.totalOverdue')}:</span>
          <span className="summary-value">
            {formatCurrency(totalAmount, language)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">{t('dashboard.quantity')}:</span>
          <span className="summary-value">{invoices.length} {t('dashboard.invoices')}</span>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>{t('dashboard.noOverdueInvoices')}</p>
        </div>
      ) : (
        <div className="invoices-table">
          <div className="table-header">
            <div className="table-cell">{t('dashboard.client')}</div>
            <div className="table-cell">{t('dashboard.value')}</div>
            <div className="table-cell">{t('dashboard.dueDate')}</div>
            <div className="table-cell">{t('dashboard.daysOverdue')}</div>
          </div>
          {invoices.map((invoice) => (
          <div key={invoice.id} className="table-row">
            <div className="table-cell">{invoice.clientName}</div>
            <div className="table-cell amount">
              {formatCurrency(invoice.amount, language)}
            </div>
            <div className="table-cell">{new Date(invoice.dueDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}</div>
            <div className={`table-cell days ${invoice.daysOverdue > 20 ? 'critical' : invoice.daysOverdue > 10 ? 'warning' : ''}`}>
              {invoice.daysOverdue} {t('dashboard.days')}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

