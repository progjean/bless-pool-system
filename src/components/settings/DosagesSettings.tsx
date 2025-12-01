import React, { useState, useEffect } from 'react';
import { DosageStandard } from '../../types/settings';
import { DEFAULT_DOSAGES } from '../../data/settingsData';
import { settingsService } from '../../services/settingsService';
import { SettingsList } from './SettingsList';
import { DosageForm } from './DosageForm';
import { useLanguage } from '../../context/LanguageContext';
import { showToast } from '../../utils/toast';
import './SettingsSection.css';

export const DosagesSettings: React.FC = () => {
  const { t, language } = useLanguage();
  const [dosages, setDosages] = useState<DosageStandard[]>([]);
  const [editingDosage, setEditingDosage] = useState<DosageStandard | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDosages = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getDosages();
        const sorted = data.sort((a, b) => (a.order || 999) - (b.order || 999));
        setDosages(sorted);
      } catch (error) {
        console.error('Erro ao carregar dosages:', error);
        // Fallback para defaults
        const sorted = DEFAULT_DOSAGES.sort((a, b) => (a.order || 999) - (b.order || 999));
        setDosages(sorted);
      } finally {
        setLoading(false);
      }
    };

    loadDosages();
  }, []);

  const saveDosages = async (updatedDosages: DosageStandard[]) => {
    try {
      await settingsService.saveDosages(updatedDosages);
      setDosages(updatedDosages);
      showToast.success(t('settings.saved') || 'Configurações salvas!');
    } catch (error) {
      console.error('Erro ao salvar dosages:', error);
      // Salvar localmente como fallback
      localStorage.setItem('dosagesSettings', JSON.stringify(updatedDosages));
      setDosages(updatedDosages);
    }
  };

  const handleSave = async (dosage: DosageStandard) => {
    try {
      let updatedDosages: DosageStandard[];
      if (editingDosage) {
        await settingsService.saveDosage(dosage);
        updatedDosages = dosages.map(d => d.id === dosage.id ? dosage : d);
      } else {
        const maxOrder = Math.max(...dosages.map(d => d.order || 0), 0);
        const newDosage = { ...dosage, order: maxOrder + 1 };
        await settingsService.saveDosage(newDosage);
        updatedDosages = [...dosages, newDosage];
      }
      setDosages(updatedDosages);
      setEditingDosage(null);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar dosage:', error);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedDosages = [...dosages];
    [updatedDosages[index - 1], updatedDosages[index]] = [updatedDosages[index], updatedDosages[index - 1]];
    // Atualizar orders
    updatedDosages.forEach((d, i) => {
      d.order = i + 1;
    });
    saveDosages(updatedDosages);
  };

  const handleMoveDown = (index: number) => {
    if (index === dosages.length - 1) return;
    const updatedDosages = [...dosages];
    [updatedDosages[index], updatedDosages[index + 1]] = [updatedDosages[index + 1], updatedDosages[index]];
    // Atualizar orders
    updatedDosages.forEach((d, i) => {
      d.order = i + 1;
    });
    saveDosages(updatedDosages);
  };

  const handleEdit = (dosage: DosageStandard) => {
    setEditingDosage(dosage);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('settings.dosages.deleteConfirm'))) {
      try {
        await settingsService.deleteDosage(id);
        const updatedDosages = dosages.filter(d => d.id !== id);
        // Reordenar após deletar
        updatedDosages.forEach((d, i) => {
          d.order = i + 1;
        });
        setDosages(updatedDosages);
      } catch (error) {
        console.error('Erro ao deletar dosage:', error);
        // Fallback: deletar localmente
        const updatedDosages = dosages.filter(d => d.id !== id);
        updatedDosages.forEach((d, i) => {
          d.order = i + 1;
        });
        localStorage.setItem('dosagesSettings', JSON.stringify(updatedDosages));
        setDosages(updatedDosages);
      }
    }
  };

  const handleCancel = () => {
    setEditingDosage(null);
    setShowForm(false);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <div>
          <h2>{t('settings.dosages.title')}</h2>
          <p>{t('settings.dosages.desc')}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="add-button">
          + {t('settings.dosages.newDosage')}
        </button>
      </div>

      {showForm && (
        <DosageForm
          dosage={editingDosage || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="settings-list">
        {dosages.length === 0 ? (
          <div className="settings-empty">
            <p>{t('settings.dosages.noDosages')}</p>
          </div>
        ) : (
          dosages.map((dosage, index) => (
            <div key={dosage.id} className="settings-item">
              <div className="item-content">
                <div className="dosage-item">
                  <div className="item-header">
                    <h4>{dosage.name}</h4>
                    <span className="item-unit">{dosage.unit}</span>
                  </div>
                  <div className="item-details">
                    <div className="detail-row">
                      <span>{t('settings.dosages.defaultAmount')}:</span>
                      <span>{dosage.defaultAmount} {dosage.unit}</span>
                    </div>
                    {dosage.description && (
                      <div className="detail-row">
                        <span>{t('settings.description')}:</span>
                        <span>{dosage.description}</span>
                      </div>
                    )}
                    {dosage.applicationNotes && (
                      <div className="detail-row">
                        <span>{t('settings.dosages.applicationNotes')}:</span>
                        <span>{dosage.applicationNotes}</span>
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
                    disabled={index === dosages.length - 1}
                    title={language === 'pt-BR' ? 'Mover para baixo' : 'Move down'}
                  >
                    ▼
                  </button>
                </div>
                <button
                  onClick={() => handleEdit(dosage)}
                  className="edit-button"
                  title={language === 'pt-BR' ? 'Editar' : 'Edit'}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(dosage.id)}
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

