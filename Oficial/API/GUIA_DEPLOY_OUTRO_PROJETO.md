# 🚀 Guia: Subir API em Outro Projeto

## 🌐 HOST DA API

```
https://api.hikerapi.com
```

**Versões disponíveis:**
- `v1` - Versão 1 da API
- `v2` - Versão 2 da API (mais recente)

## 🔑 CHAVE DA API

```
w46il1jfubi68wdnkci4m1i0udru9zdc
```

**Header necessário:**
```
x-access-key: w46il1jfubi68wdnkci4m1i0udru9zdc
```

**Exemplo de requisição:**
```javascript
const options = {
  headers: {
    'accept': 'application/json',
    'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
  }
};

https.get('https://api.hikerapi.com/v2/user/by/username?username=USERNAME', options, ...);
```

## 📦 DEPENDÊNCIAS

A API usa apenas módulos nativos do Node.js, **NÃO precisa instalar nada**:

- ✅ `http` (nativo)
- ✅ `https` (nativo)
- ✅ `url` (nativo)
- ✅ `fs` (nativo)
- ✅ `path` (nativo)
- ✅ `crypto` (nativo)

**Não precisa de `npm install`!**

## 📁 ARQUIVOS NECESSÁRIOS

Copie apenas estes arquivos:

```
API/
├── server.js          ← Arquivo principal
└── package.json       ← Opcional (só para referência)
```

## ⚙️ CONFIGURAÇÃO

### **1. Porta**

A API roda na porta **8002** por padrão. Para mudar, edite a linha 8 do `server.js`:

```javascript
const PORT = 8002; // ou a porta que você quiser
```

### **2. Variáveis de Ambiente (Opcional)**

Você pode usar variáveis de ambiente:

```bash
export PORT=8002
node server.js
```

## 🚀 COMO SUBIR

### **Opção 1: Direto**

```bash
cd /caminho/do/projeto
node server.js
```

### **Opção 2: Com PM2 (Recomendado para produção)**

```bash
# Instalar PM2 globalmente (só uma vez)
npm install -g pm2

# Iniciar a API
pm2 start server.js --name "api-server"

# Salvar configuração
pm2 save

# Ver logs
pm2 logs api-server
```

### **Opção 3: Como serviço do sistema**

```bash
pm2 startup
# Siga as instruções que aparecerem
pm2 save
```

## 📡 ENDPOINTS DISPONÍVEIS

### **1. GET /api/user?username=USERNAME**
Busca informações de um perfil do Instagram.

**Exemplo:**
```
GET http://localhost:8002/api/user?username=andre.menegon
```

### **2. GET /api/followers?username=USERNAME**
Busca seguidores de um perfil.

**Exemplo:**
```
GET http://localhost:8002/api/followers?username=andre.menegon
```

### **3. GET /api/following?username=USERNAME**
Busca quem o perfil segue.

**Exemplo:**
```
GET http://localhost:8002/api/following?username=andre.menegon
```

### **4. GET /api/user/posts?username=USERNAME&limit=N**
Busca posts de um perfil.

**Exemplo:**
```
GET http://localhost:8002/api/user/posts?username=andre.menegon&limit=12
```

### **5. GET /api/post?id=POST_ID**
Busca informações de um post específico.

**Exemplo:**
```
GET http://localhost:8002/api/post?id=123456789
```

### **6. GET /api/posts/batch**
Busca múltiplos posts (POST request com JSON).

**Exemplo:**
```bash
curl -X POST http://localhost:8002/api/posts/batch \
  -H "Content-Type: application/json" \
  -d '{"postIds": ["123", "456", "789"]}'
```

### **7. GET /proxy-image?url=IMAGE_URL**
Faz proxy de imagens do Instagram (resolve CORS).

**Exemplo:**
```
GET http://localhost:8002/proxy-image?url=https://scontent-xxx.cdninstagram.com/...
```

### **8. GET /_next/image?url=IMAGE_URL**
Mesma função do `/proxy-image`, estilo Next.js.

**Exemplo:**
```
GET http://localhost:8002/_next/image?url=https://scontent-xxx.cdninstagram.com/...
```

## 🔧 CONFIGURAR PROXY NO APACHE (Se necessário)

Se quiser que o Apache faça proxy para a API:

```apache
ProxyPass /api http://localhost:8002/api
ProxyPassReverse /api http://localhost:8002/api

ProxyPass /proxy-image http://localhost:8002/proxy-image
ProxyPassReverse /proxy-image http://localhost:8002/proxy-image

ProxyPass /_next/image http://localhost:8002/_next/image
ProxyPassReverse /_next/image http://localhost:8002/_next/image
```

## ✅ VERIFICAÇÃO

Teste se está funcionando:

```bash
curl http://localhost:8002/api/user?username=andre.menegon
```

Deve retornar JSON com dados do perfil.

## 📝 NOTAS IMPORTANTES

1. **Host da API Externa**: `https://api.hikerapi.com`
2. **Chave da API**: `w46il1jfubi68wdnkci4m1i0udru9zdc`
3. **Porta padrão**: 8002
4. **Versões da API**: v1 e v2 (a maioria usa v2)
5. **Sem dependências externas**: Usa apenas módulos nativos
6. **CORS**: A API já configura CORS automaticamente
7. **Cache**: Imagens são cacheadas em memória por 24 horas

## 🔗 ENDPOINTS DA API HIKERAPI USADOS

- `https://api.hikerapi.com/v2/user/by/username` - Buscar usuário
- `https://api.hikerapi.com/v2/user/stories/by/username` - Stories
- `https://api.hikerapi.com/v1/user/search/followers` - Seguidores
- `https://api.hikerapi.com/v1/user/search/following` - Seguindo
- `https://api.hikerapi.com/v1/user/medias` - Posts/Mídias
- `https://api.hikerapi.com/v2/media/by/id` - Post específico (v2)
- `https://api.hikerapi.com/v1/media/by/id` - Post específico (v1)

## 🔒 SEGURANÇA

⚠️ **IMPORTANTE**: A chave da API está hardcoded no código. Para produção, considere:

1. Usar variável de ambiente:
```javascript
const API_KEY = process.env.HIKERAPI_KEY || 'w46il1jfubi68wdnkci4m1i0udru9zdc';
```

2. Criar arquivo `.env`:
```
HIKERAPI_KEY=w46il1jfubi68wdnkci4m1i0udru9zdc
```

3. Adicionar `.env` ao `.gitignore`
