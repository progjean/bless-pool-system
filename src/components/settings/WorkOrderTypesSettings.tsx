import React, { useState } from 'react';
import { WorkOrderTypeSetting } from '../../types/settings';
import { DEFAULT_WORK_ORDER_TYPES } from '../../data/settingsData';
import { SettingsList } from './SettingsList';
import { WorkOrderTypeForm } from './WorkOrderTypeForm';
import { useLanguage } from '../../context/LanguageContext';
import './SettingsSection.css';

export const WorkOrderTypesSettings: React.FC = () => {
  const { t, language } = useLanguage();
  const [types, setTypes] = useState<WorkOrderTypeSetting[]>(DEFAULT_WORK_ORDER_TYPES);
  const [editingType, setEditingType] = useState<WorkOrderTypeSetting | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (type: WorkOrderTypeSetting) => {
    if (editingType) {
      setTypes(prev => prev.map(t => t.id === type.id ? type : t));
    } else {
      setTypes(prev => [...prev, type]);
    }
    setEditingType(null);
    setShowForm(false);
  };

  const handleEdit = (type: WorkOrderTypeSetting) => {
    setEditingType(type);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('settings.deleteConfirm'))) {
      setTypes(prev => prev.filter(type => type.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setTypes(prev => prev.map(type =>
      type.id === id ? { ...type, active: !type.active } : type
    ));
  };

  const handleCancel = () => {
    setEditingType(null);
    setShowForm(false);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <div>
          <h2>{language === 'pt-BR' ? 'Tipos de Work Orders' : 'Work Order Types'}</h2>
          <p>{language === 'pt-BR' ? 'Configure os tipos de work orders e suas cores de identificação' : 'Configure work order types and their identification colors'}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="add-button">
          + {t('settings.newType')}
        </button>
      </div>

      {showForm && (
        <WorkOrderTypeForm
          type={editingType || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <SettingsList
        items={types}
        renderItem={(type) => (
          <div className={`work-order-type-item ${!type.active ? 'inactive' : ''}`}>
            <div className="item-header">
              <div className="type-preview" style={{ borderLeftColor: type.color }}>
                <span className="type-icon" style={{ color: type.color }}>
                  {type.icon}
                </span>
                <h4>{type.label}</h4>
              </div>
              <label className="active-toggle">
                <input
                  type="checkbox"
                  checked={type.active}
                  onChange={() => handleToggleActive(type.id)}
                />
                <span>{type.active ? t('stats.active') : t('stats.inactive')}</span>
              </label>
            </div>
            <div className="item-details">
              <div className="detail-row">
                <span>{t('settings.description')}:</span>
                <span>{type.description}</span>
              </div>
              <div className="detail-row">
                <span>{t('settings.color')}:</span>
                <div className="color-preview" style={{ backgroundColor: type.color }}>
                  {type.color}
                </div>
              </div>
            </div>
          </div>
        )}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('settings.noTypes')}
      />
    </div>
  );
};

