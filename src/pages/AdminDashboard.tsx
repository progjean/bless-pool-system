import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DashboardStats, PeriodVariation } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';
import { StatCard } from '../components/dashboard/StatCard';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { ClientsVariation } from '../components/dashboard/ClientsVariation';
import { OverdueInvoices } from '../components/dashboard/OverdueInvoices';
import { WorkOrdersSection } from '../components/dashboard/WorkOrdersSection';
import { WaterAlerts } from '../components/dashboard/WaterAlerts';
import { TechnicianPerformance } from '../components/dashboard/TechnicianPerformance';
import { showToast } from '../utils/toast';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<'30days' | '3months' | '6months' | '1year'>('30days');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [variations, setVariations] = useState<PeriodVariation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, variationsData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getPeriodVariations(),
        ]);
        setStats(statsData);
        setVariations(variationsData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        showToast.error('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const currentVariation = variations.find(v => v.period === selectedPeriod) || variations[0];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-dashboard">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>{t('common.errorLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin-hub')} className="back-button">
              ← {t('common.backToHub')}
            </button>
            <h1>{t('dashboard.title')}</h1>
          </div>
        </div>
      </header>

      <main className="dashboard-main" style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Estatísticas Principais */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t('dashboard.mainStats')}</h2>
            <PeriodSelector 
              selectedPeriod={selectedPeriod} 
              onPeriodChange={setSelectedPeriod} 
            />
          </div>

          <div className="stats-grid">
            <StatCard
              title={t('dashboard.activeCustomers')}
              value={stats.totalActiveClients}
              subtitle={`${stats.inactiveClients} ${t('dashboard.inactive')}`}
              icon="👥"
              trend={currentVariation?.trend || 'up'}
              variation={currentVariation?.variation || 0}
            />
            <StatCard
              title={t('dashboard.newCustomers')}
              value={stats.newClientsThisMonth}
              subtitle={`${stats.lostClientsThisMonth} ${t('dashboard.lost')}`}
              icon="➕"
              trend="up"
            />
            <StatCard
              title={t('dashboard.overdueInvoices')}
              value={stats.overdueInvoices}
              subtitle={`${stats.overdueAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}`}
              icon="⚠️"
              trend="down"
              alert
            />
            <StatCard
              title={t('dashboard.billedThisMonth')}
              value={`$${(stats.totalBilledThisMonth / 1000).toFixed(0)}k`}
              subtitle={`$${(stats.totalBilledThisYear / 1000).toFixed(0)}k ${t('dashboard.billedThisYear')}`}
              icon="💰"
              trend="up"
            />
            <StatCard
              title={t('dashboard.workOrders')}
              value={stats.workOrdersCompleted}
              subtitle={`${stats.workOrdersOpen} ${t('dashboard.workOrdersOpen')}, ${stats.workOrdersInProgress} ${t('dashboard.workOrdersInProgress')}`}
              icon="📋"
            />
            <StatCard
              title={t('dashboard.waterAlerts')}
              value={stats.alertsCount}
              subtitle={t('dashboard.outOfStandard')}
              icon="🔔"
              alert
            />
          </div>
        </section>

        {/* Gráficos */}
        <section className="dashboard-section charts-section">
          <div className="charts-grid">
            <div className="chart-card">
              <h3>{t('dashboard.monthlyRevenue')}</h3>
              <RevenueChart />
            </div>
            <div className="chart-card">
              <h3>{t('dashboard.clientVariation')}</h3>
              <ClientsVariation variations={variations} />
            </div>
          </div>
        </section>

        {/* Faturas em Atraso */}
        <section className="dashboard-section">
          <h2>{t('dashboard.overdueInvoices')}</h2>
          <OverdueInvoices />
        </section>

        {/* Work Orders */}
        <section className="dashboard-section">
          <h2>{t('dashboard.workOrders')}</h2>
          <WorkOrdersSection />
        </section>

        {/* Alertas e Performance */}
        <section className="dashboard-section alerts-performance">
          <div className="alerts-performance-grid">
            <div className="alerts-card">
              <h2>{t('dashboard.parameterAlerts')}</h2>
              <WaterAlerts />
            </div>
            <div className="performance-card">
              <h2>{t('dashboard.technicianPerformance')}</h2>
              <TechnicianPerformance />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

