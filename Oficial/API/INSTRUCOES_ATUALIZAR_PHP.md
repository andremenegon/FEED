# Instruções para Atualizar api-instagram.php no Servidor

## Resumo das Mudanças

O arquivo `api-instagram.php` foi atualizado com duas funcionalidades críticas:

1. **Endpoint Batch de Posts** - Permite buscar posts de múltiplos usuários em uma única requisição
2. **Garantia de chaining_results** - Garante que perfis sugeridos (chaining_results) sejam retornados para perfis privados

## Arquivo a Atualizar

**Localização no servidor:** `https://appofficial.website/in-stalker/api-instagram.php`

**Arquivo local modificado:** `Oficial/API/api-instagram.php`

## Mudanças Implementadas

### 1. Endpoint Batch de Posts

**Novo parâmetro:**
```
?usernames=user1,user2,user3&batch_posts=true&api=plagio
```

**Funcionalidade:**
- Aceita lista de usernames separados por vírgula
- Busca posts de cada usuário em paralelo (curl_multi)
- Retorna apenas o primeiro post de cada usuário
- Limita a 25 usuários por requisição
- Formato de resposta: `{batch_results: [{username: "user1", success: true, post: {...}}, ...]}`

**Exemplo de uso:**
```
GET /api-instagram.php?usernames=mrbeast,pewdiepie,selenagomez&batch_posts=true&api=plagio
```

**Resposta:**
```json
{
  "batch_results": [
    {
      "username": "mrbeast",
      "success": true,
      "post": { ... }
    },
    {
      "username": "pewdiepie",
      "success": true,
      "post": { ... }
    }
  ],
  "timestamp": "2024-12-03T..."
}
```

### 2. Garantia de chaining_results

**Mudança:**
- Verifica se `chaining_results` está presente na resposta de `/v1/user/by/username`
- Garante que seja incluído em `account_data.result.data.chaining_results`
- Adiciona logging para debug

**Estrutura:**
```json
{
  "requests": {
    "account_data": {
      "result": {
        "data": {
          "pk": 123456,
          "username": "usuario_privado",
          "chaining_results": [
            { "username": "perfil1", "profile_pic_url": "...", ... },
            { "username": "perfil2", "profile_pic_url": "...", ... }
          ]
        }
      }
    }
  }
}
```

## Como Testar Após Atualização

### Teste 1 - Perfil Público (Dados Básicos)
```
GET https://appofficial.website/in-stalker/api-instagram.php?username=mrbeast&api=plagio
```

**Verificar:**
- `requests.account_data.result.data` contém dados do usuário
- `requests.followers.result.data` contém lista de seguidores
- `requests.following.result.data` contém lista de seguindo
- `requests.posts.result.data` contém posts do usuário

### Teste 2 - Perfil Privado (chaining_results)
```
GET https://appofficial.website/in-stalker/api-instagram.php?username=usuario_privado&api=plagio
```

**Verificar:**
- `requests.account_data.result.data.chaining_results` existe
- `chaining_results` é um array com perfis sugeridos
- Cada item tem `username`, `profile_pic_url`, etc.

### Teste 3 - Batch de Posts
```
GET https://appofficial.website/in-stalker/api-instagram.php?usernames=mrbeast,pewdiepie,selenagomez&batch_posts=true&api=plagio
```

**Verificar:**
- `batch_results` existe e é um array
- Cada item tem `username`, `success`, `post`
- `post` contém dados do primeiro post do usuário

## Mensagem para Enviar ao Chat do Projeto

```
Olá! Preciso atualizar o arquivo api-instagram.php com as seguintes mudanças:

1. ADICIONAR ENDPOINT BATCH DE POSTS
   - Permite buscar posts de múltiplos usuários em uma única requisição
   - Parâmetro: ?usernames=user1,user2,user3&batch_posts=true&api=plagio
   - Limita a 25 usuários por requisição
   - Retorna formato: {batch_results: [{username, success, post}, ...]}

2. GARANTIR CHAINING_RESULTS
   - Verificar que chaining_results está sendo retornado em account_data.result.data
   - Necessário para perfis privados (perfis sugeridos)
   - Adiciona logging para debug

3. OTIMIZAÇÕES
   - Requisições em paralelo para batch (curl_multi)
   - Timeout ajustado para 10s
   - Logging para debug

Arquivo anexado: api-instagram.php

Após atualizar, testar com:
- Perfil público: verificar se batch de posts funciona
- Perfil privado: verificar se chaining_results está presente

Obrigado!
```

## Arquivos Modificados no Frontend

Após atualizar o PHP, o frontend já está preparado para usar:

1. **Inicio1/index.html** - Usa batch do PHP para buscar posts de seguidos/sugeridos
2. **feed/feed.html** - Usa batch do PHP para buscar posts do feed
3. **Inicio1/index.html** - Salva chaining_results no localStorage automaticamente

## Notas Importantes

1. **Limite de 25 usuários** - Mantido para evitar timeout
2. **Timeout de 10s** - Suficiente para buscar 25 posts em paralelo
3. **Fallback** - Se batch falhar, frontend usa posts salvos do localStorage
4. **Logging** - Logs adicionados para facilitar debug no servidor

## Checklist de Verificação

- [ ] Arquivo PHP atualizado no servidor
- [ ] Teste 1 (perfil público) funciona
- [ ] Teste 2 (perfil privado) retorna chaining_results
- [ ] Teste 3 (batch de posts) funciona
- [ ] Frontend consegue buscar posts via batch
- [ ] Feed exibe posts corretamente

## Suporte

Se houver problemas:
1. Verificar logs do servidor PHP
2. Verificar console do navegador (F12)
3. Testar endpoints individualmente
4. Verificar se API key está correta
