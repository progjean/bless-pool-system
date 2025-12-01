import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { User, UserRole } from '../../types/user';
import { showToast } from '../../utils/toast';
import './UserFormModal.css';

interface UserFormModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    role: user?.role || UserRole.TECHNICIAN,
    companyName: user?.companyName || '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        role: user.role || UserRole.TECHNICIAN,
        companyName: user.companyName || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim()) {
      showToast.error(language === 'pt-BR' ? 'Preencha todos os campos obrigatórios' : 'Fill in all required fields');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast.error(language === 'pt-BR' ? 'Email inválido' : 'Invalid email');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      // O toast já é mostrado pelo serviço
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: language === 'pt-BR' ? 'Administrador' : 'Admin',
      [UserRole.SUPERVISOR]: language === 'pt-BR' ? 'Supervisor' : 'Supervisor',
      [UserRole.TECHNICIAN]: language === 'pt-BR' ? 'Técnico' : 'Technician',
    };
    return labels[role];
  };

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isEditing
              ? language === 'pt-BR' ? 'Editar Usuário' : 'Edit User'
              : language === 'pt-BR' ? 'Novo Usuário' : 'New User'}
          </h2>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-section">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>
                  {language === 'pt-BR' ? 'Nome Completo' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder={language === 'pt-BR' ? 'Digite o nome completo' : 'Enter full name'}
                />
              </div>

              <div className="form-group">
                <label>
                  {language === 'pt-BR' ? 'Email' : 'Email'} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  placeholder={language === 'pt-BR' ? 'usuario@exemplo.com' : 'user@example.com'}
                />
              </div>

              <div className="form-group">
                <label>
                  {language === 'pt-BR' ? 'Nome de Usuário' : 'Username'} *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                  required
                  placeholder={language === 'pt-BR' ? 'nomeusuario' : 'username'}
                />
              </div>

              <div className="form-group">
                <label>
                  {language === 'pt-BR' ? 'Função' : 'Role'} *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value as UserRole,
                    }))
                  }
                  required
                >
                  <option value={UserRole.ADMIN}>{getRoleLabel(UserRole.ADMIN)}</option>
                  <option value={UserRole.SUPERVISOR}>
                    {getRoleLabel(UserRole.SUPERVISOR)}
                  </option>
                  <option value={UserRole.TECHNICIAN}>
                    {getRoleLabel(UserRole.TECHNICIAN)}
                  </option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>
                  {language === 'pt-BR' ? 'Empresa' : 'Company'} (opcional)
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder={language === 'pt-BR' ? 'Nome da empresa' : 'Company name'}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              {language === 'pt-BR' ? 'Cancelar' : 'Cancel'}
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading
                ? language === 'pt-BR' ? 'Salvando...' : 'Saving...'
                : language === 'pt-BR' ? 'Salvar' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

