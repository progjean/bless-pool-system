# 🔄 Guia: Sincronizar Usuários do Auth para Gerenciamento

## 📋 Problema

Quando você cria um usuário diretamente no Supabase Auth (Authentication → Users), ele **não aparece automaticamente** na página de "Gerenciamento de Usuários" porque:

- Os usuários do Auth ficam na tabela `auth.users` (sistema interno do Supabase)
- A página de gerenciamento busca da tabela `public.users` (tabela do seu projeto)
- Elas não são sincronizadas automaticamente

## ✅ Solução: Sincronização Automática

Execute o script SQL abaixo para criar um **trigger automático** que sincroniza os usuários do Auth para a tabela `users` sempre que um novo usuário é criado ou atualizado.

---

## 🚀 Passo a Passo

### 1. Acessar o SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Bless Pool System**
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### 2. Executar o Script de Sincronização

Cole o conteúdo do arquivo `supabase/sync_auth_users.sql` no editor SQL e clique em **"Run"** (ou pressione `Ctrl + Enter`).

**OU** cole este código diretamente:

```sql
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
```

### 3. Verificar se Funcionou

1. Após executar o script, você deve ver uma mensagem de sucesso
2. Vá em **Table Editor** → **users**
3. Você deve ver todos os usuários do Auth sincronizados na tabela `users`
4. Agora, quando você criar um novo usuário no Auth, ele será automaticamente adicionado à tabela `users`

### 4. Testar na Aplicação

1. Acesse a página **"Gerenciamento de Usuários"** na aplicação
2. Você deve ver todos os usuários criados no Supabase Auth
3. Agora você pode editar nome, função, etc. diretamente pela interface

---

## 🔍 Como Funciona

1. **Trigger Automático**: Sempre que um usuário é criado ou atualizado no `auth.users`, o trigger executa a função `sync_auth_user_to_users()`

2. **Sincronização Inicial**: O script também sincroniza todos os usuários existentes do Auth para a tabela `users` na primeira execução

3. **Dados Sincronizados**:
   - `id`: ID do usuário (mesmo do Auth)
   - `email`: Email do usuário
   - `username`: Do metadata ou gerado do email
   - `name`: Do metadata ou gerado do email
   - `role`: Do metadata ou padrão 'technician'
   - `company_id` e `company_name`: Do metadata (se existir)

---

## ⚠️ Importante

- **Metadata Necessária**: Para que o usuário tenha role e nome corretos, certifique-se de adicionar no **User Metadata** ao criar o usuário:
  ```json
  {
    "role": "admin",
    "name": "Nome do Administrador"
  }
  ```

- **Atualizações**: Se você atualizar o metadata de um usuário no Auth, o trigger atualizará automaticamente a tabela `users`

- **Permissões**: O trigger usa `SECURITY DEFINER` para ter permissão de escrever na tabela `users`

---

## 🆘 Troubleshooting

### Erro: "permission denied for table auth.users"
- Certifique-se de estar executando como superuser ou com permissões adequadas
- O trigger usa `SECURITY DEFINER` para contornar isso

### Usuários não aparecem após sincronização
- Verifique se a tabela `users` existe: **Table Editor** → **users**
- Verifique se os usuários têm email válido no Auth
- Verifique o console do navegador para erros

### Trigger não funciona para novos usuários
- Verifique se o trigger foi criado: Execute `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Se não existir, execute novamente o script de criação do trigger

---

## ✅ Próximos Passos

Após executar este script:
1. ✅ Todos os usuários do Auth aparecerão na página de Gerenciamento de Usuários
2. ✅ Novos usuários criados no Auth serão automaticamente sincronizados
3. ✅ Você poderá editar nome, função, etc. pela interface da aplicação
4. ✅ As alterações feitas na aplicação serão salvas na tabela `users`

