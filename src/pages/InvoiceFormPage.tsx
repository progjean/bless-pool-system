import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Invoice } from '../types/invoice';
import { customersService } from '../services/customersService';
import { invoicesService } from '../services/invoicesService';
import { generateNextInvoiceNumber } from '../data/invoiceData';
import { InvoiceForm } from '../components/invoices/InvoiceForm';
import { showToast } from '../utils/toast';
import { Customer } from '../types/customer';
import './InvoiceFormPage.css';

export const InvoiceFormPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const isEditing = invoiceId !== 'new';

  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: generateNextInvoiceNumber(),
    customerId: '',
    customerName: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    subtotal: 0,
    total: 0,
    items: [],
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

        // Se estiver editando, carregar invoice
        if (isEditing && invoiceId) {
          const invoiceData = await invoicesService.get(invoiceId);
          if (invoiceData) {
            setInvoice(invoiceData);
          } else {
            showToast.error(t('invoice.notFound') || 'Invoice não encontrada');
            navigate('/admin/invoices');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast.error(t('invoice.loadError') || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [invoiceId, isEditing, navigate, t]);

  const handleSave = async (invoiceData: Invoice) => {
    try {
      if (isEditing && invoiceId) {
        await invoicesService.update(invoiceId, invoiceData);
        showToast.success(t('invoice.updated') || 'Invoice atualizada com sucesso!');
      } else {
        await invoicesService.create(invoiceData);
        showToast.success(t('invoice.created') || 'Invoice criada com sucesso!');
      }
      
      // Se for recorrente e auto-generate estiver ativado, configurar próxima geração
      if (invoiceData.isRecurring && invoiceData.recurringConfig?.autoGenerate) {
        console.log('Invoice recorrente configurado:', invoiceData.recurringConfig);
        // TODO: Implementar lógica de geração automática
      }
      
      navigate('/admin/invoices');
    } catch (error) {
      console.error('Erro ao salvar invoice:', error);
      showToast.error(t('invoice.saveError') || 'Erro ao salvar invoice');
    }
  };

  const handleCancel = () => {
    navigate('/admin/invoices');
  };

  return (
    <div className="invoice-form-page">
      <header className="form-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/invoices')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{isEditing ? (language === 'pt-BR' ? 'Editar Invoice' : 'Edit Invoice') : t('invoices.newInvoice')}</h1>
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
          <InvoiceForm
            invoice={invoice}
            customers={customers}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
};

