# 🔧 Configuração do Proxy de Imagens

## 📋 PROBLEMA ATUAL

As imagens não estão carregando porque o `/proxy-image` não está acessível.

## ✅ SOLUÇÃO

O `server.js` principal já tem a rota `/proxy-image` (linha 271), mas o Apache precisa estar configurado para servir essa rota.

### Opção 1: Apache faz proxy de `/proxy-image` também

No Apache/LiteSpeed, adicione ao proxy:

```
/proxy-image/* → http://localhost:PORTA_DO_SERVER_JS/proxy-image/*
```

Onde `PORTA_DO_SERVER_JS` é a porta onde o `server.js` principal está rodando (não a porta 8002 da API).

### Opção 2: Usar a API para proxy-image

Se preferir, podemos fazer o `/proxy-image` passar pela API também. Nesse caso, o Apache já está configurado para fazer proxy de tudo que começa com `/api/` ou `/proxy-image`.

**Verifique no painel da hospedainfo:**
- O Apache está fazendo proxy de `/proxy-image` para o `server.js` principal?
- Ou precisa adicionar essa configuração?

## 🔍 TESTE

Acesse diretamente no navegador:
- `https://in-stalker.site/proxy-image?url=https://scontent-lga3-2.cdninstagram.com/v/t51.2885-19/469280503_618774417244536_6789387411220436489_n.jpg`

Se retornar a imagem, está funcionando!
Se retornar 404, precisa configurar o proxy no Apache.

