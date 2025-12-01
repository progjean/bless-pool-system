// API Service - Centralizado para todas as chamadas de API
// Em produção, substituir URLs mockadas por endpoints reais

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Carregar token do localStorage se existir
    this.token = localStorage.getItem('blessPool_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('blessPool_token', token);
    } else {
      localStorage.removeItem('blessPool_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Se não autorizado, tentar refresh token
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Tentar novamente com novo token
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          
          if (!retryResponse.ok) {
            throw await this.handleError(retryResponse);
          }
          
          return await retryResponse.json();
        } else {
          // Se refresh falhou, fazer logout
          this.setToken(null);
          localStorage.removeItem('blessPool_user');
          window.location.href = '/login';
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
      }

      if (!response.ok) {
        throw await this.handleError(response);
      }

      // Se resposta vazia, retornar true
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return true as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido na requisição');
    }
  }

  private async handleError(response: Response): Promise<ApiError> {
    let error: ApiError;
    
    try {
      const data = await response.json();
      error = {
        message: data.message || 'Erro na requisição',
        status: response.status,
        code: data.code,
      };
    } catch {
      error = {
        message: `Erro ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return error;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('blessPool_refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.setToken(data.token);
      if (data.refreshToken) {
        localStorage.setItem('blessPool_refreshToken', data.refreshToken);
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload de arquivos
  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(true as T);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }

      xhr.send(formData);
    });
  }
}

// Instância singleton
export const api = new ApiService(API_BASE_URL);

// Endpoints específicos
export const apiEndpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  // Customers
  customers: {
    list: '/customers',
    get: (id: string) => `/customers/${id}`,
    create: '/customers',
    update: (id: string) => `/customers/${id}`,
    delete: (id: string) => `/customers/${id}`,
  },
  // Invoices
  invoices: {
    list: '/invoices',
    get: (id: string) => `/invoices/${id}`,
    create: '/invoices',
    update: (id: string) => `/invoices/${id}`,
    delete: (id: string) => `/invoices/${id}`,
    send: (id: string) => `/invoices/${id}/send`,
    preview: (id: string) => `/invoices/${id}/preview`,
  },
  // Work Orders
  workOrders: {
    list: '/work-orders',
    get: (id: string) => `/work-orders/${id}`,
    create: '/work-orders',
    update: (id: string) => `/work-orders/${id}`,
    delete: (id: string) => `/work-orders/${id}`,
    execute: (id: string) => `/work-orders/${id}/execute`,
  },
  // Services
  services: {
    create: '/services',
    get: (id: string) => `/services/${id}`,
    complete: (id: string) => `/services/${id}/complete`,
  },
  // Inventory
  inventory: {
    products: '/inventory/products',
    transactions: '/inventory/transactions',
  },
  // Settings
  settings: {
    readings: '/settings/readings',
    dosages: '/settings/dosages',
    products: '/settings/products',
  },
};

