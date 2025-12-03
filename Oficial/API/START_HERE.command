#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Iniciando servidor na porta 8002..."
lsof -ti:8002 | xargs kill -9 2>/dev/null || true
sleep 1
node server.js
