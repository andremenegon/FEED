const http = require('http');
const https = require('https');
const url = require('url');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Proxy para imagens
  if (parsedUrl.pathname === '/proxy-image') {
    const imageUrl = parsedUrl.query.url;
    
    if (!imageUrl) {
      res.writeHead(400);
      res.end('Missing url parameter');
      return;
    }

    https.get(imageUrl, (imageRes) => {
      res.writeHead(200, {
        'Content-Type': imageRes.headers['content-type'],
        'Cache-Control': 'public, max-age=86400'
      });
      imageRes.pipe(res);
    }).on('error', (e) => {
      console.error('Proxy error:', e);
      res.writeHead(500);
      res.end('Proxy error');
    });
  }
  // Servir arquivos estáticos
  else {
    const fs = require('fs');
    const path = require('path');
    
    let filePath = './site' + parsedUrl.pathname;
    if (filePath === './site/') filePath = './site/index.html';
    
    const extname = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2'
    }[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(content, 'utf-8');
      }
    });
  }
});

server.listen(8000, () => {
  console.log('🚀 Servidor rodando em http://localhost:8000');
  console.log('✅ Proxy de imagens ativado!');
});
