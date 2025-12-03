# 🔍 Como a API Está Sendo Usada Atualmente

## 🏗️ ARQUITETURA

```
Frontend (JavaScript)
    ↓
    fetch('/api/user?username=...')
    ↓
Servidor Node.js (API/server.js) - Porta 8002
    ↓
    https.get('https://api.hikerapi.com/v2/user/by/username?...')
    ↓
API HikerAPI Externa
    ↓
    Retorna JSON
    ↓
Servidor Node.js (faz proxy, adiciona CORS)
    ↓
Frontend recebe dados
```

## 📡 COMO O SERVIDOR NODE.JS FAZ PROXY

### **1. Endpoint: GET /api/user**

**Código no servidor:**
```javascript
else if (parsedUrl.pathname === '/api/user') {
  const username = parsedUrl.query.username;
  
  // URL da API HikerAPI
  const apiUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}&force=on`;
  
  // Headers com a chave
  const options = {
    headers: {
      'accept': 'application/json',
      'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
    }
  };
  
  // Fazer requisição HTTPS
  https.get(apiUrl, options, (apiRes) => {
    let data = '';
    
    apiRes.on('data', (chunk) => {
      data += chunk;
    });
    
    apiRes.on('end', () => {
      // Retornar dados diretamente (faz proxy)
      res.end(data);
    });
  });
}
```

**Fluxo:**
1. Recebe: `GET /api/user?username=andre.menegon`
2. Monta URL: `https://api.hikerapi.com/v2/user/by/username?username=andre.menegon&force=on`
3. Adiciona header: `x-access-key: w46il1jfubi68wdnkci4m1i0udru9zdc`
4. Faz requisição HTTPS para HikerAPI
5. Retorna resposta diretamente (proxy transparente)

### **2. Endpoint: GET /api/followers**

**Código no servidor:**
```javascript
else if (parsedUrl.pathname === '/api/followers') {
  const username = parsedUrl.query.username;
  
  // PASSO 1: Buscar usuário para pegar o ID (pk)
  const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
  
  https.get(userUrl, userOptions, (userRes) => {
    // PASSO 2: Parse do JSON para pegar o pk
    const userJson = JSON.parse(userData);
    const userId = userJson.user.pk;
    
    // PASSO 3: Buscar seguidores usando o ID
    const followersUrl = `https://api.hikerapi.com/v1/user/search/followers?user_id=${userId}&query=&force=on`;
    
    https.get(followersUrl, userOptions, (followersRes) => {
      // PASSO 4: Processar e retornar
      res.end(followersData);
    });
  });
}
```

**Fluxo:**
1. Recebe: `GET /api/followers?username=andre.menegon`
2. Busca usuário primeiro: `v2/user/by/username` → pega `user.pk`
3. Busca seguidores: `v1/user/search/followers?user_id={pk}`
4. Retorna lista de seguidores

### **3. Endpoint: GET /api/following**

Mesma lógica do followers, mas usa:
```javascript
const followingUrl = `https://api.hikerapi.com/v1/user/search/following?user_id=${userId}&query=&force=on`;
```

### **4. Endpoint: GET /api/user/posts**

**Código:**
```javascript
// PASSO 1: Buscar usuário
const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${username}`;
// Pega user.pk

// PASSO 2: Buscar posts
const postsUrl = `https://api.hikerapi.com/v1/user/medias?user_id=${targetUserId}`;
```

### **5. Endpoint: GET /api/post?id=POST_ID**

**Código:**
```javascript
// Tenta v2 primeiro
const apiUrl = `https://api.hikerapi.com/v2/media/by/id?id=${encodeURIComponent(postId)}`;

// Se falhar, tenta v1
const apiUrl = `https://api.hikerapi.com/v1/media/by/id?id=${encodeURIComponent(postId)}`;
```

## 💻 COMO O FRONTEND FAZ REQUISIÇÕES

### **Função getApiUrl()**

```javascript
function getApiUrl(endpoint) {
  const isLocalhost = window.location.hostname === 'localhost';
  
  if (isLocalhost) {
    // Local: http://localhost:8002/api/...
    return `http://localhost:8002${endpoint}`;
  } else {
    // Produção: https://in-stalker.site/api/...
    // Apache faz proxy de /api/* para localhost:8002/api/*
    return `${protocol}//${hostname}${endpoint}`;
  }
}
```

### **Exemplo de Uso no Frontend**

```javascript
// Buscar usuário
const response = await fetch(getApiUrl(`/api/user?username=${encodeURIComponent(username)}`));

