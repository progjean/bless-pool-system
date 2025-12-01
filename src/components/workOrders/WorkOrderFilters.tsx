import React from 'react';
import { WorkOrderFilters as WorkOrderFiltersType, WorkOrderType, WorkOrderPriority, WorkOrderStatus } from '../../types/workOrder';
import { UserRole } from '../../types/user';
import { WORK_ORDER_TYPES } from '../../types/workOrder';
import { useLanguage } from '../../context/LanguageContext';
import './WorkOrderFilters.css';

interface WorkOrderFiltersProps {
  filters: WorkOrderFiltersType;
  onFiltersChange: (filters: WorkOrderFiltersType) => void;
  technicians: string[];
  userRole?: UserRole;
}

export const WorkOrderFilters: React.FC<WorkOrderFiltersProps> = ({
  filters,
  onFiltersChange,
  technicians,
  userRole,
}) => {
  const { t } = useLanguage();
  
  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : status as WorkOrderStatus,
    });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type === 'all' ? undefined : type as WorkOrderType,
    });
  };

  const handlePriorityChange = (priority: string) => {
    onFiltersChange({
      ...filters,
      priority: priority === 'all' ? undefined : priority as WorkOrderPriority,
    });
  };

  const handleTechnicianChange = (technician: string) => {
    onFiltersChange({
      ...filters,
      assignedTechnician: technician === 'all' ? undefined : technician,
    });
  };

  return (
    <div className="wo-filters">
      <div className="filter-group">
        <label className="filter-label">{t('workOrders.status')}:</label>
        <div className="filter-buttons">
          <button
            onClick={() => handleStatusChange('all')}
            className={`filter-button ${!filters.status ? 'active' : ''}`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => handleStatusChange('open')}
            className={`filter-button ${filters.status === 'open' ? 'active' : ''}`}
          >
            {t('workOrders.status.open')}
          </button>
          <button
            onClick={() => handleStatusChange('in_progress')}
            className={`filter-button ${filters.status === 'in_progress' ? 'active' : ''}`}
          >
            {t('workOrders.status.inProgress')}
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            className={`filter-button ${filters.status === 'completed' ? 'active' : ''}`}
          >
            {t('workOrders.status.completed')}
          </button>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">{t('workOrders.type')}:</label>
        <select
          value={filters.type || 'all'}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t('common.all')}</option>
          {WORK_ORDER_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">{t('workOrders.priority')}:</label>
        <select
          value={filters.priority || 'all'}
          onChange={(e) => handlePriorityChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t('common.allFem')}</option>
          <option value="urgent">{t('workOrders.priority.urgent')}</option>
          <option value="high">{t('workOrders.priority.high')}</option>
          <option value="medium">{t('workOrders.priority.medium')}</option>
          <option value="low">{t('workOrders.priority.low')}</option>
        </select>
      </div>

      {(userRole === UserRole.ADMIN || userRole === UserRole.SUPERVISOR) && technicians.length > 0 && (
        <div className="filter-group">
          <label className="filter-label">{t('workOrders.technician')}:</label>
          <select
            value={filters.assignedTechnician || 'all'}
            onChange={(e) => handleTechnicianChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('common.all')}</option>
            {technicians.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

