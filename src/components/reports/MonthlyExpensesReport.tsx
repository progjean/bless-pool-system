import React, { useState, useEffect } from 'react';
import { ReportFilters } from '../../types/reports';
import { reportsService } from '../../services/reportsService';
import { ReportFilters as ReportFiltersComponent } from './ReportFilters';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatUtils';
import { showToast } from '../../utils/toast';
import './ReportSection.css';

export const MonthlyExpensesReport: React.FC = () => {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await reportsService.getMonthlyExpenses(12);
        setData(result);
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        showToast.error('Erro ao carregar relatório');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="report-section">
      <div className="section-header">
        <div>
          <h2>{t('reports.monthlyExpensesTitle')}</h2>
          <p>{t('reports.monthlyExpensesDesc')}</p>
        </div>
      </div>

      <ReportFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}...</div>
      ) : data.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>{t('reports.noData')}</div>
      ) : (
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>{language === 'pt-BR' ? 'Mês/Ano' : 'Month/Year'}</th>
                <th>{language === 'pt-BR' ? 'Total Gasto' : 'Total Spent'}</th>
                <th>{language === 'pt-BR' ? 'Compras' : 'Purchases'}</th>
                <th>{language === 'pt-BR' ? 'Categorias' : 'Categories'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.month} {item.year}</td>
                <td>
                  {formatCurrency(item.totalAmount, language)}
                </td>
                <td>{item.purchasesCount}</td>
                <td>
                  <div className="categories-list">
                    {item.categories.map((cat, catIdx) => (
                      <span key={catIdx} className="category-tag">
                        {cat.category}: {formatCurrency(cat.amount, language)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