if (!response.ok) {
  // Tratar erro
  const errorData = await response.json();
  alert(errorData.error);
  return;
}

const data = await response.json();
const user = data.user;

// Usar os dados
console.log(user.username);
console.log(user.full_name);
console.log(user.profile_pic_url);
```

## 🔑 HEADERS NECESSÁRIOS

**Sempre usar:**
```javascript
headers: {
  'accept': 'application/json',
  'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
}
```

## 📋 ENDPOINTS DA API HIKERAPI USADOS

| Endpoint | Versão | Uso |
|----------|--------|-----|
| `/v2/user/by/username` | v2 | Buscar usuário por username |
| `/v1/user/search/followers` | v1 | Buscar seguidores (precisa user_id) |
| `/v1/user/search/following` | v1 | Buscar seguindo (precisa user_id) |
| `/v1/user/medias` | v1 | Buscar posts (precisa user_id) |
| `/v2/media/by/id` | v2 | Buscar post específico (tenta primeiro) |
| `/v1/media/by/id` | v1 | Buscar post específico (fallback) |
| `/v2/user/stories/by/username` | v2 | Stories (não usado, desabilitado) |

## 🔄 FLUXO COMPLETO: Buscar Seguidores

```
1. Frontend: fetch('/api/followers?username=andre.menegon')
   ↓
2. Servidor Node.js recebe: GET /api/followers?username=andre.menegon
   ↓
3. Servidor faz: GET https://api.hikerapi.com/v2/user/by/username?username=andre.menegon
   Headers: { 'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc' }
   ↓
4. HikerAPI retorna: { user: { pk: 123456, username: 'andre.menegon', ... } }
   ↓
5. Servidor pega: user.pk = 123456
   ↓
6. Servidor faz: GET https://api.hikerapi.com/v1/user/search/followers?user_id=123456&force=on
   Headers: { 'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc' }
   ↓
7. HikerAPI retorna: { users: [{ username: '...', profile_pic_url: '...' }, ...] }
   ↓
8. Servidor retorna para frontend (proxy transparente)
   ↓
9. Frontend recebe e processa os dados
```

## 🛡️ CORS

O servidor Node.js adiciona automaticamente:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-key, accept');
```

## ⚠️ PONTOS IMPORTANTES

1. **Sempre usar `force=on`** quando disponível (pula verificações de privacidade)
2. **Para followers/following/posts**: Precisa primeiro buscar o usuário para pegar o `pk` (ID)
3. **Proxy transparente**: O servidor Node.js apenas repassa a resposta da HikerAPI
4. **Sem processamento**: Os dados vêm direto da HikerAPI, sem transformação
5. **Cache**: Apenas para imagens (`/proxy-image`), não para dados da API

## 📝 EXEMPLO COMPLETO: Buscar Usuário

**Frontend:**
```javascript
const username = 'andre.menegon';
const response = await fetch(getApiUrl(`/api/user?username=${username}`));
const data = await response.json();
const user = data.user;

console.log(user.username);        // 'andre.menegon'
console.log(user.full_name);       // 'André Menegon'
console.log(user.profile_pic_url); // URL da foto
console.log(user.pk);              // ID numérico
```

**Servidor (o que acontece internamente):**
```javascript
// Recebe: GET /api/user?username=andre.menegon
// Faz: GET https://api.hikerapi.com/v2/user/by/username?username=andre.menegon&force=on
// Com header: x-access-key: w46il1jfubi68wdnkci4m1i0udru9zdc
// Retorna: { user: { ... } }
```

## 🔧 PARA REPLICAR EM OUTRO PROJETO

1. **Copie o arquivo `API/server.js`**
2. **Configure a porta** (padrão: 8002)
3. **A chave já está no código**: `w46il1jfubi68wdnkci4m1i0udru9zdc`
4. **Execute**: `node server.js`
5. **No frontend**: Use `getApiUrl('/api/...')` ou faça requisições diretas para `http://localhost:8002/api/...`

## ✅ RESUMO

- **Servidor Node.js** faz proxy para `https://api.hikerapi.com`
- **Chave**: `w46il1jfubi68wdnkci4m1i0udru9zdc` (no header `x-access-key`)
- **Frontend** faz requisições para `/api/*` que são proxyadas
- **Dados** vêm direto da HikerAPI, sem processamento
- **CORS** configurado automaticamente pelo servidor Node.js
