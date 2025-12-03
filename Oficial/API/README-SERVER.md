# 🚀 Servidor API - Instruções

## Status Atual
✅ Servidor rodando na porta 8002 com proteção contra crashes

## Melhorias Implementadas

### 1. 🛡️ Tratamento de Erros
- O servidor agora captura erros não tratados (`uncaughtException` e `unhandledRejection`)
- **NÃO cai mais** quando ocorre um erro - apenas loga o problema
- Logs salvos em: `/tmp/server.log`

### 2. 🏥 Health Check
- Novo endpoint: `GET /api/health`
- Retorna status do servidor, uptime, memória e tamanho do cache
- Use para monitorar se o servidor está funcionando

### 3. 🔄 Script de Auto-Restart
- Script criado: `keep-alive.sh`
- Reinicia automaticamente se o servidor cair
- Útil para produção

## Como Usar

### Iniciar Servidor Normal
```bash
cd "/Users/andremenegon/Documents/FEED/Oficial/API"
node server.js
```

### Iniciar com Auto-Restart
```bash
cd "/Users/andremenegon/Documents/FEED/Oficial/API"
./keep-alive.sh
```

### Verificar se está rodando
```bash
curl http://localhost:8002/api/health
```

### Ver logs em tempo real
```bash
tail -f /tmp/server.log
```

### Parar o servidor
```bash
# Encontrar o processo
ps aux | grep "node server.js" | grep -v grep

# Matar o processo (substitua PID pelo número encontrado)
kill -9 PID
```

## Endpoints Disponíveis

- ✅ `GET /api/health` - Health check (NOVO!)
- `GET /api/user?username=USERNAME`
- `GET /api/followers?username=USERNAME`
- `GET /api/following?username=USERNAME`
- `GET /api/chaining-results?username=USERNAME`
- `GET /api/user/posts?username=USERNAME`
- `GET /api/post?id=POST_ID`
- `POST /api/posts/batch` - Buscar posts de múltiplos usuários
- `GET /proxy-image?url=IMAGE_URL`
- `POST /api/clear-cache`

## Solução de Problemas

### Servidor não inicia
```bash
# Verificar se a porta está em uso
lsof -i :8002

# Se estiver, matar o processo
kill -9 PID
```

### Servidor está lento
```bash
# Limpar cache de imagens
curl -X POST http://localhost:8002/api/clear-cache
```

### Ver último erro
```bash
tail -50 /tmp/server.log | grep "❌"
```

## Notas Importantes

- ⚠️ O servidor agora **não cai** com erros - apenas loga
- 📝 Todos os erros são salvos em `/tmp/server.log`
- 🔄 Use `keep-alive.sh` para garantir que nunca fique fora do ar
- 🏥 Monitore o health check para ver o status em tempo real
