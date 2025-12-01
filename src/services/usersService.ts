import { supabase, isSupabaseConfigured, handleSupabaseError, isTableNotFoundError } from './supabase';
import { User, UserRole } from '../types/user';
import { cachedAsync, createCacheKey, dataCache } from '../utils/cache';
import { showToast } from '../utils/toast';

const supabaseToUser = (row: any): User => ({
  id: row.id,
  username: row.username || row.email?.split('@')[0] || 'user',
  email: row.email || '',
  role: (row.role || row.user_metadata?.role) as UserRole || UserRole.TECHNICIAN,
  name: row.name || row.user_metadata?.name || row.email?.split('@')[0] || 'User',
  companyId: row.company_id || row.user_metadata?.company_id,
  companyName: row.company_name || row.user_metadata?.company_name,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
});

export const usersService = {
  // Listar todos os usuários (apenas ADMIN)
  async list(): Promise<User[]> {
    const cacheKey = createCacheKey('users', 'list');
    
    return cachedAsync(cacheKey, async () => {
      if (!isSupabaseConfigured()) {
        // Fallback para localStorage
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
      }

      try {
        // Buscar da tabela users
        const { data: usersData, error: tableError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (tableError) {
          console.warn('⚠️ Erro ao buscar da tabela users:', tableError);
        }

        // Se encontrou dados na tabela users, retornar
        if (usersData && usersData.length > 0) {
          return usersData.map(row => supabaseToUser(row));
        }

        // Se a tabela está vazia ou não existe, tentar sincronizar usuários do Auth
        // Isso acontece quando usuários são criados diretamente no Auth mas não na tabela users
        console.warn('⚠️ Tabela users vazia. Usuários do Auth precisam ser sincronizados.');
        console.warn('⚠️ Execute o script sync_auth_users.sql no Supabase SQL Editor para sincronizar.');
        
        // Retornar array vazio se não encontrou nada
        return [];
      } catch (error: any) {
        // Se a tabela não existe ou não tem permissão, usar fallback
        if (isTableNotFoundError(error)) {
          console.warn('⚠️ Tabela users não encontrada no Supabase. Usando fallback para localStorage.');
          const saved = localStorage.getItem('users');
          return saved ? JSON.parse(saved) : [];
        }
        const errorMessage = handleSupabaseError(error);
        console.error('Erro ao carregar usuários:', errorMessage);
        // Não mostrar toast para evitar spam
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
      }
    }, 5 * 60 * 1000); // Cache por 5 minutos
  },

  // Listar técnicos vinculados a um supervisor/company
  async getTechnicians(companyId?: string): Promise<User[]> {
    const cacheKey = createCacheKey('users', 'technicians', companyId);
    
    return cachedAsync(cacheKey, async () => {
      if (!isSupabaseConfigured()) {
        // Fallback: retornar mock technicians
        const saved = localStorage.getItem('users');
        const allUsers = saved ? JSON.parse(saved) : [];
        return allUsers.filter((u: User) => u.role === UserRole.TECHNICIAN);
      }

      try {
        const allUsers = await this.list();
        // Filtrar apenas técnicos da mesma empresa
        return allUsers.filter(user => {
          if (user.role !== UserRole.TECHNICIAN) return false;
          if (companyId) {
            return user.companyId === companyId;
          }
          return true;
        });
      } catch (error: any) {
        console.error('Erro ao carregar técnicos:', error);
        // Fallback
        const saved = localStorage.getItem('users');
        const allUsers = saved ? JSON.parse(saved) : [];
        return allUsers.filter((u: User) => u.role === UserRole.TECHNICIAN);
      }
    }, 5 * 60 * 1000);
  },

  // Buscar usuário por ID
  async get(id: string): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('users');
      const users = saved ? JSON.parse(saved) : [];
      return users.find((u: User) => u.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // Se não encontrar na tabela users, retornar null
        return null;
      }

      return data ? supabaseToUser(data) : null;
    } catch (error: any) {
      if (isTableNotFoundError(error)) {
        const saved = localStorage.getItem('users');
        const users = saved ? JSON.parse(saved) : [];
        return users.find((u: User) => u.id === id) || null;
      }
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  // Criar usuário
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!isSupabaseConfigured()) {
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const saved = localStorage.getItem('users');
      const users = saved ? JSON.parse(saved) : [];
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      return newUser;
    }

    try {
      // Criar usuário na tabela users
      const newUserData = {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        company_id: userData.companyId,
        company_name: userData.companyName,
      };

      const { data, error } = await supabase
        .from('users')
          .insert(newUserData as any)
        .select()
        .single();

      if (error) throw error;

      const newUser: User = supabaseToUser(data);

      // Invalidar cache
      dataCache.invalidatePattern('^users:');

      showToast.success('Usuário criado com sucesso!');
      return newUser;
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao criar usuário: ${errorMessage}`);
      throw error;
    }
  },

  // Atualizar usuário
  async update(id: string, userData: Partial<User>): Promise<User> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('users');
      const users = saved ? JSON.parse(saved) : [];
      const index = users.findIndex((u: User) => u.id === id);
      if (index === -1) throw new Error('Usuário não encontrado');
      
      const updated = {
        ...users[index],
        ...userData,
        updatedAt: new Date().toISOString(),
      };
      users[index] = updated;
      localStorage.setItem('users', JSON.stringify(users));
      return updated;
    }

    try {
      // Atualizar usuário na tabela users
      const updateData: any = {};
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.companyId !== undefined) updateData.company_id = userData.companyId;
      if (userData.companyName !== undefined) updateData.company_name = userData.companyName;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.username !== undefined) updateData.username = userData.username;

      // Atualizar updated_at
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
          .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updated: User = supabaseToUser(data);

      // Tentar sincronizar para auth.users via função RPC (se existir)
      // Isso garante que as alterações persistam após logout/login
      try {
        await supabase.rpc('sync_users_to_auth', { user_id: id }).catch(() => {
          // Se a função RPC não existir, não é crítico - o trigger SQL deve cuidar disso
          console.warn('Função sync_users_to_auth não encontrada. Certifique-se de executar sync_users_to_auth.sql');
        });
      } catch (rpcError) {
        // Ignorar erros da RPC - o trigger SQL deve cuidar da sincronização
        console.warn('Erro ao sincronizar para auth.users:', rpcError);
      }

      // Invalidar cache
      dataCache.invalidatePattern('^users:');
      dataCache.invalidate(createCacheKey('users', id));

      showToast.success('Usuário atualizado com sucesso!');
      return updated;
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao atualizar usuário: ${errorMessage}`);
      throw error;
    }
  },

  // Deletar usuário
  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('users');
      const users = saved ? JSON.parse(saved) : [];
      const filtered = users.filter((u: User) => u.id !== id);
      localStorage.setItem('users', JSON.stringify(filtered));
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidar cache
      dataCache.invalidatePattern('^users:');
      dataCache.invalidate(createCacheKey('users', id));

      showToast.success('Usuário deletado com sucesso!');
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao deletar usuário: ${errorMessage}`);
      throw error;
    }
  },
};

