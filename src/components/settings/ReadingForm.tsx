import React, { useState, useEffect } from 'react';
import { ReadingStandard } from '../../types/settings';
import { useLanguage } from '../../context/LanguageContext';
import './ReadingDosageForm.css';

interface ReadingFormProps {
  reading?: ReadingStandard;
  onSave: (reading: ReadingStandard) => void;
  onCancel: () => void;
}

export const ReadingForm: React.FC<ReadingFormProps> = ({ reading, onSave, onCancel }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    description: reading?.description || reading?.name || '',
    unit: reading?.unit || '',
    readingType: reading?.readingType || reading?.name || '',
  });
  const [values, setValues] = useState<string[]>(reading?.values || []);
  const [newValue, setNewValue] = useState('');
  const [selectedValue, setSelectedValue] = useState<string | undefined>(reading?.selectedValue);

  useEffect(() => {
    if (reading) {
      setFormData({
        description: reading.description || reading.name || '',
        unit: reading.unit || '',
        readingType: reading.readingType || reading.name || '',
      });
      setValues(reading.values || []);
      setSelectedValue(reading.selectedValue);
    }
  }, [reading]);

  const handleAddValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      const updatedValues = [...values, newValue.trim()].sort((a, b) => {
        const numA = parseFloat(a.replace(/[½¼¾]/g, (m) => {
          if (m === '½') return '.5';
          if (m === '¼') return '.25';
          if (m === '¾') return '.75';
          return '';
        }));
        const numB = parseFloat(b.replace(/[½¼¾]/g, (m) => {
          if (m === '½') return '.5';
          if (m === '¼') return '.25';
          if (m === '¾') return '.75';
          return '';
        }));
        return numA - numB;
      });
      setValues(updatedValues);
      setNewValue('');
    }
  };

  const handleDeleteValue = (value: string) => {
    setValues(prev => prev.filter(v => v !== value));
    if (selectedValue === value) {
      setSelectedValue(undefined);
    }
  };

  const handleSelectValue = (value: string) => {
    setSelectedValue(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.readingType) {
      alert(language === 'pt-BR' ? 'Preencha os campos obrigatórios.' : 'Please fill in required fields.');
      return;
    }

    const readingData: ReadingStandard = {
      id: reading?.id || `reading_${Date.now()}`,
      name: formData.readingType,
      unit: formData.unit,
      minValue: reading?.minValue || 0,
      maxValue: reading?.maxValue || 0,
      idealValue: reading?.idealValue,
      description: formData.description,
      category: reading?.category || 'other',
      readingType: formData.readingType,
      values: values,
      selectedValue: selectedValue,
    };

    onSave(readingData);
  };

  return (
    <div className="reading-dosage-form-container">
      <div className="form-panel">
        <h2 className="panel-title">{t('settings.readings.title')}</h2>
        <p className="info-text">
          {language === 'pt-BR' 
            ? 'A calculadora de dosagem interpreta leituras como ppm e graus como F°. Considere antes de alterar UOM.'
            : 'The dosing calculator interprets readings as ppm and degrees as F°. Consider before changing UOM.'}
        </p>

        <form onSubmit={handleSubmit} className="reading-dosage-form">
          <div className="form-group">
            <label>{language === 'pt-BR' ? 'Descrição' : 'Description'} *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              placeholder="Ex: pH"
            />
          </div>

          <div className="form-group">
            <label>UOM {language === 'pt-BR' ? '(Unidade de Medida)' : '(Unit of Measure)'}</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="Ex: ppm, F°"
            />
          </div>

          <div className="form-group">
            <label>{language === 'pt-BR' ? 'Tipo de Leitura' : 'Reading Type'} *</label>
            <select
              value={formData.readingType}
              onChange={(e) => setFormData(prev => ({ ...prev, readingType: e.target.value }))}
              required
            >
              <option value="">{language === 'pt-BR' ? 'Selecione...' : 'Select...'}</option>
              <option value="pH">pH</option>
              <option value="Chlorine">Chlorine</option>
              <option value="Free Chlorine">Free Chlorine</option>
              <option value="Combined Chlorine">Combined Chlorine</option>
              <option value="Alkalinity">Alkalinity</option>
              <option value="Calcium Hardness">Calcium Hardness</option>
              <option value="Cyanuric Acid">Cyanuric Acid</option>
              <option value="Salt Level">Salt Level</option>
              <option value="Temperature">Temperature</option>
              <option value="TDS">TDS</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="back-button">
              ← {t('common.back')}
            </button>
            <button type="submit" className="save-button">
              ✓ {t('common.save')}
            </button>
          </div>
        </form>
      </div>

      <div className="values-panel">
        <h2 className="panel-title">{language === 'pt-BR' ? 'Valores' : 'Values'}</h2>
        
        <div className="add-value-section">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
            placeholder={language === 'pt-BR' ? 'Digite um valor...' : 'Enter a value...'}
            className="value-input"
          />
          <button onClick={handleAddValue} className="add-button">
            {language === 'pt-BR' ? 'Adicionar' : 'Add'}
          </button>
        </div>

        <div className="info-message">
          <span className="info-icon">ℹ️</span>
          <span>{language === 'pt-BR' 
            ? 'O valor selecionado será o primeiro a ser exibido ao inserir a leitura.'
            : 'The selected value will be the first to display when entering the reading.'}
          </span>
        </div>

        <div className="values-list">
          {values.length === 0 ? (
            <p className="empty-message">{language === 'pt-BR' ? 'Nenhum valor adicionado' : 'No values added'}</p>
          ) : (
            values.map((value, index) => (
              <div key={index} className={`value-item ${selectedValue === value ? 'selected' : ''}`}>
                <span className="value-text">{value}</span>
                <div className="value-actions">
                  <button
                    onClick={() => handleSelectValue(value)}
                    className={`select-button ${selectedValue === value ? 'active' : ''}`}
                  >
                    ✓ {language === 'pt-BR' ? 'Selecionar' : 'Select'}
                  </button>
                  <button
                    onClick={() => handleDeleteValue(value)}
                    className="delete-button"
                  >
                    🗑️ {language === 'pt-BR' ? 'Excluir' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
