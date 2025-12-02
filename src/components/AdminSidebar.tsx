import React, { useEffect } from 'react';
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

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // Fechar sidebar ao navegar em mobile
  useEffect(() => {
    if (window.innerWidth <= 768 && onClose && isOpen) {
      // Pequeno delay para permitir a navegação antes de fechar
      const timer = setTimeout(() => {
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, onClose, isOpen]);

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

  const handleNavClick = (path: string) => {
    navigate(path);
    // Fechar sidebar em mobile após navegação
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <div className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <h2>BLESS POOL</h2>
          {onClose && (
            <button 
              className="sidebar-close-button"
              onClick={onClose}
              aria-label="Fechar menu"
            >
              ✕
            </button>
          )}
        </div>
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
              onClick={() => handleNavClick(item.path)}
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

