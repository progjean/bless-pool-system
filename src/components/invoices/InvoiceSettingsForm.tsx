import React, { useState } from 'react';
import { InvoiceSettings, LateFeeReminder, Tax } from '../../types/invoiceSettings';
import { useLanguage } from '../../context/LanguageContext';
import './InvoiceSettingsForm.css';

interface InvoiceSettingsFormProps {
  settings: InvoiceSettings;
  onSave: (settings: InvoiceSettings) => void;
}

const SERVICE_DAYS = [
  { value: 0, label: { 'pt-BR': 'Domingo', 'en-US': 'Sunday' } },
  { value: 1, label: { 'pt-BR': 'Segunda-feira', 'en-US': 'Monday' } },
  { value: 2, label: { 'pt-BR': 'Terça-feira', 'en-US': 'Tuesday' } },
  { value: 3, label: { 'pt-BR': 'Quarta-feira', 'en-US': 'Wednesday' } },
  { value: 4, label: { 'pt-BR': 'Quinta-feira', 'en-US': 'Thursday' } },
  { value: 5, label: { 'pt-BR': 'Sexta-feira', 'en-US': 'Friday' } },
  { value: 6, label: { 'pt-BR': 'Sábado', 'en-US': 'Saturday' } },
];

export const InvoiceSettingsForm: React.FC<InvoiceSettingsFormProps> = ({
  settings,
  onSave,
}) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<InvoiceSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'lateFee' | 'taxes' | 'company'>('general');

  const handleInputChange = (field: keyof InvoiceSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLateFeeReminderChange = (index: number, field: keyof LateFeeReminder, value: any) => {
    setFormData(prev => {
      const reminders = [...(prev.lateFeeReminders || [])];
      reminders[index] = { ...reminders[index], [field]: value };
      return { ...prev, lateFeeReminders: reminders };
    });
  };

  const handleAddLateFeeReminder = () => {
    const newReminder: LateFeeReminder = {
      id: `reminder_${Date.now()}`,
      daysAfterDue: 0,
      sendReminder: true,
      applyLateFee: false,
    };
    setFormData(prev => ({
      ...prev,
      lateFeeReminders: [...(prev.lateFeeReminders || []), newReminder],
    }));
  };

  const handleRemoveLateFeeReminder = (index: number) => {
    setFormData(prev => {
      const reminders = [...(prev.lateFeeReminders || [])];
      reminders.splice(index, 1);
      return { ...prev, lateFeeReminders: reminders };
    });
  };

  const handleAddTax = () => {
    const newTax: Tax = {
      id: `tax_${Date.now()}`,
      name: '',
      type: 'percentage',
      value: 0,
      applyTo: 'subtotal',
    };
    setFormData(prev => ({
      ...prev,
      taxes: [...(prev.taxes || []), newTax],
    }));
  };

  const handleTaxChange = (index: number, field: keyof Tax, value: any) => {
    setFormData(prev => {
      const taxes = [...(prev.taxes || [])];
      taxes[index] = { ...taxes[index], [field]: value };
      return { ...prev, taxes };
    });
  };

  const handleRemoveTax = (index: number) => {
    setFormData(prev => {
      const taxes = [...(prev.taxes || [])];
      taxes.splice(index, 1);
      return { ...prev, taxes };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="invoice-settings-form">
      <div className="settings-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
        >
          {t('invoice.settings.tabs.general')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lateFee')}
          className={`settings-tab ${activeTab === 'lateFee' ? 'active' : ''}`}
        >
          {t('invoice.settings.tabs.lateFee')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('taxes')}
          className={`settings-tab ${activeTab === 'taxes' ? 'active' : ''}`}
        >
          {t('invoice.settings.tabs.taxes')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`settings-tab ${activeTab === 'company' ? 'active' : ''}`}
        >
          {t('invoice.settings.tabs.company')}
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <h2>{t('invoice.settings.general.title')}</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>{t('invoice.settings.general.dueDateDays')}</label>
                <input
                  type="number"
                  min="1"
                  value={formData.dueDateDays}
                  onChange={(e) => handleInputChange('dueDateDays', parseInt(e.target.value) || 30)}
                />
                <small>{t('invoice.settings.general.dueDateDaysDesc')}</small>
              </div>

              <div className="form-group">
                <label>{t('invoice.settings.general.sendDayOfWeek')}</label>
                <select
                  value={formData.sendDayOfWeek ?? ''}
                  onChange={(e) => handleInputChange('sendDayOfWeek', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">{t('invoice.settings.general.notSet')}</option>
                  {SERVICE_DAYS.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label[language]}
                    </option>
                  ))}
                </select>
                <small>{t('invoice.settings.general.sendDayOfWeekDesc')}</small>
              </div>

              <div className="form-group">
                <label>{t('invoice.settings.general.sendDayOfMonth')}</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.sendDayOfMonth || ''}
                  onChange={(e) => handleInputChange('sendDayOfMonth', e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <small>{t('invoice.settings.general.sendDayOfMonthDesc')}</small>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lateFee' && (
          <div className="settings-section">
            <h2>{t('invoice.settings.lateFee.title')}</h2>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.lateFeeEnabled}
                  onChange={(e) => handleInputChange('lateFeeEnabled', e.target.checked)}
                />
                <span>{t('invoice.settings.lateFee.enabled')}</span>
              </label>
            </div>

            {formData.lateFeeEnabled && (
              <>
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('invoice.settings.lateFee.type')}</label>
                    <select
                      value={formData.lateFeeType}
                      onChange={(e) => handleInputChange('lateFeeType', e.target.value)}
                    >
                      <option value="fixed">{t('invoice.settings.lateFee.typeFixed')}</option>
                      <option value="percentage">{t('invoice.settings.lateFee.typePercentage')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      {formData.lateFeeType === 'percentage' 
                        ? t('invoice.settings.lateFee.percentage')
                        : t('invoice.settings.lateFee.fixedAmount')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.lateFeeValue}
                      onChange={(e) => handleInputChange('lateFeeValue', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('invoice.settings.lateFee.applyAfterDays')}</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.lateFeeApplyAfterDays}
                      onChange={(e) => handleInputChange('lateFeeApplyAfterDays', parseInt(e.target.value) || 5)}
                    />
                    <small>{t('invoice.settings.lateFee.applyAfterDaysDesc')}</small>
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.lateFeeWarningEnabled}
                      onChange={(e) => handleInputChange('lateFeeWarningEnabled', e.target.checked)}
                    />
                    <span>{t('invoice.settings.lateFee.warningEnabled')}</span>
                  </label>
                </div>

                {formData.lateFeeWarningEnabled && (
                  <div className="form-group">
                    <label>{t('invoice.settings.lateFee.warningDaysBefore')}</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.lateFeeWarningDaysBefore}
                      onChange={(e) => handleInputChange('lateFeeWarningDaysBefore', parseInt(e.target.value) || 2)}
                    />
                    <small>{t('invoice.settings.lateFee.warningDaysBeforeDesc')}</small>
                  </div>
                )}

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.multipleLateFeeReminders}
                      onChange={(e) => handleInputChange('multipleLateFeeReminders', e.target.checked)}
                    />
                    <span>{t('invoice.settings.lateFee.multipleReminders')}</span>
                  </label>
                </div>

                {formData.multipleLateFeeReminders && (
                  <div className="reminders-section">
                    <div className="section-header">
                      <h3>{t('invoice.settings.lateFee.reminders')}</h3>
                      <button
                        type="button"
                        onClick={handleAddLateFeeReminder}
                        className="add-button"
                      >
                        + {t('invoice.settings.lateFee.addReminder')}
                      </button>
                    </div>

                    {formData.lateFeeReminders?.map((reminder, index) => (
                      <div key={reminder.id} className="reminder-item">
                        <div className="reminder-header">
                          <span className="reminder-number">{t('invoice.settings.lateFee.reminder')} {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLateFeeReminder(index)}
                            className="remove-button"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>{t('invoice.settings.lateFee.daysAfterDue')}</label>
                            <input
                              type="number"
                              min="0"
                              value={reminder.daysAfterDue}
                              onChange={(e) => handleLateFeeReminderChange(index, 'daysAfterDue', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div className="form-group checkbox-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={reminder.sendReminder}
                                onChange={(e) => handleLateFeeReminderChange(index, 'sendReminder', e.target.checked)}
                              />
                              <span>{t('invoice.settings.lateFee.sendReminder')}</span>
                            </label>
                          </div>

                          <div className="form-group checkbox-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={reminder.applyLateFee}
                                onChange={(e) => handleLateFeeReminderChange(index, 'applyLateFee', e.target.checked)}
                              />
                              <span>{t('invoice.settings.lateFee.applyLateFee')}</span>
                            </label>
                          </div>

                          {reminder.applyLateFee && (
                            <div className="form-group">
                              <label>{t('invoice.settings.lateFee.customAmount')} ({t('invoice.settings.lateFee.optional')})</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={reminder.lateFeeAmount || ''}
                                onChange={(e) => handleLateFeeReminderChange(index, 'lateFeeAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder={t('invoice.settings.lateFee.useDefault')}
                              />
                            </div>
                          )}

                          <div className="form-group full-width">
                            <label>{t('invoice.settings.lateFee.customMessage')} ({t('invoice.settings.lateFee.optional')})</label>
                            <textarea
                              value={reminder.message || ''}
                              onChange={(e) => handleLateFeeReminderChange(index, 'message', e.target.value)}
                              rows={2}
                              placeholder={t('invoice.settings.lateFee.messagePlaceholder')}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'taxes' && (
          <div className="settings-section">
            <h2>{t('invoice.settings.taxes.title')}</h2>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.taxesEnabled}
                  onChange={(e) => handleInputChange('taxesEnabled', e.target.checked)}
                />
                <span>{t('invoice.settings.taxes.enabled')}</span>
              </label>
            </div>

            {formData.taxesEnabled && (
              <div className="taxes-section">
                <div className="section-header">
                  <h3>{t('invoice.settings.taxes.taxesList')}</h3>
                  <button
                    type="button"
                    onClick={handleAddTax}
                    className="add-button"
                  >
                    + {t('invoice.settings.taxes.addTax')}
                  </button>
                </div>

                {formData.taxes?.map((tax, index) => (
                  <div key={tax.id} className="tax-item">
                    <div className="tax-header">
                      <span className="tax-number">{t('invoice.settings.taxes.tax')} {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTax(index)}
                        className="remove-button"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>{t('invoice.settings.taxes.name')} *</label>
                        <input
                          type="text"
                          value={tax.name}
                          onChange={(e) => handleTaxChange(index, 'name', e.target.value)}
                          required
                          placeholder="Ex: ISS, ICMS, Tax"
                        />
                      </div>

                      <div className="form-group">
                        <label>{t('invoice.settings.taxes.type')} *</label>
                        <select
                          value={tax.type}
                          onChange={(e) => handleTaxChange(index, 'type', e.target.value)}
                          required
                        >
                          <option value="percentage">{t('invoice.settings.taxes.typePercentage')}</option>
                          <option value="fixed">{t('invoice.settings.taxes.typeFixed')}</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          {tax.type === 'percentage' 
                            ? t('invoice.settings.taxes.percentage')
                            : t('invoice.settings.taxes.fixedAmount')} *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tax.value}
                          onChange={(e) => handleTaxChange(index, 'value', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>{t('invoice.settings.taxes.applyTo')} *</label>
                        <select
                          value={tax.applyTo}
                          onChange={(e) => handleTaxChange(index, 'applyTo', e.target.value)}
                          required
                        >
                          <option value="subtotal">{t('invoice.settings.taxes.applyToSubtotal')}</option>
                          <option value="total">{t('invoice.settings.taxes.applyToTotal')}</option>
                        </select>
                      </div>

                      <div className="form-group full-width">
                        <label>{t('invoice.settings.taxes.description')} ({t('invoice.settings.taxes.optional')})</label>
                        <input
                          type="text"
                          value={tax.description || ''}
                          onChange={(e) => handleTaxChange(index, 'description', e.target.value)}
                          placeholder={t('invoice.settings.taxes.descriptionPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'company' && (
          <div className="settings-section">
            <h2>{t('invoice.settings.company.title')}</h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>{t('invoice.settings.company.name')} *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>{t('invoice.settings.company.address')} *</label>
                <textarea
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('invoice.settings.company.phone')}</label>
                <input
                  type="text"
                  value={formData.companyPhone || ''}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t('invoice.settings.company.email')}</label>
                <input
                  type="email"
                  value={formData.companyEmail || ''}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t('invoice.settings.company.taxId')}</label>
                <input
                  type="text"
                  value={formData.companyTaxId || ''}
                  onChange={(e) => handleInputChange('companyTaxId', e.target.value)}
                  placeholder={language === 'pt-BR' ? 'CNPJ/CPF' : 'Tax ID'}
                />
              </div>

              <div className="form-group full-width">
                <label>{t('invoice.settings.company.footerMessage')}</label>
                <textarea
                  value={formData.footerMessage || ''}
                  onChange={(e) => handleInputChange('footerMessage', e.target.value)}
                  rows={3}
                  placeholder={t('invoice.settings.company.footerMessagePlaceholder')}
                />
              </div>

              <div className="form-group full-width">
                <label>{t('invoice.settings.company.termsAndConditions')}</label>
                <textarea
                  value={formData.termsAndConditions || ''}
                  onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                  rows={6}
                  placeholder={t('invoice.settings.company.termsPlaceholder')}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="save-button">
          {t('common.save')}
        </button>
      </div>
    </form>
  );
};

