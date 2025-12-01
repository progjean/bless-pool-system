import React, { useState } from 'react';
import { Customer } from '../../types/customer';
import { Invoice } from '../../types/invoice';
import { useLanguage } from '../../context/LanguageContext';
import { generateRecurringInvoices, calculateNextGenerationDate, getFormattedMonth } from '../../utils/invoiceGenerator';
import { RecurringInvoiceEditModal } from './RecurringInvoiceEditModal';
import { formatCurrency } from '../../utils/formatUtils';
import './RecurringInvoiceManager.css';

interface RecurringInvoiceManagerProps {
  customers: Customer[];
  invoices: Invoice[];
  onGenerate: (newInvoices: Invoice[]) => void;
  onUpdateCustomer?: (customerId: string, updates: Partial<Customer>) => void;
}

export const RecurringInvoiceManager: React.FC<RecurringInvoiceManagerProps> = ({
  customers,
  invoices,
  onGenerate,
  onUpdateCustomer,
}) => {
  const { t, language } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Filtrar clientes elegíveis para geração automática
  const eligibleCustomers = customers.filter(customer => 
    customer.status === 'active' &&
    customer.frequency &&
    customer.chargePerMonth > 0 &&
    (customer.autoGenerateInvoices !== false) // Default true se não especificado
  );

  const handleGenerateNow = () => {
    setIsGenerating(true);
    try {
      const newInvoices = generateRecurringInvoices(eligibleCustomers, invoices);
      if (newInvoices.length > 0) {
        onGenerate(newInvoices);
        alert(`${newInvoices.length} ${t('invoice.generatedCount').replace('{count}', String(newInvoices.length))}`);
      } else {
        alert(t('invoice.noCustomersToGenerate'));
      }
    } catch (error) {
      console.error('Error generating invoices:', error);
      alert(language === 'pt-BR' ? 'Erro ao gerar invoices' : 'Error generating invoices');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleAutoGenerate = (customer: Customer) => {
    if (onUpdateCustomer) {
      onUpdateCustomer(customer.id, {
        autoGenerateInvoices: !customer.autoGenerateInvoices,
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleSaveEdit = (updates: Partial<Customer>) => {
    if (editingCustomer && onUpdateCustomer) {
      onUpdateCustomer(editingCustomer.id, updates);
      setEditingCustomer(null);
    }
  };

  const getCustomerInvoices = (customerId: string): Invoice[] => {
    return invoices.filter(inv => inv.customerId === customerId && inv.isRecurring);
  };

  const getLastGeneratedDate = (customer: Customer): string | null => {
    const customerInvoices = getCustomerInvoices(customer.id);
    if (customerInvoices.length === 0) return null;
    
    const sorted = customerInvoices.sort((a, b) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
    return sorted[0].issueDate;
  };

  const getNextGenerationDate = (customer: Customer): Date => {
    const lastGenerated = customer.lastInvoiceGeneratedDate || getLastGeneratedDate(customer);
    if (lastGenerated) {
      return calculateNextGenerationDate(customer, new Date(lastGenerated));
    }
    return calculateNextGenerationDate(customer);
  };

  if (eligibleCustomers.length === 0) {
    return (
      <div className="recurring-invoice-manager">
        <div className="empty-state">
          <p>{language === 'pt-BR' ? 'Nenhum cliente configurado para geração automática de invoices' : 'No customers configured for automatic invoice generation'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recurring-invoice-manager">
      <div className="manager-header">
        <h2>{t('invoice.recurringTemplates')}</h2>
        <button 
          onClick={handleGenerateNow} 
          className="generate-button"
          disabled={isGenerating}
        >
          {isGenerating ? (language === 'pt-BR' ? 'Gerando...' : 'Generating...') : t('invoice.generateNow')}
        </button>
      </div>

      <div className="templates-list">
        {eligibleCustomers.map(customer => {
          const customerName = customer.name || `${customer.firstName} ${customer.lastName}`.trim();
          const lastGenerated = getLastGeneratedDate(customer);
          const nextGeneration = getNextGenerationDate(customer);
          const isAutoGenerateEnabled = customer.autoGenerateInvoices !== false;

          return (
            <div key={customer.id} className="template-card">
              <div className="template-header">
                <div className="template-info">
                  <h3>{customerName}</h3>
                  <div className="template-badges">
                    <span className={`badge frequency ${customer.frequency.toLowerCase()}`}>
                      {customer.frequency === 'Weekly' ? (language === 'pt-BR' ? 'Semanal' : 'Weekly') : (language === 'pt-BR' ? 'Quinzenal' : 'Biweekly')}
                    </span>
                    <span className={`badge auto-generate ${isAutoGenerateEnabled ? 'enabled' : 'disabled'}`}>
                      {isAutoGenerateEnabled ? t('invoice.autoGenerateEnabled') : t('invoice.autoGenerateDisabled')}
                    </span>
                  </div>
                </div>
                <div className="template-actions">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="edit-button"
                    title={language === 'pt-BR' ? 'Editar' : 'Edit'}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleToggleAutoGenerate(customer)}
                    className={`toggle-button ${isAutoGenerateEnabled ? 'enabled' : 'disabled'}`}
                    title={isAutoGenerateEnabled ? t('invoice.pauseGeneration') : t('invoice.resumeGeneration')}
                  >
                    {isAutoGenerateEnabled ? '⏸️' : '▶️'}
                  </button>
                </div>
              </div>

              <div className="template-details">
                <div className="detail-row">
                  <span className="detail-label">{t('customerForm.chargePerMonth')}:</span>
                  <span className="detail-value">
                    {formatCurrency(customer.chargePerMonth, language)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">{t('customerForm.serviceDay')}:</span>
                  <span className="detail-value">
                    {customer.serviceDay === 'Monday' ? (language === 'pt-BR' ? 'Segunda' : 'Monday') :
                     customer.serviceDay === 'Tuesday' ? (language === 'pt-BR' ? 'Terça' : 'Tuesday') :
                     customer.serviceDay === 'Wednesday' ? (language === 'pt-BR' ? 'Quarta' : 'Wednesday') :
                     customer.serviceDay === 'Thursday' ? (language === 'pt-BR' ? 'Quinta' : 'Thursday') :
                     customer.serviceDay === 'Friday' ? (language === 'pt-BR' ? 'Sexta' : 'Friday') :
                     customer.serviceDay === 'Saturday' ? (language === 'pt-BR' ? 'Sábado' : 'Saturday') :
                     (language === 'pt-BR' ? 'Domingo' : 'Sunday')}
                  </span>
                </div>

                {lastGenerated && (
                  <div className="detail-row">
                    <span className="detail-label">{t('invoice.lastGenerated')}:</span>
                    <span className="detail-value">
                      {new Date(lastGenerated).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                    </span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">{t('invoice.nextGeneration')}:</span>
                  <span className="detail-value highlight">
                    {nextGeneration.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">{language === 'pt-BR' ? 'Invoices Geradas' : 'Generated Invoices'}:</span>
                  <span className="detail-value">
                    {getCustomerInvoices(customer.id).length}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingCustomer && (
        <RecurringInvoiceEditModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

