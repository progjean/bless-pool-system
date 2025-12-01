import React from 'react';
import { WorkOrder } from '../../types/workOrder';
import { getWorkOrderTypeConfig } from '../../types/workOrder';
import { useLanguage } from '../../context/LanguageContext';
import './WorkOrderCard.css';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onClick: () => void;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ workOrder, onClick }) => {
  const { t, language } = useLanguage();
  const typeConfig = getWorkOrderTypeConfig(workOrder.type);

  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'open':
        return <span className="status-badge open">⏳ {t('dashboard.workOrders.open')}</span>;
      case 'in_progress':
        return <span className="status-badge in-progress">🔧 {t('dashboard.workOrders.inProgress')}</span>;
      case 'completed':
        return <span className="status-badge completed">✓ {t('dashboard.workOrders.completed')}</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">✕ {language === 'pt-BR' ? 'Cancelada' : 'Cancelled'}</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="priority-badge urgent">🔴 {t('workOrders.priority.urgent')}</span>;
      case 'high':
        return <span className="priority-badge high">🟠 {t('workOrders.priority.high')}</span>;
      case 'medium':
        return <span className="priority-badge medium">🟡 {t('workOrders.priority.medium')}</span>;
      case 'low':
        return <span className="priority-badge low">🟢 {t('workOrders.priority.low')}</span>;
      default:
        return null;
    }
  };

  return (
    <div 
      className="work-order-card" 
      onClick={onClick}
      style={{ borderLeftColor: typeConfig.color }}
    >
      <div className="card-header">
        <div className="wo-number-section">
          <span className="wo-type-icon" style={{ color: typeConfig.color }}>
            {typeConfig.icon}
          </span>
          <div>
            <h3>{workOrder.workOrderNumber}</h3>
            <span className="wo-type-label" style={{ color: typeConfig.color }}>
              {typeConfig.label}
            </span>
          </div>
        </div>
        <div className="badges">
          {getStatusBadge(workOrder.status)}
          {getPriorityBadge(workOrder.priority)}
        </div>
      </div>

      <div className="card-body">
        <h4 className="wo-title">{workOrder.title}</h4>
        <p className="wo-description">{workOrder.description}</p>

        <div className="wo-info">
          <div className="info-item">
            <span className="info-icon">👤</span>
            <span className="info-text">{workOrder.customerName}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📍</span>
            <span className="info-text">{workOrder.customerAddress}</span>
          </div>
          {workOrder.assignedTechnician && (
            <div className="info-item">
              <span className="info-icon">🔧</span>
              <span className="info-text">{workOrder.assignedTechnician}</span>
            </div>
          )}
          {workOrder.estimatedDuration && (
            <div className="info-item">
              <span className="info-icon">⏱️</span>
              <span className="info-text">{workOrder.estimatedDuration} {language === 'pt-BR' ? 'min estimados' : 'min estimated'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card-footer">
        <span className="created-info">
          {language === 'pt-BR' ? 'Criada em' : 'Created on'} {new Date(workOrder.createdAt).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
        </span>
        <span className="card-arrow">→</span>
      </div>
    </div>
  );
};

