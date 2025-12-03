#!/bin/bash

# Script para iniciar o servidor em produção na hospedagem

echo "🚀 Iniciando servidores..."

# Verificar se a porta está definida
if [ -z "$PORT" ]; then
    echo "⚠️  Variável PORT não definida, usando porta padrão 3000"
    export PORT=3000
fi

# Definir porta da API (geralmente a mesma em produção, ou 8002 se permitir)
if [ -z "$API_PORT" ]; then
    export API_PORT=8002
fi

echo "📡 Porta principal: $PORT"
echo "📡 Porta da API: $API_PORT"

# Iniciar servidor da API em background (se a hospedagem permitir múltiplas portas)
if [ "$API_PORT" != "$PORT" ]; then
    echo "🔌 Iniciando servidor da API na porta $API_PORT..."
    cd API
    node server.js &
    API_PID=$!
    cd ..
    echo "✅ API iniciada (PID: $API_PID)"
else
    echo "⚠️  API_PORT igual a PORT - você precisa integrar a API no server.js principal"
fi

# Iniciar servidor principal
echo "🌐 Iniciando servidor principal na porta $PORT..."
node server.js
