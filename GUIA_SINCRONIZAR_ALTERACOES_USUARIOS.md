# 🔄 Guia: Sincronizar Alterações de Usuários

## 📋 Problema Resolvido

Quando você alterava o **nome** ou **username** na página de "Gerenciamento de Usuários", as alterações eram salvas apenas na tabela `users`, mas **não** no `auth.users` (Supabase Auth).

Ao fazer logout e login novamente, o sistema buscava os dados do `auth.users`, então as alterações eram perdidas.

## ✅ Solução Implementada

Agora o sistema:
1. ✅ Salva as alterações na tabela `users`
2. ✅ **Sincroniza automaticamente** para o `auth.users` (user_metadata)
3. ✅ Busca os dados atualizados da tabela `users` ao fazer login
4. ✅ As alterações **persistem** após logout/login

---

## 🚀 Passo a Passo: Executar o Script SQL

### 1. Acessar o SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Bless Pool System**
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### 2. Executar o Script de Sincronização

Cole o conteúdo do arquivo `supabase/sync_users_to_auth.sql` no editor SQL e clique em **"Run"** (ou pressione `Ctrl + Enter`).

**OU** cole este código diretamente:

```sql
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
```

### 3. Verificar se Funcionou

1. Após executar o script, você deve ver uma mensagem de sucesso
2. Agora, quando você atualizar um usuário na página de "Gerenciamento de Usuários", as alterações serão automaticamente sincronizadas para o `auth.users`

---

## 🔍 Como Funciona Agora

### Quando você atualiza um usuário:

1. **Frontend** → Chama `usersService.update()`
2. **Tabela `users`** → Atualiza nome, username, role, etc.
3. **Trigger SQL** → Detecta a atualização e executa `sync_users_to_auth()`
4. **`auth.users`** → Atualiza o `user_metadata` automaticamente
5. **Próximo login** → Sistema busca dados atualizados da tabela `users`

### Fluxo de Login:

1. Usuário faz login
2. Sistema busca dados na tabela `users` (prioridade)
3. Se não encontrar, usa `user_metadata` do Auth (fallback)
4. Dados atualizados são carregados ✅

---

## ✅ O que foi Corrigido

### 1. **Trigger SQL Automático**
- Criado trigger `on_users_updated` que sincroniza automaticamente
- Quando você atualiza a tabela `users`, o `auth.users` é atualizado também

### 2. **AuthContext Atualizado**
- Agora busca dados da tabela `users` primeiro (dados mais atualizados)
- Só usa `user_metadata` do Auth como fallback

### 3. **usersService Atualizado**
- Garante que `updated_at` seja atualizado
- Tenta chamar função RPC para sincronização (se disponível)

---

## 🧪 Testar

1. **Atualizar um usuário:**
   - Vá em "Gerenciamento de Usuários"
   - Edite o nome ou username de um usuário
   - Salve

2. **Verificar no Supabase:**
   - Vá em **Table Editor** → **users**
   - Verifique se os dados foram atualizados ✅
   - Vá em **Authentication** → **Users** → Clique no usuário
   - Verifique se o **User Metadata** foi atualizado ✅

3. **Testar logout/login:**
   - Faça logout
   - Faça login novamente
   - Verifique se os dados atualizados aparecem ✅

---

## ⚠️ Importante

- **Execute o script apenas uma vez** - ele cria o trigger que funciona automaticamente
- **O trigger funciona automaticamente** - não precisa fazer nada manualmente após executar o script
- **Alterações futuras** serão sincronizadas automaticamente

---

## 🆘 Troubleshooting

### Erro: "permission denied for table auth.users"
- O trigger usa `SECURITY DEFINER` para ter permissões adequadas
- Se ainda der erro, verifique se você tem permissões de superuser no projeto

### Alterações não estão sendo sincronizadas
- Verifique se o trigger foi criado: Execute `SELECT * FROM pg_trigger WHERE tgname = 'on_users_updated';`
- Se não existir, execute o script novamente
- Verifique os logs do Supabase para erros

### Dados ainda não aparecem após logout/login
- Limpe o cache do navegador
- Verifique se a tabela `users` tem os dados atualizados
- Verifique se o `auth.users` tem o `user_metadata` atualizado

---

## 📝 Resumo

✅ **Antes**: Alterações eram perdidas após logout/login  
✅ **Agora**: Alterações são sincronizadas automaticamente e persistem  
✅ **Como**: Trigger SQL sincroniza `users` → `auth.users` automaticamente  
✅ **Resultado**: Dados atualizados aparecem sempre, mesmo após logout/login

