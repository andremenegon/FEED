# 🔍 Qual Porta Usar no Proxy do Apache?

## 🎯 Você tem DOIS servidores Node.js possíveis:

### **1. Servidor Principal (`server.js`)**
- Arquivo: `/Oficial/server.js`
- Porta padrão: **3000** (ou a que você configurou)
- Tem as rotas: `/proxy-image` e `/_next/image`
- Serve arquivos estáticos (HTML, CSS, JS)

### **2. Servidor API (`API/server.js`)**
- Arquivo: `/Oficial/API/server.js`
- Porta padrão: **8002**
- Tem as rotas: `/proxy-image` e `/_next/image`
- Serve apenas a API

## ✅ COMO DESCOBRIR QUAL ESTÁ RODANDO?

**No servidor, via SSH, execute:**

```bash
pm2 list
```

Isso vai mostrar algo assim:

```
┌─────┬──────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ status  │ port    │ restart  │
├─────┼──────────────┼─────────┼─────────┼──────────┤
│ 0   │ main-server  │ online  │ 3000    │ 0        │
│ 1   │ api-server   │ online  │ 8002    │ 0        │
└─────┴──────────────┴─────────┴─────────┴──────────┘
```

## 🎯 DECISÃO:

### **Se AMBOS estão rodando:**
Use a porta do **servidor principal** (3000), porque:
- Ele já serve arquivos estáticos
- Tem as rotas `/proxy-image` e `/_next/image`
- É mais simples

### **Se apenas a API está rodando:**
Use a porta **8002**

## 📝 CONFIGURAÇÃO DO APACHE:

**Se o servidor principal está na porta 3000:**

```apache
ProxyPass /proxy-image http://localhost:3000/proxy-image
ProxyPassReverse /proxy-image http://localhost:3000/proxy-image

ProxyPass /_next/image http://localhost:3000/_next/image
ProxyPassReverse /_next/image http://localhost:3000/_next/image
```

**Se apenas a API está na porta 8002:**

```apache
ProxyPass /proxy-image http://localhost:8002/proxy-image
ProxyPassReverse /proxy-image http://localhost:8002/proxy-image

ProxyPass /_next/image http://localhost:8002/_next/image
ProxyPassReverse /_next/image http://localhost:8002/_next/image
```

## 🔍 OUTRA FORMA DE VERIFICAR:

```bash
# Ver qual processo está usando qual porta
netstat -tulpn | grep node
# ou
lsof -i :3000
lsof -i :8002
```

## ✅ RESUMO:

1. Execute `pm2 list` no servidor
2. Veja qual porta está rodando
3. Configure o Apache para fazer proxy para essa porta
4. Pronto! 🎉
