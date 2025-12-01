import React from 'react';
import { CustomerTimelineEvent } from '../../../types/customer';
import './Timeline.css';

interface CustomerTimelineProps {
  timeline: CustomerTimelineEvent[];
}

export const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ timeline }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return '✨';
      case 'service':
        return '🔧';
      case 'payment':
        return '💰';
      case 'status_change':
        return '🔄';
      case 'contact_update':
        return '📝';
      default:
        return '📌';
    }
  };

  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedTimeline.length === 0) {
    return (
      <div className="empty-history">
        <p>Nenhum evento registrado</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {sortedTimeline.map((event, index) => (
        <div key={event.id} className="timeline-item">
          <div className="timeline-marker">
            <span className="timeline-icon">{getEventIcon(event.type)}</span>
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <h4>{event.title}</h4>
              <span className="timeline-date">
                {new Date(event.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="timeline-description">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

