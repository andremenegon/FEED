const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Usar porta da variável de ambiente (hospedagem) ou padrão 3000
const PORT = process.env.PORT || 3000;
// Em produção, a API pode estar no mesmo processo ou em localhost
// Se a hospedagem permitir múltiplas portas, use 8002, senão use a mesma porta
const API_PORT = process.env.API_PORT || (process.env.PORT ? process.env.PORT : 8002);
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;

// Middleware para parsing JSON
app.use(express.json());

// CORS headers para todas as rotas
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-key, accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Cache em memória para imagens
const imageCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

// ===== PROXY PARA API (porta 8002) =====
// Rotas específicas de API são redirecionadas para o servidor de API na porta 8002
const apiProxyRoutes = ['/api/user', '/api/followers', '/api/following', '/api/chaining-results', 
                        '/api/user/posts', '/api/post', '/api/posts/batch', '/api/stories'];

apiProxyRoutes.forEach(route => {
  app.all(route, (req, res) => {
    // Em produção, se API_PORT for igual a PORT, significa que a API está no mesmo processo
    // Nesse caso, precisamos importar e usar a API diretamente
    // Por enquanto, mantemos o proxy para localhost
    const apiUrl = `http://localhost:${API_PORT}${req.originalUrl}`;
    console.log(`🔄 Proxy: ${req.method} ${req.originalUrl} -> ${apiUrl}`);
    
    const proxyReq = http.request(apiUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${API_PORT}`
      }
    }, (proxyRes) => {
      // Copiar headers da resposta
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      res.status(proxyRes.statusCode);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error('❌ Erro no proxy da API:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ 
          error: 'Servidor de API não está disponível. Certifique-se de que o servidor da API está rodando.',
          details: err.message,
          hint: 'Em produção, você precisa iniciar também o servidor API/server.js'
        });
      }
    });
    
    // Enviar body da requisição se houver
    if (req.body && Object.keys(req.body).length > 0) {
      proxyReq.write(JSON.stringify(req.body));
    }
    proxyReq.end();
  });
});

// Health check local (não precisa de proxy)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Servidor principal rodando. API disponível na porta 8002.'
  });
});

// ===== ROTAS DE API ANTIGAS (COMENTADAS - AGORA TUDO PASSA PELO PROXY ACIMA) =====
// Todas as requisições /api/* são redirecionadas para o servidor na porta 8002
// O código abaixo está comentado mas mantido para referência

/*
// API Followers (ANTIGA - REMOVIDA - usa proxy agora)
app.get('/api/followers', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Username não fornecido' });
  }

  console.log(`👥 Buscando followers: ${username}`);
  const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
  
  const userOptions = {
    headers: {
      'accept': 'application/json',
      'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
    }
  };

  https.get(userUrl, userOptions, (userRes) => {
    let userData = '';
    userRes.on('data', (chunk) => { userData += chunk; });
    userRes.on('end', () => {
      try {
        const userJson = JSON.parse(userData);
        if (!userJson.user || !userJson.user.pk) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const userId = userJson.user.pk;
        const followersUrl = `https://api.hikerapi.com/v1/user/search/followers?user_id=${userId}&query=&force=on`;
        
        https.get(followersUrl, userOptions, (followersRes) => {
          let followersData = '';
          followersRes.on('data', (chunk) => { followersData += chunk; });
          followersRes.on('end', () => {
            try {
              const followersJson = JSON.parse(followersData);
              let followersArray = [];
              if (followersJson.users && Array.isArray(followersJson.users)) {
                followersArray = followersJson.users;
              } else if (followersJson.followers && Array.isArray(followersJson.followers)) {
                followersArray = followersJson.followers;
              } else if (Array.isArray(followersJson)) {
                followersArray = followersJson;
              }
              
              res.json({ followers: followersArray.slice(0, 25) });
            } catch (e) {
              res.setHeader('Content-Type', 'application/json');
              res.status(followersRes.statusCode).end(followersData);
            }
          });
        }).on('error', (e) => {
          res.status(500).json({ error: 'Erro ao buscar followers: ' + e.message });
        });
      } catch (e) {
        res.status(500).json({ error: 'Erro ao processar dados do usuário: ' + e.message });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: 'Erro ao buscar usuário: ' + e.message });
  });
});

