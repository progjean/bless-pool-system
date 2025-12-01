import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './SettingsList.css';

interface SettingsListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
  getId?: (item: T) => string;
}

export function SettingsList<T extends { id: string }>({
  items,
  renderItem,
  onEdit,
  onDelete,
  emptyMessage,
  getId = (item) => item.id,
}: SettingsListProps<T>) {
  const { t, language } = useLanguage();
  if (items.length === 0) {
    return (
      <div className="settings-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="settings-list">
      {items.map((item) => (
        <div key={getId(item)} className="settings-item">
          <div className="item-content">
            {renderItem(item)}
          </div>
          <div className="item-actions">
            <button
              onClick={() => onEdit(item)}
              className="edit-button"
              title={language === 'pt-BR' ? 'Editar' : 'Edit'}
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(getId(item))}
              className="delete-button"
              title={language === 'pt-BR' ? 'Excluir' : 'Delete'}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

