import React from 'react';
import { ReportFilters as ReportFiltersType } from '../../types/reports';
import { useLanguage } from '../../context/LanguageContext';
import './ReportFilters.css';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFiltersChange }) => {
  const { t, language } = useLanguage();
  return (
    <div className="report-filters">
      <div className="filter-group">
        <label>{language === 'pt-BR' ? 'Data De:' : 'Date From:'}</label>
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })}
        />
      </div>

      <div className="filter-group">
        <label>{language === 'pt-BR' ? 'Data Até:' : 'Date To:'}</label>
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || undefined })}
        />
      </div>
    </div>
  );
};