// API Following
app.get('/api/following', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Username não fornecido' });
  }

  console.log(`👥 Buscando following: ${username}`);
  const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
  
  const userOptions = {
    headers: {
      'accept': 'application/json',
      'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
    }
  };

  https.get(userUrl, userOptions, (userRes) => {
    let userData = '';
    userRes.on('data', (chunk) => { userData += chunk; });
    userRes.on('end', () => {
      try {
        const userJson = JSON.parse(userData);
        if (!userJson.user || !userJson.user.pk) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const userId = userJson.user.pk;
        const followingUrl = `https://api.hikerapi.com/v1/user/search/following?user_id=${userId}&query=&force=on`;
        
        https.get(followingUrl, userOptions, (followingRes) => {
          let followingData = '';
          followingRes.on('data', (chunk) => { followingData += chunk; });
          followingRes.on('end', () => {
            try {
              const followingJson = JSON.parse(followingData);
              let followingArray = [];
              if (followingJson.response?.users && Array.isArray(followingJson.response.users)) {
                followingArray = followingJson.response.users;
              } else if (followingJson.users && Array.isArray(followingJson.users)) {
                followingArray = followingJson.users;
              } else if (followingJson.following && Array.isArray(followingJson.following)) {
                followingArray = followingJson.following;
              } else if (Array.isArray(followingJson)) {
                followingArray = followingJson;
              }
              
              res.json({ following: followingArray.slice(0, 25) });
            } catch (e) {
              res.setHeader('Content-Type', 'application/json');
              res.status(followingRes.statusCode).end(followingData);
            }
          });
        }).on('error', (e) => {
          res.status(500).json({ error: 'Erro ao buscar following: ' + e.message });
        });
      } catch (e) {
        res.status(500).json({ error: 'Erro ao processar dados do usuário: ' + e.message });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: 'Erro ao buscar usuário: ' + e.message });
  });
});

// API Chaining Results
app.get('/api/chaining-results', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Username não fornecido' });
  }

  console.log(`🔗 Buscando chaining_results: ${username}`);
  const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
  
  const userOptions = {
    headers: {
      'accept': 'application/json',
      'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
    }
  };

  https.get(userUrl, userOptions, (userRes) => {
    let userData = '';
    userRes.on('data', (chunk) => { userData += chunk; });
    userRes.on('end', () => {
      try {
        const userJson = JSON.parse(userData);
        if (!userJson.user || !userJson.user.pk) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const chainingResults = userJson.user.chaining_results || [];
        res.json({ chaining_results: chainingResults });
      } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar chaining_results: ' + e.message });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: 'Erro ao buscar usuário: ' + e.message });
  });
});

// API Stories (ANTIGA - REMOVIDA - usa proxy agora)
app.get('/api/stories', (req, res) => {
  res.json({ stories: [] });
});
*/

// ===== ROTAS LOCAIS (não precisam de proxy) =====

// Função compartilhada para proxy de imagens
function handleProxyImage(req, res) {
  // Suporta tanto ?url= quanto parâmetros estilo Next.js (?url=...&w=...&q=...)
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('URL não fornecida');
  }

  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    const urlObj = new URL(decodedUrl);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const etag = crypto.createHash('md5').update(decodedUrl).digest('hex');
    const cached = imageCache.get(decodedUrl);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && (ifNoneMatch === `"${etag}"` || ifNoneMatch === etag)) {
        return res.status(304).set({
          'ETag': `"${etag}"`,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }).end();
      }
      return res.set({
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': `"${etag}"`
      }).end(cached.data);
    }
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/jpeg,image/*,*/*;q=0.8',
      }
    };

    const proxyReq = protocol.request(options, (proxyRes) => {
      const contentType = proxyRes.headers['content-type'] || 'image/jpeg';
      const chunks = [];
      
      proxyRes.on('data', (chunk) => chunks.push(chunk));
      proxyRes.on('end', () => {
        const imageData = Buffer.concat(chunks);
        imageCache.set(decodedUrl, {
          data: imageData,
          contentType: contentType,
          etag: etag,
          timestamp: Date.now()
        });
        
        if (imageCache.size > 1000) {
          const entries = Array.from(imageCache.entries());
          entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
          imageCache.clear();
          entries.slice(0, 1000).forEach(([url, data]) => imageCache.set(url, data));
        }
        
        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'ETag': `"${etag}"`
        }).end(imageData);
      });
    });
    
    proxyReq.on('error', (error) => {
      res.status(500).send('Erro ao buscar imagem: ' + error.message);
    });
    
    proxyReq.setTimeout(10000, () => {
      proxyReq.destroy();
      res.status(504).send('Timeout ao buscar imagem');
    });
    
    proxyReq.end();
  } catch (error) {
    res.status(400).send('URL inválida: ' + error.message);
  }
}

