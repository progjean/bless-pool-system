// Tipos TypeScript gerados do Supabase
// Em produção, usar: npx supabase gen types typescript --project-id seu-projeto-id > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string
          city: string | null
          state: string | null
          zip_code: string | null
          frequency: 'Weekly' | 'Biweekly'
          charge_per_month: number
          type_of_service: 'POOL' | 'POOL + SPA' | 'SPA'
          service_day: string | null
          start_on: string | null
          stop_after: string | null
          minutes_at_stop: number
          assigned_technician: string | null
          status: 'active' | 'inactive'
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at'>>
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          customer_id: string
          customer_name: string
          issue_date: string
          due_date: string
          paid_date: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          late_fee: number | null
          late_fee_applied: boolean
          late_fee_applied_date: string | null
          total: number
          notes: string | null
          is_recurring: boolean
          email_sent: boolean
          email_sent_date: string | null
          auto_generated: boolean
          generated_from_customer_id: string | null
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at'>>
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          total: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['invoice_items']['Row'], 'id' | 'created_at'>>
      }
      work_orders: {
        Row: {
          id: string
          work_order_number: string
          type: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'completed' | 'cancelled'
          customer_id: string
          customer_name: string
          customer_address: string
          assigned_technician: string | null
          assigned_technician_id: string | null
          created_by: string
          created_by_role: 'admin' | 'supervisor' | 'customer'
          started_at: string | null
          completed_at: string | null
          completed_by: string | null
          notes: string | null
          estimated_duration: number | null
          actual_duration: number | null
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['work_orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['work_orders']['Row'], 'id' | 'created_at'>>
      }
      services: {
        Row: {
          id: string
          client_id: string
          service_date: string
          technician: string
          observations: string | null
          completed_at: string | null
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>>
      }
      service_readings: {
        Row: {
          id: string
          service_id: string
          chemical: string
          value: number
          unit: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_readings']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['service_readings']['Row'], 'id' | 'created_at'>>
      }
      service_dosages: {
        Row: {
          id: string
          service_id: string
          chemical: string
          amount: number
          unit: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_dosages']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['service_dosages']['Row'], 'id' | 'created_at'>>
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          unit: string
          stock: number
          min_stock: number
          unit_price: number | null
          internal_price: number | null
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>>
      }
      inventory_transactions: {
        Row: {
          id: string
          product_id: string
          type: 'entry' | 'exit' | 'consumption' | 'adjustment'
          quantity: number
          date: string
          technician_id: string | null
          notes: string | null
          company_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory_transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['inventory_transactions']['Row'], 'id' | 'created_at'>>
      }
      purchases: {
        Row: {
          id: string
          purchase_number: string
          supplier: string
          purchase_date: string
          total_amount: number
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['purchases']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['purchases']['Row'], 'id' | 'created_at'>>
      }
      purchase_items: {
        Row: {
          id: string
          purchase_id: string
          product_name: string
          quantity: number
          unit: string
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['purchase_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['purchase_items']['Row'], 'id' | 'created_at'>>
      }
      reading_standards: {
        Row: {
          id: string
          description: string
          reading_type: string
          unit: string
          values: string[] | null
          selected_value: string | null
          order: number
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reading_standards']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['reading_standards']['Row'], 'id' | 'created_at'>>
      }
      dosage_standards: {
        Row: {
          id: string
          description: string
          dosage_type: string
          unit: string
          cost_per_uom: number | null
          price_per_uom: number | null
          can_include_with_service: boolean
          values: string[] | null
          selected_value: string | null
          order: number
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['dosage_standards']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['dosage_standards']['Row'], 'id' | 'created_at'>>
      }
      service_messages: {
        Row: {
          id: string
          title: string
          content: string
          is_default: boolean
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_messages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['service_messages']['Row'], 'id' | 'created_at'>>
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          reference_number: string | null
          notes: string | null
          company_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

