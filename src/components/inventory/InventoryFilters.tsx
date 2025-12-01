import React from 'react';
import { InventoryFilters as InventoryFiltersType } from '../../types/inventory';
import { useLanguage } from '../../context/LanguageContext';
import './InventoryFilters.css';

interface InventoryFiltersProps {
  filters: InventoryFiltersType;
  onFiltersChange: (filters: InventoryFiltersType) => void;
  categories: string[];
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
}) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="inventory-filters">
      <div className="filter-group">
        <label>{language === 'pt-BR' ? 'Categoria:' : 'Category:'}</label>
        <select
          value={filters.category || 'all'}
          onChange={(e) => onFiltersChange({
            ...filters,
            category: e.target.value === 'all' ? undefined : e.target.value,
          })}
        >
          <option value="all">{t('common.allFem')}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={filters.lowStock || false}
            onChange={(e) => onFiltersChange({
              ...filters,
              lowStock: e.target.checked ? true : undefined,
            })}
          />
          <span>{language === 'pt-BR' ? 'Apenas Estoque Baixo' : 'Low Stock Only'}</span>
        </label>
      </div>
    </div>
  );
};

