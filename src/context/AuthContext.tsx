import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types/user';
import { api, apiEndpoints } from '../services/api';
import { supabase, isSupabaseConfigured, handleSupabaseError } from '../services/supabase';
import { showToast } from '../utils/toast';
import { usersService } from '../services/usersService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock de usuários para fallback quando API não estiver disponível
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@blesspool.com',
    role: UserRole.ADMIN,
    name: 'Administrador',
    companyId: 'company-1',
    companyName: 'Bless Pool',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'supervisor',
    email: 'supervisor@blesspool.com',
    role: UserRole.SUPERVISOR,
    name: 'Supervisor',
    companyId: 'company-1',
    companyName: 'Bless Pool',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'tecnico',
    email: 'tecnico@blesspool.com',
    role: UserRole.TECHNICIAN,
    name: 'Técnico',
    companyId: 'company-1',
    companyName: 'Bless Pool',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isSupabaseConfigured()) {
        // Primeiro, tentar usar dados do localStorage como fallback rápido
        const savedUser = localStorage.getItem('blessPool_user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData); // Definir imediatamente para evitar flash de logout
          } catch (err) {
            console.warn('Erro ao carregar usuário do localStorage:', err);
          }
        }

        // Depois, verificar sessão do Supabase
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.warn('Erro ao buscar sessão:', sessionError);
            // Se houver erro mas temos dados no localStorage, manter logado
            if (savedUser) {
              setLoading(false);
              return;
            }
          }
          
          if (session?.user) {
            // Buscar dados completos do usuário da tabela users (se existir)
            let fullUserData: User | null = null;
            try {
              const { data: dbUser, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (!dbError && dbUser) {
                fullUserData = {
                  id: dbUser.id,
                  username: dbUser.username || session.user.email?.split('@')[0] || 'user',
                  email: dbUser.email || session.user.email || '',
                  role: (dbUser.role as UserRole) || (session.user.user_metadata?.role as UserRole) || UserRole.TECHNICIAN,
                  name: dbUser.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  companyId: dbUser.company_id || session.user.user_metadata?.company_id,
                  companyName: dbUser.company_name || session.user.user_metadata?.company_name,
                  createdAt: dbUser.created_at || session.user.created_at,
                  updatedAt: dbUser.updated_at || session.user.updated_at || session.user.created_at,
                };
              }
            } catch (err) {
              console.warn('Erro ao buscar dados completos do usuário:', err);
              // Se houver erro mas temos sessão válida, usar dados do Auth
            }

            // Usar dados da tabela users se disponível, senão usar metadata do Auth
            const userData: User = fullUserData || {
              id: session.user.id,
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as UserRole) || UserRole.TECHNICIAN,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              companyId: session.user.user_metadata?.company_id,
              companyName: session.user.user_metadata?.company_name,
              createdAt: session.user.created_at,
              updatedAt: session.user.updated_at || session.user.created_at,
            };
            
            setUser(userData);
            localStorage.setItem('blessPool_user', JSON.stringify(userData));
            if (session.session?.access_token) {
              localStorage.setItem('blessPool_token', session.session.access_token);
            }
          } else if (!savedUser) {
            // Só limpar se não houver sessão E não houver dados salvos
            clearAuth();
          }
        } catch (err) {
          console.error('Erro ao inicializar autenticação:', err);
          // Se houver erro mas temos dados no localStorage, manter logado
          if (!savedUser) {
            clearAuth();
          }
        }
        
        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          // Ignorar evento INITIAL_SESSION para evitar logout desnecessário
          if (event === 'INITIAL_SESSION' && !session) {
            // Se não houver sessão inicial mas temos dados salvos, manter logado
            const savedUser = localStorage.getItem('blessPool_user');
            if (savedUser) {
              try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                return;
              } catch (err) {
                console.warn('Erro ao carregar usuário salvo:', err);
              }
            }
            return;
          }

          if (session?.user) {
            // Buscar dados completos da tabela users (se existir)
            let fullUserData: User | null = null;
            try {
              const { data: dbUser, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (!dbError && dbUser) {
                fullUserData = {
                  id: dbUser.id,
                  username: dbUser.username || session.user.email?.split('@')[0] || 'user',
                  email: dbUser.email || session.user.email || '',
                  role: (dbUser.role as UserRole) || (session.user.user_metadata?.role as UserRole) || UserRole.TECHNICIAN,
                  name: dbUser.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  companyId: dbUser.company_id || session.user.user_metadata?.company_id,
                  companyName: dbUser.company_name || session.user.user_metadata?.company_name,
                  createdAt: dbUser.created_at || session.user.created_at,
                  updatedAt: dbUser.updated_at || session.user.updated_at || session.user.created_at,
                };
              }
            } catch (err) {
              console.warn('Erro ao buscar dados completos do usuário:', err);
            }

            // Usar dados da tabela users se disponível, senão usar metadata do Auth
            const userData: User = fullUserData || {
              id: session.user.id,
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as UserRole) || UserRole.TECHNICIAN,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              companyId: session.user.user_metadata?.company_id,
              companyName: session.user.user_metadata?.company_name,
              createdAt: session.user.created_at,
              updatedAt: session.user.updated_at || session.user.created_at,
            };
            setUser(userData);
            localStorage.setItem('blessPool_user', JSON.stringify(userData));
            if (session.session?.access_token) {
              localStorage.setItem('blessPool_token', session.session.access_token);
            }
          } else if (event === 'SIGNED_OUT') {
            // Só limpar quando realmente houver logout explícito
            clearAuth();
          }
        });

        // Limpar subscription ao desmontar
        return () => {
          subscription.unsubscribe();
        };
      } else {
        // Fallback: Verificar se há usuário salvo no localStorage
        const savedUser = localStorage.getItem('blessPool_user');
        const token = localStorage.getItem('blessPool_token');
        
        if (savedUser && token) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            api.setToken(token);
            validateToken();
          } catch (error) {
            console.error('Erro ao carregar usuário salvo:', error);
            clearAuth();
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const validateToken = async () => {
    try {
      // Tentar validar token com API
      const userData = await api.get<User>(apiEndpoints.auth.me);
      setUser(userData);
      localStorage.setItem('blessPool_user', JSON.stringify(userData));
    } catch (error) {
      // Se falhar, usar dados do localStorage (modo offline)
      console.warn('Não foi possível validar token, usando dados locais');
    }
  };

  const clearAuth = () => {
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('blessPool_user');
    localStorage.removeItem('blessPool_token');
    localStorage.removeItem('blessPool_refreshToken');
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured()) {
        let userEmail = username;
        
        // Se não for um email (não contém @), buscar na tabela users pelo username
        if (!username.includes('@')) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('email, username, name, role, company_id, company_name')
              .eq('username', username)
              .single();
            
            if (!userError && userData && userData.email) {
              userEmail = userData.email;
            } else {
              // Se não encontrou na tabela users, mostrar erro claro
              showToast.error('Username não encontrado. Use o email para fazer login ou verifique se o username está correto.');
              return false;
            }
          } catch (err) {
            // Se a tabela users não existir ou der erro, mostrar erro
            console.error('Erro ao buscar usuário por username:', err);
            showToast.error('Erro ao buscar usuário. Tente fazer login com o email.');
            return false;
          }
        }
        
        // Login com Supabase usando o email encontrado
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });

        if (error) throw error;
        if (!data.user || !data.session) return false;

        // Buscar dados completos do usuário na tabela users (se existir)
        let fullUserData: User | null = null;
        try {
          const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (!dbError && dbUser) {
            fullUserData = {
              id: dbUser.id,
              username: dbUser.username || data.user.email?.split('@')[0] || 'user',
              email: dbUser.email || data.user.email || '',
              role: (dbUser.role as UserRole) || (data.user.user_metadata?.role as UserRole) || UserRole.TECHNICIAN,
              name: dbUser.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              companyId: dbUser.company_id || data.user.user_metadata?.company_id,
              companyName: dbUser.company_name || data.user.user_metadata?.company_name,
              createdAt: dbUser.created_at || data.user.created_at,
              updatedAt: dbUser.updated_at || data.user.updated_at || data.user.created_at,
            };
          }
        } catch (err) {
          console.warn('Erro ao buscar dados completos do usuário:', err);
        }

        // Usar dados da tabela users se disponível, senão usar metadata do Auth
        const role = fullUserData?.role || (data.user.user_metadata?.role as UserRole) || UserRole.TECHNICIAN;
        const userData: User = fullUserData || {
          id: data.user.id,
          username: username, // Manter o username usado no login
          email: data.user.email || '',
          role: role,
          name: data.user.user_metadata?.name || username,
          companyId: data.user.user_metadata?.company_id,
          companyName: data.user.user_metadata?.company_name,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at || data.user.created_at,
        };

        setUser(userData);
        localStorage.setItem('blessPool_user', JSON.stringify(userData));
        localStorage.setItem('blessPool_token', data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem('blessPool_refreshToken', data.session.refresh_token);
        }

        showToast.success('Login realizado com sucesso!');
        return true;
      } else {
        // Tentar login via API tradicional
        const response = await api.post<{
          user: User;
          token: string;
          refreshToken?: string;
        }>(apiEndpoints.auth.login, { username, password });

        if (response && response.user && response.token) {
          setUser(response.user);
          api.setToken(response.token);
          localStorage.setItem('blessPool_user', JSON.stringify(response.user));
          
          if (response.refreshToken) {
            localStorage.setItem('blessPool_refreshToken', response.refreshToken);
          }
          
          showToast.success('Login realizado com sucesso!');
          return true;
        }
      }
    } catch (error) {
      // Se API não estiver disponível, usar modo mock (desenvolvimento)
      if (import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
        console.warn('API não disponível, usando autenticação mock');
        const foundUser = MOCK_USERS.find(u => u.username === username);
        
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('blessPool_user', JSON.stringify(foundUser));
          const mockToken = `mock_token_${Date.now()}`;
          api.setToken(mockToken);
          showToast.success('Login realizado (modo desenvolvimento)');
          return true;
        }
      }
      
      const errorMessage = error instanceof Error 
        ? handleSupabaseError(error) 
        : 'Erro ao fazer login';
      showToast.error(errorMessage);
      return false;
    }
    
    return false;
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        // Logout do Supabase
        await supabase.auth.signOut();
      } else {
        // Tentar logout via API tradicional
        await api.post(apiEndpoints.auth.logout);
      }
    } catch (error) {
      // Ignorar erros de logout (pode estar offline)
      console.warn('Erro ao fazer logout:', error);
    } finally {
      clearAuth();
      showToast.info('Logout realizado');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

