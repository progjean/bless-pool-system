import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { WorkOrder } from '../../types/workOrder';
import { useLanguage } from '../../context/LanguageContext';
import { showToast } from '../../utils/toast';
import './WorkOrdersSection.css';

export const WorkOrdersSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getWorkOrdersForDashboard(10);
        setWorkOrders(data);
      } catch (error) {
        console.error('Erro ao carregar work orders:', error);
        showToast.error('Erro ao carregar work orders');
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrders();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}...</div>;
  }

  const openCount = workOrders.filter(wo => wo.status === 'open').length;
  const inProgressCount = workOrders.filter(wo => wo.status === 'in_progress').length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="status-badge open">{t('dashboard.workOrders.open')}</span>;
      case 'in_progress':
        return <span className="status-badge in-progress">{t('dashboard.workOrders.inProgress')}</span>;
      case 'completed':
        return <span className="status-badge completed">{t('dashboard.workOrders.completed')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="work-orders-section">
      <div className="wo-summary">
        <div className="wo-summary-item">
          <div className="wo-count open">{openCount}</div>
          <div className="wo-label">{t('dashboard.workOrders.open')}</div>
        </div>
        <div className="wo-summary-item">
          <div className="wo-count in-progress">{inProgressCount}</div>
          <div className="wo-label">{t('dashboard.workOrders.inProgress')}</div>
        </div>
        <div className="wo-summary-item">
          <div className="wo-count completed">{completedCount}</div>
          <div className="wo-label">{t('dashboard.workOrders.completed')}</div>
        </div>
      </div>

      {workOrders.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>{t('dashboard.noWorkOrders')}</p>
        </div>
      ) : (
        <div className="wo-list">
          {workOrders.map((wo) => (
            <div key={wo.id} className="wo-card">
              <div className="wo-header">
                <div className="wo-client">{wo.customerName}</div>
                {getStatusBadge(wo.status)}
              </div>
              <div className="wo-details">
                <div className="wo-detail-item">
                  <span className="wo-detail-label">{t('dashboard.workOrders.type')}:</span>
                  <span className="wo-detail-value">{wo.type}</span>
                </div>
                {wo.assignedTechnician && (
                  <div className="wo-detail-item">
                    <span className="wo-detail-label">{t('dashboard.workOrders.technician')}:</span>
                    <span className="wo-detail-value">{wo.assignedTechnician}</span>
                  </div>
                )}
                {wo.createdAt && (
                  <div className="wo-detail-item">
                    <span className="wo-detail-label">{t('dashboard.workOrders.created')}:</span>
                    <span className="wo-detail-value">
                      {new Date(wo.createdAt).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

