// Sistema de Cache para evitar múltiplas requisições - Melhorado para performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // em milissegundos
  accessCount: number;
  lastAccess: number;
}

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos padrão
  private maxSize = 100; // Limite máximo de itens no cache

  // Obter dados do cache - Melhorado com estatísticas de acesso
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccess = now;

    return entry.data as T;
  }

  // Salvar dados no cache - Melhorado com limpeza automática
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresIn = ttl || this.defaultTTL;
    const now = Date.now();
    
    // Se o cache está cheio, remover menos acessados
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresIn,
      accessCount: 0,
      lastAccess: now,
    });
  }

  // Limpeza automática - remove menos acessados e expirados
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remover expirados primeiro
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.expiresIn) {
        this.cache.delete(key);
      }
    });

    // Se ainda estiver cheio, remover menos acessados
    if (this.cache.size >= this.maxSize) {
      const sorted = entries
        .filter(([_, entry]) => now - entry.timestamp <= entry.expiresIn)
        .sort((a, b) => {
          if (a[1].accessCount !== b[1].accessCount) {
            return a[1].accessCount - b[1].accessCount;
          }
          return a[1].lastAccess - b[1].lastAccess;
        });

      const toRemove = sorted.slice(0, this.cache.size - this.maxSize + 1);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Invalidar cache específico
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  // Invalidar cache por padrão (ex: todas as keys que começam com "customers")
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
  }

  // Verificar se existe no cache (sem expirar)
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Obter tamanho do cache
  size(): number {
    return this.cache.size;
  }

  // Estatísticas do cache (útil para debug)
  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccesses: entries.reduce((sum, e) => sum + e.accessCount, 0),
      averageAccesses: entries.length > 0 
        ? entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length 
        : 0,
    };
  }
}

// Instância singleton
export const dataCache = new DataCache();

// Helper para criar chave de cache
export const createCacheKey = (prefix: string, ...params: (string | number | undefined)[]): string => {
  const validParams = params.filter(p => p !== undefined && p !== null);
  return `${prefix}:${validParams.join(':')}`;
};

// Helper para cache com função assíncrona
export const cachedAsync = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Verificar cache primeiro
  const cached = dataCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Executar função e cachear resultado
  const result = await fn();
  dataCache.set(key, result, ttl);
  return result;
};

