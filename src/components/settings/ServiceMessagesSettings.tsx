import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ServiceMessage, DEFAULT_SERVICE_MESSAGES } from '../../types/serviceMessages';
import { settingsService } from '../../services/settingsService';
import { showToast } from '../../utils/toast';
import './ServiceMessagesSettings.css';

export const ServiceMessagesSettings: React.FC = () => {
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
        showToast.success(t('settings.deleted') || 'Mensagem deletada!');
      } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        // Fallback: deletar localmente
        setMessages(prev => prev.filter(m => m.id !== id));
        localStorage.setItem('serviceMessages', JSON.stringify(messages.filter(m => m.id !== id)));
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
        const updated: ServiceMessage = {
          ...editingMessage,
          title: formData.title,
          content: formData.content,
          updatedAt: new Date().toISOString(),
        };
        await settingsService.saveServiceMessage(updated);
        setMessages(prev => prev.map(m => m.id === editingMessage.id ? updated : m));
      } else {
        const newMessage: ServiceMessage = {
          id: `msg_${Date.now()}`,
          title: formData.title,
          content: formData.content,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const saved = await settingsService.saveServiceMessage(newMessage);
        setMessages(prev => [...prev, saved]);
      }

      setShowForm(false);
      setEditingMessage(null);
      setFormData({ title: '', content: '' });
      showToast.success(t('settings.saved') || 'Mensagem salva!');
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      // Fallback: salvar localmente
      if (editingMessage) {
        setMessages(prev => prev.map(m => 
          m.id === editingMessage.id 
            ? { ...m, title: formData.title, content: formData.content, updatedAt: new Date().toISOString() }
            : m
        ));
      } else {
        const newMessage: ServiceMessage = {
          id: `msg_${Date.now()}`,
          title: formData.title,
          content: formData.content,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessage]);
      }
      localStorage.setItem('serviceMessages', JSON.stringify(messages));
      setShowForm(false);
      setEditingMessage(null);
      setFormData({ title: '', content: '' });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMessage(null);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="service-messages-settings">
      <div className="settings-section-header">
        <h2>{language === 'pt-BR' ? 'Mensagens Padrão de Serviço' : 'Default Service Messages'}</h2>
        <p className="section-description">
          {language === 'pt-BR' 
            ? 'Configure mensagens pré-definidas para envio aos clientes após a conclusão do serviço'
            : 'Configure predefined messages to send to clients after service completion'}
        </p>
      </div>

      <div className="messages-controls">
        <button onClick={handleAddNew} className="add-message-button">
          + {language === 'pt-BR' ? 'Nova Mensagem' : 'New Message'}
        </button>
      </div>

      {showForm && (
        <div className="message-form-section">
          <h3>{editingMessage ? (language === 'pt-BR' ? 'Editar Mensagem' : 'Edit Message') : (language === 'pt-BR' ? 'Nova Mensagem' : 'New Message')}</h3>
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
        {messages.map((message) => (
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
                <button onClick={() => handleDelete(message.id)} className="delete-button">
                  🗑️ {language === 'pt-BR' ? 'Excluir' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

