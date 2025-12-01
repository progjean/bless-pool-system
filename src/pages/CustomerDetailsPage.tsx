import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Customer } from '../types/customer';
import { Invoice } from '../types/invoice';
import { customersService } from '../services/customersService';
import { invoicesService } from '../services/invoicesService';
import { CustomerHistory } from '../components/customers/CustomerHistory';
import { CustomerInfo } from '../components/customers/CustomerInfo';
import { CustomerRecurringInvoices } from '../components/customers/CustomerRecurringInvoices';
import { showToast } from '../utils/toast';
import './CustomerDetailsPage.css';

export const CustomerDetailsPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!customerId) {
        navigate('/admin/customers');
        return;
      }

      try {
        setLoading(true);
        const [customerData, invoicesData] = await Promise.all([
          customersService.get(customerId),
          invoicesService.list(),
        ]);

        if (!customerData) {
          showToast.error(t('customers.notFound') || 'Cliente não encontrado');
          navigate('/admin/customers');
          return;
        }

        setCustomerDetails(customerData);
        
        // Filtrar invoices do cliente
        const customerInvoices = invoicesData.filter(inv => inv.customerId === customerId);
        setInvoices(customerInvoices);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast.error(t('customers.loadError') || 'Erro ao carregar dados do cliente');
        navigate('/admin/customers');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [customerId, navigate, t]);

  if (loading) {
    return (
      <div className="customer-details-page">
        <div className="loading">
          <p>{t('common.loading') || 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  if (!customerDetails) {
    return (
      <div className="customer-details-page">
        <div className="not-found">
          <p>{language === 'pt-BR' ? 'Cliente não encontrado' : 'Customer not found'}</p>
          <button onClick={() => navigate('/admin/customers')}>{t('common.back')}</button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/admin/customers/${customerId}/edit`);
  };

  const handleUpdateCustomer = async (updates: Partial<Customer>) => {
    if (!customerDetails) return;

    try {
      const updated = { ...customerDetails, ...updates } as Customer;
      await customersService.update(customerDetails.id, updated);
      setCustomerDetails(updated);
      showToast.success(t('customers.updated') || 'Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      showToast.error(t('customers.updateError') || 'Erro ao atualizar cliente');
    }
  };

  const handleGenerateInvoices = async (newInvoices: Invoice[]) => {
    try {
      // Salvar invoices geradas
      const savedInvoices = await Promise.all(
        newInvoices.map(inv => invoicesService.create(inv))
      );
      
      // Atualizar lista de invoices
      const updatedInvoices = [...invoices, ...savedInvoices];
      setInvoices(updatedInvoices);
      
      showToast.success(t('invoices.generated') || `${savedInvoices.length} invoices geradas com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar invoices:', error);
      showToast.error(t('invoices.generateError') || 'Erro ao gerar invoices');
    }
  };

  return (
    <div className="customer-details-page">
      <header className="details-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/customers')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{customerDetails.name || `${customerDetails.firstName} ${customerDetails.lastName}`.trim()}</h1>
            <p className="customer-address">
              {customerDetails.address ? 
                [customerDetails.address, customerDetails.city, customerDetails.state, customerDetails.zipCode].filter(Boolean).join(', ') : 
                customerDetails.address || ''}
            </p>
          </div>
          <div className="header-actions">
            <button onClick={handleEdit} className="edit-button">
              ✏️ {t('common.edit')}
            </button>
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
        <div className="details-layout">
          <div className="details-sidebar">
            <CustomerInfo customer={customerDetails} />
          </div>

          <div className="details-content">
            <CustomerRecurringInvoices
              customer={customerDetails}
              invoices={invoices}
              onUpdateCustomer={handleUpdateCustomer}
              onGenerateInvoices={handleGenerateInvoices}
            />
            <CustomerHistory customerDetails={customerDetails} />
          </div>
        </div>
      </main>
    </div>
  );
};

