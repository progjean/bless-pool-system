import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SettingsTabs } from '../components/settings/SettingsTabs';
import { ReadingsSettings } from '../components/settings/ReadingsSettings';
import { DosagesSettings } from '../components/settings/DosagesSettings';
import { ChecklistSettings } from '../components/settings/ChecklistSettings';
import { WorkOrderTypesSettings } from '../components/settings/WorkOrderTypesSettings';
import { ProductsSettings } from '../components/settings/ProductsSettings';
import { InvoiceSettingsForm } from '../components/invoices/InvoiceSettingsForm';
import { ServiceMessagesSettings } from '../components/settings/ServiceMessagesSettings';
import { InvoiceSettings, DEFAULT_INVOICE_SETTINGS } from '../types/invoiceSettings';
import './SettingsPage.css';

type SettingsTab = 'readings' | 'dosages' | 'checklist' | 'workOrderTypes' | 'products' | 'invoices' | 'serviceMessages';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('readings');
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
    const saved = localStorage.getItem('invoiceSettings');
    return saved ? JSON.parse(saved) : DEFAULT_INVOICE_SETTINGS;
  });

  const handleInvoiceSettingsSave = (updatedSettings: InvoiceSettings) => {
    setInvoiceSettings(updatedSettings);
    localStorage.setItem('invoiceSettings', JSON.stringify(updatedSettings));
    alert(t('settings.saved'));
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('settings.title')}</h1>
          </div>
        </div>
      </header>

      <main className="settings-main">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="settings-content">
          {activeTab === 'readings' && <ReadingsSettings />}
          {activeTab === 'dosages' && <DosagesSettings />}
          {activeTab === 'checklist' && <ChecklistSettings />}
          {activeTab === 'workOrderTypes' && <WorkOrderTypesSettings />}
          {activeTab === 'products' && <ProductsSettings />}
          {activeTab === 'invoices' && (
            <InvoiceSettingsForm
              settings={invoiceSettings}
              onSave={handleInvoiceSettingsSave}
            />
          )}
          {activeTab === 'serviceMessages' && <ServiceMessagesSettings />}
        </div>
      </main>
    </div>
  );
};

