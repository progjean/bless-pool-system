import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Customer } from '../types/customer';
import { customersService } from '../services/customersService';
import { usePagination } from '../hooks/usePagination';
import { useOptimisticList } from '../hooks/useOptimisticUpdate';
import { CustomerCard } from '../components/customers/CustomerCard';
import { CustomerFilters } from '../components/customers/CustomerFilters';
import { PaginationControls } from '../components/common/PaginationControls';
import { ExportButton } from '../components/common/ExportButton';
import { AdvancedFilters } from '../components/common/AdvancedFilters';
import { RealtimeIndicator } from '../components/common/RealtimeIndicator';
import { useRealtime } from '../hooks/useRealtime';
import { exportCustomersToCSV } from '../utils/exportUtils';
import { showToast } from '../utils/toast';
import { debounce } from '../utils/debounce';
import './CustomersPage.css';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  
  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Usar optimistic list para operações CRUD
  const {
    list: optimisticCustomers,
    addItem: addCustomerOptimistic,
    updateItem: updateCustomerOptimistic,
    removeItem: removeCustomerOptimistic,
    isUpdating: isOptimisticUpdating,
  } = useOptimisticList(
    allCustomers,
    async (customer) => await customersService.create(customer as Customer),
    async (id, updates) => await customersService.update(id, { ...allCustomers.find(c => c.id === id)!, ...updates } as Customer),
    async (id) => await customersService.delete(id)
  );

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await customersService.list();
        setAllCustomers(data);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Usar customers otimistas para filtros
  const customers = optimisticCustomers;

  const handleNewCustomer = () => {
    navigate('/admin/customers/new');
  };

  const handleCustomerClick = (customerId: string) => {
    navigate(`/admin/customers/${customerId}`);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const customerName = customer.name || `${customer.firstName} ${customer.lastName}`.trim();
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = customerName.toLowerCase().includes(searchLower) ||
                           customer.address?.toLowerCase().includes(searchLower) ||
                           customer.city?.toLowerCase().includes(searchLower) ||
                           customer.state?.toLowerCase().includes(searchLower) ||
                           customer.zipCode?.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesTechnician = technicianFilter === 'all' || customer.assignedTechnician === technicianFilter;

      return matchesSearch && matchesStatus && matchesTechnician;
    });
  }, [customers, debouncedSearchTerm, statusFilter, technicianFilter]);

  // Paginação
  const {
    paginatedData,
    paginationInfo,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(filteredCustomers, { itemsPerPage: 12 });

  const technicians = useMemo(() => Array.from(new Set(customers.map(c => c.assignedTechnician))), [customers]);

  // Memoizar callbacks do realtime para evitar re-renders desnecessários
  const handleRealtimeInsert = useCallback((newCustomer: Customer) => {
    setAllCustomers(prev => [...prev, newCustomer]);
    showToast.success(language === 'pt-BR' ? 'Novo cliente adicionado' : 'New customer added');
  }, [language]);

  const handleRealtimeUpdate = useCallback((updatedCustomer: Customer) => {
    setAllCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    showToast.info(language === 'pt-BR' ? 'Cliente atualizado' : 'Customer updated');
  }, [language]);

  const handleRealtimeDelete = useCallback((deletedCustomer: Customer) => {
    setAllCustomers(prev => prev.filter(c => c.id !== deletedCustomer.id));
    showToast.info(language === 'pt-BR' ? 'Cliente removido' : 'Customer removed');
  }, [language]);

  // Realtime para atualizações automáticas
  const { isConnected } = useRealtime<Customer>({
    table: 'customers',
    enabled: true,
    onInsert: handleRealtimeInsert,
    onUpdate: handleRealtimeUpdate,
    onDelete: handleRealtimeDelete,
  });

  const handleExportCSV = () => {
    exportCustomersToCSV(filteredCustomers);
  };

  return (
    <div className="customers-page">
      <header className="customers-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('nav.customers')}</h1>
          </div>
          <RealtimeIndicator isConnected={isConnected} />
        </div>
      </header>

      <main className="customers-main">
        <AdvancedFilters
          onFiltersChange={(filters) => {
            if (filters.search !== undefined) setSearchTerm(filters.search);
            if (filters.status) setStatusFilter(filters.status as 'all' | 'active' | 'inactive');
          }}
          filters={{
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
          }}
          availableStatuses={['active', 'inactive']}
          showDateRange={false}
          showStatus={true}
          customFilters={
            <div className="filter-group">
              <label>{language === 'pt-BR' ? 'Técnico' : 'Technician'}</label>
              <select
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">{language === 'pt-BR' ? 'Todos' : 'All'}</option>
                {technicians.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        <div className="customers-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder={t('customers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <CustomerFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            technicianFilter={technicianFilter}
            onTechnicianChange={setTechnicianFilter}
            technicians={technicians}
          />

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ExportButton
              onExportCSV={handleExportCSV}
              disabled={filteredCustomers.length === 0}
            />
            <button onClick={handleNewCustomer} className="new-customer-button">
              + {t('customers.newCustomer')}
            </button>
          </div>
        </div>

        <div className="customers-stats">
          <div className="stat-item">
            <span className="stat-label">{t('customers.total')}:</span>
            <span className="stat-value">{customers.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('customers.active')}:</span>
            <span className="stat-value active">{customers.filter(c => c.status === 'active').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('customers.inactive')}:</span>
            <span className="stat-value inactive">{customers.filter(c => c.status === 'inactive').length}</span>
          </div>
        </div>

        <div className="customers-grid">
          {loading ? (
            <div className="loading">
              <p>{t('common.loading') || 'Carregando...'}</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <>
              {paginatedData.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onClick={() => handleCustomerClick(customer.id)}
                />
              ))}
              <PaginationControls
                {...paginationInfo}
                onNext={nextPage}
                onPrevious={previousPage}
                onGoToPage={goToPage}
              />
            </>
          ) : (
            <div className="no-customers">
              <p>{t('customers.notFound')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

