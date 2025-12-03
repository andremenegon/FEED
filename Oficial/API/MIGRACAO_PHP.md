# Migração: Node.js → PHP Backend

## Resumo da Migração

O projeto foi migrado de usar o servidor Node.js (porta 8002) para usar o servidor PHP em `https://appofficial.website/in-stalker/api-instagram.php`.

## Principais Mudanças

### 1. Função `getApiUrl()`

**Antes (Node.js):**
```javascript
function getApiUrl(endpoint) {
    if (localhost) {
        return `http://localhost:8002${endpoint}`;
    } else {
        return `https://in-stalker.site${endpoint}`;
    }
}
```

**Depois (PHP):**
```javascript
function getApiUrl(endpoint) {
    const PHP_BACKEND = 'https://appofficial.website/in-stalker';
    
    // Proxy de imagens mantém lógica local
    if (endpoint.startsWith('/proxy-image') || endpoint.startsWith('/_next/image')) {
        // ... lógica local
    }
    
    // Todas as outras requisições usam PHP
    if (endpoint.includes('?')) {
        return `${PHP_BACKEND}/api-instagram.php?${endpoint.split('?')[1]}&api=plagio`;
    }
    return `${PHP_BACKEND}/api-instagram.php`;
}
```

### 2. Endpoint Único

**Antes (Node.js - múltiplas requisições):**
```javascript
// Buscar usuário
const userRes = await fetch(getApiUrl('/api/user?username=...'));

// Buscar seguidores
const followersRes = await fetch(getApiUrl('/api/followers?username=...'));

// Buscar seguindo
const followingRes = await fetch(getApiUrl('/api/following?username=...'));
```

**Depois (PHP - uma única requisição):**
```javascript
// Uma única requisição retorna tudo
const response = await fetch(getApiUrl(`?username=${username}`));
const data = await response.json();

// Extrair dados
const user = data.requests.account_data.result.data;
const followers = data.requests.followers.result.data;
const following = data.requests.following.result.data;
const posts = data.requests.posts.result.data;
```

### 3. Estrutura de Dados

**Antes (Node.js v2):**
```javascript
const data = await response.json();
const user = data.user; // v2 retorna dentro de 'user'
const profilePicUrl = user.profile_pic_url || user.hd_profile_pic_url_info?.url;
```

**Depois (PHP v1):**
```javascript
const data = await response.json();
const user = data.requests.account_data.result.data; // PHP retorna dentro de requests
const profilePicUrl = user.profile_pic_url; // v1 funciona diretamente
```

### 4. Tratamento de Erros

**Antes:**
```javascript
if (!data || !data.user) {
    throw new Error('Usuário não encontrado');
}
```

**Depois:**
```javascript
if (data.error) {
    throw new Error(data.message || data.error);
}

