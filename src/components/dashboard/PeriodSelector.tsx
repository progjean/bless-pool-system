import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './PeriodSelector.css';

interface PeriodSelectorProps {
  selectedPeriod: '30days' | '3months' | '6months' | '1year';
  onPeriodChange: (period: '30days' | '3months' | '6months' | '1year') => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const { t } = useLanguage();
  
  const periods = [
    { value: '30days', label: t('dashboard.period.30days') },
    { value: '3months', label: t('dashboard.period.3months') },
    { value: '6months', label: t('dashboard.period.6months') },
    { value: '1year', label: t('dashboard.period.1year') },
  ];

  return (
    <div className="period-selector">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value as any)}
          className={`period-button ${selectedPeriod === period.value ? 'active' : ''}`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

