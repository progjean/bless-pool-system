# 🚀 Guia Completo de Setup do Supabase

## ✅ Checklist de Configuração

- [ ] Criar conta no Supabase
- [ ] Criar projeto
- [ ] Obter credenciais (URL e Anon Key)
- [ ] Configurar variáveis de ambiente
- [ ] Executar schema SQL
- [ ] Configurar Storage Buckets
- [ ] Criar usuários de teste
- [ ] Testar conexão

## 📋 Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em **"Start your project"**
3. Faça login (GitHub recomendado)
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: `Bless Pool System`
   - **Database Password**: ⚠️ **SALVE EM LUGAR SEGURO!**
   - **Region**: Escolha a mais próxima (ex: `South America`)
   - **Pricing Plan**: **Free**

⏱️ Aguarde 2-3 minutos para o projeto ser criado.

## 📋 Passo 2: Obter Credenciais

1. No Dashboard do projeto, vá em **Settings** (⚙️) → **API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key (não a service_role!)

## 📋 Passo 3: Configurar Variáveis de Ambiente

Crie/edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-public-aqui
VITE_USE_MOCK_AUTH=false
```

⚠️ **IMPORTANTE**: Não commite o arquivo `.env` no Git!

## 📋 Passo 4: Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `supabase/schema.sql` deste projeto
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a execução (pode levar alguns segundos)

✅ Você deve ver mensagens de sucesso para cada tabela criada.

## 📋 Passo 5: Configurar Storage Buckets

### Criar Buckets

1. Vá em **Storage** no menu lateral
2. Para cada bucket abaixo, clique em **New bucket**:

#### Bucket 1: `service-photos`
- **Name**: `service-photos`
- **Public bucket**: ✅ **Sim** (marcar)
- **File size limit**: `5 MB`
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

#### Bucket 2: `invoice-pdfs`
- **Name**: `invoice-pdfs`
- **Public bucket**: ✅ **Sim**
- **File size limit**: `10 MB`
- **Allowed MIME types**: `application/pdf`

#### Bucket 3: `service-reports`
- **Name**: `service-reports`
- **Public bucket**: ✅ **Sim**
- **File size limit**: `10 MB`
- **Allowed MIME types**: `application/pdf`

### Configurar Políticas RLS para Storage

No **SQL Editor**, execute:

```sql
-- Políticas para service-photos
CREATE POLICY "Users can upload service photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-photos');

CREATE POLICY "Service photos are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-photos');

-- Políticas para invoice-pdfs
CREATE POLICY "Users can upload invoice PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoice-pdfs');

CREATE POLICY "Users can view invoice PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoice-pdfs');

-- Políticas para service-reports
CREATE POLICY "Users can upload service reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-reports');

CREATE POLICY "Users can view service reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'service-reports');
```

## 📋 Passo 6: Criar Usuários de Teste

### Opção 1: Via Interface (Recomendado)

1. Vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**

#### Usuário Admin:
- **Email**: `admin@blesspool.com`
- **Password**: `admin123` (ou outra senha)
- **Auto Confirm User**: ✅ Marcar
- **User Metadata** (JSON):
```json
{
  "role": "admin",
  "name": "Administrador"
}
```

#### Usuário Supervisor:
- **Email**: `supervisor@blesspool.com`
- **Password**: `supervisor123`
- **Auto Confirm User**: ✅ Marcar
- **User Metadata**:
```json
{
  "role": "supervisor",
  "name": "Supervisor"
}
```

#### Usuário Técnico:
- **Email**: `tecnico@blesspool.com`
- **Password**: `tecnico123`
- **Auto Confirm User**: ✅ Marcar
- **User Metadata**:
```json
{
  "role": "technician",
  "name": "Técnico"
}
```

### Opção 2: Via SQL (Avançado)

Execute no SQL Editor:

```sql
-- Nota: Este método é mais complexo e requer conhecimento de criptografia
-- Recomendado usar a Opção 1 (Interface)
```

## 📋 Passo 7: Testar Conexão

1. Inicie o projeto:
```bash
npm run dev
```

2. Acesse http://localhost:5173 (ou a porta mostrada)

3. Tente fazer login com:
   - Email: `admin@blesspool.com`
   - Senha: `admin123` (ou a que você definiu)

4. Se funcionar, você verá o dashboard!

5. Verifique no Supabase Dashboard:
   - **Table Editor** → Veja se as tabelas foram criadas
   - **Authentication** → Veja se o login aparece nos logs

## 🔧 Troubleshooting

### ❌ Erro: "Invalid API key"
**Solução:**
- Verifique se copiou a chave **anon public** (não service_role)
- Verifique se não há espaços extras no `.env`
- Reinicie o servidor de desenvolvimento após alterar `.env`

### ❌ Erro: "relation does not exist"
**Solução:**
- Execute o `schema.sql` novamente
- Verifique em **Table Editor** se as tabelas existem
- Verifique se há erros no SQL Editor

### ❌ Erro: "new row violates row-level security policy"
**Solução:**
- Verifique se o usuário está autenticado
- Verifique as políticas RLS em **Authentication** → **Policies**
- Temporariamente, pode desabilitar RLS para teste (não recomendado)

### ❌ Usuário não consegue fazer login
**Solução:**
- Verifique se o email está confirmado (`email_confirmed_at` não é NULL)
- Use **"Reset Password"** se necessário
- Verifique se a senha está correta
- Verifique os logs em **Authentication** → **Logs**

### ❌ Upload de arquivo falha
**Solução:**
- Verifique se o bucket existe
- Verifique se as políticas RLS estão configuradas
- Verifique o tamanho do arquivo (não exceder limite)
- Verifique o tipo MIME do arquivo

## 📊 Verificar Dados

### Ver Tabelas Criadas
1. Vá em **Table Editor**
2. Você deve ver todas as tabelas: `customers`, `invoices`, `work_orders`, etc.

### Ver Usuários
1. Vá em **Authentication** → **Users**
2. Você deve ver os usuários criados

### Ver Arquivos Uploadados
1. Vá em **Storage**
2. Clique em um bucket (ex: `service-photos`)
3. Você verá os arquivos uploadados

## 🎯 Próximos Passos

Após configurar tudo:

1. ✅ Testar CRUD de clientes
2. ✅ Testar criação de invoices
3. ✅ Testar upload de fotos
4. ✅ Verificar dados no Dashboard
5. ✅ Integrar com componentes existentes

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Dashboard](https://app.supabase.com)

## 💡 Dicas

1. **Backup**: O plano gratuito não tem backup automático. Faça backups manuais periodicamente.

2. **Limites Gratuitos**:
   - 500 MB de banco de dados
   - 1 GB de storage
   - 5 GB de bandwidth/mês
   - Ilimitado: API requests, autenticação, real-time

3. **Performance**: Use índices nas colunas mais consultadas (já incluídos no schema.sql)

4. **Segurança**: Nunca exponha a `service_role` key no frontend!

