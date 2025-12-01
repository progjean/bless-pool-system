# 📋 Pendências e Melhorias - Bless Pool System

## 🔴 CRÍTICO - Dados Mockados que Precisam ser Integrados

### 1. SupervisorSelector.tsx ⚠️
**Status**: Usa `MOCK_TECHNICIANS`
**O que fazer**:
- Criar serviço para buscar técnicos vinculados ao supervisor
- Integrar com `usersService` ou criar `techniciansService`
- Buscar técnicos baseado no `companyId` do supervisor
- Filtrar apenas usuários com role `TECHNICIAN`

**Arquivo**: `src/pages/SupervisorSelector.tsx`
**Linha**: 8-12

### 2. ServiceMessagesPage.tsx ⚠️
**Status**: Usa `localStorage` diretamente ao invés de `settingsService`
**O que fazer**:
- Integrar com `settingsService.getServiceMessages()`
- Usar `settingsService.createServiceMessage()`, `updateServiceMessage()`, `deleteServiceMessage()`
- Remover uso direto de `localStorage`

**Arquivo**: `src/pages/ServiceMessagesPage.tsx`
**Nota**: Esta página parece duplicada com `ServiceMessagesSettings.tsx` - considerar remover ou consolidar

### 3. Relatórios que Ainda Usam Dados Mockados ⚠️

#### 3.1 ChemicalConsumptionByTechnicianReport.tsx
**Status**: Usa `MOCK_CHEMICAL_CONSUMPTION_BY_TECHNICIAN`
**O que fazer**:
- Integrar com `reportsService.getChemicalConsumptionByTechnician()`
- Adicionar loading state
- Adicionar tratamento de erros

**Arquivo**: `src/components/reports/ChemicalConsumptionByTechnicianReport.tsx`
**Linha**: 3, 11

#### 3.2 ServiceTimeStatsReport.tsx
**Status**: Usa `MOCK_SERVICE_TIME_STATS`
**O que fazer**:
- Integrar com `reportsService.getServiceTimeStats()`
- Adicionar loading state
- Adicionar tratamento de erros

**Arquivo**: `src/components/reports/ServiceTimeStatsReport.tsx`
**Linha**: 3, 11

#### 3.3 ServicesByTechnicianReport.tsx
**Status**: Usa `MOCK_SERVICES_BY_TECHNICIAN`
**O que fazer**:
- Integrar com `reportsService.getServicesByTechnician()`
- Adicionar loading state
- Adicionar tratamento de erros

**Arquivo**: `src/components/reports/ServicesByTechnicianReport.tsx`
**Linha**: 3, 11

#### 3.4 ChemicalHistoryReport.tsx
**Status**: Usa `MOCK_CHEMICAL_HISTORY`
**O que fazer**:
- Integrar com `reportsService.getChemicalHistory()`
- Adicionar loading state
- Adicionar tratamento de erros

**Arquivo**: `src/components/reports/ChemicalHistoryReport.tsx`
**Linha**: 3, 11

#### 3.5 MonthlyComparisonReport.tsx
**Status**: Usa `MOCK_MONTHLY_COMPARISON`
**O que fazer**:
- Integrar com `reportsService.getMonthlyComparison()`
- Adicionar loading state
- Adicionar tratamento de erros

**Arquivo**: `src/components/reports/MonthlyComparisonReport.tsx`
**Linha**: 3, 12

**Nota**: Os serviços `reportsService` já existem e têm esses métodos implementados, mas os componentes não estão usando!

## 🟡 MELHORIAS IMPORTANTES

### 4. ServicePage.tsx - Checklist Mockado
**Status**: Usa `DEFAULT_CHECKLIST` de `mockData.ts`
**O que fazer**:
- Integrar com `settingsService.getChecklist()`
- Permitir que checklist seja configurável no admin

**Arquivo**: `src/pages/ServicePage.tsx`
**Linha**: 8

### 5. Validação de Formulários
**Status**: Validação básica implementada, mas não usa `react-hook-form` + `zod` consistentemente
**O que fazer**:
- Migrar todos os formulários para usar `react-hook-form`
- Usar schemas `zod` já criados em `src/utils/validation.ts`
- Melhorar feedback de validação

**Arquivos afetados**:
- `src/components/customers/CustomerForm.tsx`
- `src/components/invoices/InvoiceForm.tsx`
- `src/components/workOrders/WorkOrderForm.tsx`
- `src/components/purchases/PurchaseFormModal.tsx`
- `src/components/inventory/InventoryTransactionModal.tsx`

### 6. Exportação de Dados
**Status**: Não implementado
**O que fazer**:
- Adicionar exportação para CSV em listas (Customers, Invoices, Work Orders, etc.)
- Adicionar exportação para PDF em relatórios
- Adicionar botão de exportação em cada página de lista/relatório

