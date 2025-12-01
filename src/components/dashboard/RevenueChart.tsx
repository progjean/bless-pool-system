import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { MonthlyRevenue } from '../../types/dashboard';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import { showToast } from '../../utils/toast';
import './RevenueChart.css';

export const RevenueChart: React.FC = () => {
  const { t, language } = useLanguage();
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getMonthlyRevenue(12);
        setRevenueData(data);
      } catch (error) {
        console.error('Erro ao carregar receita:', error);
        showToast.error('Erro ao carregar receita');
      } finally {
        setLoading(false);
      }
    };

    loadRevenue();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}...</div>;
  }

  if (revenueData.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{t('dashboard.noRevenueData')}</div>;
  }

  const maxRevenue = Math.max(...revenueData.map(m => m.revenue));
  const minRevenue = Math.min(...revenueData.map(m => m.revenue));
  const range = maxRevenue - minRevenue;

  return (
    <div className="revenue-chart">
      <div className="chart-bars">
        {revenueData.map((month, index) => {
          const height = range > 0 ? ((month.revenue - minRevenue) / range) * 100 : 50;
          return (
            <div key={index} className="bar-container">
              <div 
                className="bar" 
                style={{ height: `${height}%` }}
                title={formatCurrency(month.revenue, language)}
              >
                <span className="bar-value">
                  ${(month.revenue / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="bar-label">{month.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

