import React from 'react';
import { Client } from '../types/route';
import { useLanguage } from '../context/LanguageContext';
import './ClientList.css';

interface ClientListProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onClientClick }) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge completed">✓ {t('workArea.client.status.completed')}</span>;
      case 'skipped':
        return <span className="status-badge skipped">⊘ {t('workArea.client.status.skipped')}</span>;
      default:
        return <span className="status-badge pending">⏳ {t('workArea.client.status.pending')}</span>;
    }
  };

  const getServiceTypeBadge = (type: Client['serviceType']) => {
    switch (type) {
      case 'deep':
        return <span className="service-type deep">{t('workArea.client.serviceType.deep')}</span>;
      case 'repair':
        return <span className="service-type repair">{t('workArea.client.serviceType.repair')}</span>;
      default:
        return <span className="service-type regular">{t('workArea.client.serviceType.regular')}</span>;
    }
  };

  if (clients.length === 0) {
    return (
      <div className="empty-clients">
        <p>{t('workArea.client.noClients')}</p>
      </div>
    );
  }

  return (
    <div className="client-list">
      {clients.map((client) => (
        <div
          key={client.id}
          className={`client-card ${client.status}`}
          onClick={() => onClientClick(client)}
        >
          <div className="client-header">
            <div className="client-info">
              <h3>{client.name}</h3>
              <p className="client-address">{client.address}</p>
            </div>
            <div className="client-badges">
              {getStatusBadge(client.status)}
              {getServiceTypeBadge(client.serviceType)}
            </div>
          </div>
          
          <div className="client-details">
            {client.scheduledTime && (
              <div className="detail-item">
                <span className="detail-icon">🕐</span>
                <span>{client.scheduledTime}</span>
              </div>
            )}
            {client.estimatedDuration && (
              <div className="detail-item">
                <span className="detail-icon">⏱️</span>
                <span>{client.estimatedDuration} min</span>
              </div>
            )}
          </div>

          <div className="client-arrow">→</div>
        </div>
      ))}
    </div>
  );
};

