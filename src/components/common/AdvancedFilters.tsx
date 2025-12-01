import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './AdvancedFilters.css';

export interface DateRange {
  from: string;
  to: string;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    dateRange?: DateRange;
    status?: string;
    [key: string]: any;
  }) => void;
  filters?: {
    search?: string;
    dateRange?: DateRange;
    status?: string;
    [key: string]: any;
  };
  availableStatuses?: string[];
  showDateRange?: boolean;
  showStatus?: boolean;
  customFilters?: React.ReactNode;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  filters = {},
  availableStatuses = [],
  showDateRange = true,
  showStatus = true,
  customFilters,
}) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    dateRange: filters.dateRange || { from: '', to: '' },
    status: filters.status || '',
  });

  const handleFilterChange = (key: string, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleClearFilters = () => {
    const cleared = {
      search: '',
      dateRange: { from: '', to: '' },
      status: '',
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActiveFilters = 
    localFilters.search ||
    localFilters.dateRange.from ||
    localFilters.dateRange.to ||
    localFilters.status;

  return (
    <div className="advanced-filters">
      <div className="filters-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="toggle-filters-button"
        >
          {isExpanded ? '▼' : '▶'} {language === 'pt-BR' ? 'Filtros Avançados' : 'Advanced Filters'}
          {hasActiveFilters && <span className="active-badge">●</span>}
        </button>
        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="clear-filters-button">
            {language === 'pt-BR' ? 'Limpar Filtros' : 'Clear Filters'}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filters-content">
          <div className="filter-group">
            <label>{language === 'pt-BR' ? 'Busca' : 'Search'}</label>
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder={language === 'pt-BR' ? 'Buscar...' : 'Search...'}
              className="filter-input"
            />
          </div>

          {showDateRange && (
            <div className="filter-group date-range-group">
              <label>{language === 'pt-BR' ? 'Período' : 'Date Range'}</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={localFilters.dateRange.from}
                  onChange={(e) =>
                    handleFilterChange('dateRange', {
                      ...localFilters.dateRange,
                      from: e.target.value,
                    })
                  }
                  className="filter-input"
                />
                <span>{language === 'pt-BR' ? 'até' : 'to'}</span>
                <input
                  type="date"
                  value={localFilters.dateRange.to}
                  onChange={(e) =>
                    handleFilterChange('dateRange', {
                      ...localFilters.dateRange,
                      to: e.target.value,
                    })
                  }
                  className="filter-input"
                />
              </div>
            </div>
          )}

          {showStatus && availableStatuses.length > 0 && (
            <div className="filter-group">
              <label>{language === 'pt-BR' ? 'Status' : 'Status'}</label>
              <select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">{language === 'pt-BR' ? 'Todos' : 'All'}</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {customFilters}
        </div>
      )}
    </div>
  );
};

