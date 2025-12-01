import React from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import './LanguageSelector.css';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-selector">
      <label className="language-label">{t('language.title')}:</label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="language-select"
      >
        <option value="pt-BR">{t('language.ptBR')}</option>
        <option value="en-US">{t('language.enUS')}</option>
      </select>
    </div>
  );
};

