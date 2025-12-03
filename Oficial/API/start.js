#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor na porta 8002...\n');

const serverPath = path.join(__dirname, 'server.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Servidor encerrado com código ${code}`);
    process.exit(code);
  }
});

// Manter o processo vivo
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.kill();
  process.exit(0);
});

console.log('✅ Servidor iniciado! Pressione Ctrl+C para parar.\n');
