import React, { useState } from 'react';
import { Product } from '../../types/settings';
import { DEFAULT_PRODUCTS } from '../../data/settingsData';
import { SettingsList } from './SettingsList';
import { ProductForm } from './ProductForm';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './SettingsSection.css';

export const ProductsSettings: React.FC = () => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (product: Product) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } else {
      setProducts(prev => [...prev, product]);
    }
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('settings.products.deleteConfirm'))) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  const getStockStatus = (product: Product) => {
    if (product.minStock && product.stock < product.minStock) {
      return 'low';
    }
    return 'ok';
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <div>
          <h2>{t('settings.products.title')}</h2>
          <p>{t('settings.products.desc')}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="add-button">
          + {t('settings.products.newProduct')}
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <SettingsList
        items={products}
        renderItem={(product) => {
          const stockStatus = getStockStatus(product);
          return (
            <div className={`product-item ${!product.active ? 'inactive' : ''}`}>
              <div className="item-header">
                <h4>{product.name}</h4>
                <div className="product-badges">
                  <span className={`stock-badge ${stockStatus}`}>
                    {product.stock} {product.unit}
                    {stockStatus === 'low' && ' ⚠️'}
                  </span>
                  {!product.active && <span className="inactive-badge">{t('settings.products.inactive')}</span>}
                </div>
              </div>
              <div className="item-details">
                <div className="detail-row">
                  <span>{t('settings.products.category')}:</span>
                  <span>{product.category}</span>
                </div>
                <div className="detail-row">
                  <span>{t('settings.products.internalPrice')}:</span>
                  <span>{formatCurrency(product.internalPrice, language)}</span>
                </div>
                {product.minStock && (
                  <div className="detail-row">
                    <span>{t('settings.products.minStock')}:</span>
                    <span>{product.minStock} {product.unit}</span>
                  </div>
                )}
                {product.supplier && (
                  <div className="detail-row">
                    <span>{t('settings.products.supplier')}:</span>
                    <span>{product.supplier}</span>
                  </div>
                )}
              </div>
            </div>
          );
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('settings.products.noProducts')}
      />
    </div>
  );
};