// Proxy Image (mantido local - não depende da API externa)
app.get('/proxy-image', (req, res) => {
  handleProxyImage(req, res);
});

// Rota estilo Next.js (/_next/image) - compatibilidade com concorrente
app.get('/_next/image', (req, res) => {
  handleProxyImage(req, res);
});

// API User Posts (ANTIGA - REMOVIDA - usa proxy agora)
/*
app.get('/api/user/posts', (req, res) => {
  const username = req.query.username;
  const userId = req.query.user_id;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  
  if (!username && !userId) {
    return res.status(400).json({ error: 'Username ou user_id não fornecido' });
  }

  const fetchPostsByUserId = (targetUserId) => {
    const postsUrl = `https://api.hikerapi.com/v1/user/medias?user_id=${encodeURIComponent(targetUserId)}`;
    const options = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(postsUrl, options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        if (apiRes.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            let posts = [];
            if (Array.isArray(jsonData)) {
              posts = jsonData;
            } else if (jsonData.posts && Array.isArray(jsonData.posts)) {
              posts = jsonData.posts;
            } else if (jsonData.items && Array.isArray(jsonData.items)) {
              posts = jsonData.items;
            } else if (jsonData.media && Array.isArray(jsonData.media)) {
              posts = jsonData.media;
            }
            
            if (limit && posts.length > limit) {
              posts = posts.slice(0, limit);
            }
            
            res.json({ posts: posts });
          } catch (e) {
            res.status(500).json({ error: 'Erro ao processar resposta da API' });
          }
        } else {
          res.status(apiRes.statusCode).json(JSON.parse(data));
        }
      });
    }).on('error', (e) => {
      res.status(500).json({ error: 'Erro ao buscar posts: ' + e.message });
    });
  };
  
  if (userId) {
    fetchPostsByUserId(userId);
  } else {
    const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
    const userOptions = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(userUrl, userOptions, (userRes) => {
      let userData = '';
      userRes.on('data', (chunk) => { userData += chunk; });
      userRes.on('end', () => {
        if (userRes.statusCode === 200) {
          try {
            const userJson = JSON.parse(userData);
            const targetUserId = userJson.user?.pk || userJson.user?.id || userJson.pk || userJson.id;
            if (!targetUserId) {
              return res.status(404).json({ error: 'User ID não encontrado' });
            }
            fetchPostsByUserId(targetUserId);
          } catch (e) {
            res.status(500).json({ error: 'Erro ao processar resposta da API' });
          }
        } else {
          res.status(userRes.statusCode).json(JSON.parse(userData));
        }
      });
    }).on('error', (e) => {
      res.status(500).json({ error: 'Erro ao buscar usuário: ' + e.message });
    });
  }
});

// API Post by ID (ANTIGA - REMOVIDA - usa proxy agora)
app.get('/api/post', (req, res) => {
  const postId = req.query.id;
  if (!postId) {
    return res.status(400).json({ error: 'Post ID não fornecido' });
  }

  const tryV2Endpoint = () => {
    const apiUrl = `https://api.hikerapi.com/v2/media/by/id?id=${encodeURIComponent(postId)}`;
    const options = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(apiUrl, options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        if (apiRes.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            let post = null;
            if (jsonData.items && Array.isArray(jsonData.items) && jsonData.items.length > 0) {
              post = jsonData.items[0];
            } else if (jsonData.item) {
              post = jsonData.item;
            } else if (!Array.isArray(jsonData) && jsonData.pk) {
              post = jsonData;
            }
            
            if (post) {
              res.json(post);
            } else {
              tryV1Endpoint();
            }
          } catch (e) {
            tryV1Endpoint();
          }
        } else {
          tryV1Endpoint();
        }
      });
    }).on('error', () => {
      tryV1Endpoint();
    });
  };
  
  const tryV1Endpoint = () => {
    const apiUrl = `https://api.hikerapi.com/v1/media/by/id?id=${encodeURIComponent(postId)}`;
    const options = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(apiUrl, options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        if (apiRes.statusCode === 200) {
          res.json(JSON.parse(data));
        } else {
          res.status(apiRes.statusCode).json({ error: 'Post não encontrado' });
        }
      });
    }).on('error', (e) => {
      res.status(500).json({ error: 'Erro ao buscar post: ' + e.message });
    });
  };
  
  tryV2Endpoint();
});

// API Posts Batch (ANTIGA - REMOVIDA - usa proxy agora)
app.post('/api/posts/batch', async (req, res) => {
  try {
    const { usernames, limit = 1 } = req.body;
    
    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: 'usernames array é obrigatório' });
    }
    
    if (usernames.length > 25) {
      return res.status(400).json({ error: 'Máximo de 25 usernames por batch' });
    }
    
    const fetchUserPosts = (username) => {
      return new Promise((resolve) => {
        const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
        const userOptions = {
          headers: {
            'accept': 'application/json',
            'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
          },
          timeout: 3000
        };
        
        const userReq = https.get(userUrl, userOptions, (userRes) => {
          let userData = '';
          userRes.on('data', (chunk) => { userData += chunk; });
          userRes.on('end', () => {
            try {
              const userJson = JSON.parse(userData);
              const userId = userJson.user?.pk || userJson.user?.id;
              
              if (!userId) {
                resolve({ username, success: false, error: 'user_id não encontrado', post: null });
                return;
              }
              
              const postsUrl = `https://api.hikerapi.com/v1/user/medias?user_id=${encodeURIComponent(userId)}`;
              const postsReq = https.get(postsUrl, userOptions, (postsRes) => {
                let postsData = '';
                postsRes.on('data', (chunk) => { postsData += chunk; });
                postsRes.on('end', () => {
                  try {
                    const postsJson = JSON.parse(postsData);
                    let posts = [];
                    if (Array.isArray(postsJson)) {
                      posts = postsJson;
                    } else if (postsJson.posts && Array.isArray(postsJson.posts)) {
                      posts = postsJson.posts;
                    } else if (postsJson.items && Array.isArray(postsJson.items)) {
                      posts = postsJson.items;
                    } else if (postsJson.media && Array.isArray(postsJson.media)) {
                      posts = postsJson.media;
                    }
                    
                    resolve({ username, success: true, post: posts[0] || null });
                  } catch (e) {
                    resolve({ username, success: false, error: e.message, post: null });
                  }
                });
              });
              
              postsReq.on('error', () => {
                resolve({ username, success: false, error: 'erro na requisição', post: null });
              });
              
              postsReq.setTimeout(3000, () => {
                postsReq.destroy();
                resolve({ username, success: false, error: 'timeout', post: null });
              });
            } catch (e) {
              resolve({ username, success: false, error: e.message, post: null });
            }
          });
        });
        
        userReq.on('error', () => {
          resolve({ username, success: false, error: 'erro na requisição', post: null });
        });
        
        userReq.setTimeout(3000, () => {
          userReq.destroy();
          resolve({ username, success: false, error: 'timeout', post: null });
        });
      });
    };
    
    const results = await Promise.all(usernames.map(u => fetchUserPosts(u)));
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// Clear Cache (mantido local - não precisa de proxy)
app.post('/api/clear-cache', (req, res) => {
  const cacheSizeBefore = imageCache.size;
  imageCache.clear();
  res.json({ 
    success: true, 
    message: 'Cache limpo com sucesso',
    cleared: cacheSizeBefore 
  });
});
*/

// ===== SERVIÇO DE ARQUIVOS ESTÁTICOS =====

// Servir arquivos estáticos apenas da pasta Oficial
app.use(express.static(__dirname));

// Rota raiz - redirecionar para Inicio1/index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Inicio1', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📁 Servindo apenas a pasta: ${__dirname}`);
    console.log(`🌍 Ambiente: ${IS_PRODUCTION ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
    console.log(`\n📄 Acesse:`);
    console.log(`   - http://localhost:${PORT}/Inicio1/index.html`);
    console.log(`   - http://localhost:${PORT}/Direct/direct.html`);
    console.log(`   - http://localhost:${PORT}/mensagem/mensagem-1.html`);
    console.log(`\n🔌 API disponível em:`);
    console.log(`   - http://localhost:${PORT}/api/user?username=USERNAME`);
    console.log(`   - http://localhost:${PORT}/api/followers?username=USERNAME`);
    console.log(`   - http://localhost:${PORT}/api/following?username=USERNAME`);
    console.log(`   - http://localhost:${PORT}/api/health`);
    console.log(`\n⚠️  IMPORTANTE: Para a API funcionar, você precisa iniciar também:`);
    console.log(`   - cd API && node server.js (na porta ${API_PORT})`);
});
