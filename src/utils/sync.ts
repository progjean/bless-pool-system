// Utilitário para sincronização automática e cache offline

interface SyncItem {
  id: string;
  type: 'image' | 'data';
  data: any;
  timestamp: number;
  synced: boolean;
}

class SyncManager {
  private queue: SyncItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Detectar mudanças de conectividade
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Carregar fila do localStorage
    this.loadQueue();

    // Iniciar sincronização automática
    this.startAutoSync();
  }

  private loadQueue() {
    const saved = localStorage.getItem('sync_queue');
    if (saved) {
      try {
        this.queue = JSON.parse(saved);
      } catch (error) {
        console.error('Erro ao carregar fila de sincronização:', error);
        this.queue = [];
      }
    }
  }

  private saveQueue() {
    localStorage.setItem('sync_queue', JSON.stringify(this.queue));
  }

  addToQueue(item: Omit<SyncItem, 'synced' | 'timestamp'>) {
    const syncItem: SyncItem = {
      ...item,
      timestamp: Date.now(),
      synced: false,
    };

    this.queue.push(syncItem);
    this.saveQueue();

    // Tentar sincronizar imediatamente se online
    if (this.isOnline) {
      this.syncQueue();
    }
  }

  private async syncQueue() {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    const itemsToSync = this.queue.filter(item => !item.synced);

    for (const item of itemsToSync) {
      try {
        // Aqui você faria a chamada à API real
        // await fetch('/api/sync', { method: 'POST', body: JSON.stringify(item) });
        
        // Simulação de sincronização
        await new Promise(resolve => setTimeout(resolve, 100));
        
        item.synced = true;
        console.log(`Item ${item.id} sincronizado com sucesso`);
      } catch (error) {
        console.error(`Erro ao sincronizar item ${item.id}:`, error);
        // Em caso de erro, mantém na fila para tentar novamente
      }
    }

    // Remover itens sincronizados
    this.queue = this.queue.filter(item => !item.synced);
    this.saveQueue();
  }

  private startAutoSync() {
    // Sincronizar a cada 30 segundos quando online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncQueue();
      }
    }, 30000);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(item => !item.synced).length,
      synced: this.queue.filter(item => item.synced).length,
      isOnline: this.isOnline,
    };
  }
}

export const syncManager = new SyncManager();

// Função helper para cache de imagens
export const cacheImage = (imageData: string, id?: string): string => {
  const imageId = id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Adicionar à fila de sincronização
  syncManager.addToQueue({
    id: imageId,
    type: 'image',
    data: imageData,
  });

  return imageId;
};

// Função para verificar status de sincronização
export const getSyncStatus = () => {
  return syncManager.getQueueStatus();
};

