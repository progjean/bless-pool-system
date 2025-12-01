import React, { useState, useEffect } from 'react';
import { ReadingStandard } from '../../types/settings';
import { DEFAULT_READINGS } from '../../data/settingsData';
import { settingsService } from '../../services/settingsService';
import { SettingsList } from './SettingsList';
import { ReadingForm } from './ReadingForm';
import { useLanguage } from '../../context/LanguageContext';
import { formatTemperatureRange, formatTemperature } from '../../utils/formatUtils';
import { showToast } from '../../utils/toast';
import './SettingsSection.css';

export const ReadingsSettings: React.FC = () => {
  const { t, language } = useLanguage();
  const [readings, setReadings] = useState<ReadingStandard[]>([]);
  const [editingReading, setEditingReading] = useState<ReadingStandard | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReadings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getReadings();
        const sorted = data.sort((a, b) => (a.order || 999) - (b.order || 999));
        setReadings(sorted);
      } catch (error) {
        console.error('Erro ao carregar readings:', error);
        // Fallback para defaults
        const sorted = DEFAULT_READINGS.sort((a, b) => (a.order || 999) - (b.order || 999));
        setReadings(sorted);
      } finally {
        setLoading(false);
      }
    };

    loadReadings();
  }, []);

  const saveReadings = async (updatedReadings: ReadingStandard[]) => {
    try {
      await settingsService.saveReadings(updatedReadings);
      setReadings(updatedReadings);
      showToast.success(t('settings.saved') || 'Configurações salvas!');
    } catch (error) {
      console.error('Erro ao salvar readings:', error);
      // Salvar localmente como fallback
      localStorage.setItem('readingsSettings', JSON.stringify(updatedReadings));
      setReadings(updatedReadings);
    }
  };

  const handleSave = async (reading: ReadingStandard) => {
    try {
      let updatedReadings: ReadingStandard[];
      if (editingReading) {
        await settingsService.saveReading(reading);
        updatedReadings = readings.map(r => r.id === reading.id ? reading : r);
      } else {
        const maxOrder = Math.max(...readings.map(r => r.order || 0), 0);
        const newReading = { ...reading, order: maxOrder + 1 };
        await settingsService.saveReading(newReading);
        updatedReadings = [...readings, newReading];
      }
      setReadings(updatedReadings);
      setEditingReading(null);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar reading:', error);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedReadings = [...readings];
    [updatedReadings[index - 1], updatedReadings[index]] = [updatedReadings[index], updatedReadings[index - 1]];
    // Atualizar orders
    updatedReadings.forEach((r, i) => {
      r.order = i + 1;
    });
    saveReadings(updatedReadings);
  };

  const handleMoveDown = (index: number) => {
    if (index === readings.length - 1) return;
    const updatedReadings = [...readings];
    [updatedReadings[index], updatedReadings[index + 1]] = [updatedReadings[index + 1], updatedReadings[index]];
    // Atualizar orders
    updatedReadings.forEach((r, i) => {
      r.order = i + 1;
    });
    saveReadings(updatedReadings);
  };

  const handleEdit = (reading: ReadingStandard) => {
    setEditingReading(reading);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('settings.readings.deleteConfirm'))) {
      try {
        await settingsService.deleteReading(id);
        const updatedReadings = readings.filter(r => r.id !== id);
        // Reordenar após deletar
        updatedReadings.forEach((r, i) => {
          r.order = i + 1;
        });
        setReadings(updatedReadings);
      } catch (error) {
        console.error('Erro ao deletar reading:', error);
        // Fallback: deletar localmente
        const updatedReadings = readings.filter(r => r.id !== id);
        updatedReadings.forEach((r, i) => {
          r.order = i + 1;
        });
        localStorage.setItem('readingsSettings', JSON.stringify(updatedReadings));
        setReadings(updatedReadings);
      }
    }
  };

  const handleCancel = () => {
    setEditingReading(null);
    setShowForm(false);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <div>
          <h2>{t('settings.readings.title')}</h2>
          <p>{t('settings.readings.desc')}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="add-button">
          + {t('settings.readings.newStandard')}
        </button>
      </div>

      {showForm && (
        <ReadingForm
          reading={editingReading || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="settings-list">
        {readings.length === 0 ? (
          <div className="settings-empty">
            <p>{t('settings.readings.noReadings')}</p>
          </div>
        ) : (
          readings.map((reading, index) => (
            <div key={reading.id} className="settings-item">
              <div className="item-content">
                <div className="reading-item">
                  <div className="item-header">
                    <h4>{reading.name}</h4>
                    <span className="item-unit">{reading.unit}</span>
                  </div>
                  <div className="item-details">
                    <div className="detail-row">
                      <span>{t('settings.readings.range')}:</span>
                      <span>
                        {reading.unit === '°C' && reading.name.toLowerCase().includes('temperature')
                          ? formatTemperatureRange(reading.minValue, reading.maxValue, language)
                          : `${reading.minValue} - ${reading.maxValue} ${reading.unit}`}
                      </span>
                    </div>
                    {reading.idealValue && (
                      <div className="detail-row">
                        <span>{t('settings.readings.ideal')}:</span>
                        <span>
                          {reading.unit === '°C' && reading.name.toLowerCase().includes('temperature')
                            ? formatTemperature(reading.idealValue, language)
                            : `${reading.idealValue} ${reading.unit}`}
                        </span>
                      </div>
                    )}
                    {reading.description && (
                      <div className="detail-row">
                        <span>{t('settings.description')}:</span>
                        <span>{reading.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="item-actions">
                <div className="order-buttons">
                  <button
                    onClick={() => handleMoveUp(index)}
                    className="order-button"
                    disabled={index === 0}
                    title={language === 'pt-BR' ? 'Mover para cima' : 'Move up'}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    className="order-button"
                    disabled={index === readings.length - 1}
                    title={language === 'pt-BR' ? 'Mover para baixo' : 'Move down'}
                  >
                    ▼
                  </button>
                </div>
                <button
                  onClick={() => handleEdit(reading)}
                  className="edit-button"
                  title={language === 'pt-BR' ? 'Editar' : 'Edit'}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(reading.id)}
                  className="delete-button"
                  title={language === 'pt-BR' ? 'Excluir' : 'Delete'}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

