# ⚡ Setup Rápido do Supabase - Resolver Erro de Tabelas

## 🚨 Problema Atual

Você está vendo este erro:
```
Could not find the table 'public.customers' in the schema cache
```

Isso significa que o Supabase está configurado, mas as **tabelas ainda não foram criadas**.

## ✅ Solução Rápida (5 minutos)

### Passo 1: Acessar SQL Editor do Supabase

1. Acesse https://app.supabase.com
2. Selecione seu projeto (`qwkybiozgnhkfkhekeuq`)
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**

### Passo 2: Executar o Schema

1. Abra o arquivo `supabase/schema.sql` deste projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **Run** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

⏱️ Aguarde alguns segundos para execução.

### Passo 3: Verificar se Funcionou

1. No Supabase Dashboard, vá em **Table Editor**
2. Você deve ver estas tabelas:
   - ✅ `customers`
   - ✅ `invoices`
   - ✅ `invoice_items`
   - ✅ `payments` (nova!)
   - ✅ `work_orders`
   - ✅ `services`
   - ✅ `products`
   - ✅ `purchases`
   - ✅ E outras...

### Passo 4: Recarregar a Aplicação

1. Recarregue a página do navegador (`F5` ou `Ctrl+R`)
2. O erro deve desaparecer!

## 🔍 Verificar se Está Funcionando

Após executar o schema:

1. Tente fazer login novamente
2. Vá em **Customers** - deve carregar sem erros
3. Verifique o console do navegador - não deve ter mais erros 404

## 📝 Nota sobre os Avisos

Os avisos do React Router são apenas **warnings** sobre futuras versões. Eles não afetam o funcionamento atual e podem ser ignorados.

## 🆘 Se Ainda Não Funcionar

### Verificar se o Schema Foi Executado

No SQL Editor do Supabase, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deve ver todas as tabelas listadas.

### Verificar Erros no SQL

Se houver erros ao executar o schema:

1. Verifique a aba **"Messages"** no SQL Editor
2. Procure por erros em vermelho
3. Execute apenas a parte que deu erro novamente

### Usar Modo Mock Temporariamente

Se quiser continuar desenvolvendo sem Supabase:

1. No arquivo `.env`, adicione ou altere:
```env
VITE_USE_MOCK_AUTH=true
```

2. Reinicie o servidor de desenvolvimento

Isso fará o sistema usar dados mockados do localStorage.

## ✅ Próximos Passos Após Setup

1. Criar usuários de teste (veja `SUPABASE_SETUP.md`)
2. Configurar Storage Buckets (veja `SUPABASE_SETUP.md`)
3. Testar criação de clientes
4. Testar criação de invoices

## 📚 Documentação Completa

Para um guia completo, veja: `SUPABASE_SETUP.md`

