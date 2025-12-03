#!/bin/bash

# Script para manter o servidor sempre rodando
# Reinicia automaticamente se cair

cd "$(dirname "$0")"

echo "🔄 Iniciando servidor com auto-restart..."
echo "📝 Logs em: /tmp/server.log"
echo "🛑 Para parar: ps aux | grep 'node server.js' e kill -9 PID"
echo ""

while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Iniciando servidor..."
    
    # Iniciar servidor e salvar PID
    node server.js >> /tmp/server.log 2>&1 &
    SERVER_PID=$!
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Servidor iniciado (PID: $SERVER_PID)"
    
    # Aguardar processo terminar
    wait $SERVER_PID
    EXIT_CODE=$?
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ Servidor parou (exit code: $EXIT_CODE)"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Reiniciando em 2 segundos..."
    
    # Aguardar 2 segundos antes de reiniciar
    sleep 2
done
