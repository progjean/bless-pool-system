# Variáveis de Ambiente

Este arquivo documenta todas as variáveis de ambiente necessárias para o projeto.

## Configuração

Crie um arquivo `.env` na raiz do projeto baseado neste exemplo:

```env
# Supabase Configuration (Recomendado)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# API Configuration (Alternativa - se usar backend próprio)
VITE_API_URL=http://localhost:3001/api

# Authentication
# Se true, usa autenticação mockada (desenvolvimento)
# Se Supabase estiver configurado, será usado automaticamente
VITE_USE_MOCK_AUTH=true

# Email Service (SendGrid, AWS SES, etc.)
VITE_EMAIL_SERVICE_API_KEY=your_email_api_key_here
VITE_EMAIL_SERVICE_URL=https://api.sendgrid.com/v3

# PDF Service (opcional - se usar serviço externo)
VITE_PDF_SERVICE_URL=https://api.pdfservice.com

# Maps API (Google Maps ou Mapbox)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
# ou
VITE_MAPBOX_API_KEY=your_mapbox_api_key_here

# File Upload (S3, Cloudinary, etc.)
VITE_UPLOAD_SERVICE_URL=https://api.cloudinary.com/v1_1/your_cloud_name
VITE_UPLOAD_PRESET=your_upload_preset

# Environment
VITE_ENV=development
```

## Descrição das Variáveis

### VITE_SUPABASE_URL
URL do projeto Supabase. Obtenha em: https://app.supabase.com → Seu Projeto → Settings → API

### VITE_SUPABASE_ANON_KEY
Chave pública (anon key) do Supabase. Obtenha em: https://app.supabase.com → Seu Projeto → Settings → API

### VITE_API_URL
URL base da API backend (se não usar Supabase). Padrão: `http://localhost:3001/api`

### VITE_USE_MOCK_AUTH
Se `true`, usa autenticação mockada para desenvolvimento. Em produção, deve ser `false` ou não definido.

### VITE_EMAIL_SERVICE_API_KEY
Chave da API do serviço de e-mail (SendGrid, AWS SES, etc.)

### VITE_EMAIL_SERVICE_URL
URL do serviço de e-mail

### VITE_PDF_SERVICE_URL
URL do serviço de geração de PDF (opcional, se usar serviço externo)

### VITE_GOOGLE_MAPS_API_KEY
Chave da API do Google Maps (se usar Google Maps)

### VITE_MAPBOX_API_KEY
Chave da API do Mapbox (se usar Mapbox)

### VITE_UPLOAD_SERVICE_URL
URL do serviço de upload de arquivos (S3, Cloudinary, etc.)

### VITE_UPLOAD_PRESET
Preset de upload (específico do Cloudinary)

### VITE_ENV
Ambiente da aplicação: `development`, `staging`, `production`