const accountData = data.requests?.account_data?.result;
if (!accountData || !accountData.success || !accountData.data) {
    throw new Error(accountData?.error || 'Resposta inválida');
}
```

## Estrutura de Resposta do PHP

```json
{
  "username": "andre.menegon",
  "api_type": "plagio",
  "api_name": "API Plágio",
  "timestamp": "2024-12-03T...",
  "requests": {
    "account_data": {
      "name": "User Profile",
      "endpoint": "/v1/user/by/username",
      "result": {
        "success": true,
        "data": {
          "pk": 123456,
          "username": "andre.menegon",
          "full_name": "André Menegon",
          "profile_pic_url": "https://...",
          "follower_count": 1000,
          "following_count": 500,
          "media_count": 50
        }
      }
    },
    "followers": {
      "name": "Followers",
      "endpoint": "/v1/user/followers/chunk",
      "result": {
        "success": true,
        "data": [...]
      }
    },
    "following": {
      "name": "Following",
      "endpoint": "/v1/user/following/chunk",
      "result": {
        "success": true,
        "data": [...]
      }
    },
    "posts": {
      "name": "User Posts",
      "endpoint": "/v1/user/medias/chunk",
      "result": {
        "success": true,
        "data": [...]
      }
    }
  }
}
```

## Arquivos Modificados

1. **`Oficial/js/geral.js`**
   - Função `getApiUrl()` atualizada para usar PHP

2. **`Oficial/Inicio1/index.html`**
   - Função `getApiUrl()` atualizada
   - Busca de usuário atualizada para usar endpoint PHP único
   - Processamento de dados ajustado para estrutura PHP
   - Removidas múltiplas requisições (followers/following)
   - Batch de posts adaptado (usa dados da resposta principal)

3. **`Oficial/Direct/direct.html`**
   - Função `getApiUrl()` atualizada
   - Função `fetchFollowers()` atualizada para estrutura PHP

4. **`Oficial/debug-images.html`**
   - Função `getApiUrl()` atualizada
   - Função `searchUser()` atualizada para estrutura PHP

## Vantagens do PHP

1. **Foto de perfil funciona** - PHP usa v1 que retorna `profile_pic_url` diretamente
2. **Uma única requisição** - Mais rápido, menos requisições HTTP
3. **Já está em produção** - Não precisa configurar Node.js
4. **CORS configurado** - Já permite requisições de qualquer origem

## Desvantagens / Limitações

1. **Batch de posts** - PHP não tem endpoint `/api/posts/batch`, então usa posts da resposta principal
2. **URL fixa** - Depende do servidor `appofficial.website` estar disponível
3. **Sem cache local** - Não tem cache em memória como o Node.js tinha

## Como Usar no Outro Projeto

### 1. Copiar função `getApiUrl()`

```javascript
function getApiUrl(endpoint) {
    const PHP_BACKEND = 'https://appofficial.website/in-stalker';
    
    if (endpoint.startsWith('/proxy-image') || endpoint.startsWith('/_next/image')) {
        // Lógica local para proxy de imagens
        return `${window.location.protocol}//${window.location.hostname}${endpoint}`;
    }
    
    if (endpoint.includes('?')) {
        return `${PHP_BACKEND}/api-instagram.php?${endpoint.split('?')[1]}&api=plagio`;
    }
    
    return `${PHP_BACKEND}/api-instagram.php`;
}
```

### 2. Buscar dados do usuário

```javascript
async function buscarUsuario(username) {
    const response = await fetch(getApiUrl(`?username=${encodeURIComponent(username)}`));
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Verificar erro
    if (data.error) {
        throw new Error(data.message || data.error);
    }
    
    // Extrair dados
    const accountData = data.requests?.account_data?.result;
    if (!accountData?.success) {
        throw new Error(accountData?.error || 'Erro ao buscar perfil');
    }
    
    const user = accountData.data;
    const followers = data.requests?.followers?.result?.data || [];
    const following = data.requests?.following?.result?.data || [];
    const posts = data.requests?.posts?.result?.data || [];
    
    return {
        user: user,
        profilePicUrl: user.profile_pic_url,
        followers: followers,
        following: following,
        posts: posts
    };
}
```

### 3. Exemplo de uso

```html
<img id="profile-pic" src="" alt="Foto de perfil">
<h2 id="username"></h2>
<p id="full-name"></p>

<script>
async function carregarPerfil(username) {
    try {
        const dados = await buscarUsuario(username);
        
        // Foto de perfil (funciona!)
        document.getElementById('profile-pic').src = dados.profilePicUrl;
        document.getElementById('username').textContent = '@' + dados.user.username;
        document.getElementById('full-name').textContent = dados.user.full_name;
        
        console.log('Seguidores:', dados.followers.length);
        console.log('Seguindo:', dados.following.length);
        console.log('Posts:', dados.posts.length);
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar perfil: ' + error.message);
    }
}

carregarPerfil('mrbeast');
</script>
```

## Checklist de Verificação

- [x] Função `getApiUrl()` atualizada em todos os arquivos
- [x] Busca de usuário usando endpoint PHP único
- [x] Processamento de dados ajustado para estrutura PHP
- [x] Removidas múltiplas requisições desnecessárias
- [x] Tratamento de erros ajustado
- [x] Foto de perfil funcionando (PHP usa v1)
- [x] Seguidores e seguindo usando dados da resposta principal
- [x] Batch de posts adaptado (usa dados salvos)

## Notas Importantes

1. **Foto de perfil**: PHP usa v1, então `user.profile_pic_url` funciona diretamente (sem `data.user` wrapper)

2. **Proxy de imagens**: Mantido usando `proxy-image.php` local ou Node.js se disponível

3. **Batch de posts**: PHP não tem endpoint batch, então usa posts da resposta principal ou faz requisições individuais se necessário

4. **CORS**: PHP já está configurado para permitir requisições de qualquer origem

5. **URL do servidor**: Fixa em `https://appofficial.website/in-stalker/api-instagram.php`

## Troubleshooting

### Erro: "Foto de perfil não encontrada"
- Verificar se está acessando `data.requests.account_data.result.data` (não `data.user`)
- PHP usa v1, então `user.profile_pic_url` deve funcionar diretamente

### Erro: "Resposta inválida"
- Verificar estrutura: `data.requests.account_data.result.success` deve ser `true`
- Verificar se `data.requests.account_data.result.data` existe

### Erro: CORS
- PHP já deve estar configurado, mas verificar se `Access-Control-Allow-Origin: *` está presente

### Batch de posts não funciona
- PHP não tem endpoint batch, usar posts da resposta principal ou implementar lógica separada
