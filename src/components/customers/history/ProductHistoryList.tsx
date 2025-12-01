import React from 'react';
import { ProductHistory } from '../../../types/customer';
import './HistoryList.css';

interface ProductHistoryListProps {
  products: ProductHistory[];
}

export const ProductHistoryList: React.FC<ProductHistoryListProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="empty-history">
        <p>Nenhum produto registrado</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {products.map(product => (
        <div key={product.id} className="history-item">
          <div className="history-item-header">
            <div>
              <h4>{product.productName}</h4>
              <p className="history-subtitle">
                Aplicado em {new Date(product.appliedDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="history-item-details">
            <div className="detail-item">
              <span className="detail-label">Quantidade:</span>
              <span className="detail-value">
                {product.quantity} {product.unit}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Serviço:</span>
              <span className="detail-value">{product.serviceId}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

