-- Schema do Banco de Dados Supabase para Bless Pool System
-- Execute este script no SQL Editor do Supabase Dashboard

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Users (Usuários do Sistema)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'supervisor', 'technician')) NOT NULL DEFAULT 'technician',
  name VARCHAR(255) NOT NULL,
  company_id UUID,
  company_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (Clientes)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  frequency VARCHAR(20) CHECK (frequency IN ('Weekly', 'Biweekly')) NOT NULL DEFAULT 'Weekly',
  charge_per_month DECIMAL(10, 2) NOT NULL DEFAULT 0,
  type_of_service VARCHAR(20) CHECK (type_of_service IN ('POOL', 'POOL + SPA', 'SPA')) NOT NULL DEFAULT 'POOL',
  service_day VARCHAR(20),
  start_on DATE,
  stop_after VARCHAR(20),
  minutes_at_stop INTEGER DEFAULT 25,
  assigned_technician VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (Faturas)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  late_fee DECIMAL(10, 2),
  late_fee_applied BOOLEAN DEFAULT FALSE,
  late_fee_applied_date TIMESTAMPTZ,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_date TIMESTAMPTZ,
  auto_generated BOOLEAN DEFAULT FALSE,
  generated_from_customer_id UUID REFERENCES customers(id),
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Items (Itens da Fatura)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (Pagamentos)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Orders (Ordens de Serviço)
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) NOT NULL DEFAULT 'open',
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  assigned_technician VARCHAR(255),
  assigned_technician_id UUID,
  created_by VARCHAR(255) NOT NULL,
  created_by_role VARCHAR(20) CHECK (created_by_role IN ('admin', 'supervisor', 'customer')) NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by VARCHAR(255),
  notes TEXT,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services (Serviços Realizados)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  technician VARCHAR(255) NOT NULL,
  observations TEXT,
  completed_at TIMESTAMPTZ,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Readings (Leituras de Químicos)
CREATE TABLE IF NOT EXISTS service_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  chemical VARCHAR(100) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Dosages (Dosagens Aplicadas)
CREATE TABLE IF NOT EXISTS service_dosages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  chemical VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (Produtos/Inventário)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit VARCHAR(20) NOT NULL,
  stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_stock DECIMAL(10, 2) DEFAULT 0,
  unit_price DECIMAL(10, 2),
  internal_price DECIMAL(10, 2),
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Transactions (Transações de Estoque)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('entry', 'exit', 'consumption', 'adjustment')) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  technician_id UUID,
  notes TEXT,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases (Compras)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_number VARCHAR(50) UNIQUE NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Items (Itens da Compra)
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading Standards (Padrões de Leitura)
CREATE TABLE IF NOT EXISTS reading_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description VARCHAR(255) NOT NULL,
  reading_type VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  values JSONB,
  selected_value VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dosage Standards (Padrões de Dosagem)
CREATE TABLE IF NOT EXISTS dosage_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description VARCHAR(255) NOT NULL,
  dosage_type VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'gal',
  cost_per_uom DECIMAL(10, 2),
  price_per_uom DECIMAL(10, 2),
  can_include_with_service BOOLEAN DEFAULT FALSE,
  values JSONB,
  selected_value VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Messages (Mensagens Padrão de Serviço)
CREATE TABLE IF NOT EXISTS service_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist Standards (Padrões de Checklist)
CREATE TABLE IF NOT EXISTS checklist_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label VARCHAR(255) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('pool', 'equipment', 'safety', 'chemical', 'other')) NOT NULL DEFAULT 'other',
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  company_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_technician ON customers(assigned_technician);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_technician ON work_orders(assigned_technician);
CREATE INDEX IF NOT EXISTS idx_work_orders_company ON work_orders(company_id);

CREATE INDEX IF NOT EXISTS idx_services_client ON services(client_id);
CREATE INDEX IF NOT EXISTS idx_services_date ON services(service_date);
CREATE INDEX IF NOT EXISTS idx_services_company ON services(company_id);

CREATE INDEX IF NOT EXISTS idx_service_readings_service ON service_readings(service_id);
CREATE INDEX IF NOT EXISTS idx_service_dosages_service ON service_dosages(service_id);

CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(date);

CREATE INDEX IF NOT EXISTS idx_purchases_company ON purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_standards_updated_at BEFORE UPDATE ON reading_standards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dosage_standards_updated_at BEFORE UPDATE ON dosage_standards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_messages_updated_at BEFORE UPDATE ON service_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_dosages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosage_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Usuários só veem dados da sua empresa
-- Nota: Em produção, ajustar baseado no campo company_id do usuário autenticado

-- Policy para Customers
CREATE POLICY "Users can view customers from their company"
  ON customers FOR SELECT
  USING (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can insert customers in their company"
  ON customers FOR INSERT
  WITH CHECK (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can update customers from their company"
  ON customers FOR UPDATE
  USING (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can delete customers from their company"
  ON customers FOR DELETE
  USING (company_id = auth.uid() OR company_id IS NULL);

-- Policy para Invoices
CREATE POLICY "Users can view invoices from their company"
  ON invoices FOR SELECT
  USING (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can insert invoices in their company"
  ON invoices FOR INSERT
  WITH CHECK (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can update invoices from their company"
  ON invoices FOR UPDATE
  USING (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can delete invoices from their company"
  ON invoices FOR DELETE
  USING (company_id = auth.uid() OR company_id IS NULL);

-- Policy para Work Orders
CREATE POLICY "Users can view work orders from their company"
  ON work_orders FOR SELECT
  USING (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can insert work orders in their company"
  ON work_orders FOR INSERT
  WITH CHECK (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can update work orders from their company"
  ON work_orders FOR UPDATE
  USING (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can delete work orders from their company"
  ON work_orders FOR DELETE
  USING (company_id = auth.uid() OR company_id IS NULL);

-- Policy para Payments
CREATE POLICY "Users can view payments from their company"
  ON payments FOR SELECT
  USING (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can insert payments in their company"
  ON payments FOR INSERT
  WITH CHECK (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can update payments from their company"
  ON payments FOR UPDATE
  USING (company_id = auth.uid() OR company_id IS NULL);

CREATE POLICY "Users can delete payments from their company"
  ON payments FOR DELETE
  USING (company_id = auth.uid() OR company_id IS NULL);

-- Adicionar políticas similares para outras tabelas...
-- (Por brevidade, adicione políticas similares para services, products, etc.)

