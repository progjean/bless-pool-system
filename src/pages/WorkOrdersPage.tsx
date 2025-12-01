import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types/user';
import { WorkOrder, WorkOrderFilters } from '../types/workOrder';
import { workOrdersService } from '../services/workOrdersService';
import { usePagination } from '../hooks/usePagination';
import { WorkOrderCard } from '../components/workOrders/WorkOrderCard';
import { WorkOrderFilters as WorkOrderFiltersComponent } from '../components/workOrders/WorkOrderFilters';
import { WorkOrderStats } from '../components/workOrders/WorkOrderStats';
import { PaginationControls } from '../components/common/PaginationControls';
import { ExportButton } from '../components/common/ExportButton';
import { RealtimeIndicator } from '../components/common/RealtimeIndicator';
import { useRealtime } from '../hooks/useRealtime';
import { showToast } from '../utils/toast';
import { exportWorkOrdersToCSV } from '../utils/exportUtils';
import './WorkOrdersPage.css';

export const WorkOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filters, setFilters] = useState<WorkOrderFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await workOrdersService.list();
        setWorkOrders(data);
      } catch (error) {
        console.error('Erro ao carregar work orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrders();
  }, []);

  const handleNewWorkOrder = () => {
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERVISOR) {
      navigate('/admin/work-orders/new');
    }
  };

  const handleWorkOrderClick = (workOrderId: string) => {
    navigate(`/admin/work-orders/${workOrderId}`);
  };

  const handleExportCSV = () => {
    exportWorkOrdersToCSV(filteredWorkOrders);
  };

  const handleDelete = async (workOrderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que o clique abra os detalhes
    
    if (!confirm(language === 'pt-BR' ? 'Tem certeza que deseja excluir esta Work Order?' : 'Are you sure you want to delete this Work Order?')) {
      return;
    }

    try {
      await workOrdersService.delete(workOrderId);
      setWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
      showToast.success(language === 'pt-BR' ? 'Work Order excluída com sucesso!' : 'Work Order deleted successfully!');
    } catch (error) {
      console.error('Erro ao excluir work order:', error);
      showToast.error(language === 'pt-BR' ? 'Erro ao excluir Work Order' : 'Error deleting Work Order');
    }
  };

  const canCreateWorkOrder = () => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERVISOR;
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || wo.status === filters.status;
    const matchesType = !filters.type || wo.type === filters.type;
    const matchesPriority = !filters.priority || wo.priority === filters.priority;
    const matchesTechnician = !filters.assignedTechnician || wo.assignedTechnician === filters.assignedTechnician;
    const matchesCustomer = !filters.customerId || wo.customerId === filters.customerId;

    // Técnico só vê suas próprias work orders
    if (user?.role === UserRole.TECHNICIAN) {
      return matchesSearch && matchesStatus && matchesType && matchesPriority && 
             wo.assignedTechnician === user.name;
    }

    // Supervisor pode ver todas ou filtrar por técnico
    if (user?.role === UserRole.SUPERVISOR && filters.assignedTechnician) {
      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesTechnician;
    }

    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesTechnician && matchesCustomer;
  });

  // Paginação
  const {
    paginatedData,
    paginationInfo,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(filteredWorkOrders, { itemsPerPage: 12 });

  const openCount = workOrders.filter(wo => wo.status === 'open').length;
  const inProgressCount = workOrders.filter(wo => wo.status === 'in_progress').length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;

  const technicians = Array.from(new Set(workOrders
    .map(wo => wo.assignedTechnician)
    .filter((tech): tech is string => !!tech)
  ));

  // Memoizar callbacks do realtime para evitar re-renders desnecessários
  const handleRealtimeInsert = useCallback((newWO: WorkOrder) => {
    setWorkOrders(prev => [...prev, newWO]);
    showToast.success(language === 'pt-BR' ? 'Nova work order criada' : 'New work order created');
  }, [language]);

  const handleRealtimeUpdate = useCallback((updatedWO: WorkOrder) => {
    setWorkOrders(prev => prev.map(wo => wo.id === updatedWO.id ? updatedWO : wo));
    showToast.info(language === 'pt-BR' ? 'Work order atualizada' : 'Work order updated');
  }, [language]);

  const handleRealtimeDelete = useCallback((deletedWO: WorkOrder) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== deletedWO.id));
    showToast.info(language === 'pt-BR' ? 'Work order removida' : 'Work order removed');
  }, [language]);

  // Realtime para atualizações automáticas
  const { isConnected } = useRealtime<WorkOrder>({
    table: 'work_orders',
    enabled: true,
    onInsert: handleRealtimeInsert,
    onUpdate: handleRealtimeUpdate,
    onDelete: handleRealtimeDelete,
  });

  return (
    <div className="work-orders-page">
      <header className="work-orders-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('nav.workOrders')}</h1>
          </div>
          <RealtimeIndicator isConnected={isConnected} />
        </div>
      </header>

      <main className="work-orders-main">
        <WorkOrderStats 
          total={workOrders.length}
          open={openCount}
          inProgress={inProgressCount}
          completed={completedCount}
        />

        <div className="work-orders-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder={t('workOrders.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <WorkOrderFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            technicians={technicians}
            userRole={user?.role}
          />

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ExportButton
              onExportCSV={handleExportCSV}
              disabled={filteredWorkOrders.length === 0}
            />
            {canCreateWorkOrder() && (
              <button onClick={handleNewWorkOrder} className="new-wo-button">
                + {t('workOrders.newWorkOrder')}
              </button>
            )}
          </div>
        </div>

        <div className="work-orders-grid">
          {loading ? (
            <div className="loading">
              <p>{t('common.loading') || 'Carregando...'}</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <>
              {paginatedData.map(wo => (
                <div key={wo.id} style={{ position: 'relative' }}>
                  <WorkOrderCard
                    workOrder={wo}
                    onClick={() => handleWorkOrderClick(wo.id)}
                  />
                  {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERVISOR) && (
                    <button
                      onClick={(e) => handleDelete(wo.id, e)}
                      className="delete-wo-button"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        zIndex: 10,
                      }}
                      title={language === 'pt-BR' ? 'Excluir Work Order' : 'Delete Work Order'}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              <PaginationControls
                {...paginationInfo}
                onNext={nextPage}
                onPrevious={previousPage}
                onGoToPage={goToPage}
              />
            </>
          ) : (
            <div className="no-work-orders">
              <p>{t('workOrders.notFound')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

