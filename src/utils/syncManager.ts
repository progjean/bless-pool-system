// Sistema de sincronização automática robusto

import {
  saveOfflineAction,
  getPendingActions,
  markActionAsSynced,
  removeSyncedActions,
  updateSyncStatus,
  getSyncStatus,
} from './offlineStorage';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

class SyncManager {
  private syncInterval: number | null = null;
  private isSyncing: boolean = false;

  startAutoSync(intervalMs: number = 30000): void {
    // Sincronizar imediatamente se houver ações pendentes
    if (navigator.onLine) {
      this.sync();
    }

    // Configurar sincronização automática
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.sync();
      }
    }, intervalMs);

    // Sincronizar quando voltar online
    window.addEventListener('online', () => {
      console.log('Conexão restaurada. Iniciando sincronização...');
      this.sync();
    });
  }

  stopAutoSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync(): Promise<SyncResult> {
    if (!navigator.onLine) {
      console.log('Offline. Sincronização cancelada.');
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Sem conexão com a internet'],
      };
    }

    if (this.isSyncing) {
      console.log('Sincronização já em andamento.');
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Sincronização já em andamento'],
      };
    }

    this.isSyncing = true;
    const pendingActions = getPendingActions();
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    console.log(`Iniciando sincronização de ${pendingActions.length} ações pendentes...`);

    for (const action of pendingActions) {
      try {
        await this.syncAction(action);
        markActionAsSynced(action.id);
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Erro ao sincronizar ação ${action.id}: ${error}`);
        console.error(`Erro ao sincronizar ação ${action.id}:`, error);
      }
    }

    // Remover ações sincronizadas
    if (result.synced > 0) {
      removeSyncedActions();
      updateSyncStatus(new Date().toISOString());
    }

    this.isSyncing = false;

    if (result.synced > 0) {
      console.log(`Sincronização concluída: ${result.synced} ações sincronizadas, ${result.failed} falhas.`);
    }

    return result;
  }

  private async syncAction(action: any): Promise<void> {
    // Em produção, aqui faria a chamada real à API
    // Por enquanto, simulação
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular sucesso 95% das vezes
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('Erro de rede simulado'));
        }
      }, 500);
    });
  }

  getStatus(): { isOnline: boolean; lastSync: string | null; pendingActions: number } {
    const status = getSyncStatus();
    const pending = getPendingActions().length;
    
    return {
      isOnline: status.isOnline,
      lastSync: status.lastSync,
      pendingActions: pending,
    };
  }
}

export const syncManager = new SyncManager();

