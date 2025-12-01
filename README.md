# BLESS POOL SYSTEM

Sistema de gerenciamento PWA (Progressive Web App) com autenticação e gerenciamento de múltiplos perfis de usuário.

## 🚀 Tecnologias

- React 18
- TypeScript
- Vite
- React Router DOM
- PWA (Service Worker)

## 📋 Funcionalidades

### Fluxo de Login e Navegação

#### Admin
- Após login → **Admin Hub**
  - Opção 1: **Administrative Area** (área administrativa completa)
  - Opção 2: **Work Area** (área de trabalho)
- Pode carregar imagens da galeria + tirar fotos

#### Supervisor
- Após login → **Tela de Seleção**
  - Escolher entre: **Seu nome** ou **Técnicos vinculados**
- Após seleção → **Work Area**
- Só pode tirar fotos (não upload da galeria)
- Não acessa Admin Area

#### Técnico
- Após login → **Work Area** (direto, sem tela intermediária)
- Apenas tirar fotos (não upload da galeria)
- Não acessa Admin Area

### Otimizações Implementadas

- ✅ **Cache Offline**: Imagens e dados salvos localmente
- ✅ **Sincronização Automática**: Fila de sincronização quando online
- ✅ **Indicador de Status**: Mostra status de sincronização e conexão
- ✅ **Service Worker**: PWA completo com suporte offline
- ✅ **Performance**: Carregamento rápido e navegação otimizada

## 🏗️ Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── context/         # Context API (Autenticação)
├── pages/           # Páginas da aplicação
├── types/           # Definições TypeScript
├── App.tsx          # Componente principal
└── main.tsx         # Entry point
```

## 🛠️ Instalação

```bash
npm install
```

## 🚀 Executar

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📦 Build

```bash
npm run build
```

## 👤 Usuários de Teste

- **Admin**: `admin` / qualquer senha
- **Supervisor**: `supervisor` / qualquer senha
- **Técnico**: `tecnico` / qualquer senha

## 🔮 Expansão Futura

O sistema está preparado para:
- Multi-empresa (campo `companyId` nos usuários)
- Multi-admin (estrutura de roles extensível)
- Integração com APIs backend
- Sistema de permissões mais granular

## 📝 Notas

- O sistema suporta **3 modos de operação**:
  1. **Supabase** (recomendado para produção) - Backend completo gratuito
  2. **API tradicional** - Se você tiver seu próprio backend
  3. **Mock/LocalStorage** - Para desenvolvimento sem backend

- **Setup do Supabase**: Veja `SUPABASE_SETUP.md` para guia completo
- As imagens podem ser armazenadas em Supabase Storage ou localStorage (fallback)
- O sistema detecta automaticamente quando está offline e sincroniza quando a conexão é restaurada

## 🚀 Backend Recomendado: Supabase

Este projeto está preparado para usar **Supabase** como backend:
- ✅ Banco de dados PostgreSQL gratuito (500 MB)
- ✅ Autenticação integrada
- ✅ Storage para fotos e PDFs (1 GB grátis)
- ✅ API REST automática
- ✅ Real-time subscriptions

**Veja**: `SUPABASE_SETUP.md` para configuração completa.

