-- Script para sincronizar alterações da tabela users para auth.users
-- Execute este script no SQL Editor do Supabase Dashboard
-- Isso garante que quando você atualizar nome/username na tabela users, 
-- as alterações também sejam refletidas no Auth

-- Função para atualizar user_metadata no auth.users quando a tabela users é atualizada
CREATE OR REPLACE FUNCTION sync_users_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar raw_user_meta_data no auth.users quando a tabela users é atualizada
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_build_object(
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

-- Trigger para sincronizar automaticamente quando a tabela users é atualizada
DROP TRIGGER IF EXISTS on_users_updated ON public.users;
CREATE TRIGGER on_users_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_users_to_auth();

-- Comentário: Esta função e trigger garantem que quando você atualizar nome, username, role, etc.
-- na tabela users pela interface de gerenciamento, as alterações também sejam sincronizadas
-- para o auth.users (user_metadata), permitindo que persistam após logout/login.

