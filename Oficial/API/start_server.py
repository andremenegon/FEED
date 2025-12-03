#!/usr/bin/env python3
import subprocess
import os
import sys

# Mudar para o diretório do servidor
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Iniciar o servidor Node.js
print("🚀 Iniciando servidor na porta 8002...")
try:
    subprocess.Popen(['node', 'server.js'], 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE)
    print("✅ Servidor iniciado em background!")
    print("🌐 Acesse: http://localhost:8002")
except Exception as e:
    print(f"❌ Erro ao iniciar servidor: {e}")
    sys.exit(1)
