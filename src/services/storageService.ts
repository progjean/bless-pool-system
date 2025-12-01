// Serviço para gerenciar Storage (fotos e PDFs) usando Supabase Storage
import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import { showToast } from '../utils/toast';

export const storageService = {
  // Upload de foto de serviço
  async uploadServicePhoto(file: File, serviceId: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      // Fallback: converter para base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileName = `${serviceId}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('service-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('service-photos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao fazer upload da foto: ${errorMessage}`);
      throw error;
    }
  },

  // Upload de PDF de Invoice
  async uploadInvoicePDF(file: File, invoiceId: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      // Fallback: converter para base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileName = `${invoiceId}/${Date.now()}_invoice.pdf`;
      
      const { data, error } = await supabase.storage
        .from('invoice-pdfs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('invoice-pdfs')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao fazer upload do PDF: ${errorMessage}`);
      throw error;
    }
  },

  // Upload de PDF de Service Report
  async uploadServiceReportPDF(file: File, serviceId: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileName = `${serviceId}/${Date.now()}_report.pdf`;
      
      const { data, error } = await supabase.storage
        .from('service-reports')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('service-reports')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao fazer upload do relatório: ${errorMessage}`);
      throw error;
    }
  },

  // Deletar arquivo
  async deleteFile(bucket: 'service-photos' | 'invoice-pdfs' | 'service-reports', fileName: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      return; // Em modo mock, não há nada para deletar
    }

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      showToast.error(`Erro ao deletar arquivo: ${errorMessage}`);
      throw error;
    }
  },

  // Obter URL pública de um arquivo
  getPublicUrl(bucket: 'service-photos' | 'invoice-pdfs' | 'service-reports', fileName: string): string {
    if (!isSupabaseConfigured()) {
      return fileName; // Se for base64, retornar como está
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  },
};

