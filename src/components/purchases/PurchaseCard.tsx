import React from 'react';
import { Purchase } from '../../types/purchase';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './PurchaseCard.css';

interface PurchaseCardProps {
  purchase: Purchase;
  onEdit: () => void;
}

export const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase, onEdit }) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="purchase-card">
      <div className="card-header">
        <div>
          <h3>{purchase.purchaseNumber}</h3>
          <span className="purchase-date">
            {new Date(purchase.purchaseDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
          </span>
        </div>
        <button onClick={onEdit} className="edit-button">
          ✏️
        </button>
      </div>

      <div className="card-body">
        <div className="purchase-info">
          <div className="info-item">
            <span className="info-label">{t('purchases.supplier')}:</span>
            <span className="info-value">{purchase.supplier}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('purchases.totalValue')}:</span>
            <span className="info-value total">
              {formatCurrency(purchase.totalAmount, language)}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">{language === 'pt-BR' ? 'Itens' : 'Items'}:</span>
            <span className="info-value">{purchase.items.length} {language === 'pt-BR' ? 'produto(s)' : 'product(s)'}</span>
          </div>
        </div>

        <div className="items-list">
          <h4>{language === 'pt-BR' ? 'Itens' : 'Items'}:</h4>
          {purchase.items.map(item => (
            <div key={item.id} className="item-row">
              <span className="item-name">{item.productName}</span>
              <span className="item-quantity">{item.quantity} {item.unit}</span>
              <span className="item-price">
                {formatCurrency(item.totalPrice, language)}
              </span>
            </div>
          ))}
        </div>

        {purchase.receipt && (
          <div className="receipt-section">
            <span className="receipt-label">📎 {language === 'pt-BR' ? 'Comprovante anexado' : 'Receipt attached'}</span>
          </div>
        )}

        {purchase.notes && (
          <div className="notes-section">
            <span className="notes-label">{t('purchases.notes')}:</span>
            <span className="notes-text">{purchase.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

