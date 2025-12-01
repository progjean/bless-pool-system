import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ExportButton.css';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportPDF?: () => void;
  disabled?: boolean;
  filename?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportCSV,
  onExportPDF,
  disabled = false,
  filename = 'export',
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="export-button-group">
      <button
        onClick={onExportCSV}
        disabled={disabled}
        className="export-button export-csv"
        title={language === 'pt-BR' ? 'Exportar para CSV' : 'Export to CSV'}
      >
        📊 {language === 'pt-BR' ? 'Exportar CSV' : 'Export CSV'}
      </button>
      {onExportPDF && (
        <button
          onClick={onExportPDF}
          disabled={disabled}
          className="export-button export-pdf"
          title={language === 'pt-BR' ? 'Exportar para PDF' : 'Export to PDF'}
        >
          📄 {language === 'pt-BR' ? 'Exportar PDF' : 'Export PDF'}
        </button>
      )}
    </div>
  );
};

