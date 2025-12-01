import React, { useState, useEffect } from 'react';
import { ReportFilters } from '../../types/reports';
import { reportsService } from '../../services/reportsService';
import { ReportFilters as ReportFiltersComponent } from './ReportFilters';
import { useLanguage } from '../../context/LanguageContext';
import { ServicesByTechnician } from '../../types/reports';
import { showToast } from '../../utils/toast';
import './ReportSection.css';

export const ServicesByTechnicianReport: React.FC = () => {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [data, setData] = useState<ServicesByTechnician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await reportsService.getServicesByTechnician(filters);
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
          <h2>{t('reports.servicesByTechnicianTitle')}</h2>
          <p>{t('reports.servicesByTechnicianDesc')}</p>
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
                <th>{t('reports.technician')}</th>
                <th>{t('reports.totalServices')}</th>
                <th>{t('reports.completedServices')}</th>
                <th>{t('reports.averageTime')}</th>
                <th>{language === 'pt-BR' ? 'Total de Horas' : 'Total Hours'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.technicianId}>
                  <td>{item.technicianName}</td>
                  <td>{item.totalServices}</td>
                  <td>{item.completedServices}</td>
                  <td>{item.averageTime} min</td>
                  <td>{item.totalHours.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

