# 🚀 Guia Completo: Deploy no Vercel - Passo a Passo

## 📋 Pré-requisitos

Antes de começar, você precisa ter:
- ✅ Conta no GitHub (gratuita)
- ✅ Conta no Vercel (gratuita)
- ✅ Projeto no seu computador
- ✅ Git instalado no seu computador

---

## 📦 PARTE 1: Preparar o Repositório no GitHub

### Passo 1.1: Verificar se o projeto já está no GitHub

1. Abra o terminal/PowerShell na pasta do projeto
2. Execute:
```bash
git remote -v
```

**Se aparecer algo como:**
```
origin  https://github.com/seu-usuario/seu-repositorio.git (fetch)
origin  https://github.com/seu-usuario/seu-repositorio.git (push)
```
✅ **Seu projeto já está conectado ao GitHub!** Pule para a PARTE 2.

**Se aparecer erro ou nada:**
❌ Você precisa criar o repositório primeiro. Continue no Passo 1.2.

---

### Passo 1.2: Criar repositório no GitHub (se necessário)

#### Opção A: Criar repositório pelo site do GitHub

1. Acesse: https://github.com
2. Faça login na sua conta
3. Clique no botão **"+"** no canto superior direito
4. Clique em **"New repository"**
5. Preencha:
   - **Repository name**: `bless-pool-system` (ou outro nome)
   - **Description**: "Sistema de gestão para empresas de limpeza de piscinas"
   - **Visibility**: Escolha **Public** (gratuito) ou **Private** (se tiver GitHub Pro)
   - ⚠️ **NÃO marque** "Add a README file" (seu projeto já tem arquivos)
   - ⚠️ **NÃO marque** "Add .gitignore" (seu projeto já tem)
   - ⚠️ **NÃO marque** "Choose a license"
6. Clique em **"Create repository"**

#### Opção B: Criar repositório pelo GitHub CLI (se tiver instalado)

```bash
gh repo create bless-pool-system --public --source=. --remote=origin --push
```

---

### Passo 1.3: Conectar projeto local ao GitHub

1. Abra o terminal/PowerShell na pasta do projeto:
```bash
cd "C:\Users\jeanc\Desktop\PROJETOS APPS\Bless Pool System"
```

2. Verifique se já é um repositório Git:
```bash
git status
```

**Se aparecer erro "not a git repository":**
```bash
git init
```

3. Adicione todos os arquivos:
```bash
git add .
```

4. Faça o primeiro commit:
```bash
git commit -m "Initial commit - Bless Pool System"
```

5. Conecte ao repositório GitHub (substitua `SEU-USUARIO` e `SEU-REPOSITORIO`):
```bash
git remote add origin https://github.com/progjean/bless-pool-system
```

**Exemplo:**
```bash
git remote add origin https://github.com/jeanc/bless-pool-system.git
```

6. Envie o código para o GitHub:
```bash
git branch -M main
git push -u origin main
```

**Se pedir autenticação:**
- Use seu **username** do GitHub
- Use um **Personal Access Token** como senha (veja como criar abaixo)

---

### Passo 1.4: Criar Personal Access Token (se necessário)

Se o GitHub pedir autenticação:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Preencha:
   - **Note**: "Vercel Deploy"
   - **Expiration**: Escolha um prazo (ex: 90 dias)
   - **Scopes**: Marque **"repo"** (acesso completo aos repositórios)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você só verá ele uma vez!)
6. Use esse token como senha quando o Git pedir

---

## 🌐 PARTE 2: Criar Conta no Vercel

### Passo 2.1: Criar conta

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar sua conta GitHub
5. Complete o cadastro

---

## 🔗 PARTE 3: Conectar Repositório ao Vercel

### Passo 3.1: Importar Projeto

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Você verá uma lista dos seus repositórios GitHub
3. **Procure pelo seu repositório** (`bless-pool-system` ou o nome que você usou)
4. Clique em **"Import"** ao lado do repositório

**Se não aparecer seu repositório:**
- Clique em **"Adjust GitHub App Permissions"**
- Marque os repositórios que quer dar acesso
- Ou escolha **"All repositories"**
- Clique em **"Save"**
- Volte e clique em **"Import"** novamente

---

### Passo 3.2: Configurar o Projeto

O Vercel vai detectar automaticamente que é um projeto Vite. Você verá:

#### **Framework Preset:**
- Deve aparecer: **"Vite"** ✅
- Se não aparecer, selecione manualmente: **"Vite"**

#### **Root Directory:**
- Deixe como **"./"** (raiz do projeto) ✅

#### **Build Command:**
- Deve aparecer: **"npm run build"** ✅
- Se não aparecer, digite: `npm run build`

#### **Output Directory:**
- Deve aparecer: **"dist"** ✅
- Se não aparecer, digite: `dist`

