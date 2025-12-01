import React, { useState } from 'react';
import { CustomerDetails } from '../../types/customer';
import { PaymentHistoryList } from './history/PaymentHistoryList';
import { ServiceHistoryList } from './history/ServiceHistoryList';
import { PDFHistoryList } from './history/PDFHistoryList';
import { ProductHistoryList } from './history/ProductHistoryList';
import { ReadingHistoryList } from './history/ReadingHistoryList';
import { CustomerTimeline } from './history/CustomerTimeline';
import './CustomerHistory.css';

interface CustomerHistoryProps {
  customerDetails: CustomerDetails;
}

type HistoryTab = 'payments' | 'services' | 'pdfs' | 'products' | 'readings' | 'timeline';

export const CustomerHistory: React.FC<CustomerHistoryProps> = ({ customerDetails }) => {
  const [activeTab, setActiveTab] = useState<HistoryTab>('timeline');

  const tabs: { id: HistoryTab; label: string; icon: string; count?: number }[] = [
    { id: 'timeline', label: 'Linha do Tempo', icon: '📅' },
    { id: 'payments', label: 'Pagamentos', icon: '💰', count: customerDetails.paymentHistory.length },
    { id: 'services', label: 'Serviços', icon: '🔧', count: customerDetails.serviceHistory.length },
    { id: 'pdfs', label: 'PDFs Enviados', icon: '📄', count: customerDetails.sentPDFs.length },
    { id: 'products', label: 'Produtos', icon: '🧪', count: customerDetails.productHistory.length },
    { id: 'readings', label: 'Readings', icon: '📊', count: customerDetails.readingHistory.length },
  ];

  return (
    <div className="customer-history">
      <div className="history-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`history-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="history-content">
        {activeTab === 'timeline' && (
          <CustomerTimeline timeline={customerDetails.timeline} />
        )}
        {activeTab === 'payments' && (
          <PaymentHistoryList payments={customerDetails.paymentHistory} />
        )}
        {activeTab === 'services' && (
          <ServiceHistoryList services={customerDetails.serviceHistory} />
        )}
        {activeTab === 'pdfs' && (
          <PDFHistoryList pdfs={customerDetails.sentPDFs} />
        )}
        {activeTab === 'products' && (
          <ProductHistoryList products={customerDetails.productHistory} />
        )}
        {activeTab === 'readings' && (
          <ReadingHistoryList readings={customerDetails.readingHistory} />
        )}
      </div>
    </div>
  );
};

