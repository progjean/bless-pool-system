import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ReportsTabs.css';

type ReportTab = 
  | 'chemicalByCustomer' 
  | 'chemicalByTechnician' 
  | 'monthlyExpenses' 
  | 'serviceTime' 
  | 'servicesByTechnician' 
  | 'chemicalHistory' 
  | 'monthlyComparison';

interface ReportsTabsProps {
  activeTab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
}

export const ReportsTabs: React.FC<ReportsTabsProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  const tabs = [
    { id: 'chemicalByCustomer' as ReportTab, label: t('reports.chemicalByCustomer'), icon: '👤' },
    { id: 'chemicalByTechnician' as ReportTab, label: t('reports.chemicalByTechnician'), icon: '🔧' },
    { id: 'monthlyExpenses' as ReportTab, label: t('reports.monthlyExpenses'), icon: '💰' },
    { id: 'serviceTime' as ReportTab, label: t('reports.serviceTime'), icon: '⏱️' },
    { id: 'servicesByTechnician' as ReportTab, label: t('reports.servicesByTechnician'), icon: '📊' },
    { id: 'chemicalHistory' as ReportTab, label: t('reports.chemicalHistory'), icon: '🧪' },
    { id: 'monthlyComparison' as ReportTab, label: t('reports.monthlyComparison'), icon: '📈' },
  ];

  return (
    <div className="reports-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`reports-tab ${activeTab === tab.id ? 'active' : ''}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

