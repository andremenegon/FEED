# 🔍 Explicação: Proxy no Servidor

## ❓ O que é `localhost:8002` no servidor?

`localhost:8002` é a referência **INTERNA** do servidor. Significa:

- ✅ **No servidor:** O Node.js API está rodando em `localhost:8002` (porta interna)
- ✅ **Externamente:** Ninguém acessa `localhost:8002` diretamente
- ✅ **Apache faz proxy:** Requisições externas (`https://in-stalker.site/proxy-image`) → Apache → `http://localhost:8002/proxy-image` (interno)

## 🏗️ Arquitetura no Servidor

```
INTERNET
   ↓
https://in-stalker.site/proxy-image?url=...
   ↓
APACHE/LiteSpeed (porta 80/443)
   ↓ (faz proxy)
http://localhost:8002/proxy-image?url=...  ← Node.js API (porta interna)
```

## ✅ SOLUÇÃO: Duas Opções

### **Opção 1: Proxy para API (localhost:8002)**

Se a API está rodando na porta 8002:

```apache
ProxyPass /proxy-image http://localhost:8002/proxy-image
ProxyPassReverse /proxy-image http://localhost:8002/proxy-image

ProxyPass /_next/image http://localhost:8002/_next/image
ProxyPassReverse /_next/image http://localhost:8002/_next/image
```

### **Opção 2: Proxy para Servidor Principal**

Se o servidor principal (`server.js`) está rodando em outra porta (ex: 3000):

```apache
ProxyPass /proxy-image http://localhost:3000/proxy-image
ProxyPassReverse /proxy-image http://localhost:3000/proxy-image

ProxyPass /_next/image http://localhost:3000/_next/image
ProxyPassReverse /_next/image http://localhost:3000/_next/image
```

## 🔍 Como descobrir qual porta usar?

**No servidor, via SSH:**

```bash
# Ver qual processo está rodando em qual porta
pm2 list
# ou
netstat -tulpn | grep node
# ou
lsof -i :8002
lsof -i :3000
```

## 📝 IMPORTANTE

- `localhost:8002` = **interno do servidor** (não acessível da internet)
- Apache faz proxy de requisições **externas** para esse **interno**
- É uma configuração do Apache, não do código
- O código continua usando `/proxy-image` (relativo), o Apache resolve o proxy
