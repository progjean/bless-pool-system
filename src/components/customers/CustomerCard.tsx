import React from 'react';
import { Customer } from '../../types/customer';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './CustomerCard.css';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
  const { t, language } = useLanguage();
  
  const getServiceDayLabel = (day: string) => {
    const days: Record<string, Record<string, string>> = {
      'pt-BR': {
        'Monday': 'Segunda',
        'Tuesday': 'Terça',
        'Wednesday': 'Quarta',
        'Thursday': 'Quinta',
        'Friday': 'Sexta',
        'Saturday': 'Sábado',
        'Sunday': 'Domingo',
      },
      'en-US': {
        'Monday': 'Monday',
        'Tuesday': 'Tuesday',
        'Wednesday': 'Wednesday',
        'Thursday': 'Thursday',
        'Friday': 'Friday',
        'Saturday': 'Saturday',
        'Sunday': 'Sunday',
      },
    };
    return days[language]?.[day] || day;
  };

  const customerName = customer.name || `${customer.firstName} ${customer.lastName}`.trim();
  const addressParts = [
    customer.address,
    customer.city,
    customer.state,
    customer.zipCode
  ].filter(Boolean);
  const customerAddress = addressParts.length > 0 ? addressParts.join(', ') : customer.address || '';
  const frequency = customer.frequency || customer.serviceType || 'Weekly';
  const chargePerMonth = customer.chargePerMonth || customer.servicePrice || 0;

  return (
    <div className="customer-card" onClick={onClick}>
      <div className="card-header">
        <h3>{customerName}</h3>
        <span className={`status-badge ${customer.status}`}>
          {customer.status === 'active' ? `✓ ${t('customers.active')}` : `⊘ ${t('customers.inactive')}`}
        </span>
      </div>

      <div className="card-body">
        <div className="card-info-item">
          <span className="info-icon">📍</span>
          <span className="info-text">{customerAddress}</span>
        </div>

        <div className="card-info-item">
          <span className="info-icon">🔧</span>
          <span className="info-text">
            {frequency === 'Weekly' ? (language === 'pt-BR' ? 'Semanal' : 'Weekly') : (language === 'pt-BR' ? 'Quinzenal' : 'Biweekly')} - {getServiceDayLabel(customer.serviceDay)}
          </span>
        </div>

        <div className="card-info-item">
          <span className="info-icon">👤</span>
          <span className="info-text">{customer.assignedTechnician}</span>
        </div>

        <div className="card-info-item">
          <span className="info-icon">💰</span>
          <span className="info-text">
            {formatCurrency(chargePerMonth, language)}
          </span>
        </div>

        {customer.contacts.length > 0 && (
          <div className="card-info-item">
            <span className="info-icon">📧</span>
            <span className="info-text">
              {customer.contacts.filter(c => c.type === 'email').length} {language === 'pt-BR' ? 'email(s)' : 'email(s)'}, {' '}
              {customer.contacts.filter(c => c.type === 'phone').length} {language === 'pt-BR' ? 'telefone(s)' : 'phone(s)'}
            </span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="card-arrow">→</span>
      </div>
    </div>
  );
};