#### **Install Command:**
- Deve aparecer: **"npm install"** ✅
- Se não aparecer, digite: `npm install`

---

### Passo 3.3: Configurar Variáveis de Ambiente

⚠️ **MUITO IMPORTANTE:** Configure as variáveis de ambiente antes de fazer o deploy!

1. Na seção **"Environment Variables"**, clique em **"Add"**
2. Adicione cada variável:

#### Variável 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: Cole a URL do seu projeto Supabase
  - Exemplo: `https://qwkybiozgnhkfkhekeuq.supabase.co`
- **Environment**: Marque todas as opções:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### Variável 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Cole a Anon Key do seu projeto Supabase
  - Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environment**: Marque todas as opções:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Como encontrar essas variáveis no Supabase:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **"Settings"** → **"API"**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

### Passo 3.4: Fazer o Deploy

1. Verifique se tudo está correto:
   - ✅ Framework: Vite
   - ✅ Build Command: npm run build
   - ✅ Output Directory: dist
   - ✅ Variáveis de ambiente configuradas
2. Clique em **"Deploy"**
3. Aguarde o processo (pode levar 2-5 minutos)

---

## ✅ PARTE 4: Verificar o Deploy

### Passo 4.1: Acompanhar o Build

Você verá uma tela mostrando:
- 📦 Installing dependencies...
- 🔨 Building...
- ✅ Build completed
- 🚀 Deploying...

**Se aparecer algum erro:**
- Clique em **"View Build Logs"** para ver detalhes
- Os erros mais comuns são:
  - Variáveis de ambiente não configuradas
  - Erros de build (mas já corrigimos a maioria!)

---

### Passo 4.2: Acessar seu Site

Quando o deploy terminar:

1. Você verá uma mensagem: **"Congratulations! Your project has been deployed."**
2. Você receberá uma URL automática, tipo:
   - `https://bless-pool-system-abc123.vercel.app`
3. Clique na URL para abrir seu site!

---

## 🔄 PARTE 5: Deploys Automáticos

### Como funciona:

✅ **A partir de agora, TUDO é automático!**

- Sempre que você fizer `git push` para o GitHub
- O Vercel detecta automaticamente
- Faz o build automaticamente
- Faz o deploy automaticamente
- Seu site atualiza sozinho!

### Para atualizar o site:

1. Faça suas alterações no código
2. No terminal:
```bash
git add .
git commit -m "Descrição das alterações"
git push
```
3. Aguarde alguns minutos
4. Seu site será atualizado automaticamente!

---

## 🎯 PARTE 6: Domínio Personalizado (Opcional)

### Passo 6.1: Adicionar Domínio Próprio

1. No dashboard do Vercel, vá em **"Settings"** → **"Domains"**
2. Digite seu domínio (ex: `meusite.com.br`)
3. Siga as instruções para configurar o DNS
4. Aguarde a verificação (pode levar algumas horas)

---

## 🐛 Solução de Problemas

### Problema 1: "Build failed"

**Solução:**
- Verifique os logs de build
- Certifique-se de que as variáveis de ambiente estão configuradas
- Verifique se o `package.json` tem o script `build`

### Problema 2: "Environment variables not found"

**Solução:**
- Vá em **Settings** → **Environment Variables**
- Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Faça um novo deploy

### Problema 3: "Repository not found"

**Solução:**
- Verifique se o repositório está público ou se você deu permissão ao Vercel
- Vá em **Settings** → **Git** → **Connect GitHub Account**

### Problema 4: Site não carrega / Erro de conexão

**Solução:**
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o Supabase está configurado corretamente
- Abra o console do navegador (F12) para ver erros específicos

---

## 📝 Checklist Final

Antes de fazer o deploy, verifique:

- [ ] Repositório criado no GitHub
- [ ] Código enviado para o GitHub (`git push`)
- [ ] Conta criada no Vercel
- [ ] Repositório conectado ao Vercel
- [ ] Framework detectado como "Vite"
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Variável `VITE_SUPABASE_URL` configurada
- [ ] Variável `VITE_SUPABASE_ANON_KEY` configurada
- [ ] Deploy iniciado
- [ ] Site funcionando!

---

## 🎉 Pronto!

Seu site está no ar! Compartilhe a URL com quem quiser.

**Lembre-se:**
- Cada `git push` atualiza o site automaticamente
- Você pode ver o histórico de deploys no dashboard do Vercel
- Cada branch pode ter um preview diferente

---

## 📞 Precisa de Ajuda?

Se tiver algum problema:
1. Verifique os logs de build no Vercel
2. Verifique o console do navegador (F12)
3. Verifique se as variáveis de ambiente estão corretas
4. Verifique se o Supabase está funcionando

**Documentação oficial:**
- Vercel: https://vercel.com/docs
- Vite: https://vitejs.dev/guide/static-deploy.html#vercel

