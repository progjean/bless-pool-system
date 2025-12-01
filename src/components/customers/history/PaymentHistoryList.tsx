import React from 'react';
import { PaymentHistory } from '../../../types/customer';
import './HistoryList.css';

interface PaymentHistoryListProps {
  payments: PaymentHistory[];
}

export const PaymentHistoryList: React.FC<PaymentHistoryListProps> = ({ payments }) => {
  if (payments.length === 0) {
    return (
      <div className="empty-history">
        <p>Nenhum pagamento registrado</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {payments.map(payment => (
        <div key={payment.id} className="history-item">
          <div className="history-item-header">
            <div>
              <h4>{payment.invoiceNumber}</h4>
              {payment.description && <p className="history-subtitle">{payment.description}</p>}
            </div>
            <span className={`status-badge ${payment.status}`}>
              {payment.status === 'paid' ? '✓ Pago' :
               payment.status === 'overdue' ? '⚠️ Atrasado' : '⏳ Pendente'}
            </span>
          </div>
          <div className="history-item-details">
            <div className="detail-item">
              <span className="detail-label">Valor:</span>
              <span className="detail-value">
                R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Vencimento:</span>
              <span className="detail-value">
                {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {payment.paidDate && (
              <div className="detail-item">
                <span className="detail-label">Pago em:</span>
                <span className="detail-value">
                  {new Date(payment.paidDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

