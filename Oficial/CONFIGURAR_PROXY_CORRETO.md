# 🔧 Configurar Proxy Corretamente no Apache

## 🎯 DECISÃO: Para qual porta fazer proxy?

Você tem **DUAS opções**, dependendo de qual servidor está rodando:

### **Opção A: Servidor Principal (server.js)**

Se o `server.js` está rodando (ex: porta 3000):

```apache
ProxyPass /proxy-image http://localhost:3000/proxy-image
ProxyPassReverse /proxy-image http://localhost:3000/proxy-image

ProxyPass /_next/image http://localhost:3000/_next/image
ProxyPassReverse /_next/image http://localhost:3000/_next/image
```

### **Opção B: API (API/server.js)**

Se a API está rodando separadamente na porta 8002:

```apache
ProxyPass /proxy-image http://localhost:8002/proxy-image
ProxyPassReverse /proxy-image http://localhost:8002/proxy-image

ProxyPass /_next/image http://localhost:8002/_next/image
ProxyPassReverse /_next/image http://localhost:8002/_next/image
```

## 🔍 Como descobrir qual está rodando?

**No servidor, via SSH:**

```bash
# Ver processos PM2
pm2 list

# Ver portas em uso
netstat -tulpn | grep node
# ou
lsof -i :3000
lsof -i :8002
```

## ✅ RECOMENDAÇÃO

**Use a Opção A (servidor principal)** se:
- O `server.js` está rodando
- Ele já tem as rotas `/proxy-image` e `/_next/image`
- É mais simples (um servidor só)

**Use a Opção B (API)** se:
- Apenas a API está rodando
- O servidor principal não está ativo

## 📝 IMPORTANTE

- `localhost:3000` ou `localhost:8002` = **interno do servidor**
- Apache faz proxy de `https://in-stalker.site/proxy-image` → `http://localhost:PORTA/proxy-image`
- É configuração do Apache, não do código
- O código continua usando `/proxy-image` (relativo)
