import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './AdminSidebar.css';

interface MenuItem {
  path: string;
  icon: string;
  labelKey: string;
  descriptionKey: string;
}

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const menuItems: MenuItem[] = [
    { path: '/admin/dashboard', icon: '📊', labelKey: 'nav.dashboard', descriptionKey: 'nav.dashboard' },
    { path: '/work', icon: '🔧', labelKey: 'nav.workArea', descriptionKey: 'nav.workArea' },
    { path: '/admin/customers', icon: '👥', labelKey: 'nav.customers', descriptionKey: 'nav.customers' },
    { path: '/admin/invoices', icon: '💰', labelKey: 'nav.invoices', descriptionKey: 'nav.invoices' },
    { path: '/admin/work-orders', icon: '📋', labelKey: 'nav.workOrders', descriptionKey: 'nav.workOrders' },
    { path: '/admin/inventory', icon: '📦', labelKey: 'nav.inventory', descriptionKey: 'nav.inventory' },
    { path: '/admin/purchases', icon: '🛒', labelKey: 'nav.purchases', descriptionKey: 'nav.purchases' },
    { path: '/admin/reports', icon: '📊', labelKey: 'nav.reports', descriptionKey: 'nav.reports' },
    { path: '/admin/users', icon: '👤', labelKey: 'nav.users', descriptionKey: 'nav.users' },
    { path: '/admin/settings', icon: '⚙️', labelKey: 'nav.settings', descriptionKey: 'nav.settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>BLESS POOL</h2>
        <div className="user-section">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-content">
                <span className="nav-label">{t(item.labelKey)}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          {t('common.logout')}
        </button>
      </div>
    </div>
  );
};

