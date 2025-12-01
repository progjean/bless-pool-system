# 🔧 Guia: Corrigir Login com Username

## 📋 Problema Identificado

Quando você alterava o **username** na página de "Gerenciamento de Usuários":

1. ❌ O login com o novo username não funcionava (ficava tentando infinitamente)
2. ❌ Ao fazer login com email, as alterações eram revertidas
3. ❌ Havia conflito entre dois triggers SQL que se sobrescreviam

## ✅ Solução Implementada

### 1. **Corrigido Conflito de Triggers**

**Problema**: Dois triggers estavam em conflito:
- `on_auth_user_created` → sincronizava Auth → users (em INSERT e UPDATE)
- `on_users_updated` → sincronizava users → Auth (em UPDATE)

**Solução**: 
- O trigger `on_auth_user_created` agora só funciona em **INSERT** (novos usuários)
- Não sobrescreve mais quando você atualiza a tabela `users`
- O trigger `on_users_updated` continua sincronizando users → Auth

### 2. **Melhorado Login com Username**

**Problema**: Quando não encontrava o username, tentava `${username}@blesspool.com` infinitamente

**Solução**:
- Agora mostra erro claro se o username não for encontrado
- Busca o email correto na tabela `users` antes de fazer login
- Se não encontrar, mostra mensagem de erro ao invés de ficar tentando

### 3. **Preservação de Dados**

- O trigger preserva campos do metadata que não estão na tabela `users`
- O email do Auth nunca é alterado (apenas metadata)
- Alterações na tabela `users` são sincronizadas para Auth corretamente

---

## 🚀 O que Você Precisa Fazer

### 1. Executar os Scripts SQL Atualizados

Execute **ambos** os scripts no Supabase SQL Editor (na ordem):

#### Script 1: `sync_auth_users.sql` (atualizado)

```sql
-- Função para sincronizar um usuário do Auth para a tabela users
-- IMPORTANTE: Esta função só sincroniza em INSERT, não em UPDATE
CREATE OR REPLACE FUNCTION sync_auth_user_to_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas inserir quando é um novo usuário (INSERT)
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
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger apenas para INSERT (não UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_users();
```

#### Script 2: `sync_users_to_auth.sql` (atualizado)

```sql
-- Função para atualizar user_metadata no auth.users quando a tabela users é atualizada
CREATE OR REPLACE FUNCTION sync_users_to_auth()
RETURNS TRIGGER AS $$
DECLARE
  current_metadata jsonb;
BEGIN
  -- Buscar metadata atual para preservar campos que não estão na tabela users
  SELECT raw_user_meta_data INTO current_metadata
  FROM auth.users
  WHERE id = NEW.id;
  
  -- Atualizar raw_user_meta_data preservando campos existentes
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

-- Trigger para sincronizar quando a tabela users é atualizada
DROP TRIGGER IF EXISTS on_users_updated ON public.users;
CREATE TRIGGER on_users_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_users_to_auth();
```

### 2. Como Funciona Agora

#### Quando você atualiza username/nome na interface:

1. ✅ Alteração é salva na tabela `users`
2. ✅ Trigger `on_users_updated` sincroniza para `auth.users` (user_metadata)
3. ✅ O email do Auth **não é alterado** (continua o mesmo)
4. ✅ Ao fazer login, busca o email correto pela tabela `users`

#### Quando você faz login com username:

1. ✅ Sistema busca o username na tabela `users`
2. ✅ Encontra o email correspondente
3. ✅ Faz login no Supabase Auth usando o email
4. ✅ Carrega dados atualizados da tabela `users`

#### Quando você faz login com email:

1. ✅ Faz login diretamente no Supabase Auth
2. ✅ Busca dados atualizados da tabela `users`
3. ✅ Usa dados da tabela `users` (não do metadata antigo)

---

## ⚠️ Importante

### Sobre Username vs Email:

- **Username**: É apenas um campo de exibição/identificação na sua aplicação
- **Email**: É o identificador real usado pelo Supabase Auth para login
- **Não é possível alterar o email** do Auth diretamente pela interface (por segurança)
- O login sempre usa o **email**, mas você pode digitar o **username** e o sistema busca o email automaticamente

### Se você alterar o username:

- ✅ O username será atualizado na tabela `users`
- ✅ O username será atualizado no `user_metadata` do Auth
- ✅ O **email permanece o mesmo** (não muda)
- ✅ Para fazer login, você pode usar:
  - **Email original** (sempre funciona)
  - **Novo username** (sistema busca o email automaticamente)

---

## 🧪 Testar

1. **Atualizar username:**
   - Vá em "Gerenciamento de Usuários"
   - Edite o username de um usuário (ex: `admin` → `admin2`)
   - Salve

2. **Fazer login com novo username:**
   - Faça logout
   - Tente fazer login com o novo username (`admin2`)
   - ✅ Deve funcionar e buscar o email correto

3. **Fazer login com email:**
   - Faça logout
   - Faça login com o email original
   - ✅ Deve funcionar e mostrar o username atualizado

4. **Verificar persistência:**
   - Faça logout
   - Faça login novamente
   - ✅ O username atualizado deve aparecer

---

## 🆘 Troubleshooting

### Erro: "Username não encontrado"
- Verifique se o username está correto na tabela `users`
- Use o email para fazer login se necessário
- Verifique se executou os scripts SQL atualizados

### Alterações ainda são revertidas
- Verifique se executou o script `sync_users_to_auth.sql` atualizado
- Verifique se o trigger `on_users_updated` existe: 
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_users_updated';
  ```
- Verifique se o trigger `on_auth_user_created` só funciona em INSERT:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```

### Login com username não funciona
- Verifique se a tabela `users` tem o username correto
- Verifique se o email correspondente está correto
- Tente fazer login com o email diretamente

---

## 📝 Resumo das Mudanças

✅ **Trigger Auth → Users**: Agora só funciona em INSERT (não sobrescreve mais)  
✅ **Trigger Users → Auth**: Continua funcionando e preserva campos existentes  
✅ **Login com Username**: Busca email correto e mostra erro se não encontrar  
✅ **Persistência**: Alterações persistem após logout/login  
✅ **Email**: Nunca é alterado (apenas metadata é atualizado)

