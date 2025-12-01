import React, { useState } from 'react';
import { ChecklistItem } from '../../types/settings';
import { useLanguage } from '../../context/LanguageContext';
import './SettingsForm.css';

interface ChecklistItemFormProps {
  item?: ChecklistItem;
  maxOrder: number;
  onSave: (item: ChecklistItem) => void;
  onCancel: () => void;
}

export const ChecklistItemForm: React.FC<ChecklistItemFormProps> = ({
  item,
  maxOrder,
  onSave,
  onCancel,
}) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    label: item?.label || '',
    category: item?.category || 'pool',
    order: item?.order || maxOrder + 1,
    active: item?.active !== undefined ? item.active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label) {
      alert(language === 'pt-BR' ? 'Preencha o label do item.' : 'Please fill in the item label.');
      return;
    }

    const itemData: ChecklistItem = {
      id: item?.id || `checklist_${Date.now()}`,
      label: formData.label,
      category: formData.category as any,
      order: formData.order,
      active: formData.active,
    };

    onSave(itemData);
  };

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      <div className="form-grid">
        <div className="form-group full-width">
          <label>{language === 'pt-BR' ? 'Label' : 'Label'} *</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
            required
            placeholder="Ex: Brush walls, Vacuum pool"
          />
        </div>

        <div className="form-group">
          <label>{t('settings.checklist.category')} *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as typeof prev.category }))}
            required
          >
            <option value="pool">Pool</option>
            <option value="equipment">Equipment</option>
            <option value="safety">Safety</option>
            <option value="chemical">Chemical</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>{language === 'pt-BR' ? 'Ordem' : 'Order'}</label>
          <input
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            <span>{language === 'pt-BR' ? 'Item Ativo' : 'Active Item'}</span>
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

