import React, { useState, useEffect } from 'react';
import { syncManager } from '../utils/syncManager';
import './SyncStatus.css';

export const SyncStatus: React.FC = () => {
  const [status, setStatus] = useState(syncManager.getStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Atualizar status a cada 5 segundos
    const interval = setInterval(() => {
      setStatus(syncManager.getStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncManager.sync();
      setStatus(syncManager.getStatus());
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`sync-status ${status.isOnline ? 'online' : 'offline'}`}>
      <div className="sync-indicator">
        <span className="status-dot" />
        <span className="status-text">
          {status.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {status.pendingActions > 0 && (
        <div className="pending-actions">
          <span className="pending-count">{status.pendingActions}</span>
          <span className="pending-label">ações pendentes</span>
        </div>
      )}

      {status.lastSync && (
        <div className="last-sync">
          Última sincronização: {new Date(status.lastSync).toLocaleTimeString('pt-BR')}
        </div>
      )}

      {status.pendingActions > 0 && status.isOnline && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="sync-button"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </button>
      )}
    </div>
  );
};
