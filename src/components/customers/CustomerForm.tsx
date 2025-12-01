import React, { useState } from 'react';
import { Customer, Contact, AccessCode } from '../../types/customer';
import { useLanguage } from '../../context/LanguageContext';
import './CustomerForm.css';

interface CustomerFormProps {
  customer: Partial<Customer>;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

const CONTACT_TAGS: Contact['tag'][] = ['Owner', 'Wife', 'Work', 'Other'];
const SERVICE_DAYS: Customer['serviceDay'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MOCK_TECHNICIANS = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira'];

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
  const { t, language } = useLanguage();
  
  // Helper to split name if legacy field exists
  const getFirstName = () => {
    if (customer.firstName) return customer.firstName;
    if (customer.name) {
      const parts = customer.name.split(' ');
      return parts[0] || '';
    }
    return '';
  };
  
  const getLastName = () => {
    if (customer.lastName) return customer.lastName;
    if (customer.name) {
      const parts = customer.name.split(' ');
      return parts.slice(1).join(' ') || '';
    }
    return '';
  };
  
  const [formData, setFormData] = useState({
    firstName: getFirstName(),
    lastName: getLastName(),
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    zipCode: customer.zipCode || '',
    frequency: customer.frequency || customer.serviceType || 'Weekly',
    chargePerMonth: customer.chargePerMonth || customer.servicePrice || 0,
    typeOfService: customer.typeOfService || 'POOL',
    serviceDay: customer.serviceDay || 'Monday',
    startOn: customer.startOn || new Date().toISOString().split('T')[0],
    stopAfter: customer.stopAfter || 'NO END',
    minutesAtStop: customer.minutesAtStop !== undefined ? customer.minutesAtStop : 25,
    assignedTechnician: customer.assignedTechnician || '',
    status: customer.status || 'active',
  });

  const [accessCodes, setAccessCodes] = useState<AccessCode[]>(customer.accessCodes || []);
  const [contacts, setContacts] = useState<Contact[]>(customer.contacts || []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAccessCode = () => {
    setAccessCodes(prev => [...prev, {
      id: `ac_${Date.now()}`,
      type: 'other',
      label: '',
      code: '',
    }]);
  };

  const handleUpdateAccessCode = (id: string, field: string, value: any) => {
    setAccessCodes(prev => prev.map(ac =>
      ac.id === id ? { ...ac, [field]: value } : ac
    ));
  };

  const handleRemoveAccessCode = (id: string) => {
    setAccessCodes(prev => prev.filter(ac => ac.id !== id));
  };

  const handleAddContact = (type: 'email' | 'phone') => {
    if (contacts.filter(c => c.type === type).length >= 3) {
      alert(type === 'email' ? t('customer.maxEmails') : t('customer.maxPhones'));
      return;
    }
    setContacts(prev => [...prev, {
      id: `c_${Date.now()}`,
      type,
      value: '',
      tag: 'Owner',
    }]);
  };

  const handleUpdateContact = (id: string, field: string, value: any) => {
    setContacts(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleRemoveContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.address) {
      alert(t('customer.fillRequired'));
      return;
    }

    const customerData: Customer = {
      id: customer.id || `customer_${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      frequency: formData.frequency as 'Weekly' | 'Biweekly',
      chargePerMonth: formData.chargePerMonth,
      typeOfService: formData.typeOfService as 'POOL' | 'POOL + SPA' | 'SPA',
      serviceDay: formData.serviceDay as Customer['serviceDay'],
      startOn: formData.startOn,
      stopAfter: formData.stopAfter as string | 'NO END',
      minutesAtStop: formData.minutesAtStop || 25,
      assignedTechnician: formData.assignedTechnician,
      status: formData.status as 'active' | 'inactive',
      accessCodes: accessCodes.filter(ac => ac.label && ac.code),
      contacts: contacts.filter(c => c.value),
      createdAt: customer.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      serviceType: formData.frequency as 'Weekly' | 'Biweekly',
      servicePrice: formData.chargePerMonth,
    };

    onSave(customerData);
  };

  return (
    <form onSubmit={handleSubmit} className="customer-form">
      {/* Dados Básicos */}
      <section className="form-section">
        <h2>{t('customer.basicData')}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('customerForm.firstName')} *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('customerForm.lastName')} *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>{t('customerForm.address')} *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('customerForm.city')} *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('customerForm.state')} *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('customerForm.zipCode')} *</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      {/* Códigos de Acesso */}
      <section className="form-section">
        <div className="section-header">
          <h2>{t('customerForm.accessCodes')}</h2>
          <button type="button" onClick={handleAddAccessCode} className="add-button">
            + {t('customerForm.addCode')}
          </button>
        </div>
        <div className="access-codes-list">
          {accessCodes.map(code => (
            <div key={code.id} className="access-code-item">
              <select
                value={code.type}
                onChange={(e) => handleUpdateAccessCode(code.id, 'type', e.target.value)}
                className="code-type-select"
              >
                <option value="gate">Gate Code</option>
                <option value="lock">Lock Code</option>
                <option value="other">Other Code</option>
              </select>
              <input
                type="text"
                placeholder={t('customerForm.codeLabel')}
                value={code.label}
                onChange={(e) => handleUpdateAccessCode(code.id, 'label', e.target.value)}
                className="code-label-input"
              />
              <input
                type="text"
                placeholder={t('customerForm.code')}
                value={code.code}
                onChange={(e) => handleUpdateAccessCode(code.id, 'code', e.target.value)}
                className="code-input"
              />
              <button
                type="button"
                onClick={() => handleRemoveAccessCode(code.id)}
                className="remove-button"
              >
                ✕
              </button>
            </div>
          ))}
          {accessCodes.length === 0 && (
            <p className="empty-message">{t('customerForm.noCodes')}</p>
          )}
        </div>
      </section>

      {/* Contatos */}
      <section className="form-section">
        <h2>{t('customerForm.contacts')}</h2>
        <div className="contacts-section">
          <div className="contact-type-group">
            <div className="contact-type-header">
              <h3>{t('customerForm.emails')}</h3>
              <button
                type="button"
                onClick={() => handleAddContact('email')}
                className="add-button"
                disabled={contacts.filter(c => c.type === 'email').length >= 3}
              >
                + {t('customerForm.addEmail')}
              </button>
            </div>
            {contacts.filter(c => c.type === 'email').map(contact => (
              <div key={contact.id} className="contact-item">
                <input
                  type="email"
                  placeholder={language === 'pt-BR' ? 'E-mail' : 'Email'}
                  value={contact.value}
                  onChange={(e) => handleUpdateContact(contact.id, 'value', e.target.value)}
                  className="contact-input"
                />
                <select
                  value={contact.tag}
                  onChange={(e) => handleUpdateContact(contact.id, 'tag', e.target.value)}
                  className="contact-tag-select"
                >
                  {CONTACT_TAGS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(contact.id)}
                  className="remove-button"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="contact-type-group">
            <div className="contact-type-header">
              <h3>{t('customerForm.phones')}</h3>
              <button
                type="button"
                onClick={() => handleAddContact('phone')}
                className="add-button"
                disabled={contacts.filter(c => c.type === 'phone').length >= 3}
              >
                + {t('customerForm.addPhone')}
              </button>
            </div>
            {contacts.filter(c => c.type === 'phone').map(contact => (
              <div key={contact.id} className="contact-item">
                <input
                  type="tel"
                  placeholder={language === 'pt-BR' ? 'Telefone' : 'Phone'}
                  value={contact.value}
                  onChange={(e) => handleUpdateContact(contact.id, 'value', e.target.value)}
                  className="contact-input"
                />
                <select
                  value={contact.tag}
                  onChange={(e) => handleUpdateContact(contact.id, 'tag', e.target.value)}
                  className="contact-tag-select"
                >
                  {CONTACT_TAGS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(contact.id)}
                  className="remove-button"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Configurações do Serviço */}
      <section className="form-section">
        <h2>{t('customerForm.serviceSettings')}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('customerForm.frequency')}</label>
            <select
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
            >
              <option value="Weekly">{language === 'pt-BR' ? 'Semanal' : 'Weekly'}</option>
              <option value="Biweekly">{language === 'pt-BR' ? 'Quinzenal' : 'Biweekly'}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('customerForm.chargePerMonth')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.chargePerMonth}
              onChange={(e) => handleInputChange('chargePerMonth', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="form-group">
            <label>{t('customerForm.typeOfService')}</label>
            <select
              value={formData.typeOfService}
              onChange={(e) => handleInputChange('typeOfService', e.target.value)}
            >
              <option value="POOL">{t('customerForm.typeOfService.pool')}</option>
              <option value="POOL + SPA">{t('customerForm.typeOfService.poolSpa')}</option>
              <option value="SPA">{t('customerForm.typeOfService.spa')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('customerForm.serviceDay')}</label>
            <select
              value={formData.serviceDay}
              onChange={(e) => handleInputChange('serviceDay', e.target.value)}
            >
              {SERVICE_DAYS.map(day => (
                <option key={day} value={day}>
                  {day === 'Monday' ? (language === 'pt-BR' ? 'Segunda' : 'Monday') :
                   day === 'Tuesday' ? (language === 'pt-BR' ? 'Terça' : 'Tuesday') :
                   day === 'Wednesday' ? (language === 'pt-BR' ? 'Quarta' : 'Wednesday') :
                   day === 'Thursday' ? (language === 'pt-BR' ? 'Quinta' : 'Thursday') :
                   day === 'Friday' ? (language === 'pt-BR' ? 'Sexta' : 'Friday') :
                   day === 'Saturday' ? (language === 'pt-BR' ? 'Sábado' : 'Saturday') : 
                   (language === 'pt-BR' ? 'Domingo' : 'Sunday')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('customerForm.startOn')}</label>
            <input
              type="date"
              value={formData.startOn}
              onChange={(e) => handleInputChange('startOn', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('customerForm.stopAfter')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select
                value={formData.stopAfter === 'NO END' ? 'NO END' : 'DATE'}
                onChange={(e) => {
                  if (e.target.value === 'NO END') {
                    handleInputChange('stopAfter', 'NO END');
                  } else {
                    // Se mudar para DATE e ainda não tiver data, usar startOn
                    handleInputChange('stopAfter', formData.stopAfter !== 'NO END' ? formData.stopAfter : formData.startOn);
                  }
                }}
              >
                <option value="NO END">{t('customerForm.stopAfter.noEnd')}</option>
                <option value="DATE">{language === 'pt-BR' ? 'Definir Data' : 'Set Date'}</option>
              </select>
              {formData.stopAfter !== 'NO END' && (
                <input
                  type="date"
                  value={formData.stopAfter}
                  onChange={(e) => handleInputChange('stopAfter', e.target.value)}
                  style={{ width: '100%' }}
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label>{t('customerForm.minutesAtStop')}</label>
            <input
              type="number"
              min="0"
              value={formData.minutesAtStop || ''}
              onChange={(e) => handleInputChange('minutesAtStop', parseInt(e.target.value) || 25)}
              placeholder={t('customerForm.minutesAtStop.placeholder')}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '12px' }}>
              {t('customerForm.minutesAtStop.description')}
            </small>
          </div>

          <div className="form-group">
            <label>{t('customerForm.responsibleTechnician')}</label>
            <select
              value={formData.assignedTechnician}
              onChange={(e) => handleInputChange('assignedTechnician', e.target.value)}
            >
              <option value="">{t('common.select')}</option>
              {MOCK_TECHNICIANS.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('customerForm.status')}</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="active">{language === 'pt-BR' ? 'Ativo' : 'Active'}</option>
              <option value="inactive">{language === 'pt-BR' ? 'Inativo' : 'Inactive'}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Ações */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          {t('common.cancel')}
        </button>
        <button type="submit" className="save-button">
          {language === 'pt-BR' ? 'Salvar Cliente' : 'Save Customer'}
        </button>
      </div>
    </form>
  );
};

