import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './RealtimeIndicator.css';

interface RealtimeIndicatorProps {
  isConnected: boolean;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({ isConnected }) => {
  const { language } = useLanguage();

  return (
    <div className={`realtime-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
      <span className="indicator-dot"></span>
      <span className="indicator-text">
        {isConnected
          ? language === 'pt-BR' ? 'Tempo Real Ativo' : 'Real-time Active'
          : language === 'pt-BR' ? 'Desconectado' : 'Disconnected'}
      </span>
    </div>
  );
};

