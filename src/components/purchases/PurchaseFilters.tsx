import React from 'react';
import { PurchaseFilters as PurchaseFiltersType } from '../../types/purchase';
import './PurchaseFilters.css';

interface PurchaseFiltersProps {
  filters: PurchaseFiltersType;
  onFiltersChange: (filters: PurchaseFiltersType) => void;
  suppliers: string[];
}

export const PurchaseFilters: React.FC<PurchaseFiltersProps> = ({
  filters,
  onFiltersChange,
  suppliers,
}) => {
  return (
    <div className="purchase-filters">
      <div className="filter-group">
        <label>Fornecedor:</label>
        <select
          value={filters.supplier || 'all'}
          onChange={(e) => onFiltersChange({
            ...filters,
            supplier: e.target.value === 'all' ? undefined : e.target.value,
          })}
        >
          <option value="all">Todos</option>
          {suppliers.map(supplier => (
            <option key={supplier} value={supplier}>{supplier}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Data De:</label>
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => onFiltersChange({
            ...filters,
            dateFrom: e.target.value || undefined,
          })}
        />
      </div>

      <div className="filter-group">
        <label>Data Até:</label>
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => onFiltersChange({
            ...filters,
            dateTo: e.target.value || undefined,
          })}
        />
      </div>

      <div className="filter-group">
        <label>Valor Mínimo:</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={filters.minAmount || ''}
          onChange={(e) => onFiltersChange({
            ...filters,
            minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
          })}
          placeholder="R$ 0,00"
        />
      </div>

      <div className="filter-group">
        <label>Valor Máximo:</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={filters.maxAmount || ''}
          onChange={(e) => onFiltersChange({
            ...filters,
            maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
          })}
          placeholder="R$ 0,00"
        />
      </div>
    </div>
  );
};

