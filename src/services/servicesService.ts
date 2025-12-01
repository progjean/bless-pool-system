// Serviço para gerenciar Services (serviços realizados) usando Supabase
import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import { ServiceData } from '../types/route';
import { showToast } from '../utils/toast';
import { dataCache, createCacheKey } from '../utils/cache';

// Converter ServiceData para formato Supabase
const serviceDataToSupabase = (serviceData: ServiceData, technician: string) => ({
  client_id: serviceData.clientId,
  service_date: new Date().toISOString().split('T')[0],
  technician: technician,
  observations: serviceData.observations || null,
  completed_at: serviceData.completedAt || new Date().toISOString(),
  company_id: null, // Será preenchido pelo RLS
});

export const servicesService = {
  // Criar novo serviço
  async create(serviceData: ServiceData, technician: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      // Fallback para localStorage
      const saved = localStorage.getItem('services');
      const services = saved ? JSON.parse(saved) : [];
      const serviceId = `service_${Date.now()}`;
      services.push({
        id: serviceId,
        ...serviceData,
        technician,
        completedAt: new Date().toISOString(),
      });
      localStorage.setItem('services', JSON.stringify(services));
      return serviceId;
    }

    try {
      // Criar serviço principal
      const supabaseData = serviceDataToSupabase(serviceData, technician);
      
      const { data: service, error: serviceError } = await supabase
        .from('services')
          .insert(supabaseData as any)
        .select()
        .single();

      if (serviceError) throw serviceError;
      if (!service) throw new Error('Service data is null');

      // Criar readings
      if (serviceData.readings && serviceData.readings.length > 0) {
        const readingsData = serviceData.readings
          .filter(r => r.value > 0)
          .map(reading => ({
            service_id: (service as any).id,
            chemical: reading.chemical,
            value: reading.value,
            unit: reading.unit,
          }));

        if (readingsData.length > 0) {
          const { error: readingsError } = await supabase
            .from('service_readings')
            .insert(readingsData as any);

          if (readingsError) throw readingsError;
        }
      }

      // Criar dosages
      if (serviceData.dosages && serviceData.dosages.length > 0) {
        const dosagesData = serviceData.dosages
          .filter(d => d.amount > 0)
          .map(dosage => ({
            service_id: (service as any).id,
            chemical: dosage.chemical,
            amount: dosage.amount,
            unit: dosage.unit,
          }));

        if (dosagesData.length > 0) {
          const { error: dosagesError } = await supabase
            .from('service_dosages')
            .insert(dosagesData as any);

          if (dosagesError) throw dosagesError;
        }
      }

      showToast.success('Serviço registrado com sucesso!');
      return (service as any).id;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao registrar serviço: ${errorMessage}`);
      throw error;
    }
  },

  // Buscar histórico de serviços de um cliente
  async getClientHistory(clientId: string, limit: number = 5): Promise<ServiceData[]> {
    const cacheKey = createCacheKey('services', 'history', clientId, limit.toString());
    
    // Verificar cache primeiro
    const cached = dataCache.get<ServiceData[]>(cacheKey);
    if (cached) return cached;

    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('services');
      const services = saved ? JSON.parse(saved) : [];
      const result = services
        .filter((s: any) => s.clientId === clientId)
        .slice(0, limit);
      dataCache.set(cacheKey, result, 2 * 60 * 1000);
      return result;
    }

    try {
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('client_id', clientId)
        .order('service_date', { ascending: false })
        .limit(limit);

      if (servicesError) throw servicesError;

      // Buscar readings e dosages para cada serviço
      const servicesWithData = await Promise.all(
        (services || []).map(async (service) => {
          const { data: readings } = await supabase
            .from('service_readings')
            .select('*')
            .eq('service_id', service.id);

          const { data: dosages } = await supabase
            .from('service_dosages')
            .select('*')
            .eq('service_id', service.id);

          return {
            clientId: service.client_id,
            checklist: [], // Checklist não está no banco ainda
            readings: (readings || []).map(r => ({
              id: r.id,
              chemical: r.chemical,
              value: r.value,
              unit: r.unit,
              timestamp: r.created_at,
            })),
            dosages: (dosages || []).map(d => ({
              id: d.id,
              chemical: d.chemical,
              amount: d.amount,
              unit: d.unit,
              timestamp: d.created_at,
            })),
            products: [],
            photos: [],
            observations: service.observations || '',
            completedAt: service.completed_at,
          } as ServiceData;
        })
      );

      // Cachear resultado
      const cacheKey = createCacheKey('services', 'history', clientId);
      dataCache.set(cacheKey, servicesWithData, 2 * 60 * 1000); // Cache por 2 minutos

      return servicesWithData;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao carregar histórico: ${errorMessage}`);
      throw error;
    }
  },

  // Listar todos os serviços
  async list(): Promise<{ data: ServiceData[] | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('services');
      return { data: saved ? JSON.parse(saved) : [], error: null };
    }

    try {
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('service_date', { ascending: false });

      if (servicesError) throw servicesError;

      // Buscar readings e dosages para cada serviço
      const servicesWithData = await Promise.all(
        (services || []).map(async (service) => {
          const { data: readings } = await supabase
            .from('service_readings')
            .select('*')
            .eq('service_id', service.id);

          const { data: dosages } = await supabase
            .from('service_dosages')
            .select('*')
            .eq('service_id', service.id);

          return {
            id: service.id,
            clientId: service.client_id,
            technician: service.technician,
            checklist: [], // Checklist não está no banco ainda
            readings: (readings || []).map(r => ({
              id: r.id,
              chemical: r.chemical,
              value: r.value,
              unit: r.unit,
              timestamp: r.created_at,
            })),
            dosages: (dosages || []).map(d => ({
              id: d.id,
              chemical: d.chemical,
              amount: d.amount,
              unit: d.unit,
              timestamp: d.created_at,
            })),
            products: [],
            photos: [],
            observations: service.observations || '',
            completedAt: service.completed_at,
            createdAt: service.created_at,
          } as ServiceData & { id: string; createdAt: string };
        })
      );

      return { data: servicesWithData, error: null };
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      return { data: null, error: errorMessage };
    }
  },
};

