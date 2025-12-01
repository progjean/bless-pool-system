import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usersService } from '../services/usersService';
import { User } from '../types/user';
import { showToast } from '../utils/toast';
import './SupervisorSelector.css';

export const SupervisorSelector: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        setLoading(true);
        const techs = await usersService.getTechnicians(user?.companyId);
        setTechnicians(techs);
      } catch (error) {
        console.error('Erro ao carregar técnicos:', error);
        showToast.error(language === 'pt-BR' ? 'Erro ao carregar técnicos' : 'Error loading technicians');
      } finally {
        setLoading(false);
      }
    };

    loadTechnicians();
  }, [user?.companyId, language]);

  const handleSelect = (option: 'self' | string) => {
    setSelectedOption(option);
    localStorage.setItem('supervisor_selection', option);
    
    // Navegar para Work Area com a seleção
    if (option === 'self') {
      navigate('/work', { state: { viewMode: 'self' } });
    } else {
      navigate('/work', { state: { viewMode: 'technician', technicianId: option } });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="supervisor-selector-page">
      <div className="supervisor-selector-container">
        <div className="selector-header">
          <h1>{t('supervisor.chooseMode')}</h1>
          <p>{t('supervisor.selectView')}</p>
        </div>

        <div className="selector-options">
          <div 
            className={`selector-option-card ${selectedOption === 'self' ? 'selected' : ''}`}
            onClick={() => handleSelect('self')}
          >
            <div className="option-avatar">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="option-content">
              <h3>{t('supervisor.myProfile')}</h3>
              <p>{t('supervisor.viewAs')} {user?.name}</p>
            </div>
            <div className="option-arrow">→</div>
          </div>

          <div className="divider">
            <span>{t('supervisor.or')}</span>
          </div>

          <div className="technicians-list">
            <h3>{t('supervisor.linkedTechnicians')}</h3>
            {loading ? (
              <div className="loading">
                <p>{language === 'pt-BR' ? 'Carregando técnicos...' : 'Loading technicians...'}</p>
              </div>
            ) : technicians.length > 0 ? (
              technicians.map((technician) => (
                <div
                  key={technician.id}
                  className={`selector-option-card ${selectedOption === technician.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(technician.id)}
                >
                  <div className="option-avatar technician-avatar">
                    {technician.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="option-content">
                    <h3>{technician.name}</h3>
                    <p>
                      <span className="status-badge">{t('supervisor.status.active')}</span>
                    </p>
                  </div>
                  <div className="option-arrow">→</div>
                </div>
              ))
            ) : (
              <div className="no-technicians">
                <p>{language === 'pt-BR' ? 'Nenhum técnico vinculado encontrado' : 'No linked technicians found'}</p>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleLogout} className="logout-button">
          {t('common.logout')}
        </button>
      </div>
    </div>
  );
};

