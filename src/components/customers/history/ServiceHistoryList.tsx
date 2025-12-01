import React from 'react';
import { ServiceHistory } from '../../../types/customer';
import './HistoryList.css';

interface ServiceHistoryListProps {
  services: ServiceHistory[];
}

export const ServiceHistoryList: React.FC<ServiceHistoryListProps> = ({ services }) => {
  if (services.length === 0) {
    return (
      <div className="empty-history">
        <p>Nenhum serviço registrado</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {services.map(service => (
        <div key={service.id} className="history-item">
          <div className="history-item-header">
            <div>
              <h4>{service.serviceType}</h4>
              <p className="history-subtitle">
                {new Date(service.serviceDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <span className={`status-badge ${service.status}`}>
              {service.status === 'completed' ? '✓ Concluído' : '⊘ Pulado'}
            </span>
          </div>
          <div className="history-item-details">
            <div className="detail-item">
              <span className="detail-label">Técnico:</span>
              <span className="detail-value">{service.technician}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Checklist:</span>
              <span className="detail-value">
                {service.checklistCompleted}/{service.checklistTotal} itens
              </span>
            </div>
            {service.observations && (
              <div className="detail-item full-width">
                <span className="detail-label">Observações:</span>
                <span className="detail-value">{service.observations}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

