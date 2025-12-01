import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types/user';
import { WorkOrder } from '../types/workOrder';
import { customersService } from '../services/customersService';
import { workOrdersService } from '../services/workOrdersService';
import { generateNextWorkOrderNumber } from '../data/workOrderData';
import { WorkOrderForm } from '../components/workOrders/WorkOrderForm';
import { showToast } from '../utils/toast';
import { Customer } from '../types/customer';
import './WorkOrderFormPage.css';

interface LocationState {
  returnToService?: boolean;
  customerId?: string;
  customerName?: string;
  client?: any;
  viewMode?: 'self' | 'technician';
  technicianId?: string;
}

export const WorkOrderFormPage: React.FC = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const isEditing = workOrderId !== 'new';

  const [workOrder, setWorkOrder] = useState<Partial<WorkOrder>>({
    workOrderNumber: generateNextWorkOrderNumber(),
    type: 'other',
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    customerId: '',
    customerName: '',
    customerAddress: '',
    createdBy: user?.name || '',
    createdByRole: user?.role === UserRole.ADMIN ? 'admin' : 'supervisor',
    createdAt: new Date().toISOString(),
    photos: [],
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar clientes
        const customersData = await customersService.list();
        setCustomers(customersData);

        // Se veio da ServicePage, pré-preencher customerId e customerName
        if (!isEditing && state?.customerId) {
          const customer = customersData.find(c => c.id === state.customerId);
          setWorkOrder(prev => ({
            ...prev,
            customerId: state.customerId || '',
            customerName: state.customerName || customer?.name || '',
            customerAddress: customer?.address || '',
          }));
        }

        // Se estiver editando, carregar work order
        if (isEditing && workOrderId) {
          const existingWO = await workOrdersService.get(workOrderId);
          if (existingWO) {
            setWorkOrder(existingWO);
          } else {
            showToast.error(t('workOrders.notFound') || 'Work Order não encontrada');
            handleBack();
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast.error(t('workOrders.loadError') || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [workOrderId, isEditing, state, t]);

  const handleBack = () => {
    if (state?.returnToService && state?.customerId) {
      // Voltar para a ServicePage do cliente
      navigate(`/work/service/${state.customerId}`, {
        state: {
          client: state.client,
          viewMode: state.viewMode,
          technicianId: state.technicianId,
        }
      });
    } else {
      // Voltar para a lista de Work Orders (baseado no role)
      if (user?.role === UserRole.ADMIN) {
        navigate('/admin/work-orders');
      } else {
        navigate('/work');
      }
    }
  };

  const handleSave = async (woData: WorkOrder) => {
    try {
      if (isEditing && workOrderId) {
        await workOrdersService.update(workOrderId, woData);
        showToast.success(t('workOrder.updated') || 'Work Order atualizada com sucesso!');
      } else {
        await workOrdersService.create(woData);
        showToast.success(t('workOrder.createdSuccess') || 'Work Order criada com sucesso!');
      }
      
      if (state?.returnToService && state?.customerId) {
        // Voltar para a ServicePage do cliente
        navigate(`/work/service/${state.customerId}`, {
          state: {
            client: state.client,
            viewMode: state.viewMode,
            technicianId: state.technicianId,
          }
        });
      } else {
        // Voltar para a lista de Work Orders (baseado no role)
        if (user?.role === UserRole.ADMIN) {
          navigate('/admin/work-orders');
        } else {
          navigate('/work');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar work order:', error);
      showToast.error(t('workOrders.saveError') || 'Erro ao salvar work order');
    }
  };

  const handleCancel = () => {
    if (state?.returnToService && state?.customerId) {
      // Voltar para a ServicePage do cliente
      navigate(`/work/service/${state.customerId}`, {
        state: {
          client: state.client,
          viewMode: state.viewMode,
          technicianId: state.technicianId,
        }
      });
    } else {
      // Voltar para a lista de Work Orders (baseado no role)
      if (user?.role === UserRole.ADMIN) {
        navigate('/admin/work-orders');
      } else {
        navigate('/work');
      }
    }
  };

  return (
    <div className="work-order-form-page">
      <header className="form-header">
        <div className="header-content">
          <div>
            <button onClick={handleBack} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{isEditing ? (language === 'pt-BR' ? 'Editar Work Order' : 'Edit Work Order') : t('workOrders.newWorkOrder')}</h1>
          </div>
          <div className="user-info">
            <span>{user?.name}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="logout-button">
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="form-main">
        {loading ? (
          <div className="loading">
            <p>{t('common.loading') || 'Carregando...'}</p>
          </div>
        ) : (
          <WorkOrderForm
            workOrder={workOrder}
            customers={customers}
            userRole={user?.role}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
};

