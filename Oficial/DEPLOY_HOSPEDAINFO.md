# 🚀 Guia de Deploy na Hospedainfo

## 📋 Pré-requisitos

1. Hospedainfo com suporte a Node.js
2. Acesso SSH ou painel de controle
3. Node.js instalado (versão 14+)

## 🔧 Passo a Passo

### 1. Fazer Upload dos Arquivos

Faça upload de TODA a pasta `Oficial` para a hospedagem via FTP ou Git:
- Via FTP: Upload da pasta `Oficial` para `public_html` ou `www`
- Via Git: Clone seu repositório na hospedagem

### 2. Instalar Dependências

No terminal SSH da hospedagem ou via painel, execute:

```bash
cd public_html/Oficial  # ou o caminho onde você fez upload
npm install
```

### 3. Configurar Variáveis de Ambiente

A hospedagem geralmente fornece uma porta via variável de ambiente `PORT`.

Crie um arquivo `.env` na raiz da pasta `Oficial` (se a hospedagem suportar) ou ajuste o código.

### 4. Iniciar o Servidor

**Opção A: Via Painel da Hospedainfo**
- Procure por "Aplicações Node.js" ou "Node.js Apps"
- Configure:
  - **Arquivo de entrada**: `server.js`
  - **Diretório**: `Oficial` (ou o caminho completo)
  - **Porta**: Deixe em branco (usará a variável PORT automaticamente)

**Opção B: Via SSH**
```bash
cd public_html/Oficial
node server.js
```

**Opção C: Usando PM2 (recomendado para produção)**
```bash
npm install -g pm2
cd public_html/Oficial
pm2 start server.js --name "in-stalker"
pm2 save
pm2 startup  # Siga as instruções para iniciar automaticamente
```

### 5. Configurar e Iniciar a API

O `server.js` principal faz proxy para a API na porta 8002. **Você precisa iniciar AMBOS os servidores:**

**Usando PM2 (RECOMENDADO - gerencia ambos os processos):**

```bash
# Instalar PM2 globalmente (se ainda não tiver)
npm install -g pm2

# Iniciar servidor da API
cd API
pm2 start server.js --name "api-server" --update-env
cd ..

# Iniciar servidor principal
pm2 start server.js --name "main-server" --update-env

# Salvar configuração
pm2 save

# Configurar para iniciar automaticamente ao reiniciar o servidor
pm2 startup
# Siga as instruções que aparecerem
```

**Ou usando o script fornecido:**

```bash
chmod +x start-production.sh
./start-production.sh
```

**IMPORTANTE:** 
- O servidor principal (`server.js`) precisa estar rodando na porta fornecida pela hospedagem (variável `PORT`)
- O servidor da API (`API/server.js`) precisa estar rodando na porta 8002 (ou a porta que você configurar)
- Se a hospedagem não permitir múltiplas portas, você precisará integrar a API diretamente no `server.js`

### 6. Verificar se Está Funcionando

Acesse:
- `https://in-stalker.site/api/health` - Deve retornar JSON com status "ok"
- `https://in-stalker.site/Inicio1/` - Deve carregar a página

## ⚠️ Problemas Comuns

### Erro 404 na API
- Verifique se o servidor está rodando
- Verifique se a porta está correta
- Verifique se o proxy está configurado

### Erro de conexão
- Verifique se todas as dependências foram instaladas (`npm install`)
- Verifique os logs do servidor
- Verifique se a variável PORT está configurada

### API não responde
- Verifique se o `API/server.js` está rodando (se usar processo separado)
- Verifique se a chave da API HikerAPI está configurada

## 📝 Notas Importantes

1. A hospedagem pode usar uma porta diferente de 3000/8002
2. Use variáveis de ambiente para configurações sensíveis (chaves de API)
3. Configure logs para debug em produção
4. Use PM2 ou similar para manter o servidor rodando
