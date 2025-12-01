import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Customer, Contact, AccessCode } from '../types/customer';
import { customersService } from '../services/customersService';
import { CustomerForm } from '../components/customers/CustomerForm';
import { showToast } from '../utils/toast';
import './CustomerFormPage.css';

export const CustomerFormPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const isEditing = customerId !== 'new';
  const [loading, setLoading] = useState(false);
  
  const [customer, setCustomer] = useState<Partial<Customer>>({
    name: '',
    address: '',
    accessCodes: [],
    contacts: [],
    serviceType: 'Weekly',
    servicePrice: 0,
    serviceDay: 'Monday',
    assignedTechnician: '',
    status: 'active',
  });

  useEffect(() => {
    const loadCustomer = async () => {
      if (isEditing && customerId) {
        try {
          setLoading(true);
          const existingCustomer = await customersService.get(customerId);
          if (existingCustomer) {
            setCustomer(existingCustomer);
          }
        } catch (error) {
          console.error('Erro ao carregar cliente:', error);
          showToast.error(t('customers.loadError') || 'Erro ao carregar cliente');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCustomer();
  }, [customerId, isEditing, t]);

  const handleSave = async (customerData: Customer) => {
    try {
      setLoading(true);
      if (isEditing && customerId) {
        await customersService.update(customerId, customerData);
      } else {
        await customersService.create(customerData);
      }
      navigate('/admin/customers');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      // Toast já é mostrado pelo serviço
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/customers');
  };

  return (
    <div className="customer-form-page">
      <header className="form-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/customers')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{isEditing ? (language === 'pt-BR' ? 'Editar Cliente' : 'Edit Customer') : t('customers.newCustomer')}</h1>
          </div>
          <div className="user-info">
            <span>{user?.name}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="logout-button">
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="form-main">
        {loading && isEditing ? (
          <div className="loading">
            <p>{t('common.loading') || 'Carregando...'}</p>
          </div>
        ) : (
          <CustomerForm
            customer={customer}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
};

