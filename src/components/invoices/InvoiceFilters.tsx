import React from 'react';
import { InvoiceFilters as InvoiceFiltersType } from '../../types/invoice';
import { useLanguage } from '../../context/LanguageContext';
import './InvoiceFilters.css';

interface InvoiceFiltersProps {
  filters: InvoiceFiltersType;
  onFiltersChange: (filters: InvoiceFiltersType) => void;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({ filters, onFiltersChange }) => {
  const { t } = useLanguage();
  
  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : status as any,
    });
  };

  const handleOverdueToggle = () => {
    onFiltersChange({
      ...filters,
      overdueOnly: !filters.overdueOnly,
    });
  };

  return (
    <div className="invoice-filters">
      <div className="filter-group">
        <label className="filter-label">{t('invoices.status')}:</label>
        <div className="filter-buttons">
          <button
            onClick={() => handleStatusChange('all')}
            className={`filter-button ${!filters.status ? 'active' : ''}`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => handleStatusChange('draft')}
            className={`filter-button ${filters.status === 'draft' ? 'active' : ''}`}
          >
            {t('invoices.status.draft')}
          </button>
          <button
            onClick={() => handleStatusChange('sent')}
            className={`filter-button ${filters.status === 'sent' ? 'active' : ''}`}
          >
            {t('invoices.status.sent')}
          </button>
          <button
            onClick={() => handleStatusChange('paid')}
            className={`filter-button ${filters.status === 'paid' ? 'active' : ''}`}
          >
            {t('invoices.status.paid')}
          </button>
          <button
            onClick={() => handleStatusChange('overdue')}
            className={`filter-button ${filters.status === 'overdue' ? 'active' : ''}`}
          >
            {t('invoices.status.overdue')}
          </button>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.overdueOnly || false}
            onChange={handleOverdueToggle}
          />
          <span>{t('invoices.overdueOnly')}</span>
        </label>
      </div>
    </div>
  );
};

