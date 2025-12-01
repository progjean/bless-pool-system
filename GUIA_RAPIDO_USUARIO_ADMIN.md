# ⚡ Guia Rápido: Criar Usuário Admin

## 🎯 Método Mais Simples (Passo a Passo Visual)

### 1️⃣ Acessar Supabase

1. Vá em: https://supabase.com/dashboard
2. Faça login
3. Clique no seu projeto

---

### 2️⃣ Criar Usuário

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique em **"Users"** (ou já estará selecionado)
3. Clique no botão **"Add User"** (canto superior direito, botão azul/roxo)
4. Selecione **"Create new user"**

---

### 3️⃣ Preencher Formulário

Você verá um formulário modal/popup com campos:

**📧 Email:**
```
admin@blesspool.com
```
(ou qualquer email que você quiser usar)

**🔒 Password:**
```
Admin123!@#
```
(escolha uma senha forte e anote!)

**✅ Auto Confirm User:**
- ✅ **MARQUE ESTA CAIXA** (muito importante!)

**📝 Raw User Meta Data (ou User Metadata):**
- Este campo pode estar:
  - Visível diretamente no formulário
  - Em uma seção expansível (procure por "Metadata" ou "Advanced")
  - Ou pode não aparecer (não se preocupe, vamos adicionar depois)

Se o campo aparecer, cole:
```json
{"role":"admin","name":"Administrador"}
```

---

### 4️⃣ Salvar

1. Clique em **"Create User"** (botão no final do formulário)
2. Aguarde a mensagem de sucesso
3. Feche o modal/popup

---

### 5️⃣ Adicionar Metadata (SE NÃO ADICIONOU ANTES)

**Se você não viu o campo User Metadata ao criar:**

1. Na lista de usuários, encontre o usuário que você criou
2. Clique no **email** do usuário OU nos **três pontinhos (...)** ao lado
3. Isso abrirá os detalhes do usuário
4. Procure por uma aba ou seção chamada:
   - **"Metadata"**
   - **"User Metadata"**
   - **"Raw User Meta Data"**
   - Ou pode estar em **"General"** → **"Metadata"**

5. Se encontrar, clique para editar e cole:
```json
{"role":"admin","name":"Administrador"}
```

6. Clique em **"Save"** ou **"Update"**

**Se ainda não encontrar:**
- Não se preocupe! O sistema pode funcionar sem isso inicialmente
- Você pode adicionar depois ou usar o método alternativo abaixo

---

### 6️⃣ Verificar se Está Correto

Na lista de usuários, você deve ver:
- ✅ Email do usuário
- ✅ Status: **Confirmed** (verde) ou **Auto Confirmed**
- ✅ Se clicar no usuário, deve ver o metadata com `"role": "admin"`

---

### 7️⃣ Fazer Login

1. Acesse: `https://blesspool.vercel.app/login` (ou sua URL do Vercel)
2. Digite:
   - **Email**: `admin@blesspool.com` (ou o que você usou)
   - **Senha**: `Admin123!@#` (ou a que você definiu)
3. Clique em **"Entrar"**
4. ✅ Deve funcionar e te levar para o dashboard admin!

---

## 🔄 Método Alternativo: Se Não Conseguir Adicionar Metadata

Se você criou o usuário mas não conseguiu adicionar o metadata:

### Opção 1: Editar via SQL Editor

1. No Supabase Dashboard, vá em **"SQL Editor"**
2. Clique em **"New Query"**
3. Cole e execute (substitua o email pelo seu):

```sql
-- Atualizar metadata do usuário admin
UPDATE auth.users
SET raw_user_meta_data = '{"role":"admin","name":"Administrador"}'::jsonb
WHERE email = 'admin@blesspool.com';
```

4. Clique em **"Run"** ou pressione `Ctrl + Enter`
5. Deve aparecer "Success. No rows returned" ou similar

### Opção 2: Usar API do Supabase

Se você tem acesso ao código, pode criar um script temporário, mas o método SQL acima é mais simples.

---

## ❓ Onde Está o Campo User Metadata?

O campo pode estar em diferentes lugares dependendo da versão do Supabase:

### Versão Nova (Interface Atualizada):
- Pode estar diretamente no formulário de criação
- Ou em uma seção **"Advanced"** ou **"Additional Options"**
- Procure por um campo de texto grande ou área de código

### Versão Antiga:
- Pode estar como **"Raw User Meta Data"**
- Ou em uma aba separada após criar o usuário

### Se Não Encontrar:
- Use o método SQL acima (Opção 1) - é mais confiável
- Ou edite o usuário depois de criado

---

## ✅ Checklist Final

Antes de considerar pronto:

- [ ] Usuário criado no Supabase
- [ ] Email confirmado (Auto Confirm marcado)
- [ ] User Metadata com `"role": "admin"` adicionado
- [ ] Consegue fazer login no site
- [ ] Após login, vê o dashboard admin (não página de técnico)

---

## 🆘 Ainda Não Funciona?

1. **Verifique os logs:**
   - No Supabase: **Authentication** → **Logs**
   - Veja se há erros de login

2. **Verifique o console do navegador:**
   - Pressione F12
   - Vá na aba **Console**
   - Veja se há erros

3. **Teste com outro email:**
   - Crie um novo usuário com outro email
   - Use um email real que você tenha acesso

4. **Verifique as variáveis de ambiente:**
   - No Vercel: **Settings** → **Environment Variables**
   - Certifique-se de que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas

---

## 📞 Precisa de Mais Ajuda?

Se ainda tiver problemas, me diga:
- O que aparece quando você tenta criar o usuário?
- Você consegue ver o campo User Metadata?
- Qual mensagem de erro aparece (se houver)?

