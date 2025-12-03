const fs = require('fs');
const path = require('path');

// Criar estrutura de site
const siteDir = path.join(__dirname, 'site');
const dirs = ['images', '_next'];

dirs.forEach(dir => {
  const dirPath = path.join(siteDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Copiar HTMLs capturados
const htmlFiles = [
  { src: 'html-feed-inicial.html', dest: 'site/feed.html' },
  { src: 'html-direct.html', dest: 'site/direct.html' },
  // chat-1.html já existe em site/ - não precisa ser gerado
  // Chat-2: atualmente usa m***** (deveria ser j***** quando capturado)
  // Chat-3: novo chat com j***** e "eii, tá aí?" e chat2.png
  { src: 'html-chat-3-novo.html', dest: 'site/chat-3.html' }
];

htmlFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    let content = fs.readFileSync(src, 'utf8');
    
    // Corrigir caminhos relativos - apenas caminhos absolutos que começam com /
    content = content.replace(/href="\/_next\//g, 'href="../_next/');
    content = content.replace(/src="\/_next\//g, 'src="../_next/');
    content = content.replace(/src="\/icon\//g, 'src="../icon/');
    content = content.replace(/href="\/icon/g, 'href="../icon');
    content = content.replace(/href="\/favicon/g, 'href="../images/favicon');
    content = content.replace(/src="\/home/g, 'src="../home');
    // Corrigir caminhos de home-feed (com espaços no HTML original)
    content = content.replace(/src="\/home\s*-\s*feed\//g, 'src="../home-feed/');
    content = content.replace(/srcset="\/home\s*-\s*feed\//g, 'srcset="../home-feed/');
    // Corrigir caminhos que já têm ../ antes (já processados anteriormente)
    content = content.replace(/src="\.\.\/home\s*-\s*feed\//g, 'src="../home-feed/');
    content = content.replace(/srcset="\.\.\/home\s*-\s*feed\//g, 'srcset="../home-feed/');
    // Corrigir srcset - garantir que ambos os valores sejam relativos
    content = content.replace(/srcset="([^"]*)\/_next\/image([^"]*)\s+1x,\s*\/_next\/image([^"]*)\s+2x"/g, 'srcset="../_next/image$2 1x, ../_next/image$3 2x"');
    content = content.replace(/srcset="\/_next\//g, 'srcset="../_next/');
    content = content.replace(/srcset="\/home/g, 'srcset="../home');
    // Corrigir caminhos dentro dos scripts JSON do Next.js - apenas caminhos absolutos (não URLs)
    // Primeiro, proteger URLs HTTP/HTTPS
    content = content.replace(/https?:\/\/[^"']+/g, (match) => match.replace(/\//g, '__SLASH__'));
    // Agora substituir caminhos absolutos
    content = content.replace(/"\/_next\//g, '"../_next/');
    content = content.replace(/'\/_next\//g, "'../_next/");
    content = content.replace(/"\/icon\//g, '"../icon/');
    content = content.replace(/'\/icon\//g, "'../icon/");
    content = content.replace(/"\/icon-site\.png"/g, '"../images/icon-site.png"');
    content = content.replace(/"\/favicon\.ico"/g, '"../images/favicon.ico"');
    // Corrigir caminhos de home-feed em JSON/strings
    content = content.replace(/"\/home\s*-\s*feed\//g, '"../home-feed/');
    content = content.replace(/'\/home\s*-\s*feed\//g, "'../home-feed/");
    // Restaurar URLs
    content = content.replace(/__SLASH__/g, '/');
    // Corrigir caminhos duplicados
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\//g, '../../');
    content = content.replace(/\.\.\/\.\.\/\.\.\//g, '../');
    content = content.replace(/images\.\.\/images\//g, 'images/');
    // Corrigir SVG width="auto"
    content = content.replace(/width="auto"/g, 'width="100%"');
    
    // Remover scripts UTM/utmify completamente - APENAS tags script específicas
    // Remove tags script com utmify (self-closing ou com fechamento)
    content = content.replace(/<script[^>]*utmify[^>]*\/?>/gi, '');
    content = content.replace(/<script[^>]*data-utmify[^>]*\/?>/gi, '');
    content = content.replace(/<script[^>]*utmify[^>]*>[\s\S]*?<\/script>/gi, '');
    // Remove dentro de JSON do Next.js - apenas propriedades específicas
    content = content.replace(/["']src["']:\s*["']https:\/\/cdn\.utmify\.com\.br[^"']*["'][^,}]*/gi, '');
    content = content.replace(/["']data-utmify[^"']*["']:\s*[^,}]*/gi, '');
    // Remove URLs utmify de qualquer lugar
    content = content.replace(/https?:\/\/cdn\.utmify\.com\.br[^\s"'>}]*/gi, '');
    // Corrigir tags script duplicadas que podem ter ficado
    content = content.replace(/<\/script><\/script>/g, '</script>');
    
    // Remover parâmetros UTM de todas as URLs (href e src)
    content = content.replace(/(href|src)="([^"]*)\?[^"]*utm_[^"]*"/gi, (match, attr, url) => {
      const cleanUrl = url.split('?')[0];
      const params = url.split('?')[1];
      if (params) {
        const cleanParams = params.split('&').filter(p => !p.includes('utm_')).join('&');
        if (cleanParams) {
          return `${attr}="${cleanUrl}?${cleanParams}"`;
        }
      }
      return `${attr}="${cleanUrl}"`;
    });
    // Remover parâmetros UTM que ficaram sozinhos após remoção anterior
    content = content.replace(/[?&]utm_[^&"\s]*/gi, '');
    content = content.replace(/\?&/g, '?');
    content = content.replace(/\?$/g, '');
    content = content.replace(/&{2,}/g, '&');
    
    // Adicionar script de proteção contra limpeza do conteúdo pelo Next.js
    // EXATAMENTE igual ao feed.html que funciona - usando setInterval para monitorar continuamente
    const protectionScript = `<script>
// Proteção contra limpeza do body pelo Next.js
(function() {
  let originalBody = null;
  let checkInterval = null;
  
  function captureAndProtect() {
    if (document.body && document.body.innerHTML.length > 5000) {
      if (!originalBody) {
        originalBody = document.body.innerHTML;
        console.log('✅ Body capturado:', originalBody.length, 'caracteres');
      }
      
      // Verificar periodicamente se o body foi limpo
      if (!checkInterval) {
        checkInterval = setInterval(() => {
          if (document.body && originalBody) {
            const currentLength = document.body.innerHTML.length;
            // Se o conteúdo diminuiu muito, restaurar
            if (currentLength < 5000 || currentLength < originalBody.length * 0.5) {
              console.log('⚠️ Body foi limpo! Restaurando...');
              document.body.innerHTML = originalBody;
            }
          }
        }, 100);
      }
    }
  }
  
  // Tentar capturar imediatamente
  captureAndProtect();
  
  // Aguardar DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', captureAndProtect);
  }
  
  // Tentar novamente após um delay
  setTimeout(captureAndProtect, 100);
  setTimeout(captureAndProtect, 500);
  setTimeout(captureAndProtect, 1000);
  
  // Desabilitar __next_f.push completamente
  if (window.__next_f) {
    window.__next_f.push = function() { return; };
  }
  
  // Interceptar erros
  window.addEventListener('error', function(e) {
    e.preventDefault();
    return true;
  });
})();
</script>`;
    
    // Inserir script de proteção LOGO APÓS o <body>
    // Isso garante que o body já existe quando o script executa
    content = content.replace(/<body[^>]*>/, '$&' + protectionScript);
    
    // Adicionar menu de navegação
    const navMenu = `
    <div style="position:fixed;top:20px;right:20px;z-index:10000;background:rgba(43,48,54,0.95);padding:15px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <h3 style="margin:0 0 10px 0;font-size:14px;color:#517aff;">📱 Navegação</h3>
        <a href="feed.html" style="display:block;color:#fff;text-decoration:none;padding:8px 15px;margin:5px 0;border-radius:5px;background:rgba(255,255,255,0.1);">🏠 Feed</a>
        <a href="direct.html" style="display:block;color:#fff;text-decoration:none;padding:8px 15px;margin:5px 0;border-radius:5px;background:rgba(255,255,255,0.1);">💬 Direct</a>
        <a href="chat-1.html" style="display:block;color:#fff;text-decoration:none;padding:8px 15px;margin:5px 0;border-radius:5px;background:rgba(255,255,255,0.1);">💭 Chat 1</a>
        <a href="chat-2.html" style="display:block;color:#fff;text-decoration:none;padding:8px 15px;margin:5px 0;border-radius:5px;background:rgba(255,255,255,0.1);">💭 Chat 2</a>
        <a href="chat-3.html" style="display:block;color:#fff;text-decoration:none;padding:8px 15px;margin:5px 0;border-radius:5px;background:rgba(255,255,255,0.1);">💭 Chat 3</a>
    </div>`;
    
    content = content.replace('</body>', navMenu + '</body>');
    
    fs.writeFileSync(dest, content);
    console.log(`✅ ${dest} criado`);
  }
});

// Criar index.html principal
const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>DeepGram - Clone</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: rgb(11, 16, 20);
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            margin-bottom: 40px;
            color: #517aff;
        }
        .pages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .page-card {
            background: rgba(43, 48, 54, 0.8);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s;
        }
        .page-card:hover {
            transform: translateY(-5px);
            background: rgba(43, 48, 54, 1);
        }
        .page-card a {
            color: #fff;
            text-decoration: none;
            display: block;
        }
        .page-card h2 {
            margin-bottom: 10px;
            font-size: 24px;
        }
        .page-card p {
            color: #999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 DeepGram Clone</h1>
        <div class="pages-grid">
            <div class="page-card">
                <a href="feed.html">
                    <h2>🏠 Feed</h2>
                    <p>Feed inicial do Instagram</p>
                </a>
            </div>
            <div class="page-card">
                <a href="direct.html">
                    <h2>💬 Direct</h2>
                    <p>Lista de conversas</p>
                </a>
            </div>
            <div class="page-card">
                <a href="chat-1.html">
                    <h2>💭 Chat 1</h2>
                    <p>Conversa com l*****</p>
                </a>
            </div>
            <div class="page-card">
                <a href="chat-2.html">
                    <h2>💭 Chat 2</h2>
                    <p>Conversa com j*****</p>
                </a>
            </div>
            <div class="page-card">
                <a href="chat-3.html">
                    <h2>💭 Chat 3</h2>
                    <p>Conversa com m*****</p>
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('site/index.html', indexHtml);
console.log('✅ site/index.html criado');

// Copiar recursos
console.log('\n📦 Copiando recursos...');
const resourceDirs = ['_next', 'images', 'home-feed', 'icon'];
resourceDirs.forEach(dir => {
  const src = path.join(__dirname, dir);
  const dest = path.join(siteDir, dir);
  if (fs.existsSync(src)) {
    // Copiar recursivamente
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const entries = fs.readdirSync(src, { withFileTypes: true });
      entries.forEach(entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
    };
    copyRecursive(src, dest);
    console.log(`✅ ${dir} copiado`);
  }
});

console.log('\n✨ Site criado com sucesso!');
console.log('📁 Pasta: site/');
console.log('🌐 Abra: site/index.html');

