import React, { useState, useEffect } from 'react';
import { ReportFilters } from '../../types/reports';
import { reportsService } from '../../services/reportsService';
import { ReportFilters as ReportFiltersComponent } from './ReportFilters';
import { useLanguage } from '../../context/LanguageContext';
import { showToast } from '../../utils/toast';
import './ReportSection.css';

export const ChemicalConsumptionByCustomerReport: React.FC = () => {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await reportsService.getChemicalConsumptionByCustomer({
          startDate: filters.dateFrom,
          endDate: filters.dateTo,
        });
        setData(result);
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        showToast.error('Erro ao carregar relatório');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  return (
    <div className="report-section">
      <div className="section-header">
        <div>
          <h2>{t('reports.consumptionByCustomer')}</h2>
          <p>{t('reports.consumptionByCustomerDesc')}</p>
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
                <th>{t('reports.customer')}</th>
                <th>{t('reports.totalConsumed')}</th>
                <th>{t('reports.products')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
              <tr key={item.customerId}>
                <td>{item.customerName}</td>
                <td>{item.totalConsumption}</td>
                <td>
                  <div className="products-list">
                    {item.products.map((product, idx) => (
                      <span key={idx} className="product-tag">
                        {product.productName}: {product.quantity} {product.unit}
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

