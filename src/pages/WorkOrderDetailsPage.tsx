import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types/user';
import { WorkOrder } from '../types/workOrder';
import { workOrdersService } from '../services/workOrdersService';
import { storageService } from '../services/storageService';
import { WorkOrderDetails } from '../components/workOrders/WorkOrderDetails';
import { WorkOrderExecution } from '../components/workOrders/WorkOrderExecution';
import { showToast } from '../utils/toast';
import './WorkOrderDetailsPage.css';

export const WorkOrderDetailsPage: React.FC = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();

  const [workOrder, setWorkOrder] = useState<WorkOrder | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!workOrderId) return;

      try {
        setLoading(true);
        const data = await workOrdersService.get(workOrderId);
        
        if (!data) {
          showToast.error(t('workOrders.notFound') || 'Work Order não encontrada');
          navigate('/admin/work-orders');
          return;
        }

        setWorkOrder(data);
      } catch (error) {
        console.error('Erro ao carregar work order:', error);
        showToast.error(t('workOrders.loadError') || 'Erro ao carregar work order');
        navigate('/admin/work-orders');
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrder();
  }, [workOrderId, navigate, t]);

  if (loading) {
    return (
      <div className="work-order-details-page">
        <div className="loading">
          <p>{t('common.loading') || 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="work-order-details-page">
        <div className="not-found">
          <p>{language === 'pt-BR' ? 'Work Order não encontrada' : 'Work Order not found'}</p>
          <button onClick={() => navigate('/admin/work-orders')}>{t('common.back')}</button>
        </div>
      </div>
    );
  }

  const canEdit = () => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERVISOR;
  };

  const canExecute = () => {
    return (user?.role === UserRole.SUPERVISOR || user?.role === UserRole.TECHNICIAN) &&
           (workOrder.status === 'open' || workOrder.status === 'in_progress');
  };

  const handleStatusUpdate = async (status: WorkOrder['status'], updates?: Partial<WorkOrder>) => {
    if (!workOrder) return;

    try {
      const updated = {
        ...workOrder,
        status,
        ...updates,
      } as WorkOrder;

      await workOrdersService.update(workOrder.id, updated);
      setWorkOrder(updated);
    } catch (error) {
      console.error('Erro ao atualizar work order:', error);
      showToast.error(t('workOrders.updateError') || 'Erro ao atualizar work order');
    }
  };

  const handleStart = async () => {
    await handleStatusUpdate('in_progress', {
      startedAt: new Date().toISOString(),
      assignedTechnician: user?.name || workOrder.assignedTechnician,
      assignedTechnicianId: user?.id,
    });
    showToast.success(t('workOrders.started') || 'Work Order iniciada!');
  };

  const handleDelete = async () => {
    if (!workOrder) return;

    if (!confirm(language === 'pt-BR' ? 'Tem certeza que deseja excluir esta Work Order?' : 'Are you sure you want to delete this Work Order?')) {
      return;
    }

    try {
      await workOrdersService.delete(workOrder.id);
      showToast.success(language === 'pt-BR' ? 'Work Order excluída com sucesso!' : 'Work Order deleted successfully!');
      navigate('/admin/work-orders');
    } catch (error) {
      console.error('Erro ao excluir work order:', error);
      showToast.error(language === 'pt-BR' ? 'Erro ao excluir Work Order' : 'Error deleting Work Order');
    }
  };

  const handleComplete = async (notes: string, photos: string[], actualDuration?: number) => {
    if (!workOrder) return;

    try {
      // Upload de fotos se houver
      const uploadedPhotos: string[] = [];
      if (photos.length > 0) {
        for (const photo of photos) {
          if (photo.startsWith('data:image')) {
            const response = await fetch(photo);
            const blob = await response.blob();
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const url = await storageService.uploadServicePhoto(file, workOrder.id);
            uploadedPhotos.push(url);
          } else {
            uploadedPhotos.push(photo);
          }
        }
      }

      await handleStatusUpdate('completed', {
        completedAt: new Date().toISOString(),
        completedBy: user?.name,
        notes,
        photos: [...workOrder.photos, ...uploadedPhotos],
        actualDuration,
      });

      showToast.success(t('workOrder.completed') || 'Work Order concluída!');
      navigate('/admin/work-orders');
    } catch (error) {
      console.error('Erro ao completar work order:', error);
      showToast.error(t('workOrders.completeError') || 'Erro ao completar work order');
    }
  };

  return (
    <div className="work-order-details-page">
      <header className="details-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/work-orders')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{workOrder.workOrderNumber}</h1>
            <p className="wo-title">{workOrder.title}</p>
          </div>
          <div className="header-actions">
            {canEdit() && (
              <>
                <button 
                  onClick={() => navigate(`/admin/work-orders/${workOrder.id}/edit`)}
                  className="edit-button"
                >
                  ✏️ {t('common.edit')}
                </button>
                <button 
                  onClick={handleDelete}
                  className="delete-button"
                  style={{
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    marginLeft: '10px',
                  }}
                >
                  🗑️ {language === 'pt-BR' ? 'Excluir' : 'Delete'}
                </button>
              </>
            )}
            <div className="user-info">
              <span>{user?.name}</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="logout-button">
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="details-main">
        <WorkOrderDetails workOrder={workOrder} />

        {canExecute() && (
          <WorkOrderExecution
            workOrder={workOrder}
            onStart={handleStart}
            onComplete={handleComplete}
            userRole={user?.role}
          />
        )}
      </main>
    </div>
  );
};

