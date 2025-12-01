import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import { showToast } from '../../utils/toast';
import './TechnicianPerformance.css';

export const TechnicianPerformance: React.FC = () => {
  const { t, language } = useLanguage();
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getTechnicianPerformance();
        setPerformance(data);
      } catch (error) {
        console.error('Erro ao carregar performance:', error);
        showToast.error('Erro ao carregar performance');
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);
  
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}...</div>;
  }

  if (performance.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>{t('dashboard.performance.noData')}</p>
      </div>
    );
  }

  return (
    <div className="technician-performance">
      <div className="performance-table">
        <div className="perf-header">
          <div className="perf-cell">{t('dashboard.performance.technician')}</div>
          <div className="perf-cell">{t('dashboard.performance.services')}</div>
          <div className="perf-cell">{t('dashboard.performance.rating')}</div>
          <div className="perf-cell">{t('dashboard.performance.punctuality')}</div>
          <div className="perf-cell">{t('dashboard.performance.revenue')}</div>
        </div>
        {performance.map((tech) => (
          <div key={tech.id} className="perf-row">
            <div className="perf-cell name">{tech.name}</div>
            <div className="perf-cell">{tech.completedServices}</div>
            <div className="perf-cell rating">
              <span className="rating-value">{tech.averageRating.toFixed(1)}</span>
              <span className="rating-stars">
                {'⭐'.repeat(Math.floor(tech.averageRating))}
              </span>
            </div>
            <div className="perf-cell">
              <div className="on-time-bar">
                <div 
                  className="on-time-fill"
                  style={{ width: `${tech.onTimePercentage}%` }}
                />
                <span className="on-time-text">{tech.onTimePercentage}%</span>
              </div>
            </div>
            <div className="perf-cell revenue">
              {formatCurrency(tech.totalRevenue, language).replace(/\.\d{2}$/, '')}k
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

