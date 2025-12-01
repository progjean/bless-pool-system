import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './SettingsTabs.css';

type SettingsTab = 'readings' | 'dosages' | 'checklist' | 'workOrderTypes' | 'products' | 'invoices' | 'serviceMessages';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  const tabs = [
    { id: 'readings' as SettingsTab, label: t('settings.tabs.readings'), icon: '📊' },
    { id: 'dosages' as SettingsTab, label: t('settings.tabs.dosages'), icon: '🧪' },
    { id: 'checklist' as SettingsTab, label: t('settings.tabs.checklist'), icon: '✅' },
    { id: 'workOrderTypes' as SettingsTab, label: t('settings.tabs.workOrderTypes'), icon: '📋' },
    { id: 'products' as SettingsTab, label: t('settings.tabs.products'), icon: '📦' },
    { id: 'invoices' as SettingsTab, label: t('settings.tabs.invoices'), icon: '💰' },
    { id: 'serviceMessages' as SettingsTab, label: t('settings.tabs.serviceMessages'), icon: '💬' },
  ];

  return (
    <div className="settings-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

