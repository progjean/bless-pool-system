import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminHub.css';

export const AdminHub: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigateToAdminArea = () => {
    navigate('/admin');
  };

  const handleNavigateToWorkArea = () => {
    navigate('/work');
  };

  return (
    <div className="admin-hub">
      <header className="admin-hub-header">
        <div className="header-content">
          <h1>Admin Hub</h1>
          <div className="user-info">
            <span>{user?.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="admin-hub-main">
        <div className="admin-hub-welcome">
          <h2>Bem-vindo, {user?.name}!</h2>
          <p>Escolha uma área para acessar:</p>
        </div>

        <div className="admin-hub-options">
          <div 
            className="hub-option-card" 
            onClick={handleNavigateToAdminArea}
          >
            <div className="hub-option-icon">⚙️</div>
            <h3>Administrative Area</h3>
            <p>Gerenciamento completo do sistema</p>
            <div className="hub-option-arrow">→</div>
          </div>

          <div 
            className="hub-option-card" 
            onClick={handleNavigateToWorkArea}
          >
            <div className="hub-option-icon">🔧</div>
            <h3>Work Area</h3>
            <p>Área de trabalho operacional</p>
            <div className="hub-option-arrow">→</div>
          </div>
        </div>
      </main>
    </div>
  );
};

