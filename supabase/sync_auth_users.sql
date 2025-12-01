-- Script para sincronizar usuários do Auth para a tabela users
-- Execute este script no SQL Editor do Supabase Dashboard

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar a tabela users se ela não existir
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'supervisor', 'technician')) NOT NULL DEFAULT 'technician',
  name VARCHAR(255) NOT NULL,
  company_id UUID,
  company_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Função para sincronizar um usuário do Auth para a tabela users
CREATE OR REPLACE FUNCTION sync_auth_user_to_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar na tabela users quando um usuário é criado/atualizado no Auth
  INSERT INTO public.users (
    id,
    email,
    username,
    name,
    role,
    company_id,
    company_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'technician')::VARCHAR,
    (NEW.raw_user_meta_data->>'company_id')::UUID,
    NEW.raw_user_meta_data->>'company_name',
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id,
    company_name = EXCLUDED.company_name,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar automaticamente quando um usuário é criado no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_users();

-- Sincronizar usuários existentes do Auth para a tabela users
INSERT INTO public.users (
  id,
  email,
  username,
  name,
  role,
  company_id,
  company_name,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1)) as username,
  COALESCE(raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)) as name,
  COALESCE(raw_user_meta_data->>'role', 'technician')::VARCHAR as role,
  (raw_user_meta_data->>'company_id')::UUID as company_id,
  raw_user_meta_data->>'company_name' as company_name,
  created_at,
  updated_at
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  company_name = EXCLUDED.company_name,
  updated_at = EXCLUDED.updated_at;

-- Comentário: Esta função e trigger garantem que todos os usuários do Auth sejam automaticamente
-- sincronizados para a tabela users, permitindo que apareçam na página de gerenciamento de usuários.

