import React, { useState, useEffect } from 'react';
import { ReportFilters } from '../../types/reports';
import { reportsService } from '../../services/reportsService';
import { ReportFilters as ReportFiltersComponent } from './ReportFilters';
import { useLanguage } from '../../context/LanguageContext';
import { ChemicalHistory } from '../../types/reports';
import { showToast } from '../../utils/toast';
import './ReportSection.css';

export const ChemicalHistoryReport: React.FC = () => {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [data, setData] = useState<ChemicalHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await reportsService.getChemicalHistory(filters);
        setData(result);
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        showToast.error(language === 'pt-BR' ? 'Erro ao carregar relatório' : 'Error loading report');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, language]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'var(--success-color)';
      case 'low':
        return 'var(--warning-color)';
      case 'high':
        return 'var(--error-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="report-section">
      <div className="section-header">
        <div>
          <h2>{t('reports.chemicalHistoryTitle')}</h2>
          <p>{t('reports.chemicalHistoryDesc')}</p>
        </div>
      </div>

      <ReportFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <div className="loading">
          <p>{language === 'pt-BR' ? 'Carregando dados...' : 'Loading data...'}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="no-data">
          <p>{language === 'pt-BR' ? 'Nenhum dado encontrado' : 'No data found'}</p>
        </div>
      ) : (
        <div className="chemical-history">
          {data.map((customer) => (
          <div key={customer.customerId} className="customer-history-card">
            <h3>{customer.customerName}</h3>
            <div className="readings-timeline">
              {customer.readings.map((reading, idx) => (
                <div key={idx} className="reading-entry">
                  <div className="reading-date">
                    {new Date(reading.date).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                  </div>
                  <div className="readings-list">
                    {reading.readings.map((r, rIdx) => (
                      <div key={rIdx} className="reading-item">
                        <span className="reading-name">{r.name}:</span>
                        <span className="reading-value">{r.value} {r.unit}</span>
                        <span
                          className="reading-status"
                          style={{ color: getStatusColor(r.status) }}
                        >
                          {r.status === 'normal' ? '✓' : r.status === 'low' ? '↓' : '↑'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

