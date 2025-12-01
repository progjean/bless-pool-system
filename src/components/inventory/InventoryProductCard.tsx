import React from 'react';
import { InventoryProduct } from '../../types/inventory';
import { useLanguage } from '../../context/LanguageContext';
import './InventoryProductCard.css';

interface InventoryProductCardProps {
  product: InventoryProduct;
  onTransaction: () => void;
}

export const InventoryProductCard: React.FC<InventoryProductCardProps> = ({
  product,
  onTransaction,
}) => {
  const { t, language } = useLanguage();
  const isLowStock = product.currentStock < product.minStock;
  const stockPercentage = (product.currentStock / (product.minStock * 2)) * 100;

  return (
    <div className={`inventory-product-card ${isLowStock ? 'low-stock' : ''}`}>
      <div className="card-header">
        <h3>{product.productName}</h3>
        {isLowStock && (
          <span className="low-stock-badge">⚠️ {language === 'pt-BR' ? 'Estoque Baixo' : 'Low Stock'}</span>
        )}
      </div>

      <div className="card-body">
        <div className="stock-info">
          <div className="stock-value">
            <span className="stock-label">{language === 'pt-BR' ? 'Estoque Atual:' : 'Current Stock:'}</span>
            <span className={`stock-amount ${isLowStock ? 'low' : ''}`}>
              {product.currentStock} {product.unit}
            </span>
          </div>
          <div className="stock-bar">
            <div
              className="stock-bar-fill"
              style={{
                width: `${Math.min(stockPercentage, 100)}%`,
                backgroundColor: isLowStock ? 'var(--error-color)' : 'var(--success-color)',
              }}
            />
          </div>
          <div className="stock-min">
            <span>{language === 'pt-BR' ? 'Mínimo' : 'Minimum'}: {product.minStock} {product.unit}</span>
          </div>
        </div>

        <div className="product-details">
          <div className="detail-item">
            <span className="detail-label">{language === 'pt-BR' ? 'Categoria:' : 'Category:'}</span>
            <span className="detail-value">{product.category}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{language === 'pt-BR' ? 'Entradas:' : 'Entries:'}</span>
            <span className="detail-value">{product.totalEntries}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{language === 'pt-BR' ? 'Saídas:' : 'Exits:'}</span>
            <span className="detail-value">{product.totalExits}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button onClick={onTransaction} className="transaction-button">
          📝 {language === 'pt-BR' ? 'Registrar Movimentação' : 'Register Movement'}
        </button>
      </div>
    </div>
  );
};

