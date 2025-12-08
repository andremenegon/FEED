# 🚀 Guia Rápido - Endpoints API Instagram

## 📍 Endpoint Base

```
GET /api-instagram.php
```

---

## 🎯 Endpoints Disponíveis

### 1. **Buscar Dados Completos do Usuário**

```bash
GET /api-instagram.php?username={username}&api=plagio
```

**Exemplo:**
```bash
curl "http://localhost:8000/api-instagram.php?username=eo.rosch&api=plagio"
```

**Retorna:**
- ✅ Dados do perfil (`account_data`)
- ✅ Seguidores (`followers`)
- ✅ Seguindo (`following`)
- ✅ Posts (`posts`)
- ✅ Stories (`stories`)
- ✅ Highlights (`highlights`)
- ✅ Perfis sugeridos (`chaining_results`)

---

### 2. **Batch de Posts (Múltiplos Usuários)**

```bash
GET /api-instagram.php?batch_posts=true&usernames={user1,user2,user3}&api=plagio
```

**Exemplo:**
```bash
curl "http://localhost:8000/api-instagram.php?batch_posts=true&usernames=user1,user2,user3&api=plagio"
```

**Retorna:**
- ✅ Primeiro post de cada usuário
- ⚠️ Limite: 25 usuários por requisição

---

## 📋 Parâmetros

| Parâmetro | Exemplo | Descrição |
|-----------|---------|-----------|
| `username` | `eo.rosch` | Username do Instagram |
| `api` | `plagio` | Tipo de API (só `plagio` funciona) |
| `batch_posts` | `true` | Ativa modo batch |
| `usernames` | `user1,user2` | Lista de usernames (batch) |

---

## 🔍 Estrutura de Resposta

```json
{
  "username": "eo.rosch",
  "api_type": "plagio",
  "requests": {
    "account_data": { "result": { "success": true, "data": {...} } },
    "followers": { "result": { "success": true, "data": [...] } },
    "following": { "result": { "success": true, "data": [...] } },
    "posts": { "result": { "success": true, "data": [...] } },
    "stories": { "result": { "success": true, "data": [...] } },
    "highlights": { "result": { "success": true, "data": [...] } }
  }
}
```

---

## ⚠️ Códigos de Erro

| Código | Significado | Ação |
|--------|-------------|------|
| `200` | ✅ Sucesso | Dados retornados |
| `403` | 🔒 Perfil Privado | Usar fallback (chaining_results) |
| `404` | ❌ Usuário não encontrado | Verificar username |
| `500` | ❌ Erro do servidor | Verificar logs |

---

## 💻 Exemplos de Uso

### JavaScript

```javascript
// Buscar dados completos
const data = await fetch('http://localhost:8000/api-instagram.php?username=eo.rosch&api=plagio')
  .then(r => r.json());

// Acessar dados
const profile = data.requests.account_data.result.data;
const followers = data.requests.followers.result.data;
const posts = data.requests.posts.result.data;
```

### cURL

```bash
# Dados completos
curl "http://localhost:8000/api-instagram.php?username=eo.rosch&api=plagio"

# Batch
curl "http://localhost:8000/api-instagram.php?batch_posts=true&usernames=user1,user2&api=plagio"
```

---

## 🔗 URLs Completas

**Local:**
```
http://localhost:8000/api-instagram.php?username=eo.rosch&api=plagio
```

**Produção:**
```
https://appofficial.website/in-stalker/API/api-instagram.php?username=eo.rosch&api=plagio
```

---

## 📚 Documentação Completa

Veja `ENDPOINTS.md` para documentação detalhada.



