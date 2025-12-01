import React from 'react';
import { Invoice } from '../../types/invoice';
import { Customer } from '../../types/customer';
import { InvoiceSettings } from '../../types/invoiceSettings';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './InvoicePreview.css';

interface InvoicePreviewProps {
  invoice: Invoice;
  customer?: Customer;
  settings?: InvoiceSettings;
  onClose: () => void;
  onSend?: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  customer,
  settings,
  onClose,
  onSend,
}) => {
  const { t, language } = useLanguage();

  const calculateTaxes = (): number => {
    if (!settings?.taxesEnabled || !settings.taxes || settings.taxes.length === 0) {
      return 0;
    }

    let totalTaxes = 0;
    settings.taxes.forEach(tax => {
      if (tax.applyTo === 'subtotal') {
        if (tax.type === 'percentage') {
          totalTaxes += (invoice.subtotal * tax.value) / 100;
        } else {
          totalTaxes += tax.value;
        }
      } else {
        // Aplicar sobre total (subtotal + outras taxas)
        const baseAmount = invoice.subtotal + totalTaxes;
        if (tax.type === 'percentage') {
          totalTaxes += (baseAmount * tax.value) / 100;
        } else {
          totalTaxes += tax.value;
        }
      }
    });

    return Math.round(totalTaxes * 100) / 100;
  };

  const taxesAmount = calculateTaxes();
  const finalTotal = invoice.subtotal + (invoice.lateFee || 0) + taxesAmount;

  const customerAddress = customer 
    ? `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`.trim()
    : '';

  const companyInfo = settings || {
    companyName: 'BLESS POOL SYSTEM',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyTaxId: '',
  };

  return (
    <div className="invoice-preview-overlay" onClick={onClose}>
      <div className="invoice-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h2>{language === 'pt-BR' ? 'Pré-visualização da Invoice' : 'Invoice Preview'}</h2>
          <div className="preview-actions">
            {onSend && (
              <button onClick={onSend} className="send-button">
                📧 {language === 'pt-BR' ? 'Enviar ao Cliente' : 'Send to Customer'}
              </button>
            )}
            <button onClick={onClose} className="close-button">
              {language === 'pt-BR' ? 'Fechar' : 'Close'}
            </button>
          </div>
        </div>

        <div className="invoice-preview-content">
          {/* Invoice PDF Preview */}
          <div className="invoice-pdf-preview">
            <div className="invoice-header">
              <div className="company-info">
                <h1>{companyInfo.companyName}</h1>
                {companyInfo.companyAddress && (
                  <p>{companyInfo.companyAddress}</p>
                )}
                {companyInfo.companyPhone && (
                  <p>{language === 'pt-BR' ? 'Telefone' : 'Phone'}: {companyInfo.companyPhone}</p>
                )}
                {companyInfo.companyEmail && (
                  <p>{language === 'pt-BR' ? 'E-mail' : 'Email'}: {companyInfo.companyEmail}</p>
                )}
                {companyInfo.companyTaxId && (
                  <p>{language === 'pt-BR' ? 'CNPJ/CPF' : 'Tax ID'}: {companyInfo.companyTaxId}</p>
                )}
              </div>
              <div className="invoice-title">
                <h2>{language === 'pt-BR' ? 'INVOICE' : 'INVOICE'}</h2>
                <p className="invoice-number">{invoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="invoice-body">
              <div className="invoice-info-section">
                <div className="bill-to">
                  <h3>{language === 'pt-BR' ? 'FATURAR PARA' : 'BILL TO'}</h3>
                  <p className="customer-name">{invoice.customerName}</p>
                  {customerAddress && (
                    <p className="customer-address">{customerAddress}</p>
                  )}
                  {customer?.contacts && customer.contacts.length > 0 && (
                    <div className="customer-contacts">
                      {customer.contacts.filter(c => c.type === 'email').map((contact, idx) => (
                        <p key={idx}>{contact.value}</p>
                      ))}
                      {customer.contacts.filter(c => c.type === 'phone').map((contact, idx) => (
                        <p key={idx}>{contact.value}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="invoice-dates">
                  <div className="date-item">
                    <span className="date-label">{language === 'pt-BR' ? 'Data de Emissão' : 'Issue Date'}:</span>
                    <span className="date-value">
                      {new Date(invoice.issueDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                    </span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">{language === 'pt-BR' ? 'Data de Vencimento' : 'Due Date'}:</span>
                    <span className="date-value">
                      {new Date(invoice.dueDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="invoice-items-section">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>{language === 'pt-BR' ? 'Descrição' : 'Description'}</th>
                      <th className="text-right">{language === 'pt-BR' ? 'Quantidade' : 'Quantity'}</th>
                      <th className="text-right">{language === 'pt-BR' ? 'Preço Unit.' : 'Unit Price'}</th>
                      <th className="text-right">{language === 'pt-BR' ? 'Total' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.description}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">
                          {formatCurrency(item.unitPrice, language)}
                        </td>
                        <td className="text-right">
                          {formatCurrency(item.total, language)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-totals-section">
                <div className="totals-table">
                  <div className="total-row">
                    <span className="total-label">{language === 'pt-BR' ? 'Subtotal' : 'Subtotal'}:</span>
                    <span className="total-value">
                      {formatCurrency(invoice.subtotal, language)}
                    </span>
                  </div>

                  {taxesAmount > 0 && settings?.taxes && (
                    <>
                      {settings.taxes.map((tax, idx) => {
                        let taxAmount = 0;
                        if (tax.applyTo === 'subtotal') {
                          taxAmount = tax.type === 'percentage' 
                            ? (invoice.subtotal * tax.value) / 100 
                            : tax.value;
                        } else {
                          const baseAmount = invoice.subtotal + taxesAmount;
                          taxAmount = tax.type === 'percentage' 
                            ? (baseAmount * tax.value) / 100 
                            : tax.value;
                        }
                        return (
                          <div key={idx} className="total-row">
                            <span className="total-label">{tax.name}:</span>
                            <span className="total-value">
                              {formatCurrency(taxAmount, language)}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {invoice.lateFee && invoice.lateFee > 0 && (
                    <div className="total-row late-fee-row">
                      <span className="total-label">
                        {language === 'pt-BR' ? 'Taxa de Atraso' : 'Late Fee'}:
                      </span>
                      <span className="total-value late-fee">
                        {formatCurrency(invoice.lateFee, language)}
                      </span>
                    </div>
                  )}

                  <div className="total-row final-total">
                    <span className="total-label">{language === 'pt-BR' ? 'Total' : 'Total'}:</span>
                    <span className="total-value">
                      {formatCurrency(finalTotal, language)}
                    </span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="invoice-notes-section">
                  <h4>{language === 'pt-BR' ? 'Observações' : 'Notes'}</h4>
                  <p>{invoice.notes}</p>
                </div>
              )}

              {settings?.footerMessage && (
                <div className="invoice-footer-message">
                  <p>{settings.footerMessage}</p>
                </div>
              )}

              {settings?.termsAndConditions && (
                <div className="invoice-terms-section">
                  <h4>{language === 'pt-BR' ? 'Termos e Condições' : 'Terms and Conditions'}</h4>
                  <p>{settings.termsAndConditions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

