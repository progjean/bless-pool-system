import React, { useState, useEffect } from 'react';
import { DosageStandard } from '../../types/settings';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import './ReadingDosageForm.css';

interface DosageFormProps {
  dosage?: DosageStandard;
  onSave: (dosage: DosageStandard) => void;
  onCancel: () => void;
}

export const DosageForm: React.FC<DosageFormProps> = ({ dosage, onSave, onCancel }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    description: dosage?.description || dosage?.name || '',
    unit: dosage?.unit || 'gal',
    dosageType: dosage?.dosageType || dosage?.name || '',
    costPerUOM: dosage?.costPerUOM || 0,
    pricePerUOM: dosage?.pricePerUOM || 0,
    canIncludeWithService: dosage?.canIncludeWithService || false,
  });
  const [values, setValues] = useState<string[]>(dosage?.values || ['½', '1', '1½', '2', '2½', '3', '3½', '4', '4½', '5', '5½', '6', '6¼', '6½']);
  const [newValue, setNewValue] = useState('');
  const [selectedValue, setSelectedValue] = useState<string | undefined>(dosage?.selectedValue || '1½');

  useEffect(() => {
    if (dosage) {
      setFormData({
        description: dosage.description || dosage.name || '',
        unit: dosage.unit || 'gal',
        dosageType: dosage.dosageType || dosage.name || '',
        costPerUOM: dosage.costPerUOM || 0,
        pricePerUOM: dosage.pricePerUOM || 0,
        canIncludeWithService: dosage.canIncludeWithService || false,
      });
      setValues(dosage.values || ['½', '1', '1½', '2', '2½', '3', '3½', '4', '4½', '5', '5½', '6', '6¼', '6½']);
      setSelectedValue(dosage.selectedValue || '1½');
    }
  }, [dosage]);

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
    
    if (!formData.description || !formData.dosageType) {
      alert(language === 'pt-BR' ? 'Preencha os campos obrigatórios.' : 'Please fill in required fields.');
      return;
    }

    const dosageData: DosageStandard = {
      id: dosage?.id || `dosage_${Date.now()}`,
      name: formData.dosageType,
      unit: formData.unit,
      defaultAmount: dosage?.defaultAmount || 0,
      description: formData.description,
      applicationNotes: dosage?.applicationNotes,
      dosageType: formData.dosageType,
      costPerUOM: formData.costPerUOM,
      pricePerUOM: formData.pricePerUOM,
      canIncludeWithService: formData.canIncludeWithService,
      values: values,
      selectedValue: selectedValue,
    };

    onSave(dosageData);
  };

  return (
    <div className="reading-dosage-form-container">
      <div className="form-panel">
        <h2 className="panel-title">{t('settings.dosages.title')}</h2>
        <p className="info-text">
          {language === 'pt-BR' 
            ? 'A calculadora de dosagem interpreta líquidos como galões e secos como libras. Considere antes de alterar UOM.'
            : 'The dosing calculator interprets liquids as gallons and dry as pounds. Consider before changing UOM.'}
        </p>

        <form onSubmit={handleSubmit} className="reading-dosage-form">
          <div className="form-group">
            <label>{language === 'pt-BR' ? 'Descrição' : 'Description'} *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              placeholder="Ex: Liquid Chlorine"
            />
          </div>

          <div className="form-group">
            <label>UOM {language === 'pt-BR' ? '(Unidade de Medida)' : '(Unit of Measure)'}</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="Ex: gal, lb"
            />
          </div>

          <div className="form-group">
            <label>{language === 'pt-BR' ? 'Tipo de Dosagem' : 'Dosage Type'} *</label>
            <select
              value={formData.dosageType}
              onChange={(e) => setFormData(prev => ({ ...prev, dosageType: e.target.value }))}
              required
            >
              <option value="">{language === 'pt-BR' ? 'Selecione...' : 'Select...'}</option>
              <option value="Liquid Chlorine">Liquid Chlorine</option>
              <option value="Muriatic Acid">Muriatic Acid</option>
              <option value="Soda Ash">Soda Ash</option>
              <option value="Baking Soda">Baking Soda</option>
              <option value="Calcium Chloride">Calcium Chloride</option>
              <option value="Stabilizer">Stabilizer</option>
              <option value="Salt Bags">Salt Bags</option>
            </select>
          </div>

          <div className="form-group">
            <label>{language === 'pt-BR' ? 'Custo / UOM' : 'Cost / UOM'}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.costPerUOM}
              onChange={(e) => setFormData(prev => ({ ...prev, costPerUOM: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>{language === 'pt-BR' ? 'Preço / UOM' : 'Price / UOM'}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePerUOM}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerUOM: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.canIncludeWithService}
                onChange={(e) => setFormData(prev => ({ ...prev, canIncludeWithService: e.target.checked }))}
              />
              <span>{language === 'pt-BR' ? 'Pode incluir com serviço' : 'Can include with service'}</span>
            </label>
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
            ? 'O valor selecionado será o primeiro a ser exibido ao inserir a dosagem.'
            : 'The selected value will be the first to display when entering the dosage.'}
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
