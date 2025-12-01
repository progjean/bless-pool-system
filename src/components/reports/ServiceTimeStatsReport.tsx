import React, { useState, useEffect } from 'react';
import { ReportFilters } from '../../types/reports';
import { reportsService } from '../../services/reportsService';
import { ReportFilters as ReportFiltersComponent } from './ReportFilters';
import { useLanguage } from '../../context/LanguageContext';
import { ServiceTimeStats } from '../../types/reports';
import { showToast } from '../../utils/toast';
import './ReportSection.css';

export const ServiceTimeStatsReport: React.FC = () => {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [data, setData] = useState<ServiceTimeStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await reportsService.getServiceTimeStats(filters);
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

  return (
    <div className="report-section">
      <div className="section-header">
        <div>
          <h2>{t('reports.serviceTimeTitle')}</h2>
          <p>{t('reports.serviceTimeDesc')}</p>
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
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>{t('reports.serviceType')}</th>
                <th>{t('reports.averageTime')}</th>
                <th>{t('reports.minTime')}</th>
                <th>{t('reports.maxTime')}</th>
                <th>{t('reports.totalServices')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.serviceType}</td>
                  <td>{item.averageTime} min</td>
                  <td>{item.minTime} min</td>
                  <td>{item.maxTime} min</td>
                  <td>{item.totalServices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

