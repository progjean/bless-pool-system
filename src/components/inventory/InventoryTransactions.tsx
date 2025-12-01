import React from 'react';
import { InventoryTransaction } from '../../types/inventory';
import { useLanguage } from '../../context/LanguageContext';
import './InventoryTransactions.css';

interface InventoryTransactionsProps {
  transactions: InventoryTransaction[];
}

export const InventoryTransactions: React.FC<InventoryTransactionsProps> = ({ transactions }) => {
  const { t } = useLanguage();
  
  const getTransactionIcon = (type: InventoryTransaction['type']) => {
    switch (type) {
      case 'entry':
        return '📥';
      case 'exit':
        return '📤';
      case 'consumption':
        return '🔧';
      case 'adjustment':
        return '⚙️';
      default:
        return '📋';
    }
  };

  const getTransactionLabel = (type: InventoryTransaction['type']) => {
    switch (type) {
      case 'entry':
        return t('inventory.transaction.type.entry');
      case 'exit':
        return t('inventory.transaction.type.exit');
      case 'consumption':
        return t('inventory.transaction.type.consumption');
      case 'adjustment':
        return t('inventory.transaction.type.adjustment');
      default:
        return t('inventory.transaction');
    }
  };

  const getTransactionColor = (type: InventoryTransaction['type']) => {
    switch (type) {
      case 'entry':
        return 'var(--success-color)';
      case 'exit':
      case 'consumption':
        return 'var(--warning-color)';
      case 'adjustment':
        return '#667eea';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="inventory-transactions">
      {transactions.length > 0 ? (
        <div className="transactions-list">
          {transactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon" style={{ color: getTransactionColor(transaction.type) }}>
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="transaction-content">
                <div className="transaction-header">
                  <span className="transaction-type">{getTransactionLabel(transaction.type)}</span>
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="transaction-details">
                  <span className="product-name">{transaction.productName}</span>
                  <span className={`quantity ${transaction.type === 'entry' ? 'positive' : 'negative'}`}>
                    {transaction.type === 'entry' ? '+' : '-'}{transaction.quantity} {transaction.unit || ''}
                  </span>
                </div>
                {transaction.technicianName && (
                  <div className="transaction-technician">
                    {t('inventory.transaction.technician')}: {transaction.technicianName}
                  </div>
                )}
                {transaction.notes && (
                  <div className="transaction-notes">
                    {transaction.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-transactions">
          <p>{t('inventory.noMovements')}</p>
        </div>
      )}
    </div>
  );
};

