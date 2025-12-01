# 👤 Guia: Como Criar um Usuário Admin

## 📋 Método 1: Via Supabase Dashboard (RECOMENDADO - Mais Fácil)

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione seu projeto **Bless Pool System** (ou o nome do seu projeto)

---

### Passo 2: Criar Usuário Admin

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique na aba **"Users"**
3. Clique no botão **"Add User"** (canto superior direito)
4. Selecione **"Create new user"**

---

### Passo 3: Preencher Dados do Usuário

Você verá um formulário com os seguintes campos:

#### **Email:**
- Digite o email do admin (ex: `admin@blesspool.com` ou `seu-email@exemplo.com`)

#### **Password:**
- Digite uma senha forte (ex: `Admin123!@#`)
- ⚠️ **ANOTE ESTA SENHA!** Você precisará dela para fazer login

#### **Auto Confirm User:**
- ✅ **MARQUE ESTA OPÇÃO** (muito importante!)
- Isso permite que o usuário faça login imediatamente sem precisar confirmar email

#### **User Metadata (JSON):**

**IMPORTANTE:** O campo User Metadata pode aparecer de formas diferentes dependendo da versão do Supabase:

**Opção A - Campo de Texto JSON:**
- Procure por um campo chamado **"Raw User Meta Data"** ou **"User Metadata"**
- Pode estar em uma seção expansível (clique para expandir)
- Cole o seguinte JSON diretamente:

```json
{"role":"admin","name":"Administrador"}
```

**Opção B - Campos Separados:**
- Se não houver campo JSON, você pode adicionar o metadata DEPOIS de criar o usuário (veja Passo 4 abaixo)

**Opção C - Se não encontrar o campo:**
- Não se preocupe! Você pode adicionar o metadata depois de criar o usuário
- Continue criando o usuário sem o metadata
- Depois, edite o usuário para adicionar o metadata (veja Passo 4 abaixo)

---

### Passo 4: Salvar

1. Clique em **"Create User"** ou **"Add User"**
2. Aguarde alguns segundos
3. Você verá uma mensagem de sucesso
4. O usuário aparecerá na lista de usuários

---

### Passo 4.5: Adicionar User Metadata (SE NÃO ADICIONOU ANTES)

Se você não conseguiu adicionar o User Metadata ao criar o usuário, faça agora:

1. Na lista de usuários, encontre o usuário que você acabou de criar
2. Clique nos **três pontinhos (...)** ao lado do usuário OU clique no **email** do usuário
3. Selecione **"Edit User"** ou **"Edit"**
4. Procure pela seção **"Raw User Meta Data"** ou **"User Metadata"**
5. Se não aparecer, procure por **"Metadata"** ou uma aba **"Metadata"**
6. Cole ou digite o seguinte JSON:

```json
{"role":"admin","name":"Administrador"}
```

**OU** se preferir formatado:

```json
{
  "role": "admin",
  "name": "Administrador"
}
```

7. Clique em **"Save"** ou **"Update User"**

**⚠️ IMPORTANTE:** O campo `role` deve ser exatamente `"admin"` (em minúsculas) para funcionar corretamente.

---

### Passo 5: Testar Login

1. Acesse seu site: `https://blesspool.vercel.app/login` (ou sua URL)
2. Faça login com:
   - **Email**: O email que você digitou (ex: `admin@blesspool.com`)
   - **Senha**: A senha que você definiu
3. Se funcionar, você será redirecionado para o dashboard admin! ✅

---

## 📋 Método 2: Via SQL Editor (Avançado)

Se preferir criar via SQL:

### Passo 1: Acessar SQL Editor

1. No Supabase Dashboard, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New Query"**

### Passo 2: Executar SQL

Cole e execute o seguinte SQL (substitua os valores):

