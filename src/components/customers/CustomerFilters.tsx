import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './CustomerFilters.css';

interface CustomerFiltersProps {
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
  technicianFilter: string;
  onTechnicianChange: (technician: string) => void;
  technicians: string[];
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  statusFilter,
  onStatusChange,
  technicianFilter,
  onTechnicianChange,
  technicians,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="customer-filters">
      <div className="filter-group">
        <label className="filter-label">{t('customers.status')}:</label>
        <div className="filter-buttons">
          <button
            onClick={() => onStatusChange('all')}
            className={`filter-button ${statusFilter === 'all' ? 'active' : ''}`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => onStatusChange('active')}
            className={`filter-button ${statusFilter === 'active' ? 'active' : ''}`}
          >
            {t('customers.active')}
          </button>
          <button
            onClick={() => onStatusChange('inactive')}
            className={`filter-button ${statusFilter === 'inactive' ? 'active' : ''}`}
          >
            {t('customers.inactive')}
          </button>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">{t('customers.technician')}:</label>
        <select
          value={technicianFilter}
          onChange={(e) => onTechnicianChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t('common.all')}</option>
          {technicians.map(tech => (
            <option key={tech} value={tech}>{tech}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

