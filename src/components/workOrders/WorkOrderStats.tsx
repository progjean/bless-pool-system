import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './WorkOrderStats.css';

interface WorkOrderStatsProps {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
}

export const WorkOrderStats: React.FC<WorkOrderStatsProps> = ({
  total,
  open,
  inProgress,
  completed,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="wo-stats">
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-content">
          <div className="stat-value">{total}</div>
          <div className="stat-label">{t('stats.total')}</div>
        </div>
      </div>

      <div className="stat-card open">
        <div className="stat-icon">⏳</div>
        <div className="stat-content">
          <div className="stat-value">{open}</div>
          <div className="stat-label">{t('dashboard.workOrders.open')}</div>
        </div>
      </div>

      <div className="stat-card in-progress">
        <div className="stat-icon">🔧</div>
        <div className="stat-content">
          <div className="stat-value">{inProgress}</div>
          <div className="stat-label">{t('dashboard.workOrders.inProgress')}</div>
        </div>
      </div>

      <div className="stat-card completed">
        <div className="stat-icon">✓</div>
        <div className="stat-content">
          <div className="stat-value">{completed}</div>
          <div className="stat-label">{t('dashboard.workOrders.completed')}</div>
        </div>
      </div>
    </div>
  );
};

