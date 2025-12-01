import React, { useState } from 'react';
import { WorkOrderTypeSetting } from '../../types/settings';
import { useLanguage } from '../../context/LanguageContext';
import './SettingsForm.css';

interface WorkOrderTypeFormProps {
  type?: WorkOrderTypeSetting;
  onSave: (type: WorkOrderTypeSetting) => void;
  onCancel: () => void;
}

export const WorkOrderTypeForm: React.FC<WorkOrderTypeFormProps> = ({ type, onSave, onCancel }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    label: type?.label || '',
    description: type?.description || '',
    color: type?.color || '#667eea',
    icon: type?.icon || '📋',
    active: type?.active !== undefined ? type.active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label || !formData.description) {
      alert(t('settings.fillRequired'));
      return;
    }

    const typeData: WorkOrderTypeSetting = {
      id: type?.id || `wo_type_${Date.now()}`,
      label: formData.label,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      active: formData.active,
    };

    onSave(typeData);
  };

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      <div className="form-grid">
        <div className="form-group">
          <label>{t('workOrders.type')} *</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
            required
            placeholder={language === 'pt-BR' ? 'Ex: Verificação de Vazamento' : 'Ex: Leak Check'}
          />
        </div>

        <div className="form-group">
          <label>{t('settings.icon')}</label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder={language === 'pt-BR' ? 'Ex: 💧, 🔧' : 'Ex: 💧, 🔧'}
            maxLength={2}
          />
        </div>

        <div className="form-group full-width">
          <label>{t('settings.description')} *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            rows={3}
            placeholder={language === 'pt-BR' ? 'Descreva este tipo de work order...' : 'Describe this work order type...'}
          />
        </div>

        <div className="form-group">
          <label>{t('settings.color')} *</label>
          <div className="color-picker-group">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="color-picker"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="color-input"
              placeholder="#667eea"
            />
            <div className="color-preview-box" style={{ backgroundColor: formData.color }} />
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            <span>{t('settings.activeType')}</span>
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

