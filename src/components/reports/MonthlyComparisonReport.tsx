import React, { useState, useEffect } from 'react';
import { ReportFilters } from '../../types/reports';
import { reportsService } from '../../services/reportsService';
import { ReportFilters as ReportFiltersComponent } from './ReportFilters';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import { MonthlyComparison } from '../../types/reports';
import { showToast } from '../../utils/toast';
import './ReportSection.css';

export const MonthlyComparisonReport: React.FC = () => {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [data, setData] = useState<MonthlyComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await reportsService.getMonthlyComparison(filters);
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
          <h2>{t('reports.monthlyComparisonTitle')}</h2>
          <p>{t('reports.monthlyComparisonDesc')}</p>
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
                <th>{language === 'pt-BR' ? 'Mês/Ano' : 'Month/Year'}</th>
                <th>{t('reports.services')}</th>
                <th>{t('reports.revenue')}</th>
                <th>{t('reports.expenses')}</th>
                <th>{t('reports.profit')}</th>
                <th>{t('reports.customers')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.month} {item.year}</td>
                  <td>{item.services}</td>
                  <td>{formatCurrency(item.revenue, language)}</td>
                  <td>{formatCurrency(item.expenses, language)}</td>
                  <td className="profit-cell">
                    {formatCurrency(item.profit, language)}
                  </td>
                  <td>{item.customers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

