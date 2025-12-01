# 🔧 Estratégia de Correção dos Erros de Build

## ✅ Erros Corrigidos

1. ✅ `InventoryPage.tsx` - Adicionado `logout` ao `useAuth()`
2. ✅ `PurchasesPage.tsx` - Adicionado `logout` ao `useAuth()`
3. ✅ `SkipServiceModal.tsx` - Corrigido `sentVia` → `sendVia`
4. ✅ `customersService.ts` - Corrigido escopo de `newCustomer`

## 🔴 Problemas Principais Restantes

### 1. **Tipos Supabase** (~80 erros)
**Problema**: TypeScript está inferindo tipos como `never` ao inserir dados no Supabase.

**Causa**: O arquivo `src/types/supabase.ts` provavelmente não tem os tipos corretos ou está vazio.

**Solução**:
```bash
# Opção 1: Gerar tipos do Supabase (recomendado)
npx supabase gen types typescript --project-id seu-projeto-id > src/types/supabase.ts

# Opção 2: Criar tipos manualmente baseado no schema.sql
```

### 2. **Zod Validation** (5 erros)
**Problema**: Zod 4.1.13 tem API diferente do Zod 3.x

**Solução**:
```bash
# Downgrade para Zod 3.x (mais estável)
npm install zod@^3.22.4
```

### 3. **Propriedades Faltando em Tipos** (~30 erros)
- `ServiceData` precisa de: `technician`, `createdAt`, `id`, `customerId`
- `Customer` precisa de: `email`
- `InventoryProduct` vs `Product` - tipos diferentes

**Solução**: Atualizar tipos em `src/types/`

### 4. **Propriedades Duplicadas** (4 erros)
- `LanguageContext.tsx` tem chaves duplicadas

**Solução**: Remover duplicatas

## 📋 Plano de Ação Imediato

### Passo 1: Corrigir Zod (5 minutos)
```bash
npm install zod@^3.22.4
```

### Passo 2: Corrigir Propriedades Duplicadas (10 minutos)
- Abrir `src/context/LanguageContext.tsx`
- Encontrar e remover chaves duplicadas

### Passo 3: Atualizar Tipos (30 minutos)
- Adicionar propriedades faltando em `ServiceData`, `Customer`, etc.
- Corrigir mapeamento `Product` → `InventoryProduct`

### Passo 4: Gerar Tipos Supabase (15 minutos)
- Gerar tipos do Supabase ou criar manualmente

### Passo 5: Testar Build
```bash
npm run build
```

## 🚀 Solução Rápida (Temporária)

Para fazer o build funcionar rapidamente, podemos:
1. Desabilitar verificação de tipos no build: `"build": "vite build"` (sem `tsc`)
2. Ou usar `// @ts-ignore` nos erros críticos (não recomendado)

## 💡 Recomendação

**Melhor abordagem**: Corrigir os tipos do Supabase primeiro, pois isso resolve ~80 erros de uma vez.
