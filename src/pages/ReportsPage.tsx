import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ReportsTabs } from '../components/reports/ReportsTabs';
import { ChemicalConsumptionByCustomerReport } from '../components/reports/ChemicalConsumptionByCustomerReport';
import { ChemicalConsumptionByTechnicianReport } from '../components/reports/ChemicalConsumptionByTechnicianReport';
import { MonthlyExpensesReport } from '../components/reports/MonthlyExpensesReport';
import { ServiceTimeStatsReport } from '../components/reports/ServiceTimeStatsReport';
import { ServicesByTechnicianReport } from '../components/reports/ServicesByTechnicianReport';
import { ChemicalHistoryReport } from '../components/reports/ChemicalHistoryReport';
import { MonthlyComparisonReport } from '../components/reports/MonthlyComparisonReport';
import './ReportsPage.css';

type ReportTab = 
  | 'chemicalByCustomer' 
  | 'chemicalByTechnician' 
  | 'monthlyExpenses' 
  | 'serviceTime' 
  | 'servicesByTechnician' 
  | 'chemicalHistory' 
  | 'monthlyComparison';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ReportTab>('chemicalByCustomer');

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('nav.reports')}</h1>
          </div>
        </div>
      </header>

      <main className="reports-main">
        <ReportsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="reports-content">
          {activeTab === 'chemicalByCustomer' && <ChemicalConsumptionByCustomerReport />}
          {activeTab === 'chemicalByTechnician' && <ChemicalConsumptionByTechnicianReport />}
          {activeTab === 'monthlyExpenses' && <MonthlyExpensesReport />}
          {activeTab === 'serviceTime' && <ServiceTimeStatsReport />}
          {activeTab === 'servicesByTechnician' && <ServicesByTechnicianReport />}
          {activeTab === 'chemicalHistory' && <ChemicalHistoryReport />}
          {activeTab === 'monthlyComparison' && <MonthlyComparisonReport />}
        </div>
      </main>
    </div>
  );
};

