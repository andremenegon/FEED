#!/bin/bash

# Script para instalar PHP no macOS
# Execute SEM sudo: bash install-php.sh

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
    echo "❌ ERRO: Não execute este script com sudo!"
    echo "💡 Execute sem sudo: bash install-php.sh"
    exit 1
fi

echo "🔧 Verificando Homebrew..."

# Verificar se Homebrew já está instalado em diferentes locais
BREW_PATH=""
if [ -f /opt/homebrew/bin/brew ]; then
    BREW_PATH="/opt/homebrew/bin/brew"
    echo "✅ Homebrew encontrado em /opt/homebrew"
elif [ -f /usr/local/bin/brew ]; then
    BREW_PATH="/usr/local/bin/brew"
    echo "✅ Homebrew encontrado em /usr/local"
fi

# Se encontrou Homebrew, configurar PATH
if [ -n "$BREW_PATH" ]; then
    eval "$($BREW_PATH shellenv)"
    export PATH="$($BREW_PATH shellenv | grep 'export PATH' | cut -d'"' -f2):$PATH"
fi

# Verificar se brew está disponível agora
if ! command -v brew &> /dev/null; then
    echo "📦 Homebrew não encontrado. Instalando..."
    echo "⚠️  Isso pode pedir sua senha para instalar dependências do sistema"
    
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Configurar PATH após instalação
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        echo "✅ Homebrew instalado em /opt/homebrew"
    elif [ -f /usr/local/bin/brew ]; then
        eval "$(/usr/local/bin/brew shellenv)"
        echo "✅ Homebrew instalado em /usr/local"
    fi
    
    # Aguardar um pouco para garantir que está configurado
    sleep 2
fi

# Verificar novamente se brew está disponível
if ! command -v brew &> /dev/null; then
    echo "❌ ERRO: Homebrew não pôde ser instalado ou configurado"
    echo "💡 Tente executar manualmente:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✅ Homebrew configurado"
echo ""
echo "📦 Instalando PHP (isso pode demorar alguns minutos)..."
brew install php

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PHP instalado com sucesso!"
    echo ""
    echo "🔍 Verificando instalação..."
    php -v
    
    echo ""
    echo "✅ Instalação concluída!"
    echo ""
    echo "💡 Para usar o PHP, você pode:"
    echo "   1. Rodar: cd API && php -S localhost:8000"
    echo "   2. Ou usar o servidor Node.js que já está configurado (porta 8002)"
else
    echo ""
    echo "❌ ERRO: Falha ao instalar PHP"
    echo "💡 Tente executar manualmente: brew install php"
    exit 1
fi

