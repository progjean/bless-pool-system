# Setup do Supabase - Bless Pool System

## Passo a Passo para Configuração

### 1. Criar Conta e Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub (recomendado) ou crie conta
4. Clique em "New Project"
5. Preencha:
   - **Name**: Bless Pool System
   - **Database Password**: Escolha uma senha forte (salve em local seguro!)
   - **Region**: Escolha a região mais próxima (ex: South America)
   - **Pricing Plan**: Free (gratuito)

### 2. Obter Credenciais

Após criar o projeto (pode levar alguns minutos):

1. Vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (chave pública)

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-public-aqui
VITE_USE_MOCK_AUTH=false
```

### 4. Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução (pode levar alguns segundos)

### 5. Configurar Storage Buckets

1. Vá em **Storage** no menu lateral
2. Crie os seguintes buckets:

#### Bucket: `service-photos`
- **Public bucket**: ✅ Sim
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

#### Bucket: `invoice-pdfs`
- **Public bucket**: ✅ Sim
- **File size limit**: 10 MB
- **Allowed MIME types**: `application/pdf`

#### Bucket: `service-reports`
- **Public bucket**: ✅ Sim
- **File size limit**: 10 MB
- **Allowed MIME types**: `application/pdf`

### 6. Configurar Políticas de Storage (RLS)

Para cada bucket criado, adicione políticas:

#### Para `service-photos`:
```sql
-- Permitir upload autenticado
CREATE POLICY "Users can upload service photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-photos');

-- Permitir visualização pública
CREATE POLICY "Service photos are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-photos');
```

#### Para `invoice-pdfs`:
```sql
-- Permitir upload autenticado
CREATE POLICY "Users can upload invoice PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoice-pdfs');

-- Permitir visualização autenticada
CREATE POLICY "Users can view invoice PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoice-pdfs');
```

#### Para `service-reports`:
```sql
-- Permitir upload autenticado
CREATE POLICY "Users can upload service reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-reports');

-- Permitir visualização autenticada
CREATE POLICY "Users can view service reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'service-reports');
```

### 7. Criar Usuários de Teste

No **SQL Editor**, execute:

```sql
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
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@blesspool.com',
  crypt('senha123', gen_salt('bf')), -- Substitua 'senha123' pela senha desejada
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "name": "Administrador", "company_id": null}',
  NOW(),
  NOW()
);

-- Criar usuário Supervisor
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
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'supervisor@blesspool.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "supervisor", "name": "Supervisor", "company_id": null}',
  NOW(),
  NOW()
);

-- Criar usuário Técnico
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
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'tecnico@blesspool.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "technician", "name": "Técnico", "company_id": null}',
  NOW(),
  NOW()
);
```

**OU** use a interface do Supabase:
1. Vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Preencha email e senha
4. Em **User Metadata**, adicione:
   ```json
   {
     "role": "admin",
     "name": "Administrador"
   }
   ```

### 8. Testar Conexão

1. Inicie o projeto: `npm run dev`
2. Tente fazer login com um dos usuários criados
3. Verifique se os dados aparecem no Supabase Dashboard

## Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a chave correta (anon public, não service_role)
- Verifique se não há espaços extras nas variáveis de ambiente

### Erro: "relation does not exist"
- Execute o schema.sql novamente
- Verifique se todas as tabelas foram criadas em **Table Editor**

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS estão corretas
- Temporariamente, pode desabilitar RLS para teste (não recomendado em produção)

### Usuário não consegue fazer login
- Verifique se o email está confirmado (`email_confirmed_at` não é NULL)
- Verifique se a senha está correta
- Use a função de reset de senha do Supabase se necessário

## Próximos Passos

Após configurar o Supabase:

1. ✅ Testar login/logout
2. ✅ Criar alguns clientes de teste
3. ✅ Testar upload de fotos
4. ✅ Verificar se os dados aparecem no Dashboard
5. ✅ Integrar serviços com componentes existentes

## Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

