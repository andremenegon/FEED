# 🔍 DESCOBERTA: API do DeepGram

## ✅ API IDENTIFICADA

O DeepGram usa a **HikerAPI** como backend!

### Endpoint Principal
```
GET https://api.hikerapi.com/v2/user/by/username?username={username}
```

### Exemplo
```
GET https://api.hikerapi.com/v2/user/by/username?username=andre.menegon
```

## 📋 Informações Capturadas

Durante a execução do script, foi identificado que:

1. **API Backend**: HikerAPI (`api.hikerapi.com`)
2. **Endpoint**: `/v2/user/by/username`
3. **Método**: GET
4. **Parâmetro**: `username` (query parameter)

## 🔑 Próximos Passos

Para usar a API diretamente, você precisa:

1. **Capturar a API Key** - O script precisa ser executado novamente para capturar os headers completos da requisição
2. **Verificar autenticação** - A API pode usar:
   - Header `Authorization`
   - Header `X-API-Key`
   - Query parameter `api_key` ou `key`
   - Cookie de autenticação

## 🚀 Como Usar

Execute o script novamente:
```bash
python3 deepgram_capture.py
```

O script vai:
- Abrir o Chrome
- Navegar até o DeepGram
- Clicar em "Espionar Agora"
- Digitar o username
- Capturar TODAS as requisições com headers completos
- Salvar em arquivos JSON e TXT

## 📝 Nota

O script já identificou que o DeepGram usa HikerAPI. Agora precisamos capturar os headers de autenticação completos para poder usar a API diretamente.
