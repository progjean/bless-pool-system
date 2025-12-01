import React from 'react';
import { WorkOrder } from '../../types/workOrder';
import { getWorkOrderTypeConfig } from '../../types/workOrder';
import './WorkOrderDetails.css';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
}

export const WorkOrderDetails: React.FC<WorkOrderDetailsProps> = ({ workOrder }) => {
  const typeConfig = getWorkOrderTypeConfig(workOrder.type);

  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'open':
        return <span className="status-badge open">⏳ Aberta</span>;
      case 'in_progress':
        return <span className="status-badge in-progress">🔧 Em Andamento</span>;
      case 'completed':
        return <span className="status-badge completed">✓ Concluída</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">✕ Cancelada</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="priority-badge urgent">🔴 Urgente</span>;
      case 'high':
        return <span className="priority-badge high">🟠 Alta</span>;
      case 'medium':
        return <span className="priority-badge medium">🟡 Média</span>;
      case 'low':
        return <span className="priority-badge low">🟢 Baixa</span>;
      default:
        return null;
    }
  };

  return (
    <div className="wo-details">
      <div className="details-grid">
        {/* Informações Principais */}
        <div className="details-card">
          <h3>Informações da Work Order</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value">{getStatusBadge(workOrder.status)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tipo:</span>
              <span className="info-value" style={{ color: typeConfig.color }}>
                {typeConfig.icon} {typeConfig.label}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Prioridade:</span>
              <span className="info-value">{getPriorityBadge(workOrder.priority)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Cliente:</span>
              <span className="info-value">{workOrder.customerName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Endereço:</span>
              <span className="info-value">{workOrder.customerAddress}</span>
            </div>
            {workOrder.assignedTechnician && (
              <div className="info-item">
                <span className="info-label">Técnico:</span>
                <span className="info-value">{workOrder.assignedTechnician}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Criada por:</span>
              <span className="info-value">{workOrder.createdBy}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Data de Criação:</span>
              <span className="info-value">
                {new Date(workOrder.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {workOrder.startedAt && (
              <div className="info-item">
                <span className="info-label">Iniciada em:</span>
                <span className="info-value">
                  {new Date(workOrder.startedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {workOrder.completedAt && (
              <div className="info-item">
                <span className="info-label">Concluída em:</span>
                <span className="info-value">
                  {new Date(workOrder.completedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {workOrder.completedBy && (
              <div className="info-item">
                <span className="info-label">Concluída por:</span>
                <span className="info-value">{workOrder.completedBy}</span>
              </div>
            )}
            {workOrder.estimatedDuration && (
              <div className="info-item">
                <span className="info-label">Duração Estimada:</span>
                <span className="info-value">{workOrder.estimatedDuration} minutos</span>
              </div>
            )}
            {workOrder.actualDuration && (
              <div className="info-item">
                <span className="info-label">Duração Real:</span>
                <span className="info-value">{workOrder.actualDuration} minutos</span>
              </div>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className="details-card">
          <h3>Descrição</h3>
          <div className="description-content">
            <h4>{workOrder.title}</h4>
            <p>{workOrder.description}</p>
          </div>
        </div>
      </div>

      {/* Fotos */}
      {workOrder.photos && workOrder.photos.length > 0 && (
        <div className="details-card">
          <h3>Fotos ({workOrder.photos.length})</h3>
          <div className="photos-grid">
            {workOrder.photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo} alt={`Foto ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observações */}
      {workOrder.notes && (
        <div className="details-card">
          <h3>Observações</h3>
          <p className="notes-text">{workOrder.notes}</p>
        </div>
      )}
    </div>
  );
};

