import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';
import { showToast } from '../../utils/toast';
import './WaterAlerts.css';

export const WaterAlerts: React.FC = () => {
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getWaterAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Erro ao carregar alertas:', error);
        showToast.error('Erro ao carregar alertas');
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="severity-badge high">🔴 {t('dashboard.alerts.high')}</span>;
      case 'medium':
        return <span className="severity-badge medium">🟡 {t('dashboard.alerts.medium')}</span>;
      case 'low':
        return <span className="severity-badge low">🟢 {t('dashboard.alerts.low')}</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}...</div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="water-alerts-empty">
        <p>{t('dashboard.alerts.noAlerts')}</p>
      </div>
    );
  }

  return (
    <div className="water-alerts">
      {alerts.map((alert) => (
        <div key={alert.id} className="alert-card">
          <div className="alert-header">
            <div className="alert-client">{alert.clientName}</div>
            {getSeverityBadge(alert.severity)}
          </div>
          <div className="alert-details">
            <div className="alert-parameter">
              <span className="parameter-name">{alert.parameter}:</span>
              <span className={`parameter-value ${alert.severity}`}>
                {alert.value} {alert.parameter === 'pH' ? '' : 'ppm'}
              </span>
            </div>
            <div className="alert-standard">
              {t('dashboard.alerts.standard')}: {alert.standard}
            </div>
            <div className="alert-time">
              {t('dashboard.alerts.detected')}: {new Date(alert.detectedAt).toLocaleString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

