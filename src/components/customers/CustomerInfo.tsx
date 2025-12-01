import React from 'react';
import { Customer } from '../../types/customer';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './CustomerInfo.css';

interface CustomerInfoProps {
  customer: Customer;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  const { t, language } = useLanguage();
  
  const getServiceDayLabel = (day: string) => {
    const days: Record<string, Record<string, string>> = {
      'pt-BR': {
        'Monday': 'Segunda-feira',
        'Tuesday': 'Terça-feira',
        'Wednesday': 'Quarta-feira',
        'Thursday': 'Quinta-feira',
        'Friday': 'Sexta-feira',
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

  const frequency = customer.frequency || customer.serviceType || 'Weekly';
  const chargePerMonth = customer.chargePerMonth || customer.servicePrice || 0;
  const typeOfService = customer.typeOfService || 'POOL';

  return (
    <div className="customer-info">
      <div className="info-card">
        <h3>{language === 'pt-BR' ? 'Informações do Cliente' : 'Customer Information'}</h3>
        
        <div className="info-item">
          <span className="info-label">{t('customerForm.status')}:</span>
          <span className={`info-value status ${customer.status}`}>
            {customer.status === 'active' ? `✓ ${language === 'pt-BR' ? 'Ativo' : 'Active'}` : `⊘ ${language === 'pt-BR' ? 'Inativo' : 'Inactive'}`}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">{t('customerForm.frequency')}:</span>
          <span className="info-value">
            {frequency === 'Weekly' ? (language === 'pt-BR' ? 'Semanal' : 'Weekly') : (language === 'pt-BR' ? 'Quinzenal' : 'Biweekly')}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">{t('customerForm.typeOfService')}:</span>
          <span className="info-value">
            {typeOfService === 'POOL' ? t('customerForm.typeOfService.pool') :
             typeOfService === 'POOL + SPA' ? t('customerForm.typeOfService.poolSpa') :
             t('customerForm.typeOfService.spa')}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">{t('customerForm.serviceDay')}:</span>
          <span className="info-value">{getServiceDayLabel(customer.serviceDay)}</span>
        </div>

        <div className="info-item">
          <span className="info-label">{t('customerForm.chargePerMonth')}:</span>
          <span className="info-value">
            {formatCurrency(chargePerMonth, language)}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">{t('customerForm.responsibleTechnician')}:</span>
          <span className="info-value">{customer.assignedTechnician}</span>
        </div>
      </div>

      {customer.accessCodes.length > 0 && (
        <div className="info-card">
          <h3>Códigos de Acesso</h3>
          {customer.accessCodes.map(code => (
            <div key={code.id} className="info-item">
              <span className="info-label">{code.label}:</span>
              <span className="info-value code">{code.code}</span>
            </div>
          ))}
        </div>
      )}

      {customer.contacts.length > 0 && (
        <div className="info-card">
          <h3>Contatos</h3>
          {customer.contacts.map(contact => (
            <div key={contact.id} className="info-item">
              <span className="info-label">
                {contact.type === 'email' ? '📧' : '📞'} {contact.tag}:
              </span>
              <span className="info-value">{contact.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

