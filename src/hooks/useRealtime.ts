// Hook para usar Supabase Realtime (gratuito)
import { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

export const useRealtime = <T = any>(options: UseRealtimeOptions) => {
  const { table, filter, enabled = true } = options;
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Usar refs para armazenar as funções de callback mais recentes
  // Isso evita que o useEffect seja executado novamente quando as funções mudarem
  const callbacksRef = useRef({
    onInsert: options.onInsert,
    onUpdate: options.onUpdate,
    onDelete: options.onDelete,
  });

  // Atualizar refs quando as funções mudarem
  useEffect(() => {
    callbacksRef.current = {
      onInsert: options.onInsert,
      onUpdate: options.onUpdate,
      onDelete: options.onDelete,
    };
  }, [options.onInsert, options.onUpdate, options.onDelete]);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) {
      return;
    }

    // Criar canal de realtime
    const newChannel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log('Realtime event:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              callbacksRef.current.onInsert?.(payload.new as T);
              break;
            case 'UPDATE':
              callbacksRef.current.onUpdate?.(payload.new as T);
              break;
            case 'DELETE':
              callbacksRef.current.onDelete?.(payload.old as T);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(newChannel);

    // Cleanup
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [table, filter, enabled]); // Removido onInsert, onUpdate, onDelete das dependências

  return { channel, isConnected };
};

