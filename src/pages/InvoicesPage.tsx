import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Invoice, InvoiceFilters } from '../types/invoice';
import { Customer } from '../types/customer';
import { invoicesService } from '../services/invoicesService';
import { customersService } from '../services/customersService';
import { DEFAULT_LATE_FEE, applyLateFeeToInvoice } from '../data/invoiceData';
import { usePagination } from '../hooks/usePagination';
import { InvoiceCard } from '../components/invoices/InvoiceCard';
import { InvoiceFilters as InvoiceFiltersComponent } from '../components/invoices/InvoiceFilters';
import { InvoiceStats } from '../components/invoices/InvoiceStats';
import { RecurringInvoiceManager } from '../components/invoices/RecurringInvoiceManager';
import { PaginationControls } from '../components/common/PaginationControls';
import { ExportButton } from '../components/common/ExportButton';
import { RealtimeIndicator } from '../components/common/RealtimeIndicator';
import { useRealtime } from '../hooks/useRealtime';
import { showToast } from '../utils/toast';
import { exportInvoicesToCSV } from '../utils/exportUtils';
import './InvoicesPage.css';

export const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [invoicesData, customersData] = await Promise.all([
          invoicesService.list(),
          customersService.list(),
        ]);
        
        // Aplicar Late Fee automaticamente para invoices em atraso
        const updatedInvoices = invoicesData.map(invoice => {
          if (invoice.status === 'sent' || invoice.status === 'overdue') {
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            if (today > dueDate && !invoice.lateFeeApplied) {
              return applyLateFeeToInvoice(invoice, DEFAULT_LATE_FEE);
            }
          }
          return invoice;
        });
        
        setInvoices(updatedInvoices);
        setCustomers(customersData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNewInvoice = () => {
    navigate('/admin/invoices/new');
  };

  const handleInvoiceClick = (invoiceId: string) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  const handleGenerateInvoices = async (newInvoices: Invoice[]) => {
    try {
      // Salvar cada invoice no backend
      const savedInvoices = await Promise.all(
        newInvoices.map(inv => invoicesService.create(inv))
      );
      setInvoices(prev => [...prev, ...savedInvoices]);
    } catch (error) {
      console.error('Erro ao gerar invoices:', error);
    }
  };

  const handleUpdateCustomer = (customerId: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, ...updates } : c
    ));
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || invoice.status === filters.status;
    const matchesCustomer = !filters.customerId || invoice.customerId === filters.customerId;
    const matchesOverdue = !filters.overdueOnly || invoice.status === 'overdue';
    
    const matchesDateFrom = !filters.dateFrom || new Date(invoice.dueDate) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(invoice.dueDate) <= new Date(filters.dateTo);

    return matchesSearch && matchesStatus && matchesCustomer && matchesOverdue && matchesDateFrom && matchesDateTo;
  });

  // Paginação
  const {
    paginatedData,
    paginationInfo,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(filteredInvoices, { itemsPerPage: 12 });

  const pendingAmount = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  // Memoizar callbacks do realtime para evitar re-renders desnecessários
  const handleRealtimeInsert = useCallback((newInvoice: Invoice) => {
    setInvoices(prev => [...prev, newInvoice]);
    showToast.success(language === 'pt-BR' ? 'Nova invoice criada' : 'New invoice created');
  }, [language]);

  const handleRealtimeUpdate = useCallback((updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    showToast.info(language === 'pt-BR' ? 'Invoice atualizada' : 'Invoice updated');
  }, [language]);

  const handleRealtimeDelete = useCallback((deletedInvoice: Invoice) => {
    setInvoices(prev => prev.filter(inv => inv.id !== deletedInvoice.id));
    showToast.info(language === 'pt-BR' ? 'Invoice removida' : 'Invoice removed');
  }, [language]);

  // Realtime para atualizações automáticas
  const { isConnected } = useRealtime<Invoice>({
    table: 'invoices',
    enabled: true,
    onInsert: handleRealtimeInsert,
    onUpdate: handleRealtimeUpdate,
    onDelete: handleRealtimeDelete,
  });

  const handleExportCSV = () => {
    exportInvoicesToCSV(filteredInvoices, language);
  };

  return (
    <div className="invoices-page">
      <header className="invoices-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{t('nav.invoices')}</h1>
          </div>
          <RealtimeIndicator isConnected={isConnected} />
        </div>
      </header>

      <main className="invoices-main">
        <InvoiceStats 
          totalInvoices={invoices.length}
          pendingAmount={pendingAmount}
          overdueCount={overdueCount}
        />

        <RecurringInvoiceManager
          customers={customers}
          invoices={invoices}
          onGenerate={handleGenerateInvoices}
          onUpdateCustomer={handleUpdateCustomer}
        />

        <div className="invoices-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder={t('invoices.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <InvoiceFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            customers={customers}
          />

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ExportButton
              onExportCSV={handleExportCSV}
              disabled={filteredInvoices.length === 0}
            />
            <button onClick={handleNewInvoice} className="new-invoice-button">
              + {t('invoices.newInvoice')}
            </button>
          </div>
        </div>

        <div className="invoices-grid">
          {loading ? (
            <div className="loading">
              <p>{t('common.loading') || 'Carregando...'}</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <>
              {paginatedData.map(invoice => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onClick={() => handleInvoiceClick(invoice.id)}
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
            <div className="no-invoices">
              <p>{t('invoices.notFound')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

