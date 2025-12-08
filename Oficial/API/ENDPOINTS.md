# 📚 Documentação dos Endpoints - API Instagram

## 🎯 Endpoint Principal

### `GET /api-instagram.php`

API para buscar múltiplos dados do Instagram usando diferentes provedores de API.

---

## 📋 Parâmetros da Query String

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `username` | string | Não | `mrbeast` | Nome de usuário do Instagram |
| `api` | string | Não | `scraper` | Tipo de API: `scraper`, `social` ou `plagio` |
| `batch_posts` | string | Não | - | Se `true`, processa batch de posts |
| `usernames` | string | Não | - | Lista de usernames separados por vírgula (para batch) |

---

## 🔌 Tipos de API Disponíveis

### 1. **API Plágio (HikerAPI)** - `api=plagio` ✅ **IMPLEMENTADA**

**Host:** `api.hikerapi.com`  
**Método:** GET  
**Autenticação:** Header `x-access-key`

**Endpoints internos utilizados:**
- `/v1/user/by/username` - Buscar dados do usuário
- `/v1/user/chaining` - Buscar perfis sugeridos
- `/v1/user/followers/chunk` - Buscar seguidores
- `/v1/user/following/chunk` - Buscar seguindo
- `/v1/user/medias/chunk` - Buscar posts
- `/v1/user/stories` - Buscar stories
- `/v1/user/highlights` - Buscar highlights

### 2. **API Scraper** - `api=scraper` ⚠️ **NÃO IMPLEMENTADA**

**Host:** `instagram-scraper-stable-api.p.rapidapi.com`  
**Método:** POST  
**Autenticação:** Headers RapidAPI

### 3. **API Social** - `api=social` ⚠️ **NÃO IMPLEMENTADA**

**Host:** `instagram-social-api.p.rapidapi.com`  
**Método:** GET  
**Autenticação:** Headers RapidAPI

---

## 📥 Exemplos de Requisições

### 1. Buscar dados completos de um usuário (API Plágio)

```bash
GET /api-instagram.php?username=eo.rosch&api=plagio
```

**Resposta:**
```json
{
  "username": "eo.rosch",
  "api_type": "plagio",
  "api_name": "API Plágio",
  "timestamp": "2024-01-15T10:30:00+00:00",
  "requests": {
    "account_data": {
      "name": "User Profile",
      "endpoint": "/v1/user/by/username",
      "result": {
        "success": true,
        "data": {
          "pk": 50013941674,
          "username": "eo.rosch",
          "full_name": "Nome Completo",
          "profile_pic_url": "https://...",
          "follower_count": 1000,
          "following_count": 500,
          "media_count": 150,
          "is_private": false,
          "chaining_results": [...]
        },
        "http_code": 200
      }
    },
    "followers": {
      "name": "Followers",
      "endpoint": "/v1/user/followers/chunk",
      "result": {
        "success": true,
        "data": [...],
        "http_code": 200
      }
    },
    "following": {
      "name": "Following",
      "endpoint": "/v1/user/following/chunk",
      "result": {
        "success": true,
        "data": [...],
        "http_code": 200
      }
    },
    "posts": {
      "name": "User Posts",
      "endpoint": "/v1/user/medias/chunk",
      "result": {
        "success": true,
        "data": [...],
        "http_code": 200
      }
    },
    "stories": {
      "name": "User Stories",
      "endpoint": "/v1/user/stories",
      "result": {
        "success": true,
        "data": [...],
        "http_code": 200
      }
    },
    "highlights": {
      "name": "User Highlights",
      "endpoint": "/v1/user/highlights",
      "result": {
        "success": true,
        "data": [...],
        "http_code": 200
      }
    }
  }
}
```

### 2. Buscar batch de posts (múltiplos usuários)

```bash
GET /api-instagram.php?batch_posts=true&usernames=user1,user2,user3&api=plagio
```

**Resposta:**
```json
{
  "batch_results": [
    {
      "username": "user1",
      "success": true,
      "post": { ... },
      "error": null
    },
    {
      "username": "user2",
      "success": true,
      "post": { ... },
      "error": null
    },
    {
      "username": "user3",
      "success": false,
      "post": null,
      "error": "HTTP 404"
    }
  ],
  "timestamp": "2024-01-15T10:30:00+00:00"
}
```

**Limite:** Máximo de 25 usuários por requisição batch.

---

## 🔍 Estrutura de Resposta

### Resposta de Sucesso

```json
{
  "username": "string",
  "api_type": "plagio|scraper|social",
  "api_name": "string",
  "timestamp": "ISO 8601",
  "requests": {
    "account_data": {
      "name": "string",
      "endpoint": "string",
      "result": {
        "success": true|false,
        "data": object|array|null,
        "error": string|null,
        "http_code": number,
        "raw_response": string|null
      }
    },
    "followers": { ... },
    "following": { ... },
    "posts": { ... },
    "stories": { ... },
    "highlights": { ... }
  }
}
```

