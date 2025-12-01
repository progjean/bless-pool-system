import React, { useState } from 'react';
import { InventoryProduct, InventoryTransaction } from '../../types/inventory';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types/user';
import './InventoryTransactionModal.css';

interface InventoryTransactionModalProps {
  product?: InventoryProduct | null;
  products: InventoryProduct[];
  onClose: () => void;
  onSave: (transaction: InventoryTransaction) => void;
}

const MOCK_TECHNICIANS = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira'];

export const InventoryTransactionModal: React.FC<InventoryTransactionModalProps> = ({
  product,
  products,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    productId: product?.productId || '',
    type: 'entry' as InventoryTransaction['type'],
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    technicianId: '',
    technicianName: '',
    notes: '',
  });

  const selectedProduct = products.find(p => p.productId === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || formData.quantity <= 0) {
      alert(t('inventory.transaction.fillRequired'));
      return;
    }

    if (formData.type === 'consumption' && !formData.technicianName) {
      alert(t('inventory.transaction.selectTechnician'));
      return;
    }

    const transaction: InventoryTransaction = {
      id: `trans_${Date.now()}`,
      productId: formData.productId,
      productName: selectedProduct?.productName || '',
      type: formData.type,
      quantity: formData.quantity,
      date: formData.date,
      technicianId: formData.technicianId || undefined,
      technicianName: formData.technicianName || undefined,
      notes: formData.notes || undefined,
      createdBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };

    onSave(transaction);
  };

  return (
    <div className="transaction-modal-overlay" onClick={onClose}>
      <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('inventory.transaction.new')}</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label>{t('inventory.transaction.product')} *</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
              required
              disabled={!!product}
            >
              <option value="">{t('common.select')}</option>
              {products.map(p => (
                <option key={p.productId} value={p.productId}>
                  {p.productName} ({p.currentStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('inventory.transaction.type')} *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              required
            >
              <option value="entry">📥 {t('inventory.transaction.type.entry')}</option>
              <option value="exit">📤 {t('inventory.transaction.type.exit')}</option>
              <option value="consumption">🔧 {t('inventory.transaction.type.consumption')}</option>
              <option value="adjustment">⚙️ {t('inventory.transaction.type.adjustment')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('inventory.transaction.quantity')} *</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
              required
            />
            {selectedProduct && (
              <span className="unit-hint">{t('inventory.transaction.unit')}: {selectedProduct.unit}</span>
            )}
          </div>

          <div className="form-group">
            <label>{t('inventory.transaction.date')} *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {formData.type === 'consumption' && (
            <div className="form-group">
              <label>{t('inventory.transaction.technician')} *</label>
              <select
                value={formData.technicianName}
                onChange={(e) => setFormData(prev => ({ ...prev, technicianName: e.target.value }))}
                required
              >
                <option value="">{t('common.select')}</option>
                {MOCK_TECHNICIANS.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group full-width">
            <label>{t('inventory.transaction.notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder={t('inventory.transaction.notesPlaceholder')}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              {t('common.cancel')}
            </button>
            <button type="submit" className="save-button">
              {t('inventory.transaction.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

