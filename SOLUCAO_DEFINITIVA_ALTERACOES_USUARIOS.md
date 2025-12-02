# 🔧 Solução Definitiva: Corrigir Alterações de Usuários

## 📋 Problema

Quando você altera **nome** ou **username** na página de "Gerenciamento de Usuários":
- ❌ As alterações são salvas na tabela `users`
- ❌ Mas quando você faz login novamente, os dados voltam ao estado anterior
- ❌ As alterações são perdidas

## 🔍 Causa do Problema

Há um **conflito entre triggers SQL**:
1. Um trigger sincroniza `auth.users` → `users` (sobrescreve suas alterações)
2. Outro trigger sincroniza `users` → `auth.users` (deveria funcionar, mas é sobrescrito)

## ✅ Solução: Executar Script SQL Corrigido

### Passo 1: Acessar o Supabase SQL Editor

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Bless Pool System**
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### Passo 2: Executar o Script de Correção

Copie e cole o conteúdo completo do arquivo `supabase/fix_sync_triggers.sql` no editor SQL.

**OU** cole este código diretamente:

```sql
-- Script para CORRIGIR DEFINITIVAMENTE o problema de sobrescrita
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
```

### Passo 3: Executar o Script

1. Clique em **"Run"** (ou pressione `Ctrl + Enter`)
2. Aguarde a mensagem de sucesso
3. Você deve ver uma mensagem confirmando que os triggers foram criados

### Passo 4: Verificar se Funcionou

Execute esta query para verificar:

```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname IN ('on_auth_user_created', 'on_users_updated')
ORDER BY tgname;
```

**Resultado esperado:**
- `on_auth_user_created` | `auth.users` | `O` (enabled)
- `on_users_updated` | `public.users` | `O` (enabled)

---

## 🎯 Como Funciona Agora

### Quando você atualiza nome/username na interface:

1. ✅ Você altera na página "Gerenciamento de Usuários"
2. ✅ A alteração é salva na tabela `users`
3. ✅ O trigger `on_users_updated` sincroniza para `auth.users` (user_metadata)
4. ✅ **A tabela `users` é a fonte da verdade** - nunca é sobrescrita pelo Auth

### Quando você faz login:

1. ✅ Sistema busca dados da tabela `users` (prioridade)
2. ✅ Se não encontrar, usa `user_metadata` do Auth (fallback)
3. ✅ **Dados atualizados aparecem corretamente**

### Quando um novo usuário é criado no Auth:

1. ✅ O trigger `on_auth_user_created` cria registro na tabela `users`
2. ✅ **Mas nunca atualiza** registros existentes (DO NOTHING)

---

## ⚠️ IMPORTANTE

### O que foi corrigido:

1. ✅ **Trigger Auth → Users**: Agora só funciona em INSERT (não sobrescreve mais)
2. ✅ **Trigger Users → Auth**: Continua funcionando e sincroniza suas alterações
3. ✅ **Prioridade**: A tabela `users` sempre tem prioridade sobre `auth.users`
4. ✅ **Sem conflitos**: Os triggers não se sobrescrevem mais

### O que você NÃO deve fazer:

- ❌ **NÃO execute** scripts antigos de sincronização que usam `ON CONFLICT DO UPDATE`
- ❌ **NÃO execute** a parte comentada do script (sincronização inicial) se já tem dados
- ✅ **Execute apenas** o script `fix_sync_triggers.sql` uma vez

---

## 🧪 Testar Agora

1. **Alterar um usuário:**
   - Vá em "Gerenciamento de Usuários"
   - Edite o nome ou username de um usuário
   - Salve

2. **Verificar no Supabase:**
   - Vá em **Table Editor** → **users**
   - Verifique se os dados foram atualizados ✅
   - Vá em **Authentication** → **Users** → Clique no usuário
   - Verifique se o **User Metadata** foi atualizado ✅

3. **Fazer logout e login:**
   - Faça logout
   - Faça login novamente
   - Vá em "Gerenciamento de Usuários"
   - ✅ Os dados atualizados devem aparecer (não voltaram ao estado anterior)

---

## 🆘 Se Ainda Não Funcionar

### Verificar triggers:

```sql
-- Ver todos os triggers relacionados
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname LIKE '%user%' OR tgname LIKE '%auth%';
```

### Verificar se a função existe:

```sql
-- Ver funções relacionadas
SELECT proname, prosrc
FROM pg_proc
WHERE proname IN ('sync_auth_user_to_users', 'sync_users_to_auth');
```

### Limpar e recriar (se necessário):

Se ainda houver problemas, execute:

```sql
-- Remover tudo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_users_updated ON public.users;
DROP FUNCTION IF EXISTS sync_auth_user_to_users();
DROP FUNCTION IF EXISTS sync_users_to_auth();

-- Depois execute o script fix_sync_triggers.sql novamente
```

---

## 📝 Resumo

✅ **Execute o script `fix_sync_triggers.sql` no Supabase SQL Editor**  
✅ **Isso corrige os triggers para que a tabela `users` tenha prioridade**  
✅ **As alterações agora vão persistir após logout/login**  
✅ **A tabela `users` nunca mais será sobrescrita pelo Auth**

