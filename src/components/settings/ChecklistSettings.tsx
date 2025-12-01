import React, { useState } from 'react';
import { ChecklistItem } from '../../types/settings';
import { DEFAULT_CHECKLIST } from '../../data/settingsData';
import { SettingsList } from './SettingsList';
import { ChecklistItemForm } from './ChecklistItemForm';
import { useLanguage } from '../../context/LanguageContext';
import './SettingsSection.css';

export const ChecklistSettings: React.FC = () => {
  const { t } = useLanguage();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (item: ChecklistItem) => {
    if (editingItem) {
      setChecklist(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      const maxOrder = Math.max(...checklist.map(i => i.order), 0);
      setChecklist(prev => [...prev, { ...item, order: maxOrder + 1 }]);
    }
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: ChecklistItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('settings.checklist.deleteConfirm'))) {
      setChecklist(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    setChecklist(prev => {
      const items = [...prev];
      const index = items.findIndex(i => i.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= items.length) return prev;

      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      items[index].order = index + 1;
      items[newIndex].order = newIndex + 1;
      
      return items;
    });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setShowForm(false);
  };

  const sortedChecklist = [...checklist].sort((a, b) => a.order - b.order);

  return (
    <div className="settings-section">
      <div className="section-header">
        <div>
          <h2>{t('settings.checklist.title')}</h2>
          <p>{t('settings.checklist.desc')}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="add-button">
          + {t('settings.checklist.newItem')}
        </button>
      </div>

      {showForm && (
        <ChecklistItemForm
          item={editingItem || undefined}
          maxOrder={checklist.length}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <SettingsList
        items={sortedChecklist}
        renderItem={(item) => (
          <div className={`checklist-item ${!item.active ? 'inactive' : ''}`}>
            <div className="item-header">
              <div className="item-order-controls">
                <button
                  type="button"
                  onClick={() => handleMove(item.id, 'up')}
                  className="move-button"
                  disabled={item.order === 1}
                >
                  ↑
                </button>
                <span className="item-order">#{item.order}</span>
                <button
                  type="button"
                  onClick={() => handleMove(item.id, 'down')}
                  className="move-button"
                  disabled={item.order === checklist.length}
                >
                  ↓
                </button>
              </div>
              <h4>{item.label}</h4>
              <label className="active-toggle">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => handleToggleActive(item.id)}
                />
                <span>{item.active ? t('stats.active') : t('stats.inactive')}</span>
              </label>
            </div>
            <div className="item-details">
              <div className="detail-row">
                <span>{t('settings.checklist.category')}:</span>
                <span className="category-badge">{item.category}</span>
              </div>
            </div>
          </div>
        )}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('settings.checklist.noChecklist')}
      />
    </div>
  );
};

