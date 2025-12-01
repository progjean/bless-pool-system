import React, { useState } from 'react';
import { Product } from '../../types/settings';
import { useLanguage } from '../../context/LanguageContext';
import './SettingsForm.css';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const PRODUCT_CATEGORIES = [
  'Químicos',
  'Equipamentos',
  'Acessórios',
  'Filtros',
  'Bombas',
  'Outros',
];

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    unit: product?.unit || 'kg',
    stock: product?.stock || 0,
    minStock: product?.minStock || undefined,
    category: product?.category || 'Químicos',
    internalPrice: product?.internalPrice || 0,
    supplier: product?.supplier || '',
    barcode: product?.barcode || '',
    active: product?.active !== undefined ? product.active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.internalPrice < 0) {
      alert(t('settings.fillRequired'));
      return;
    }

    const productData: Product = {
      id: product?.id || `product_${Date.now()}`,
      name: formData.name,
      unit: formData.unit,
      stock: formData.stock,
      minStock: formData.minStock || undefined,
      category: formData.category,
      internalPrice: formData.internalPrice,
      supplier: formData.supplier || undefined,
      barcode: formData.barcode || undefined,
      active: formData.active,
    };

    onSave(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      <div className="form-grid">
        <div className="form-group">
          <label>{language === 'pt-BR' ? 'Nome' : 'Name'} *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Ex: Cloro Granulado"
          />
        </div>

        <div className="form-group">
          <label>{language === 'pt-BR' ? 'Unidade' : 'Unit'} *</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            required
            placeholder={language === 'pt-BR' ? 'Ex: kg, litros, unidades' : 'Ex: kg, liters, units'}
          />
        </div>

        <div className="form-group">
          <label>{language === 'pt-BR' ? 'Estoque Atual' : 'Current Stock'}</label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="form-group">
          <label>{t('settings.products.minStock')} ({language === 'pt-BR' ? 'opcional' : 'optional'})</label>
          <input
            type="number"
            min="0"
            value={formData.minStock || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value ? parseInt(e.target.value) : undefined }))}
            placeholder={language === 'pt-BR' ? 'Alerta quando abaixo' : 'Alert when below'}
          />
        </div>

        <div className="form-group">
          <label>{t('settings.products.category')} *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          >
            {PRODUCT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>{t('settings.products.internalPrice')} *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.internalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, internalPrice: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('settings.products.supplier')} ({language === 'pt-BR' ? 'opcional' : 'optional'})</label>
          <input
            type="text"
            value={formData.supplier}
            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
            placeholder={language === 'pt-BR' ? 'Nome do fornecedor' : 'Supplier name'}
          />
        </div>

        <div className="form-group">
          <label>{language === 'pt-BR' ? 'Código de Barras (opcional)' : 'Barcode (optional)'}</label>
          <input
            type="text"
            value={formData.barcode}
            onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
            placeholder={language === 'pt-BR' ? 'Código de barras' : 'Barcode'}
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            <span>{language === 'pt-BR' ? 'Produto Ativo' : 'Active Product'}</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          {t('common.cancel')}
        </button>
        <button type="submit" className="save-button">
          {t('common.save')}
        </button>
      </div>
    </form>
  );
};

