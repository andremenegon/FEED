# API Proxy - Oficial

Servidor proxy para evitar problemas de CORS com a API HikerAPI e imagens do Instagram.

## 🚀 Como usar

1. Instale as dependências (se necessário):
```bash
cd API
npm install
```

2. Inicie o servidor:
```bash
node server.js
```

O servidor estará rodando em **http://localhost:8002**

## 📡 Endpoints

### GET /api/user?username=USERNAME
Busca informações de um perfil do Instagram via HikerAPI.

**Exemplo:**
```
GET http://localhost:8002/api/user?username=andre.menegon
```

### GET /proxy-image?url=IMAGE_URL
Faz proxy de imagens do Instagram para evitar problemas de CORS.

**Exemplo:**
```
GET http://localhost:8002/proxy-image?url=https://scontent-xxx.cdninstagram.com/...
```

## ⚙️ Configuração

O servidor roda na porta **8002** por padrão. Para alterar, edite a variável `PORT` no arquivo `server.js`.
