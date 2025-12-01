import React from 'react';
import { ReadingHistory } from '../../../types/customer';
import './HistoryList.css';

interface ReadingHistoryListProps {
  readings: ReadingHistory[];
}

export const ReadingHistoryList: React.FC<ReadingHistoryListProps> = ({ readings }) => {
  if (readings.length === 0) {
    return (
      <div className="empty-history">
        <p>Nenhuma leitura registrada</p>
      </div>
    );
  }

  // Agrupar por data
  const groupedReadings = readings.reduce((acc, reading) => {
    const date = reading.readingDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(reading);
    return acc;
  }, {} as Record<string, ReadingHistory[]>);

  return (
    <div className="history-list">
      {Object.entries(groupedReadings).map(([date, dateReadings]) => (
        <div key={date} className="history-item">
          <div className="history-item-header">
            <div>
              <h4>{new Date(date).toLocaleDateString('pt-BR')}</h4>
              <p className="history-subtitle">{dateReadings.length} leitura(s)</p>
            </div>
          </div>
          <div className="history-item-details">
            {dateReadings.map(reading => (
              <div key={reading.id} className="detail-item">
                <span className="detail-label">{reading.chemical}:</span>
                <span className="detail-value">
                  {reading.value} {reading.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

