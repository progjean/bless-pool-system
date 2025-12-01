import React from 'react';
import { SentPDF } from '../../../types/customer';
import './HistoryList.css';

interface PDFHistoryListProps {
  pdfs: SentPDF[];
}

export const PDFHistoryList: React.FC<PDFHistoryListProps> = ({ pdfs }) => {
  const getPDFTypeLabel = (type: string) => {
    switch (type) {
      case 'service_report':
        return 'Relatório de Serviço';
      case 'invoice':
        return 'Fatura';
      default:
        return 'Outro';
    }
  };

  if (pdfs.length === 0) {
    return (
      <div className="empty-history">
        <p>Nenhum PDF enviado</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {pdfs.map(pdf => (
        <div key={pdf.id} className="history-item">
          <div className="history-item-header">
            <div>
              <h4>{getPDFTypeLabel(pdf.type)}</h4>
              <p className="history-subtitle">{pdf.fileName}</p>
            </div>
            <span className="pdf-icon">📄</span>
          </div>
          <div className="history-item-details">
            <div className="detail-item">
              <span className="detail-label">Enviado em:</span>
              <span className="detail-value">
                {new Date(pdf.sentDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Para:</span>
              <span className="detail-value">{pdf.sentTo}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

