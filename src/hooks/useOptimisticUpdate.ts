// Hook para optimistic updates
import { useState, useCallback } from 'react';
import { showToast } from '../utils/toast';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  rollbackOnError?: boolean;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (optimisticData: T) => {
    // Salvar estado anterior para rollback
    const previousData = data;
    
    // Atualizar UI imediatamente (optimistic)
    setData(optimisticData);
    setIsUpdating(true);
    setError(null);

    try {
      // Executar atualização real
      const result = await updateFn(optimisticData);
      
      // Atualizar com dados reais do servidor
      setData(result);
      setIsUpdating(false);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      setIsUpdating(false);

      // Rollback se configurado
      if (options.rollbackOnError !== false) {
        setData(previousData);
        showToast.error('Erro ao atualizar. Alterações revertidas.');
      }

      if (options.onError) {
        options.onError(error);
      }

      throw error;
    }
  }, [data, updateFn, options]);

  return {
    data,
    update,
    isUpdating,
    error,
  };
}

// Hook específico para listas
export function useOptimisticList<T extends { id: string }>(
  initialList: T[],
  createFn?: (item: Omit<T, 'id'>) => Promise<T>,
  updateFn?: (id: string, item: Partial<T>) => Promise<T>,
  deleteFn?: (id: string) => Promise<void>
) {
  const [list, setList] = useState<T[]>(initialList);
  const [isUpdating, setIsUpdating] = useState(false);

  const addItem = useCallback(async (newItem: Omit<T, 'id'>) => {
    if (!createFn) {
      throw new Error('Função de criação não fornecida');
    }

    // Criar item temporário
    const tempId = `temp_${Date.now()}`;
    const tempItem = { ...newItem, id: tempId } as T;
    
    // Adicionar à lista imediatamente
    setList(prev => [...prev, tempItem]);
    setIsUpdating(true);

    try {
      // Criar no servidor
      const created = await createFn(newItem);
      
      // Substituir item temporário pelo real
      setList(prev => prev.map(item => item.id === tempId ? created : item));
      setIsUpdating(false);
      
      return created;
    } catch (error) {
      // Remover item temporário em caso de erro
      setList(prev => prev.filter(item => item.id !== tempId));
      setIsUpdating(false);
      throw error;
    }
  }, [createFn]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    if (!updateFn) {
      throw new Error('Função de atualização não fornecida');
    }

    // Salvar estado anterior
    const previousItem = list.find(item => item.id === id);
    if (!previousItem) return;

    // Atualizar imediatamente
    setList(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    setIsUpdating(true);

    try {
      // Atualizar no servidor
      const updated = await updateFn(id, updates);
      
      // Substituir com dados reais
      setList(prev => prev.map(item => item.id === id ? updated : item));
      setIsUpdating(false);
      
      return updated;
    } catch (error) {
      // Rollback em caso de erro
      if (previousItem) {
        setList(prev => prev.map(item => item.id === id ? previousItem : item));
      }
      setIsUpdating(false);
      throw error;
    }
  }, [list, updateFn]);

  const removeItem = useCallback(async (id: string) => {
    if (!deleteFn) {
      throw new Error('Função de deleção não fornecida');
    }

    // Salvar item para rollback
    const itemToRemove = list.find(item => item.id === id);
    if (!itemToRemove) return;

    // Remover imediatamente
    setList(prev => prev.filter(item => item.id !== id));
    setIsUpdating(true);

    try {
      // Deletar no servidor
      await deleteFn(id);
      setIsUpdating(false);
    } catch (error) {
      // Restaurar item em caso de erro
      setList(prev => [...prev, itemToRemove].sort((a, b) => 
        a.id.localeCompare(b.id)
      ));
      setIsUpdating(false);
      throw error;
    }
  }, [list, deleteFn]);

  return {
    list,
    addItem,
    updateItem,
    removeItem,
    isUpdating,
  };
}

