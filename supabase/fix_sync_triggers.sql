-- Script para CORRIGIR DEFINITIVAMENTE o problema de sobrescrita
-- Execute este script no SQL Editor do Supabase Dashboard
-- Este script garante que a tabela users SEMPRE tenha prioridade sobre auth.users

-- 1. Remover TODOS os triggers que podem causar conflito
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_users_updated ON public.users;

-- 2. Recriar função que sincroniza Auth → Users APENAS em INSERT (novos usuários)
CREATE OR REPLACE FUNCTION sync_auth_user_to_users()
RETURNS TRIGGER AS $$
BEGIN
  -- APENAS inserir novos usuários, NUNCA atualizar existentes
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (
      id, email, username, name, role, company_id, company_name, created_at, updated_at
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
    ON CONFLICT (id) DO NOTHING; -- CRÍTICO: Não atualizar se já existir
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger APENAS para INSERT (não UPDATE)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_users();

-- 4. Recriar função que sincroniza Users → Auth (quando você atualiza na interface)
CREATE OR REPLACE FUNCTION sync_users_to_auth()
RETURNS TRIGGER AS $$
DECLARE
  current_metadata jsonb;
BEGIN
  -- Buscar metadata atual para preservar campos que não estão na tabela users
  SELECT raw_user_meta_data INTO current_metadata
  FROM auth.users
  WHERE id = NEW.id;
  
  -- Atualizar auth.users quando a tabela users é atualizada
  -- Preservar campos existentes que não estão sendo atualizados
  UPDATE auth.users
  SET 
    raw_user_meta_data = COALESCE(current_metadata, '{}'::jsonb) || jsonb_build_object(
      'role', NEW.role,
      'name', NEW.name,
      'username', NEW.username,
      'company_id', NEW.company_id,
      'company_name', NEW.company_name
    ),
    updated_at = NEW.updated_at
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger para sincronizar Users → Auth
CREATE TRIGGER on_users_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_users_to_auth();

-- 6. IMPORTANTE: Garantir que a sincronização inicial NÃO sobrescreva dados existentes
-- Esta parte só deve ser executada UMA VEZ, quando você cria a tabela pela primeira vez
-- Se você já tem dados na tabela users, NÃO execute esta parte novamente!

-- Comentário: Se você já executou este script antes e tem dados na tabela users,
-- NÃO execute a parte abaixo (linhas comentadas). Ela só serve para sincronização inicial.

/*
-- Sincronizar usuários existentes do Auth para a tabela users (APENAS se a tabela estiver vazia)
INSERT INTO public.users (
  id, email, username, name, role, company_id, company_name, created_at, updated_at
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
  AND id NOT IN (SELECT id FROM public.users) -- Apenas inserir se não existir
ON CONFLICT (id) DO NOTHING; -- CRÍTICO: Não atualizar se já existir
*/

-- VERIFICAÇÃO: Verificar se os triggers foram criados corretamente
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname IN ('on_auth_user_created', 'on_users_updated')
ORDER BY tgname;

-- RESULTADO ESPERADO:
-- on_auth_user_created | auth.users | O (enabled)
-- on_users_updated     | public.users | O (enabled)

