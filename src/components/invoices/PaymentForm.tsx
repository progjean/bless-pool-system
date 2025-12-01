import React, { useState } from 'react';
import { Invoice, Payment } from '../../types/invoice';
import { useAuth } from '../../context/AuthContext';
import './PaymentForm.css';

interface PaymentFormProps {
  invoice: Invoice;
  onPaymentRecorded: (payment: Payment) => void;
  onClose: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ invoice, onPaymentRecorded, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: invoice.total,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer' as Payment['paymentMethod'],
    reference: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      alert('O valor do pagamento deve ser maior que zero');
      return;
    }

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      amount: formData.amount,
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      reference: formData.reference || undefined,
      notes: formData.notes || undefined,
      recordedBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };

    onPaymentRecorded(payment);
    onClose();
  };

  return (
    <div className="payment-form-overlay" onClick={onClose}>
      <div className="payment-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="payment-form-header">
          <h2>Registrar Pagamento</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Invoice:</label>
            <div className="invoice-info">
              <strong>{invoice.invoiceNumber}</strong>
              <span>{invoice.customerName}</span>
              <span>Total: R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Valor do Pagamento *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={invoice.total}
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Data do Pagamento *</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Método de Pagamento *</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
              required
            >
              <option value="cash">Dinheiro</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit_card">Cartão de Débito</option>
              <option value="bank_transfer">Transferência Bancária</option>
              <option value="pix">PIX</option>
              <option value="check">Cheque</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Referência (opcional)</label>
            <input
              type="text"
              placeholder="Número do cheque, comprovante, etc."
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Observações (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              Registrar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

