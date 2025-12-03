# 🔧 Solução: Imagem Abrindo em Nova Guia

## ❓ PROBLEMA

A imagem está abrindo em nova guia quando clicada, mostrando a URL direta do Instagram:
```
https://scontent-yyz1-1.cdninstagram.com/v/t51.2885-19/...
```

## 🔍 CAUSA

1. **O código já usa `/proxy-image`** ✅ (linha 683 do `Inicio1/index.html`)
2. **Mas o proxy não está funcionando no servidor** ❌
3. Quando o proxy falha, a imagem não carrega e o `onerror` esconde ela
4. O navegador tenta abrir a URL que está no `src`

## ✅ SOLUÇÃO

### **1. Configurar Proxy no Apache**

Adicione no Apache:

```apache
ProxyPass /proxy-image http://localhost:8002/proxy-image
ProxyPassReverse /proxy-image http://localhost:8002/proxy-image

ProxyPass /_next/image http://localhost:8002/_next/image
ProxyPassReverse /_next/image http://localhost:8002/_next/image
```

**OU** se o servidor principal está rodando (porta 3000):

```apache
ProxyPass /proxy-image http://localhost:3000/proxy-image
ProxyPassReverse /proxy-image http://localhost:3000/proxy-image

ProxyPass /_next/image http://localhost:3000/_next/image
ProxyPassReverse /_next/image http://localhost:3000/_next/image
```

### **2. Verificar Qual Porta Está Rodando**

No servidor, via SSH:

```bash
pm2 list
# ou
netstat -tulpn | grep node
```

### **3. Depois de Configurar**

- A imagem deve carregar normalmente na página
- Não vai mais abrir em nova guia
- O proxy vai funcionar corretamente

## 📝 IMPORTANTE

- O código **já está correto** - usa `/proxy-image?url=...`
- O problema é **configuração do Apache** - falta fazer proxy
- `localhost:8002` ou `localhost:3000` = **interno do servidor**
- Apache faz proxy de requisições externas para esse interno
