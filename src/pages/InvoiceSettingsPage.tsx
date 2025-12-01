import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { InvoiceSettings, DEFAULT_INVOICE_SETTINGS, LateFeeReminder, Tax } from '../types/invoiceSettings';
import { InvoiceSettingsForm } from '../components/invoices/InvoiceSettingsForm';
import './InvoiceSettingsPage.css';

export const InvoiceSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<InvoiceSettings>(() => {
    // Carregar do localStorage ou usar default
    const saved = localStorage.getItem('invoiceSettings');
    return saved ? JSON.parse(saved) : DEFAULT_INVOICE_SETTINGS;
  });

  const handleSave = (updatedSettings: InvoiceSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('invoiceSettings', JSON.stringify(updatedSettings));
    alert(t('settings.saved'));
  };

  return (
    <div className="invoice-settings-page">
      <header className="settings-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/settings')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('invoice.settings.title')}</h1>
            <p>{t('invoice.settings.description')}</p>
          </div>
        </div>
      </header>

      <main className="settings-main">
        <InvoiceSettingsForm
          settings={settings}
          onSave={handleSave}
        />
      </main>
    </div>
  );
};

