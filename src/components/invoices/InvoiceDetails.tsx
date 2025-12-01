import React from 'react';
import { Invoice, Payment } from '../../types/invoice';
import './InvoiceDetails.css';

interface InvoiceDetailsProps {
  invoice: Invoice;
  payments: Payment[];
  totalPaid: number;
  remainingAmount: number;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoice,
  payments,
  totalPaid,
  remainingAmount,
}) => {
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <span className="status-badge paid">✓ Pago</span>;
      case 'sent':
        return <span className="status-badge sent">📧 Enviado</span>;
      case 'overdue':
        return <span className="status-badge overdue">⚠️ Atrasado</span>;
      case 'draft':
        return <span className="status-badge draft">📝 Rascunho</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">✕ Cancelado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="invoice-details">
      <div className="details-grid">
        {/* Informações Principais */}
        <div className="details-card">
          <h3>Informações da Invoice</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value">{getStatusBadge(invoice.status)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Cliente:</span>
              <span className="info-value">{invoice.customerName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Data de Emissão:</span>
              <span className="info-value">
                {new Date(invoice.issueDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Data de Vencimento:</span>
              <span className="info-value">
                {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {invoice.paidDate && (
              <div className="info-item">
                <span className="info-label">Data de Pagamento:</span>
                <span className="info-value">
                  {new Date(invoice.paidDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {invoice.emailSent && invoice.emailSentDate && (
              <div className="info-item">
                <span className="info-label">E-mail Enviado:</span>
                <span className="info-value">
                  {new Date(invoice.emailSentDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {invoice.isRecurring && (
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-value recurring">🔄 Recorrente</span>
              </div>
            )}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="details-card">
          <h3>Resumo Financeiro</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Subtotal:</span>
              <span className="info-value">
                R$ {invoice.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {invoice.lateFee && invoice.lateFee > 0 && (
              <div className="info-item late-fee-item">
                <span className="info-label">Taxa de Atraso:</span>
                <span className="info-value late-fee">
                  R$ {invoice.lateFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {invoice.lateFeeAppliedDate && (
                  <span className="late-fee-date">
                    Aplicada em {new Date(invoice.lateFeeAppliedDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            )}
            <div className="info-item total-item">
              <span className="info-label">Total:</span>
              <span className="info-value total">
                R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {payments.length > 0 && (
              <>
                <div className="info-item">
                  <span className="info-label">Total Pago:</span>
                  <span className="info-value paid">
                    R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {remainingAmount > 0 && (
                  <div className="info-item remaining-item">
                    <span className="info-label">Restante:</span>
                    <span className="info-value remaining">
                      R$ {remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="details-card">
        <h3>Itens da Invoice</h3>
        <div className="items-table">
          <div className="items-header">
            <div className="item-col description">Descrição</div>
            <div className="item-col quantity">Quantidade</div>
            <div className="item-col price">Preço Unit.</div>
            <div className="item-col total">Total</div>
          </div>
          {invoice.items.map(item => (
            <div key={item.id} className="item-row">
              <div className="item-col description">{item.description}</div>
              <div className="item-col quantity">{item.quantity}</div>
              <div className="item-col price">
                R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="item-col total">
                R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagamentos */}
      {payments.length > 0 && (
        <div className="details-card">
          <h3>Histórico de Pagamentos</h3>
          <div className="payments-list">
            {payments.map(payment => (
              <div key={payment.id} className="payment-item">
                <div className="payment-header">
                  <span className="payment-amount">
                    R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="payment-date">
                    {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="payment-details">
                  <span className="payment-method">{payment.paymentMethod}</span>
                  {payment.reference && (
                    <span className="payment-reference">Ref: {payment.reference}</span>
                  )}
                  {payment.notes && (
                    <span className="payment-notes">{payment.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observações */}
      {invoice.notes && (
        <div className="details-card">
          <h3>Observações</h3>
          <p className="notes-text">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};

