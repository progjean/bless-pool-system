import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/customer';
import { useLanguage } from '../../context/LanguageContext';
import './RecurringInvoiceEditModal.css';

interface RecurringInvoiceEditModalProps {
  customer: Customer;
  onClose: () => void;
  onSave: (updates: Partial<Customer>) => void;
}

const SERVICE_DAYS: Customer['serviceDay'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const RecurringInvoiceEditModal: React.FC<RecurringInvoiceEditModalProps> = ({
  customer,
  onClose,
  onSave,
}) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    frequency: customer.frequency,
    chargePerMonth: customer.chargePerMonth,
    serviceDay: customer.serviceDay,
    startOn: customer.startOn,
    stopAfter: customer.stopAfter,
    autoGenerateInvoices: customer.autoGenerateInvoices !== false,
    invoiceDueDateDays: customer.invoiceDueDateDays || 30,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const customerName = customer.name || `${customer.firstName} ${customer.lastName}`.trim();

  return (
    <div className="recurring-edit-modal-overlay" onClick={onClose}>
      <div className="recurring-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{language === 'pt-BR' ? 'Editar Template de Invoice Recorrente' : 'Edit Recurring Invoice Template'}</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-customer-info">
          <strong>{customerName}</strong>
        </div>

        <form onSubmit={handleSubmit} className="recurring-edit-form">
          <div className="form-grid">
            <div className="form-group">
              <label>{t('customerForm.frequency')} *</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as 'Weekly' | 'Biweekly' }))}
                required
              >
                <option value="Weekly">{language === 'pt-BR' ? 'Semanal' : 'Weekly'}</option>
                <option value="Biweekly">{language === 'pt-BR' ? 'Quinzenal' : 'Biweekly'}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('customerForm.chargePerMonth')} *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.chargePerMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, chargePerMonth: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('customerForm.serviceDay')} *</label>
              <select
                value={formData.serviceDay}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceDay: e.target.value as Customer['serviceDay'] }))}
                required
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
              <label>{t('customerForm.startOn')} *</label>
              <input
                type="date"
                value={formData.startOn}
                onChange={(e) => setFormData(prev => ({ ...prev, startOn: e.target.value }))}
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
                      setFormData(prev => ({ ...prev, stopAfter: 'NO END' }));
                    } else {
                      setFormData(prev => ({ ...prev, stopAfter: prev.stopAfter !== 'NO END' ? prev.stopAfter : prev.startOn }));
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
                    onChange={(e) => setFormData(prev => ({ ...prev, stopAfter: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label>{language === 'pt-BR' ? 'Dias para Vencimento' : 'Days Until Due'}</label>
              <input
                type="number"
                min="1"
                value={formData.invoiceDueDateDays}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceDueDateDays: parseInt(e.target.value) || 30 }))}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.autoGenerateInvoices}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoGenerateInvoices: e.target.checked }))}
                />
                <span>{t('invoice.autoGenerateEnabled')}</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              {t('common.cancel')}
            </button>
            <button type="submit" className="save-button">
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

