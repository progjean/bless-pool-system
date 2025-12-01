import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ServiceMessage, DEFAULT_SERVICE_MESSAGES } from '../types/serviceMessages';
import { settingsService } from '../services/settingsService';
import { showToast } from '../utils/toast';
import './ServiceMessagesPage.css';

export const ServiceMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ServiceMessage[]>([]);
  const [editingMessage, setEditingMessage] = useState<ServiceMessage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getServiceMessages();
        setMessages(data.length > 0 ? data : DEFAULT_SERVICE_MESSAGES);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        // Fallback para defaults
        setMessages(DEFAULT_SERVICE_MESSAGES);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const handleSave = async () => {
    // As mensagens já são salvas individualmente, mas podemos manter este método para compatibilidade
    showToast.success(language === 'pt-BR' ? 'Mensagens já estão salvas!' : 'Messages are already saved!');
  };

  const handleEdit = (message: ServiceMessage) => {
    setEditingMessage(message);
    setFormData({ title: message.title, content: message.content });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'pt-BR' ? 'Tem certeza que deseja excluir esta mensagem?' : 'Are you sure you want to delete this message?')) {
      try {
        await settingsService.deleteServiceMessage(id);
        setMessages(prev => prev.filter(m => m.id !== id));
        showToast.success(language === 'pt-BR' ? 'Mensagem deletada!' : 'Message deleted!');
      } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        // Fallback: deletar localmente
        setMessages(prev => prev.filter(m => m.id !== id));
        showToast.error(language === 'pt-BR' ? 'Erro ao deletar mensagem' : 'Error deleting message');
      }
    }
  };

  const handleAddNew = () => {
    setEditingMessage(null);
    setFormData({ title: '', content: '' });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast.error(language === 'pt-BR' ? 'Preencha todos os campos.' : 'Please fill in all fields.');
      return;
    }

    try {
      if (editingMessage) {
        const updated = await settingsService.saveServiceMessage({
          ...editingMessage,
          title: formData.title,
          content: formData.content,
        });
        setMessages(prev => prev.map(m => m.id === editingMessage.id ? updated : m));
        showToast.success(language === 'pt-BR' ? 'Mensagem atualizada!' : 'Message updated!');
      } else {
        const newMessage = await settingsService.saveServiceMessage({
          id: `msg_${Date.now()}`,
          title: formData.title,
          content: formData.content,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setMessages(prev => [...prev, newMessage]);
        showToast.success(language === 'pt-BR' ? 'Mensagem criada!' : 'Message created!');
      }

      setShowForm(false);
      setEditingMessage(null);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      showToast.error(language === 'pt-BR' ? 'Erro ao salvar mensagem' : 'Error saving message');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMessage(null);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="service-messages-page">
      <header className="messages-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/admin/settings')} className="back-button">
              ← {t('common.back')}
            </button>
            <h1>{language === 'pt-BR' ? 'Mensagens Padrão de Serviço' : 'Default Service Messages'}</h1>
            <p>{language === 'pt-BR' ? 'Configure mensagens pré-definidas para envio aos clientes após a conclusão do serviço' : 'Configure predefined messages to send to clients after service completion'}</p>
          </div>
        </div>
      </header>

      <main className="messages-main">
        <div className="messages-controls">
          <button onClick={handleAddNew} className="add-message-button">
            + {language === 'pt-BR' ? 'Nova Mensagem' : 'New Message'}
          </button>
          <button onClick={handleSave} className="save-all-button">
            💾 {language === 'pt-BR' ? 'Salvar Todas' : 'Save All'}
          </button>
        </div>

        {showForm && (
          <div className="message-form-section">
            <h2>{editingMessage ? (language === 'pt-BR' ? 'Editar Mensagem' : 'Edit Message') : (language === 'pt-BR' ? 'Nova Mensagem' : 'New Message')}</h2>
            <form onSubmit={handleFormSubmit} className="message-form">
              <div className="form-group">
                <label>{language === 'pt-BR' ? 'Título' : 'Title'} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder={language === 'pt-BR' ? 'Ex: Serviço Completo Padrão' : 'Ex: Standard Complete Service'}
                />
              </div>
              <div className="form-group">
                <label>{language === 'pt-BR' ? 'Conteúdo' : 'Content'} *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                  rows={6}
                  placeholder={language === 'pt-BR' ? 'Digite a mensagem que será enviada ao cliente...' : 'Enter the message that will be sent to the client...'}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-button">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="save-button">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="messages-list">
          {loading ? (
            <div className="loading">
              <p>{language === 'pt-BR' ? 'Carregando mensagens...' : 'Loading messages...'}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="no-messages">
              <p>{language === 'pt-BR' ? 'Nenhuma mensagem encontrada' : 'No messages found'}</p>
            </div>
          ) : (
            messages.map((message) => (
            <div key={message.id} className="message-card">
              <div className="message-header">
                <h3>{message.title}</h3>
                {message.isDefault && (
                  <span className="default-badge">{language === 'pt-BR' ? 'Padrão' : 'Default'}</span>
                )}
              </div>
              <div className="message-content">
                <p>{message.content}</p>
              </div>
              <div className="message-footer">
                <span className="message-date">
                  {language === 'pt-BR' ? 'Criada em' : 'Created'}: {new Date(message.createdAt).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                </span>
                <div className="message-actions">
                  <button onClick={() => handleEdit(message)} className="edit-button">
                    ✏️ {language === 'pt-BR' ? 'Editar' : 'Edit'}
                  </button>
                  {!message.isDefault && (
                    <button onClick={() => handleDelete(message.id)} className="delete-button">
                      🗑️ {language === 'pt-BR' ? 'Excluir' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