### 7. Busca e Filtros Avançados
**Status**: Filtros básicos implementados, mas podem ser melhorados
**O que fazer**:
- Adicionar filtros por data range em todas as listas
- Adicionar busca por múltiplos campos simultaneamente
- Adicionar filtros salvos (favoritos)
- Adicionar ordenação customizada

### 8. Notificações em Tempo Real
**Status**: Não implementado
**O que fazer**:
- Usar Supabase Realtime para notificações
- Notificar quando:
  - Nova work order é atribuída
  - Invoice é criada/atualizada
  - Pagamento é registrado
  - Serviço é concluído

### 9. Gerenciamento de Usuários
**Status**: Usuários são mockados
**O que fazer**:
- Criar `usersService.ts` para CRUD de usuários
- Criar página de gerenciamento de usuários (Admin)
- Permitir criar/editar/deletar técnicos e supervisores
- Integrar com Supabase Auth para criação de contas

**Arquivo**: `src/services/usersService.ts` (criar)
**Página**: `src/pages/UsersPage.tsx` (criar)

### 10. Mapa Interativo no Work Area
**Status**: Placeholder implementado
**O que fazer**:
- Integrar Google Maps ou Mapbox
- Mostrar marcadores para todos os clientes
- Mostrar rota otimizada
- Permitir navegação GPS

**Arquivo**: `src/components/RouteMap.tsx`
**Nota**: Já tem comentário indicando que é placeholder

## 🟢 MELHORIAS OPCIONAIS

### 11. Cache e Performance
**Status**: Cache básico implementado, mas pode ser melhorado
**O que fazer**:
- Implementar cache mais agressivo para dados que não mudam frequentemente
- Adicionar invalidação inteligente de cache
- Implementar lazy loading de imagens

### 12. Sincronização Offline Melhorada
**Status**: Sincronização básica implementada
**O que fazer**:
- Melhorar detecção de conflitos
- Adicionar resolução manual de conflitos
- Melhorar feedback visual de sincronização

### 13. Otimistic Updates
**Status**: Implementado parcialmente em algumas páginas
**O que fazer**:
- Aplicar optimistic updates em todas as operações CRUD
- Melhorar feedback visual durante operações

### 14. Paginação
**Status**: Implementado em algumas páginas
**O que fazer**:
- Adicionar paginação em todas as listas que não têm
- Melhorar controles de paginação
- Adicionar opção de itens por página

### 15. Testes
**Status**: Não implementado
**O que fazer**:
- Adicionar testes unitários para serviços
- Adicionar testes de integração para componentes principais
- Adicionar testes E2E para fluxos críticos

### 16. Documentação
**Status**: Documentação básica existe
**O que fazer**:
- Adicionar JSDoc em todas as funções públicas
- Criar guia de contribuição
- Criar guia de deploy
- Documentar APIs dos serviços

### 17. Acessibilidade (A11y)
**Status**: Não verificado
**O que fazer**:
- Adicionar labels em todos os inputs
- Adicionar ARIA attributes
- Testar navegação por teclado
- Testar com leitores de tela

### 18. Internacionalização Completa
**Status**: Português e Inglês implementados
**O que fazer**:
- Verificar se todas as strings estão traduzidas
- Adicionar mais idiomas se necessário
- Melhorar formatação de datas/números por locale

## 📊 Resumo por Prioridade

### 🔴 Alta Prioridade (Crítico)
1. ✅ Integrar SupervisorSelector com dados reais
2. ✅ Integrar ServiceMessagesPage com settingsService
3. ✅ Integrar todos os relatórios com reportsService
4. ✅ Integrar checklist do ServicePage com settingsService

### 🟡 Média Prioridade (Importante)
5. Validação de formulários com react-hook-form + zod
6. Exportação de dados (CSV/PDF)
7. Busca e filtros avançados
8. Gerenciamento de usuários
9. Notificações em tempo real

### 🟢 Baixa Prioridade (Opcional)
10. Mapa interativo
11. Cache e performance melhorados
12. Sincronização offline melhorada
13. Otimistic updates em todas as páginas
14. Paginação completa
15. Testes
16. Documentação completa
17. Acessibilidade
18. Mais idiomas

## 📝 Notas Importantes

1. **Serviços já criados**: A maioria dos serviços já existe e está funcionando. O problema é que alguns componentes ainda não foram atualizados para usá-los.

2. **reportsService**: Todos os métodos necessários já existem em `reportsService.ts`, mas os componentes de relatório não estão usando!

3. **settingsService**: Já tem métodos para service messages, mas `ServiceMessagesPage.tsx` não está usando.

4. **Duplicação**: `ServiceMessagesPage.tsx` e `ServiceMessagesSettings.tsx` parecem fazer a mesma coisa. Considerar consolidar.

5. **Prioridade**: Focar primeiro em integrar os dados mockados, depois nas melhorias opcionais.

