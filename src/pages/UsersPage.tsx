import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, UserRole } from '../types/user';
import { usersService } from '../services/usersService';
import { ExportButton } from '../components/common/ExportButton';
import { exportToCSV } from '../utils/exportUtils';
import { showToast } from '../utils/toast';
import { UserRole as UserRoleEnum } from '../types/user';
import './UsersPage.css';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.list();
        setUsers(data);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showToast.error(language === 'pt-BR' ? 'Erro ao carregar usuários' : 'Error loading users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [language]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      showToast.error(language === 'pt-BR' ? 'Você não pode excluir seu próprio usuário' : 'You cannot delete your own user');
      return;
    }

    if (confirm(language === 'pt-BR' ? 'Tem certeza que deseja excluir este usuário?' : 'Are you sure you want to delete this user?')) {
      try {
        await usersService.delete(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast.success(language === 'pt-BR' ? 'Usuário excluído!' : 'User deleted!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showToast.error(language === 'pt-BR' ? 'Erro ao excluir usuário' : 'Error deleting user');
      }
    }
  };

  const handleExportCSV = () => {
    const data = filteredUsers.map(u => ({
      'Nome': u.name,
      'Email': u.email,
      'Usuário': u.username,
      'Função': u.role,
      'Empresa': u.companyName || '',
      'Criado em': new Date(u.createdAt).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US'),
    }));
    exportToCSV(data, 'usuarios', Object.keys(data[0]));
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      [UserRoleEnum.ADMIN]: language === 'pt-BR' ? 'Administrador' : 'Admin',
      [UserRoleEnum.SUPERVISOR]: language === 'pt-BR' ? 'Supervisor' : 'Supervisor',
      [UserRoleEnum.TECHNICIAN]: language === 'pt-BR' ? 'Técnico' : 'Technician',
    };
    return labels[role];
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRoleEnum.ADMIN:
        return '#ef4444';
      case UserRoleEnum.SUPERVISOR:
        return '#3b82f6';
      case UserRoleEnum.TECHNICIAN:
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{language === 'pt-BR' ? 'Gerenciamento de Usuários' : 'User Management'}</h1>
          </div>
        </div>
      </header>

      <main className="users-main">
        <div className="users-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder={language === 'pt-BR' ? 'Buscar usuários...' : 'Search users...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
            className="filter-select"
          >
            <option value="all">{language === 'pt-BR' ? 'Todas as funções' : 'All roles'}</option>
            <option value={UserRoleEnum.ADMIN}>{getRoleLabel(UserRoleEnum.ADMIN)}</option>
            <option value={UserRoleEnum.SUPERVISOR}>{getRoleLabel(UserRoleEnum.SUPERVISOR)}</option>
            <option value={UserRoleEnum.TECHNICIAN}>{getRoleLabel(UserRoleEnum.TECHNICIAN)}</option>
          </select>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ExportButton
              onExportCSV={handleExportCSV}
              disabled={filteredUsers.length === 0}
            />
            <button
              onClick={() => {
                setEditingUser(null);
                setShowForm(true);
              }}
              className="new-user-button"
            >
              + {language === 'pt-BR' ? 'Novo Usuário' : 'New User'}
            </button>
          </div>
        </div>

        <div className="users-stats">
          <div className="stat-item">
            <span className="stat-label">{language === 'pt-BR' ? 'Total' : 'Total'}:</span>
            <span className="stat-value">{users.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{getRoleLabel(UserRoleEnum.ADMIN)}:</span>
            <span className="stat-value">{users.filter(u => u.role === UserRoleEnum.ADMIN).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{getRoleLabel(UserRoleEnum.SUPERVISOR)}:</span>
            <span className="stat-value">{users.filter(u => u.role === UserRoleEnum.SUPERVISOR).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{getRoleLabel(UserRoleEnum.TECHNICIAN)}:</span>
            <span className="stat-value">{users.filter(u => u.role === UserRoleEnum.TECHNICIAN).length}</span>
          </div>
        </div>

        <div className="users-grid">
          {loading ? (
            <div className="loading">
              <p>{t('common.loading') || 'Carregando...'}</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                  </div>
                </div>
                <div className="user-details">
                  <div className="detail-item">
                    <span className="detail-label">{language === 'pt-BR' ? 'Usuário' : 'Username'}:</span>
                    <span className="detail-value">{user.username}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{language === 'pt-BR' ? 'Função' : 'Role'}:</span>
                    <span
                      className="role-badge"
                      style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  {user.companyName && (
                    <div className="detail-item">
                      <span className="detail-label">{language === 'pt-BR' ? 'Empresa' : 'Company'}:</span>
                      <span className="detail-value">{user.companyName}</span>
                    </div>
                  )}
                </div>
                <div className="user-actions">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setShowForm(true);
                    }}
                    className="edit-button"
                  >
                    ✏️ {language === 'pt-BR' ? 'Editar' : 'Edit'}
                  </button>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="delete-button"
                    >
                      🗑️ {language === 'pt-BR' ? 'Excluir' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-users">
              <p>{language === 'pt-BR' ? 'Nenhum usuário encontrado' : 'No users found'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

