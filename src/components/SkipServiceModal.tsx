import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SkipServiceModal.css';

interface SkipServiceModalProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
}

export const SkipServiceModal: React.FC<SkipServiceModalProps> = ({
  clientId,
  clientName,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [sendVia, setSendVia] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Por favor, informe o motivo para pular o serviço.');
      return;
    }

    setSending(true);

    try {
      // Salvar motivo do skip
      const skipData = {
        clientId,
        clientName,
        reason,
        timestamp: new Date().toISOString(),
        sentVia: sendVia,
      };

      localStorage.setItem(`skip_${clientId}`, JSON.stringify(skipData));

      // Simular envio
      console.log(`Enviando motivo via ${sendVia}...`, skipData);

      // Em produção, aqui faria a chamada à API para enviar:
      // - Email: usando serviço de e-mail (SendGrid, AWS SES, etc.)
      // - SMS: usando serviço de SMS (Twilio, AWS SNS, etc.)
      // - WhatsApp: usando API do WhatsApp Business ou Twilio

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação

      alert(`Motivo registrado e enviado via ${sendVia.toUpperCase()} ao cliente.`);
      
      // Voltar para Work Area
      navigate('/work');
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="skip-modal-overlay" onClick={onClose}>
      <div className="skip-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="skip-modal-header">
          <h2>Pular Serviço</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="skip-modal-content">
          <p className="client-name">Cliente: <strong>{clientName}</strong></p>
          
          <div className="form-group">
            <label htmlFor="reason">Motivo para pular o serviço *</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo para pular este serviço..."
              rows={4}
              className="reason-textarea"
            />
          </div>

          <div className="form-group">
            <label>Enviar notificação via:</label>
            <div className="send-via-options">
              <label className="send-via-option">
                <input
                  type="radio"
                  value="email"
                  checked={sendVia === 'email'}
                  onChange={(e) => setSendVia(e.target.value as 'email')}
                />
                <span>📧 E-mail</span>
              </label>
              <label className="send-via-option">
                <input
                  type="radio"
                  value="sms"
                  checked={sendVia === 'sms'}
                  onChange={(e) => setSendVia(e.target.value as 'sms')}
                />
                <span>💬 SMS</span>
              </label>
              <label className="send-via-option">
                <input
                  type="radio"
                  value="whatsapp"
                  checked={sendVia === 'whatsapp'}
                  onChange={(e) => setSendVia(e.target.value as 'whatsapp')}
                />
                <span>💚 WhatsApp</span>
              </label>
            </div>
          </div>
        </div>

        <div className="skip-modal-actions">
          <button onClick={onClose} className="cancel-button">
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            className="confirm-button"
            disabled={sending || !reason.trim()}
          >
            {sending ? 'Enviando...' : 'Confirmar e Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
};

