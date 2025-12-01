// Sistema melhorado de sincronização offline
import { showToast } from './toast';

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  service: string;
  method: string;
  params: any[];
  timestamp: number;
  retries: number;
}

class OfflineSyncManager {
  private pendingActions: PendingAction[] = [];
  private maxRetries = 3;
  private syncInterval: number | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    // Escutar mudanças de conectividade
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingActions();
      showToast.success('Conexão restaurada. Sincronizando...');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      showToast.info('Modo offline ativado. As ações serão sincronizadas quando a conexão for restaurada.');
    });

    // Carregar ações pendentes do localStorage
    this.loadPendingActions();

    // Iniciar sincronização periódica
    this.startPeriodicSync();
  }

  // Adicionar ação pendente
  addPendingAction(
    service: string,
    method: string,
    type: 'create' | 'update' | 'delete',
    ...params: any[]
  ): string {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const action: PendingAction = {
      id: actionId,
      type,
      service,
      method,
      params,
      timestamp: Date.now(),
      retries: 0,
    };

    this.pendingActions.push(action);
    this.savePendingActions();

    // Tentar sincronizar imediatamente se online
    if (this.isOnline) {
      this.syncPendingActions();
    }

    return actionId;
  }

  // Sincronizar ações pendentes
  async syncPendingActions(): Promise<void> {
    if (!this.isOnline || this.pendingActions.length === 0) {
      return;
    }

    const actionsToSync = [...this.pendingActions];
    
    for (const action of actionsToSync) {
      try {
        await this.executeAction(action);
        
        // Remover ação bem-sucedida
        this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
        this.savePendingActions();
      } catch (error) {
        console.error(`Erro ao sincronizar ação ${action.id}:`, error);
        
        action.retries++;
        
        // Se excedeu tentativas, remover ou manter para retry manual
        if (action.retries >= this.maxRetries) {
          console.warn(`Ação ${action.id} excedeu tentativas máximas`);
          // Opcional: mover para uma fila de falhas
        }
      }
    }
  }

  // Executar ação individual
  private async executeAction(action: PendingAction): Promise<void> {
    // Importar serviço dinamicamente
    const serviceModule = await import(`../services/${action.service}`);
    const service = serviceModule[`${action.service.replace('Service', '')}Service`];
    
    if (!service || !service[action.method]) {
      throw new Error(`Serviço ou método não encontrado: ${action.service}.${action.method}`);
    }

    // Executar método do serviço
    await service[action.method](...action.params);
  }

  // Salvar ações pendentes no localStorage
  private savePendingActions(): void {
    try {
      localStorage.setItem('offlinePendingActions', JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('Erro ao salvar ações pendentes:', error);
    }
  }

  // Carregar ações pendentes do localStorage
  private loadPendingActions(): void {
    try {
      const saved = localStorage.getItem('offlinePendingActions');
      if (saved) {
        this.pendingActions = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar ações pendentes:', error);
      this.pendingActions = [];
    }
  }

  // Iniciar sincronização periódica
  private startPeriodicSync(): void {
    // Sincronizar a cada 30 segundos quando online
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && this.pendingActions.length > 0) {
        this.syncPendingActions();
      }
    }, 30000);
  }

  // Parar sincronização periódica
  stopPeriodicSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Obter ações pendentes
  getPendingActions(): PendingAction[] {
    return [...this.pendingActions];
  }

  // Limpar ações pendentes
  clearPendingActions(): void {
    this.pendingActions = [];
    this.savePendingActions();
  }

  // Verificar se está online
  isOnlineNow(): boolean {
    return this.isOnline;
  }
}

// Instância singleton
export const offlineSyncManager = new OfflineSyncManager();

// Helper para executar ação com sincronização offline
export const executeWithOfflineSync = async <T>(
  service: string,
  method: string,
  type: 'create' | 'update' | 'delete',
  ...params: any[]
): Promise<T> => {
  if (offlineSyncManager.isOnlineNow()) {
    try {
      // Tentar executar diretamente
      const serviceModule = await import(`../services/${service}`);
      const serviceInstance = serviceModule[`${service.replace('Service', '')}Service`];
      
      if (!serviceInstance || !serviceInstance[method]) {
        throw new Error(`Serviço ou método não encontrado`);
      }

      return await serviceInstance[method](...params);
    } catch (error) {
      // Se falhar e estiver offline, adicionar à fila
      if (!offlineSyncManager.isOnlineNow()) {
        offlineSyncManager.addPendingAction(service, method, type, ...params);
        throw error;
      }
      throw error;
    }
  } else {
    // Adicionar à fila de sincronização
    offlineSyncManager.addPendingAction(service, method, type, ...params);
    throw new Error('Modo offline. Ação será sincronizada quando a conexão for restaurada.');
  }
};

