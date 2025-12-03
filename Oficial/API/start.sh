#!/bin/bash
echo "🚀 Iniciando servidor da API..."
cd "$(dirname "$0")"

# Matar processo na porta 8002 se existir
lsof -ti:8002 | xargs kill -9 2>/dev/null || true

# Aguardar um pouco
sleep 1

# Iniciar servidor
node server.js
