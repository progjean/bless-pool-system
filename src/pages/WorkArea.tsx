import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types/user';
import { Client } from '../types/route';
import { customersService } from '../services/customersService';
import { Customer } from '../types/customer';
import { cacheImage } from '../utils/sync';
import { SyncStatus } from '../components/SyncStatus';
import { RouteMap } from '../components/RouteMap';
import { DateSelector } from '../components/DateSelector';
import { ClientList } from '../components/ClientList';
import { showToast } from '../utils/toast';
import './WorkArea.css';

interface LocationState {
  viewMode?: 'self' | 'technician';
  technicianId?: string;
}

export const WorkArea: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const state = location.state as LocationState | null;
  
  const [viewMode, setViewMode] = useState<'self' | 'technician'>('self');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const cachedDate = localStorage.getItem('workArea_selectedDate');
    return cachedDate || new Date().toISOString().split('T')[0];
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se supervisor veio do seletor, usar os dados do state
    if (user?.role === UserRole.SUPERVISOR && state) {
      if (state.viewMode === 'self') {
        setViewMode('self');
        setSelectedTechnicianId(null);
      } else if (state.viewMode === 'technician' && state.technicianId) {
        setViewMode('technician');
        setSelectedTechnicianId(state.technicianId);
      }
    } else if (user?.role === UserRole.SUPERVISOR && !state) {
      // Se supervisor acessou diretamente sem seleção, redirecionar para seletor
      navigate('/supervisor-selector', { replace: true });
      return;
    }
  }, [user?.role, state, navigate]);

  useEffect(() => {
    // Carregar clientes do dia selecionado quando a data mudar ou quando o modo de visualização mudar
    if (user) {
      loadClientsForDate(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, viewMode, selectedTechnicianId, user]);

  const loadClientsForDate = async (date: string) => {
    try {
      setLoading(true);
      localStorage.setItem('workArea_selectedDate', date);
      
      // Buscar clientes do Supabase
      const customersResult = await customersService.list();
      const customers = customersResult || [];
      
      // Filtrar clientes baseado no técnico selecionado (se supervisor)
      let filteredCustomers = customers.filter(c => c.status === 'active');
      
      if (user?.role === UserRole.SUPERVISOR && viewMode === 'technician' && selectedTechnicianId) {
        // Filtrar por técnico selecionado
        filteredCustomers = filteredCustomers.filter(c => 
          c.assignedTechnician && c.assignedTechnician.toLowerCase().includes(selectedTechnicianId.toLowerCase())
        );
      } else if (user?.role === UserRole.TECHNICIAN) {
        // Filtrar apenas clientes do técnico logado
        filteredCustomers = filteredCustomers.filter(c => 
          c.assignedTechnician && c.assignedTechnician.toLowerCase() === (user.name || '').toLowerCase()
        );
      }
      
      // Converter Customer para Client
      const selectedDateObj = new Date(date);
      const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
      
      const clientsData: Client[] = filteredCustomers
        .filter(customer => {
          // Verificar se o cliente tem serviço no dia selecionado
          if (customer.serviceDay) {
            return customer.serviceDay.toLowerCase() === dayOfWeek.toLowerCase();
          }
          return true; // Se não tem dia específico, mostrar todos
        })
        .map((customer, index) => {
          // Verificar se já foi completado hoje (verificar serviços)
          const status: 'pending' | 'completed' = 'pending'; // Será atualizado quando integrarmos serviços
          
          return {
            id: customer.id,
            name: customer.name,
            address: `${customer.address}, ${customer.city || ''} ${customer.state || ''} ${customer.zipCode || ''}`.trim(),
            latitude: 0, // Será necessário adicionar coordenadas ao Customer ou buscar de outro lugar
            longitude: 0,
            serviceType: customer.typeOfService?.toLowerCase() || 'regular',
            status,
            scheduledTime: customer.serviceDay ? '09:00' : '09:00', // Pode ser melhorado
            estimatedDuration: customer.minutesAtStop || 25,
          };
        });
      
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showToast.error('Erro ao carregar clientes');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadClientsForDate(date);
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    navigate(`/work/service/${client.id}`, { 
      state: { 
        client,
        viewMode,
        technicianId: selectedTechnicianId 
      } 
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    if (user?.role === UserRole.ADMIN) {
      navigate('/admin-hub');
    } else if (user?.role === UserRole.SUPERVISOR) {
      navigate('/supervisor-selector');
    } else {
      // Technician - voltar para login ou dashboard se tiver acesso
      navigate('/login');
    }
  };

  const handleChangeView = () => {
    if (user?.role === UserRole.SUPERVISOR) {
      navigate('/supervisor-selector');
    }
  };

  const handleViewRoute = () => {
    setShowRoute(true);
    setShowMap(true);
  };

  const getCurrentViewName = () => {
    if (user?.role === UserRole.SUPERVISOR) {
      if (viewMode === 'self') {
        return user.name;
      } else if (viewMode === 'technician' && selectedTechnicianId) {
        // Em produção, buscar nome do técnico
        return t('workArea.technician');
      }
    }
    return user?.name || t('workArea.user');
  };

  const pendingClients = clients.filter(c => c.status === 'pending').length;
  const completedClients = clients.filter(c => c.status === 'completed').length;

  return (
    <div className="work-area">
      <header className="work-header">
        <div className="header-content">
          <div>
            <button onClick={handleBack} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('workArea.title')}</h1>
            {user?.role === UserRole.SUPERVISOR && (
              <p className="technician-name">
                {t('workArea.viewing')}: {getCurrentViewName()}
                {viewMode === 'technician' && ` (${t('workArea.technician')})`}
              </p>
            )}
          </div>
          <div className="user-info">
            <span>{user?.name} ({user?.role})</span>
            {user?.role === UserRole.SUPERVISOR && (
              <button 
                onClick={handleChangeView}
                className="change-technician-button"
              >
                {t('workArea.changeView')}
              </button>
            )}
            <button onClick={handleLogout} className="logout-button">
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="work-main">
        <div className="work-dashboard">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-value">{pendingClients}</div>
              <div className="stat-label">{t('workArea.pending')}</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-value">{completedClients}</div>
              <div className="stat-label">{t('dashboard.workOrders.completed')}</div>
            </div>
            <div className="stat-card total">
              <div className="stat-value">{clients.length}</div>
              <div className="stat-label">{t('stats.total')}</div>
            </div>
          </div>

          <div className="work-controls">
            <DateSelector 
              selectedDate={selectedDate} 
              onDateChange={handleDateChange} 
            />
            <button 
              onClick={handleViewRoute}
              className="view-route-button"
            >
              🗺️ {t('workArea.viewRoute')}
            </button>
          </div>
        </div>

        {showMap && (
          <div className="map-container">
            <RouteMap 
              clients={clients}
              showRoute={showRoute}
              onClose={() => setShowMap(false)}
            />
          </div>
        )}

        <div className="clients-section">
          <h2>{t('workArea.routeClients')} - {new Date(selectedDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}</h2>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}...</div>
          ) : clients.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>{t('workArea.noClients')}</div>
          ) : (
            <ClientList 
              clients={clients}
              onClientClick={handleClientClick}
            />
          )}
        </div>
      </main>
      <SyncStatus />
    </div>
  );
};
