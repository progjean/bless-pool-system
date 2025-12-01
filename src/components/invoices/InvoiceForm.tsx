import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, RecurringConfig } from '../../types/invoice';
import { Customer } from '../../types/customer';
import { useLanguage } from '../../context/LanguageContext';
import { calculateInvoiceAmount, generateInvoiceDescription, getFormattedMonth, getDayOfWeekNumber } from '../../utils/invoiceGenerator';
import { formatCurrency } from '../../utils/formatUtils';
import './InvoiceForm.css';

interface InvoiceFormProps {
  invoice: Partial<Invoice>;
  customers: Customer[];
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, customers, onSave, onCancel }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    invoiceNumber: invoice.invoiceNumber || '',
    customerId: invoice.customerId || '',
    issueDate: invoice.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice.dueDate || '',
    status: invoice.status || 'draft',
    notes: invoice.notes || '',
    isRecurring: invoice.isRecurring || false,
  });

  const [items, setItems] = useState<InvoiceItem[]>(invoice.items || []);
  const [recurringConfig, setRecurringConfig] = useState<Partial<RecurringConfig>>(
    invoice.recurringConfig || {
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      autoGenerate: false,
    }
  );

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const [useCustomerSettings, setUseCustomerSettings] = useState(false);

  useEffect(() => {
    if (selectedCustomer && !formData.dueDate) {
      // Calcular data de vencimento padrão (30 dias ou do cliente)
      const dueDateDays = selectedCustomer.invoiceDueDateDays || 30;
      const issueDate = new Date(formData.issueDate);
      issueDate.setDate(issueDate.getDate() + dueDateDays);
      setFormData(prev => ({
        ...prev,
        dueDate: issueDate.toISOString().split('T')[0],
      }));
    }
  }, [selectedCustomer, formData.issueDate]);

  // Quando cliente é selecionado e useCustomerSettings está ativo
  useEffect(() => {
    if (selectedCustomer && useCustomerSettings && selectedCustomer.frequency && selectedCustomer.chargePerMonth > 0) {
      // Calcular valor da invoice
      const invoiceAmount = calculateInvoiceAmount(selectedCustomer.chargePerMonth, selectedCustomer.frequency);
      
      // Gerar descrição
      const period = getFormattedMonth(new Date(formData.issueDate), language);
      const description = generateInvoiceDescription(selectedCustomer, period);

      // Atualizar items se estiver vazio ou substituir
      if (items.length === 0 || items[0].description === '') {
        setItems([{
          id: `item_${Date.now()}`,
          description,
          quantity: 1,
          unitPrice: invoiceAmount,
          total: invoiceAmount,
        }]);
      } else {
        // Atualizar primeiro item
        setItems(prev => prev.map((item, idx) => 
          idx === 0 ? {
            ...item,
            description,
            unitPrice: invoiceAmount,
            total: invoiceAmount,
          } : item
        ));
      }

      // Configurar como recorrente
      if (!formData.isRecurring) {
        setFormData(prev => ({ ...prev, isRecurring: true }));
      }

      // Configurar recurringConfig
      setRecurringConfig({
        frequency: selectedCustomer.frequency.toLowerCase() as 'weekly' | 'biweekly',
        startDate: selectedCustomer.startOn,
        endDate: selectedCustomer.stopAfter !== 'NO END' ? selectedCustomer.stopAfter : undefined,
        dayOfWeek: getDayOfWeekNumber(selectedCustomer.serviceDay),
        autoGenerate: selectedCustomer.autoGenerateInvoices !== false,
        customerId: selectedCustomer.id,
        chargePerMonth: selectedCustomer.chargePerMonth,
      });
    }
  }, [selectedCustomer, useCustomerSettings, formData.issueDate, language]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setItems(prev => [...prev, {
      id: `item_${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }]);
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    return { subtotal, total: subtotal };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.dueDate || items.length === 0) {
      alert(t('invoiceForm.fillRequired'));
      return;
    }

    const { subtotal, total } = calculateTotals();
    const customer = customers.find(c => c.id === formData.customerId);

    const customerName = customer?.name || (customer ? `${customer.firstName} ${customer.lastName}`.trim() : '');

    const invoiceData: Invoice = {
      id: invoice.id || `inv_${Date.now()}`,
      invoiceNumber: formData.invoiceNumber,
      customerId: formData.customerId,
      customerName,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status: formData.status,
      subtotal,
      total,
      items: items.filter(item => item.description),
      notes: formData.notes,
      isRecurring: formData.isRecurring,
      recurringConfig: formData.isRecurring ? {
        ...recurringConfig as RecurringConfig,
        customerId: useCustomerSettings ? formData.customerId : undefined,
        chargePerMonth: useCustomerSettings && customer ? customer.chargePerMonth : undefined,
      } : undefined,
      autoGenerated: useCustomerSettings && formData.isRecurring ? true : undefined,
      generatedFromCustomerId: useCustomerSettings && formData.isRecurring ? formData.customerId : undefined,
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(invoiceData);
  };

  const { subtotal, total } = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="invoice-form">
      {/* Informações Básicas */}
      <section className="form-section">
        <h2>{t('invoiceForm.basicInfo')}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('invoiceForm.number')} *</label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('invoiceForm.customer')} *</label>
            <select
              value={formData.customerId}
              onChange={(e) => {
                handleInputChange('customerId', e.target.value);
                // Reset useCustomerSettings quando mudar cliente
                setUseCustomerSettings(false);
              }}
              required
            >
              <option value="">{t('common.select')}</option>
              {customers.map(customer => {
                const customerName = customer.name || `${customer.firstName} ${customer.lastName}`.trim();
                return (
                  <option key={customer.id} value={customer.id}>
                    {customerName}
                  </option>
                );
              })}
            </select>
            {selectedCustomer && selectedCustomer.frequency && selectedCustomer.chargePerMonth > 0 && (
              <div className="checkbox-group" style={{ marginTop: '8px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={useCustomerSettings}
                    onChange={(e) => {
                      setUseCustomerSettings(e.target.checked);
                      if (e.target.checked) {
                        // Mostrar mensagem de sucesso
                        setTimeout(() => {
                          alert(t('invoice.customerSettingsApplied'));
                        }, 100);
                      }
                    }}
                  />
                  <span>{t('invoice.useCustomerSettings')}</span>
                </label>
                <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '12px' }}>
                  {language === 'pt-BR' 
                    ? `Usará frequência ${selectedCustomer.frequency === 'Weekly' ? 'semanal' : 'quinzenal'} e valor mensal de R$ ${selectedCustomer.chargePerMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : `Will use ${selectedCustomer.frequency.toLowerCase()} frequency and monthly charge of $${selectedCustomer.chargePerMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </small>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>{t('invoiceForm.issueDate')} *</label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleInputChange('issueDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('invoiceForm.dueDate')} *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('invoiceForm.status')}</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="draft">{t('invoices.status.draft')}</option>
              <option value="sent">{t('invoices.status.sent')}</option>
              <option value="paid">{t('invoices.status.paid')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Itens */}
      <section className="form-section">
        <div className="section-header">
          <h2>{t('invoiceForm.items')}</h2>
          <button type="button" onClick={handleAddItem} className="add-button">
            + {t('invoiceForm.addItem')}
          </button>
        </div>
        <div className="items-table">
          <div className="items-header">
            <div className="item-col description">{t('invoiceForm.description')}</div>
            <div className="item-col quantity">{t('invoiceForm.quantity')}</div>
            <div className="item-col price">{t('invoiceForm.unitPrice')}</div>
            <div className="item-col total">{t('invoiceForm.total')}</div>
            <div className="item-col actions"></div>
          </div>
          {items.map(item => (
            <div key={item.id} className="item-row">
              <input
                type="text"
                placeholder={t('invoiceForm.itemDescriptionPlaceholder')}
                value={item.description}
                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                className="item-input description"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="item-input quantity"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="item-input price"
              />
              <div className="item-total">
                {formatCurrency(item.total, language)}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="remove-button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="items-summary">
          <div className="summary-row">
            <span>{t('invoice.subtotal')}:</span>
            <span>{formatCurrency(subtotal, language)}</span>
          </div>
          <div className="summary-row total">
            <span>{t('stats.total')}:</span>
            <span>{formatCurrency(total, language)}</span>
          </div>
        </div>
      </section>

      {/* Recorrência */}
      <section className="form-section">
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
            />
            <span>{t('invoiceForm.recurring')}</span>
          </label>
        </div>

        {formData.isRecurring && (
          <div className="recurring-config">
            <div className="form-grid">
              <div className="form-group">
                <label>{t('invoiceForm.frequency')}</label>
                <select
                  value={recurringConfig.frequency}
                  onChange={(e) => setRecurringConfig(prev => ({ ...prev, frequency: e.target.value as any }))}
                >
                  <option value="weekly">{language === 'pt-BR' ? 'Semanal' : 'Weekly'}</option>
                  <option value="biweekly">{language === 'pt-BR' ? 'Quinzenal' : 'Biweekly'}</option>
                  <option value="monthly">{language === 'pt-BR' ? 'Mensal' : 'Monthly'}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('invoiceForm.startDate')}</label>
                <input
                  type="date"
                  value={recurringConfig.startDate}
                  onChange={(e) => setRecurringConfig(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>{t('invoiceForm.endDate')}</label>
                <input
                  type="date"
                  value={recurringConfig.endDate || ''}
                  onChange={(e) => setRecurringConfig(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={recurringConfig.autoGenerate || false}
                    onChange={(e) => setRecurringConfig(prev => ({ ...prev, autoGenerate: e.target.checked }))}
                  />
                  <span>{t('invoiceForm.autoGenerate')}</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Observações */}
      <section className="form-section">
        <h2>{t('invoiceForm.observations')}</h2>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="notes-textarea"
          placeholder={t('invoiceForm.observationsPlaceholder')}
          rows={4}
        />
      </section>

      {/* Ações */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          {t('common.cancel')}
        </button>
        <button type="submit" className="save-button">
          {t('invoiceForm.save')}
        </button>
      </div>
    </form>
  );
};

