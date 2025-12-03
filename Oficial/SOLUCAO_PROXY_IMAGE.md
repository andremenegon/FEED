# 🔧 Solução para /proxy-image não carregar

## 📋 PROBLEMA

As imagens não carregam porque o `/proxy-image` não está acessível no servidor.

## ✅ SOLUÇÃO

O Apache precisa fazer proxy de `/proxy-image` também.

### Configuração no Apache/LiteSpeed:

Adicione estas linhas ao arquivo de configuração do Apache (ou configure no painel da hospedainfo):

```apache
# Proxy para /proxy-image → API (porta 8002)
ProxyPass /proxy-image http://localhost:8002/proxy-image
ProxyPassReverse /proxy-image http://localhost:8002/proxy-image
```

**OU** se o `server.js` principal estiver rodando em outra porta:

```apache
# Proxy para /proxy-image → server.js principal
ProxyPass /proxy-image http://localhost:PORTA_DO_SERVER_JS/proxy-image
ProxyPassReverse /proxy-image http://localhost:PORTA_DO_SERVER_JS/proxy-image
```

Onde `PORTA_DO_SERVER_JS` é a porta onde o `server.js` principal está rodando.

## 🔍 VERIFICAÇÃO

Depois de configurar, teste:

```
https://in-stalker.site/proxy-image?url=https://scontent-lga3-2.cdninstagram.com/v/t51.2885-19/469280503_618774417244536_6789387411220436489_n.jpg
```

- ✅ Se retornar a imagem = Funcionando!
- ❌ Se retornar 404 = Precisa configurar o proxy

## 📝 NOTA

A API (`API/server.js`) já tem a rota `/proxy-image` (linha 596), então a primeira opção (proxy para porta 8002) é a mais simples, já que a API já está rodando.