```sql
-- Criar usuário Admin via SQL
-- IMPORTANTE: Este método requer a extensão pgcrypto habilitada

-- Primeiro, verificar se a extensão está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuário Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@blesspool.com',  -- SUBSTITUA pelo email desejado
  crypt('SuaSenha123!', gen_salt('bf')),  -- SUBSTITUA pela senha desejada
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "name": "Administrador"}',
  NOW(),
  NOW(),
  '',
  ''
);
```

**⚠️ IMPORTANTE:**
- Substitua `'admin@blesspool.com'` pelo email desejado
- Substitua `'SuaSenha123!'` pela senha desejada
- Execute o SQL clicando em **"Run"** ou pressionando `Ctrl + Enter`

---

## 📋 Método 3: Via Interface do Sistema (Se já tiver acesso admin)

Se você já tem acesso como admin no sistema:

1. Faça login como admin
2. Vá em **"Usuários"** ou **"Users"** no menu
3. Clique em **"Novo Usuário"** ou **"Add User"**
4. Preencha:
   - **Username**: `admin` (ou outro)
   - **Email**: `admin@blesspool.com` (ou outro)
   - **Role**: Selecione **"Admin"**
   - **Nome**: `Administrador`
5. Clique em **"Salvar"**

**⚠️ NOTA:** Este método cria o usuário na tabela `users`, mas você ainda precisa criar no Supabase Auth para fazer login.

---

## 🔐 Informações Importantes

### Credenciais de Login:

Após criar o usuário, você usará:

- **Email**: O email que você definiu (ex: `admin@blesspool.com`)
- **Senha**: A senha que você definiu

### Roles Disponíveis:

- `admin` - Administrador completo
- `supervisor` - Supervisor (gerencia técnicos)
- `technician` - Técnico (acesso limitado)

### User Metadata:

O campo `role` no User Metadata é **ESSENCIAL** para o sistema funcionar corretamente. Sem ele, o usuário pode não ter as permissões corretas.

---

## 🐛 Solução de Problemas

### Problema 1: "Email já existe"

**Solução:**
- Use outro email
- Ou delete o usuário existente e crie novamente

### Problema 2: "Não consigo fazer login"

**Soluções:**
1. Verifique se marcou **"Auto Confirm User"**
2. Verifique se o email está correto
3. Verifique se a senha está correta
4. Verifique se o User Metadata tem `"role": "admin"`

### Problema 3: "Usuário criado mas não tem permissões de admin"

**Solução:**
- Verifique o User Metadata no Supabase Dashboard
- Certifique-se de que tem `"role": "admin"`
- Se necessário, edite o usuário e adicione/atualize o metadata

### Problema 4: "Erro ao criar usuário via SQL"

**Solução:**
- Use o Método 1 (Interface) que é mais simples
- Ou verifique se a extensão `pgcrypto` está habilitada

---

## ✅ Checklist de Criação

Antes de considerar o usuário criado, verifique:

- [ ] Usuário aparece na lista de usuários do Supabase
- [ ] Campo `email_confirmed_at` não está NULL (ou Auto Confirm está marcado)
- [ ] User Metadata contém `"role": "admin"`
- [ ] Consegue fazer login no site com email e senha
- [ ] Após login, vê o dashboard admin (não página de técnico)

---

## 🎯 Próximos Passos

Após criar o usuário admin:

1. ✅ Faça login no sistema
2. ✅ Verifique se tem acesso completo ao dashboard
3. ✅ Crie outros usuários (supervisores, técnicos) se necessário
4. ✅ Configure as permissões e políticas RLS no Supabase

---

## 📞 Precisa de Ajuda?

Se tiver problemas:

1. Verifique os logs em **Authentication** → **Logs** no Supabase
2. Verifique o console do navegador (F12) para erros
3. Verifique se as variáveis de ambiente estão configuradas corretamente no Vercel

**Documentação:**
- Supabase Auth: https://supabase.com/docs/guides/auth
- User Management: https://supabase.com/docs/guides/auth/users

