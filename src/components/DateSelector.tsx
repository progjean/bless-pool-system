import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './DateSelector.css';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const { t } = useLanguage();
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="date-selector">
      <button 
        onClick={handlePreviousDay}
        className="date-nav-button"
        aria-label={t('workArea.dateSelector.previousDay')}
      >
        ←
      </button>
      
      <div className="date-input-wrapper">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-input"
        />
        {!isToday && (
          <button 
            onClick={handleToday}
            className="today-button"
          >
            {t('workArea.dateSelector.today')}
          </button>
        )}
      </div>

      <button 
        onClick={handleNextDay}
        className="date-nav-button"
        aria-label={t('workArea.dateSelector.nextDay')}
      >
        →
      </button>
    </div>
  );
};