### Resposta de Erro

```json
{
  "error": true,
  "message": "Mensagem de erro",
  "timestamp": "ISO 8601"
}
```

**Códigos HTTP de Erro:**
- `400` - Requisição inválida
- `403` - Perfil privado ou acesso negado
- `404` - Usuário não encontrado
- `500` - Erro interno do servidor

---

## 🚀 Como Usar

### Via cURL

```bash
# Buscar dados completos
curl "http://localhost:8000/api-instagram.php?username=eo.rosch&api=plagio"

# Batch de posts
curl "http://localhost:8000/api-instagram.php?batch_posts=true&usernames=user1,user2&api=plagio"
```

### Via JavaScript (Fetch)

```javascript
// Buscar dados completos
const response = await fetch('http://localhost:8000/api-instagram.php?username=eo.rosch&api=plagio');
const data = await response.json();
console.log(data);

// Batch de posts
const batchResponse = await fetch('http://localhost:8000/api-instagram.php?batch_posts=true&usernames=user1,user2&api=plagio');
const batchData = await batchResponse.json();
console.log(batchData);
```

### Via Node.js Server (server.js)

O `server.js` na porta 8002 pode fazer proxy para esta API:

```javascript
// Exemplo de uso no server.js
const apiUrl = `http://localhost:8000/api-instagram.php?username=${username}&api=plagio`;
const response = await fetch(apiUrl);
const data = await response.json();
```

---

## 📊 Dados Retornados

### account_data (Dados do Perfil)

```json
{
  "pk": 50013941674,
  "username": "eo.rosch",
  "full_name": "Nome Completo",
  "profile_pic_url": "https://cdninstagram.com/...",
  "profile_pic_url_hd": "https://cdninstagram.com/...",
  "follower_count": 1000,
  "following_count": 500,
  "media_count": 150,
  "is_private": false,
  "biography": "Bio do usuário",
  "chaining_results": [
    {
      "pk": 123456,
      "username": "sugerido1",
      "full_name": "Nome",
      "profile_pic_url": "https://...",
      "is_private": false
    }
  ]
}
```

### followers / following (Lista de Usuários)

```json
[
  {
    "pk": 123456,
    "username": "user1",
    "full_name": "Nome",
    "profile_pic_url": "https://...",
    "is_private": false
  }
]
```

### posts (Posts do Usuário)

```json
[
  {
    "pk": "post_id",
    "id": "post_id",
    "media_type": 1,
    "image_versions2": {
      "candidates": [
        {
          "url": "https://cdninstagram.com/...",
          "width": 1080,
          "height": 1080
        }
      ]
    },
    "like_count": 100,
    "comment_count": 10,
    "caption": {
      "text": "Legenda do post"
    },
    "taken_at": 1234567890,
    "taken_at_ts": 1234567890
  }
]
```

---

## ⚡ Performance

- **Requisições em Paralelo:** Todas as requisições são feitas simultaneamente usando `curl_multi_init()`
- **Timeout:** 10 segundos por requisição
- **Timeout de Conexão:** 3 segundos
- **Compressão:** Gzip/Deflate habilitado
- **Cache:** Não implementado (cada requisição é nova)

---

## 🔒 Tratamento de Erros

### Perfil Privado (403)

Quando um perfil é privado, a API retorna:
- `http_code: 403` nos resultados
- `success: false` no resultado
- `error: "HTTP 403"` na mensagem de erro

**No frontend (`feed.html`):**
- Detecta automaticamente erro 403
- Marca perfil como privado no localStorage
- Usa `chaining_results` para stories fallback
- Usa posts fallback (conteúdo restrito)

### Usuário Não Encontrado (404)

```json
{
  "error": true,
  "message": "Erro ao buscar dados do usuário: HTTP 404",
  "timestamp": "2024-01-15T10:30:00+00:00"
}
```

---

## 📝 Notas Importantes

1. **API Plágio é a única implementada** - As APIs `scraper` e `social` não estão implementadas no código atual
2. **Batch limitado a 25 usuários** - Requisições batch são limitadas a 25 usuários
3. **Chaining Results** - Incluído automaticamente em `account_data.result.data.chaining_results`
4. **CORS habilitado** - Headers CORS permitem requisições de qualquer origem
5. **Timeout de execução** - Máximo de 60 segundos para processar toda a requisição

---

## 🔗 URLs de Exemplo

```bash
# Localhost (PHP built-in server)
http://localhost:8000/api-instagram.php?username=eo.rosch&api=plagio

# Produção (assumindo domínio)
https://appofficial.website/in-stalker/API/api-instagram.php?username=eo.rosch&api=plagio
```

---

## 📞 Suporte

Para problemas ou dúvidas, verifique:
1. Logs do servidor PHP
2. Código HTTP retornado
3. Campo `error` na resposta JSON
4. Campo `raw_response` para debug (primeiros 500 caracteres)



