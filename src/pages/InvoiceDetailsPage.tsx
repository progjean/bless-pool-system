import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Invoice, Payment } from '../types/invoice';
import { invoicesService } from '../services/invoicesService';
import { customersService } from '../services/customersService';
import { paymentsService } from '../services/paymentsService';
import { DEFAULT_LATE_FEE, applyLateFeeToInvoice } from '../data/invoiceData';
import { InvoiceSettings, DEFAULT_INVOICE_SETTINGS } from '../types/invoiceSettings';
import { InvoiceDetails } from '../components/invoices/InvoiceDetails';
import { PaymentForm } from '../components/invoices/PaymentForm';
import { InvoicePreview } from '../components/invoices/InvoicePreview';
import { sendInvoiceEmail } from '../utils/emailService';
import { showToast } from '../utils/toast';
import { Customer } from '../types/customer';
import './InvoiceDetailsPage.css';

export const InvoiceDetailsPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();

  const [invoice, setInvoice] = useState<Invoice | undefined>(undefined);
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const invoiceSettings: InvoiceSettings = (() => {
    const saved = localStorage.getItem('invoiceSettings');
    return saved ? JSON.parse(saved) : DEFAULT_INVOICE_SETTINGS;
  })();

  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) return;

      try {
        setLoading(true);
        const invoiceData = await invoicesService.get(invoiceId);
        
        if (!invoiceData) {
          showToast.error(t('invoice.notFound') || 'Invoice não encontrada');
          navigate('/admin/invoices');
          return;
        }

        setInvoice(invoiceData);

        // Carregar cliente
        if (invoiceData.customerId) {
          try {
            const customerData = await customersService.get(invoiceData.customerId);
            setCustomer(customerData || undefined);
          } catch (error) {
            console.warn('Erro ao carregar cliente:', error);
          }
        }

        // Carregar pagamentos
        const paymentsData = await paymentsService.listByInvoice(invoiceData.id);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Erro ao carregar invoice:', error);
        showToast.error(t('invoice.loadError') || 'Erro ao carregar invoice');
        navigate('/admin/invoices');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, navigate, t]);

  if (loading) {
    return (
      <div className="invoice-details-page">
        <div className="loading">
          <p>{t('common.loading') || 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-details-page">
        <div className="not-found">
          <p>{language === 'pt-BR' ? 'Invoice não encontrada' : 'Invoice not found'}</p>
          <button onClick={() => navigate('/admin/invoices')}>{t('common.back')}</button>
        </div>
      </div>
    );
  }

  // Aplicar Late Fee se necessário
  const currentInvoice = invoice.status === 'sent' || invoice.status === 'overdue'
    ? applyLateFeeToInvoice(invoice, DEFAULT_LATE_FEE)
    : invoice;

  const handleSendEmail = async () => {
    try {
      await sendInvoiceEmail(currentInvoice);
      
      // Atualizar invoice no backend
      const updatedInvoice = {
        ...currentInvoice,
        emailSent: true,
        emailSentDate: new Date().toISOString(),
      };
      
      await invoicesService.update(currentInvoice.id, updatedInvoice);
      setInvoice(updatedInvoice);
      
      showToast.success(t('invoice.emailSent') || 'E-mail enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      showToast.error(language === 'pt-BR' ? 'Erro ao enviar e-mail. Tente novamente.' : 'Error sending email. Please try again.');
    }
  };

  const handlePaymentRecorded = async (payment: Payment) => {
    try {
      // Criar pagamento no backend
      const newPayment = await paymentsService.create(payment);
      
      // Atualizar lista de pagamentos
      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      
      // Atualizar status da invoice se totalmente paga
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= currentInvoice.total) {
        const updatedInvoice = {
          ...currentInvoice,
          status: 'paid' as const,
          paidDate: payment.paymentDate,
        };
        
        await invoicesService.update(currentInvoice.id, updatedInvoice);
        setInvoice(updatedInvoice);
        showToast.success(t('invoice.paid') || 'Pagamento registrado e invoice marcada como paga!');
      } else {
        showToast.success(t('invoice.paymentRecorded') || 'Pagamento registrado!');
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      showToast.error(t('invoice.paymentError') || 'Erro ao registrar pagamento');
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = currentInvoice.total - totalPaid;

  return (
    <div className="invoice-details-page">
      <header className="details-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/invoices')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{currentInvoice.invoiceNumber}</h1>
            <p className="customer-name">{currentInvoice.customerName}</p>
          </div>
          <div className="header-actions">
            {/* Botão de Preview sempre visível */}
            <button onClick={() => setShowPreview(true)} className="preview-button">
              👁️ {language === 'pt-BR' ? 'Pré-visualizar' : 'Preview'}
            </button>
            
            {/* Outros botões baseados no status */}
            {currentInvoice.status !== 'paid' && currentInvoice.status !== 'cancelled' && (
              <>
                {!currentInvoice.emailSent && (
                  <button onClick={handleSendEmail} className="send-email-button">
                    📧 {language === 'pt-BR' ? 'Enviar por E-mail' : 'Send by Email'}
                  </button>
                )}
                {remainingAmount > 0 && (
                  <button onClick={() => setShowPaymentForm(true)} className="record-payment-button">
                    💰 {language === 'pt-BR' ? 'Registrar Pagamento' : 'Record Payment'}
                  </button>
                )}
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
        <InvoiceDetails 
          invoice={currentInvoice}
          payments={payments}
          totalPaid={totalPaid}
          remainingAmount={remainingAmount}
        />

        {showPaymentForm && (
          <PaymentForm
            invoice={currentInvoice}
            onPaymentRecorded={handlePaymentRecorded}
            onClose={() => setShowPaymentForm(false)}
          />
        )}

        {showPreview && (
          <InvoicePreview
            invoice={currentInvoice}
            customer={customer}
            settings={invoiceSettings}
            onClose={() => setShowPreview(false)}
            onSend={handleSendEmail}
          />
        )}
      </main>
    </div>
  );
};

