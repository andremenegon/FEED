const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const app = express();
const PORT = 3000;

// Servir arquivos estáticos do diretório site
app.use(express.static(path.join(__dirname, 'site')));

// Servir arquivos estáticos da raiz do projeto FEED (para acessar direct.html da raiz)
app.use(express.static(path.join(__dirname, '..')));

// Servir arquivos estáticos do diretório deepgram-clone (para CSS e JS da nova página)
app.use(express.static(__dirname));

// Servir arquivos de /site/_next/* diretamente (para compatibilidade com scripts do Next.js)
app.use('/site/_next', express.static(path.join(__dirname, 'site', '_next')));

// Rota para imagens do Next.js - usar o mesmo proxy
app.get('/_next/image', (req, res) => {
  let imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('URL não fornecida');
  }
  
  // Decodificar a URL (pode vir codificada)
  try {
    imageUrl = decodeURIComponent(imageUrl);
  } catch (e) {
    // Se já estiver decodificada, continuar
  }
  
  // Se for URL do Instagram, usar proxy
  if (imageUrl.includes('cdninstagram.com') || imageUrl.startsWith('http')) {
    try {
      const url = new URL(imageUrl);
      const protocol = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.instagram.com/',
          'Origin': 'https://www.instagram.com',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'cross-site',
          'Cache-Control': 'no-cache',
        }
      };
      
      const proxyReq = protocol.request(options, (proxyRes) => {
        // Log para debug
        console.log(`📸 Proxy imagem: ${imageUrl.substring(0, 60)}... -> ${proxyRes.statusCode}`);
        
        // Se retornar erro, tentar servir diretamente
        if (proxyRes.statusCode === 403 || proxyRes.statusCode === 404) {
          console.warn(`⚠️ Instagram bloqueou (${proxyRes.statusCode}), redirecionando para URL direta`);
          res.redirect(imageUrl);
          return;
        }
        
        const contentType = proxyRes.headers['content-type'] || 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(proxyRes.statusCode);
        proxyRes.pipe(res);
      });
      
      proxyReq.on('error', (error) => {
        console.error('❌ Erro no proxy:', error.message);
        // Em caso de erro, redirecionar para URL direta
        res.redirect(imageUrl);
      });
      
      proxyReq.end();
    } catch (error) {
      console.error('Erro ao processar URL:', error);
      res.status(400).send('URL inválida');
    }
  } else {
    // Se for caminho relativo, servir do diretório site
    const filePath = path.join(__dirname, 'site', imageUrl);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Erro ao servir imagem:', err);
        res.status(404).send('Imagem não encontrada');
      }
    });
  }
});

// Proxy para imagens do Instagram (para evitar problemas CORS)
app.get('/proxy-image', (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).send('URL não fornecida');
  }
  
  try {
    const url = new URL(imageUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.instagram.com/',
      }
    };
    
    const proxyReq = protocol.request(options, (proxyRes) => {
      // Copiar headers importantes
      const contentType = proxyRes.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(proxyRes.statusCode);
      
      // Log para debug
      console.log(`📸 Proxy: ${imageUrl.substring(0, 60)}... -> ${proxyRes.statusCode} ${contentType}`);
      
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (error) => {
      console.error('Erro no proxy:', error);
      res.status(500).send('Erro ao buscar imagem');
    });
    
    proxyReq.end();
  } catch (error) {
    console.error('Erro ao processar URL:', error);
    res.status(400).send('URL inválida');
  }
});

// Rota para a página home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'index.html'));
});

// Rota para /feed (sem username) - redirecionar para feed.html
app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'feed.html'));
});

// Rota para /feed/[username] - redirecionar para /feed
app.get('/feed/:username', (req, res) => {
  res.redirect('/feed');
});

// Rota para outras páginas
app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'feed.html'));
});

app.get('/direct', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'direct.html'));
});

// Rota para direct da raiz (nova versão)
app.get('/direct-root', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'direct.html'));
});

// Rota para html-direct.html (HTML capturado original)
app.get('/html-direct', (req, res) => {
  res.sendFile(path.join(__dirname, 'html-direct.html'));
});

// Rota para direct-new.html (Nova versão recriada em HTML/CSS/JS puro)
app.get('/direct-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'direct-new.html'));
});

// Rota para página de vendas (CTA)
app.get('/cta', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'home.html'));
});

app.get('/chat-1', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'chat-1.html'));
});

app.get('/chat-2', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'chat-2.html'));
});

app.get('/chat-3', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'chat-3.html'));
});

// Rota para índice de páginas
app.get('/index', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DeepGram - Páginas Disponíveis</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; 
          padding: 40px; 
          background: linear-gradient(135deg, #040607 0%, #0C1011 100%);
          color: #fff;
          min-height: 100vh;
        }
        h1 { 
          color: #fff; 
          margin-bottom: 30px;
          font-size: 2.5em;
        }
        ul { 
          list-style-type: none; 
          padding: 0; 
        }
        li { 
          margin-bottom: 15px; 
        }
        a { 
          color: #517aff; 
          text-decoration: none; 
          font-size: 1.2em;
          display: inline-block;
          padding: 10px 20px;
          background: rgba(81, 122, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(81, 122, 255, 0.3);
          transition: all 0.3s;
        }
        a:hover { 
          background: rgba(81, 122, 255, 0.2);
          transform: translateX(5px);
        }
      </style>
    </head>
    <body>
      <h1>🚀 DeepGram - Páginas Disponíveis</h1>
      <h2 style="color: #517aff; margin-top: 30px; margin-bottom: 15px;">💬 Páginas Direct:</h2>
      <ul>
        <li><a href="/direct">💬 Direct (site/direct.html)</a></li>
        <li><a href="/direct-root">💬 Direct Root (direct.html - Nova versão com chats)</a></li>
        <li><a href="/html-direct">💬 HTML Direct (html-direct.html - HTML capturado original)</a></li>
        <li><a href="/direct-new">✨ Direct New (direct-new.html - Recriado em HTML/CSS/JS puro)</a></li>
      </ul>
      <h2 style="color: #517aff; margin-top: 30px; margin-bottom: 15px;">📱 Outras Páginas:</h2>
      <ul>
        <li><a href="/">🏠 Home (Landing Page)</a></li>
        <li><a href="/feed">📱 Feed</a></li>
        <li><a href="/chat-1">💭 Chat 1</a></li>
        <li><a href="/chat-2">💭 Chat 2</a></li>
        <li><a href="/chat-3">💭 Chat 3</a></li>
      </ul>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`\n📄 Páginas Direct:`);
  console.log(`   💬 Direct (site): http://localhost:${PORT}/direct`);
  console.log(`   💬 Direct Root (nova): http://localhost:${PORT}/direct-root`);
  console.log(`   💬 HTML Direct (original): http://localhost:${PORT}/html-direct`);
  console.log(`   ✨ Direct New (recriado): http://localhost:${PORT}/direct-new`);
  console.log(`\n📄 Outras páginas:`);
  console.log(`   🏠 Home: http://localhost:${PORT}/`);
  console.log(`   📱 Feed: http://localhost:${PORT}/feed`);
  console.log(`   💳 CTA (Vendas): http://localhost:${PORT}/cta`);
  console.log(`   💭 Chat 1: http://localhost:${PORT}/chat-1`);
  console.log(`   💭 Chat 2: http://localhost:${PORT}/chat-2`);
  console.log(`   💭 Chat 3: http://localhost:${PORT}/chat-3`);
  console.log(`   📋 Índice: http://localhost:${PORT}/index\n`);
});

