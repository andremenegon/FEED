const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8002;

// Cache em memória para imagens (evita buscar a mesma imagem múltiplas vezes)
const imageCache = new Map(); // URL -> { data: Buffer, contentType: string, etag: string, timestamp: number }
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

// Função auxiliar para expandir chaining_results buscando perfis relacionados
function expandChainingResults(chainingResults, userOptions, callback) {
  if (chainingResults.length >= 50) {
    return callback(chainingResults.slice(0, 50));
  }
  
  console.log(`📊 Chaining results iniciais: ${chainingResults.length}, tentando buscar mais...`);
  const existingUsernames = new Set(chainingResults.map(p => p.username).filter(Boolean));
  const profilesToSearch = chainingResults.slice(0, Math.min(10, chainingResults.length));
  let completed = 0;
  
  if (profilesToSearch.length === 0) {
    return callback(chainingResults.slice(0, 50));
  }
  
  profilesToSearch.forEach(profile => {
    if (profile.username) {
      const searchUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(profile.username)}&force=on`;
      https.get(searchUrl, userOptions, (searchRes) => {
        let searchData = '';
        searchRes.on('data', (chunk) => { searchData += chunk; });
        searchRes.on('end', () => {
          try {
            const searchJson = JSON.parse(searchData);
            if (searchJson.user && searchJson.user.chaining_results) {
              searchJson.user.chaining_results.forEach(p => {
                if (p.username && !existingUsernames.has(p.username) && chainingResults.length < 50) {
                  existingUsernames.add(p.username);
                  chainingResults.push(p);
                }
              });
            }
          } catch (e) {
            console.warn(`⚠️ Erro ao processar busca de perfil relacionado: ${e.message}`);
          }
          completed++;
          if (completed === profilesToSearch.length) {
            callback(chainingResults.slice(0, 50));
          }
        });
      }).on('error', (e) => {
        console.warn(`⚠️ Erro ao buscar perfil relacionado ${profile.username}: ${e.message}`);
        completed++;
        if (completed === profilesToSearch.length) {
          callback(chainingResults.slice(0, 50));
        }
      });
    } else {
      completed++;
      if (completed === profilesToSearch.length) {
        callback(chainingResults.slice(0, 50));
      }
    }
  });
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-key, accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // ===== ENDPOINT: /api/health - Health Check =====
  if (parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
      status: 'ok', 
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      cacheSize: imageCache.size
    }));
    return;
  }

  // Endpoint para buscar chaining_results (perfis sugeridos)
  else if (parsedUrl.pathname === '/api/chaining-results') {
    const username = parsedUrl.query.username;
    
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Username não fornecido' }));
      return;
    }

    console.log(`🔗 Buscando chaining_results: ${username}`);
    // Primeiro buscar o user para pegar o pk
    const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
    
    const userOptions = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(userUrl, userOptions, (userRes) => {
      let userData = '';
      
      userRes.on('data', (chunk) => {
        userData += chunk;
      });
      
      userRes.on('end', () => {
        try {
          const userJson = JSON.parse(userData);
          if (!userJson.user || !userJson.user.pk) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Usuário não encontrado' }));
            return;
          }
          
          const userId = userJson.user.pk;
          // Obter chaining_results da resposta inicial
          const chainingResults = userJson.user.chaining_results || [];
          
          console.log(`✅ Total de chaining results: ${chainingResults.length}`);
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ chaining_results: chainingResults }));
        } catch (e) {
          console.error('❌ Erro ao processar chaining_results:', e.message);
          res.writeHead(500, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'Erro ao buscar chaining_results: ' + e.message }));
        }
      });
    }).on('error', (e) => {
      console.error('❌ Erro ao buscar usuário:', e.message);
      res.writeHead(500, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Erro ao buscar usuário: ' + e.message }));
    });
  }
  // Proxy para API HikerAPI
  else if (parsedUrl.pathname === '/api/user') {
    const username = parsedUrl.query.username;
    
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Username não fornecido' }));
      return;
    }

    console.log(`🔍 Buscando perfil: ${username}`);
    // Tentar adicionar parâmetros para forçar retorno de chaining_results
    // A API pode retornar chaining_results para alguns perfis e não para outros
    // Vamos tentar com force=on para ver se ajuda
    const apiUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}&force=on`;
    
    const options = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(apiUrl, options, (apiRes) => {
      let data = '';
      
      apiRes.on('data', (chunk) => {
        data += chunk;
      });
      
      apiRes.on('end', () => {
        console.log(`✅ Resposta recebida: ${apiRes.statusCode}`);
        res.end(data);
      });
    }).on('error', (e) => {
      console.error('❌ Erro na API:', e.message);
      res.writeHead(500, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Erro ao buscar perfil: ' + e.message }));
    });
    return; // Parar execução aqui
  }
  // Proxy para Stories - DESABILITADO: A API NÃO RETORNA STORIES
  // Stories são criados a partir de following/followers/chaining_results no frontend
  // Este endpoint está mantido apenas para compatibilidade, mas retorna vazio
  else if (parsedUrl.pathname === '/api/stories') {
    const username = parsedUrl.query.username;
    
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Username não fornecido' }));
      return;
    }

    console.log(`⚠️ Endpoint /api/stories chamado para ${username} - A API NÃO RETORNA STORIES`);
    console.log(`ℹ️ Stories devem ser criados a partir de following/followers/chaining_results no frontend`);
    
    // Retornar resposta vazia (stories são criados no frontend)
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ stories: [] }));
  }
  
  /* CÓDIGO ORIGINAL DE STORIES REMOVIDO - A API NÃO RETORNA STORIES
   * Todo o código de busca de stories foi removido porque a API não retorna stories.
   * Stories são criados no frontend a partir de following/followers/chaining_results.
   */
  
  /* CÓDIGO COMENTADO REMOVIDO
    if (false) { // Desabilitado
    const username = parsedUrl.query.username;
    
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Username não fornecido' }));
      return;
    }

    console.log(`📸 Buscando stories: ${username}`);
    // Primeiro buscar o user para pegar o pk
    const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
    
    const userOptions = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(userUrl, userOptions, (userRes) => {
      let userData = '';
      
      userRes.on('data', (chunk) => {
        userData += chunk;
      });
      
      userRes.on('end', () => {
        try {
          const userJson = JSON.parse(userData);
          if (!userJson.user || !userJson.user.pk) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Usuário não encontrado' }));
            return;
          }
          
          const userId = userJson.user.pk;
          const storiesUrl = `https://api.hikerapi.com/v2/user/stories/by/username?username=${encodeURIComponent(username)}`;
          
          https.get(storiesUrl, userOptions, (storiesRes) => {
            let storiesData = '';
            
            storiesRes.on('data', (chunk) => {
              storiesData += chunk;
            });
            
            storiesRes.on('end', () => {
              try {
                // Processar resposta da API para garantir formato consistente
                const storiesJson = JSON.parse(storiesData);
                let processedData = { stories: [] };
                
                console.log('📦 Formato recebido da API de stories:', Object.keys(storiesJson));
                
                // A API pode retornar em diferentes formatos
                if (storiesJson.stories && Array.isArray(storiesJson.stories)) {
                  processedData.stories = storiesJson.stories;
                } else if (storiesJson.reel && storiesJson.reel.items && Array.isArray(storiesJson.reel.items)) {
                  // Formato reel (comum na API do Instagram)
                  processedData.stories = storiesJson.reel.items.map(item => ({
                    username: item.user?.username || username,
                    image: item.image_versions2?.candidates?.[0]?.url || item.video_versions?.[0]?.url || item.user?.profile_pic_url || '',
                    image_url: item.image_versions2?.candidates?.[0]?.url || item.video_versions?.[0]?.url || item.user?.profile_pic_url || '',
                    image_versions2: item.image_versions2,
                    video_versions: item.video_versions,
                    user: item.user,
                    taken_at: item.taken_at,
                    pk: item.pk
                  }));
                } else if (storiesJson.items && Array.isArray(storiesJson.items)) {
                  // Converter items para formato stories
                  processedData.stories = storiesJson.items.map(item => ({
                    username: item.user?.username || username,
                    image: item.image_versions2?.candidates?.[0]?.url || item.video_versions?.[0]?.url || item.user?.profile_pic_url || '',
                    image_url: item.image_versions2?.candidates?.[0]?.url || item.video_versions?.[0]?.url || item.user?.profile_pic_url || '',
                    image_versions2: item.image_versions2,
                    video_versions: item.video_versions,
                    user: item.user,
                    taken_at: item.taken_at,
                    pk: item.pk
                  }));
                } else if (Array.isArray(storiesJson)) {
                  processedData.stories = storiesJson;
                } else if (storiesJson.reel) {
                  // Se tem reel mas não tem items, retornar o reel completo
                  processedData.stories = [storiesJson.reel];
                }
                
                console.log(`✅ Stories processados: ${processedData.stories.length} encontrados`);
                
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(processedData));
              } catch (e) {
                // Se não conseguir processar, retornar dados originais
                res.writeHead(storiesRes.statusCode, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(storiesData);
              }
            });
          }).on('error', (e) => {
            console.error('❌ Erro ao buscar stories:', e.message);
            res.writeHead(500, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Erro ao buscar stories: ' + e.message }));
          });
        } catch (e) {
          res.writeHead(500, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'Erro ao processar dados do usuário: ' + e.message }));
        }
      });
    }).on('error', (e) => {
      console.error('❌ Erro ao buscar usuário:', e.message);
      res.writeHead(500, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Erro ao buscar usuário: ' + e.message }));
    });
    */
  
  // Proxy para Followers
  if (parsedUrl.pathname === '/api/followers') {
    const username = parsedUrl.query.username;
    
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Username não fornecido' }));
      return;
    }

    console.log(`👥 Buscando followers: ${username}`);
    // Primeiro buscar o user para pegar o pk
    const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
    
    const userOptions = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(userUrl, userOptions, (userRes) => {
      let userData = '';
      
      userRes.on('data', (chunk) => {
        userData += chunk;
      });
      
      userRes.on('end', () => {
        try {
          const userJson = JSON.parse(userData);
          if (!userJson.user || !userJson.user.pk) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Usuário não encontrado' }));
            return;
          }
          
          const userId = userJson.user.pk;
          // Usar force=on para pular verificações de privacidade e permitir buscar dados de perfis privados
          const followersUrl = `https://api.hikerapi.com/v1/user/search/followers?user_id=${userId}&query=&force=on`;
          
          https.get(followersUrl, userOptions, (followersRes) => {
            let followersData = '';
            
            followersRes.on('data', (chunk) => {
              followersData += chunk;
            });
            
            followersRes.on('end', () => {
              try {
                // Processar resposta da API para garantir formato consistente
                const followersJson = JSON.parse(followersData);
                let processedData = { followers: [] };
                
                console.log('📦 Resposta raw da API followers:', followersData.substring(0, 200));
                console.log('📦 Status code:', followersRes.statusCode);
                
                // A API pode retornar em diferentes formatos
                let followersArray = [];
                if (followersJson.users && Array.isArray(followersJson.users)) {
                  followersArray = followersJson.users;
                } else if (followersJson.followers && Array.isArray(followersJson.followers)) {
                  followersArray = followersJson.followers;
                } else if (Array.isArray(followersJson)) {
                  followersArray = followersJson;
                  console.log('✅ Seguiu formato array direto, encontrados:', followersJson.length);
                } else {
                  console.warn('⚠️ Formato desconhecido de followers:', typeof followersJson, Object.keys(followersJson || {}));
                }
                
                // Limitar a 25 followers para feed
                processedData.followers = followersArray.slice(0, 25);
                console.log(`✅ Followers coletado: ${processedData.followers.length} itens (de ${followersArray.length} total)`);
                
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(processedData));
              } catch (e) {
                // Se não conseguir processar, retornar dados originais
                res.writeHead(followersRes.statusCode, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(followersData);
              }
            });
          }).on('error', (e) => {
            console.error('❌ Erro ao buscar followers:', e.message);
            res.writeHead(500, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Erro ao buscar followers: ' + e.message }));
          });
        } catch (e) {
          res.writeHead(500, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'Erro ao processar dados do usuário: ' + e.message }));
        }
      });
    }).on('error', (e) => {
      console.error('❌ Erro ao buscar usuário:', e.message);
      res.writeHead(500, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Erro ao buscar usuário: ' + e.message }));
    });
  }
  // Proxy para Following
  else if (parsedUrl.pathname === '/api/following') {
    const username = parsedUrl.query.username;
    
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Username não fornecido' }));
      return;
    }

    console.log(`👥 Buscando following: ${username}`);
    // Primeiro buscar o user para pegar o pk
    const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
    
    const userOptions = {
      headers: {
        'accept': 'application/json',
        'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
      }
    };

    https.get(userUrl, userOptions, (userRes) => {
      let userData = '';
      
      userRes.on('data', (chunk) => {
        userData += chunk;
      });
      
      userRes.on('end', () => {
        try {
          const userJson = JSON.parse(userData);
          if (!userJson.user || !userJson.user.pk) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Usuário não encontrado' }));
            return;
          }
          
          const userId = userJson.user.pk;
          // Usar force=on para pular verificações de privacidade e permitir buscar dados de perfis privados
          const followingUrl = `https://api.hikerapi.com/v1/user/search/following?user_id=${userId}&query=&force=on`;
          
          https.get(followingUrl, userOptions, (followingRes) => {
            let followingData = '';
            
            followingRes.on('data', (chunk) => {
              followingData += chunk;
            });
            
            followingRes.on('end', () => {
              try {
                // Processar resposta da API para garantir formato consistente
                const followingJson = JSON.parse(followingData);
                let processedData = { following: [] };
                
                // A API pode retornar em diferentes formatos
                let followingArray = [];
                if (followingJson.response && followingJson.response.users && Array.isArray(followingJson.response.users)) {
                  followingArray = followingJson.response.users;
                } else if (followingJson.users && Array.isArray(followingJson.users)) {
                  followingArray = followingJson.users;
                } else if (followingJson.following && Array.isArray(followingJson.following)) {
                  followingArray = followingJson.following;
                } else if (Array.isArray(followingJson)) {
                  followingArray = followingJson;
                  console.log('✅ Seguiu formato array direto, encontrados:', followingJson.length);
                } else {
                  console.warn('⚠️ Formato desconhecido de following:', typeof followingJson, Object.keys(followingJson || {}));
                }
                
                // Limitar a 25 following para feed
                processedData.following = followingArray.slice(0, 25);
                console.log(`✅ Following coletado: ${processedData.following.length} itens (de ${followingArray.length} total)`);
                console.log('📦 Resposta raw da API following:', followingData.substring(0, 200));
                console.log('📦 Status code:', followingRes.statusCode);
                
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(processedData));
              } catch (e) {
                // Se não conseguir processar, retornar dados originais
                res.writeHead(followingRes.statusCode, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(followingData);
              }
            });
          }).on('error', (e) => {
            console.error('❌ Erro ao buscar following:', e.message);
            res.writeHead(500, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Erro ao buscar following: ' + e.message }));
          });
        } catch (e) {
          res.writeHead(500, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'Erro ao processar dados do usuário: ' + e.message }));
        }
      });
    }).on('error', (e) => {
      console.error('❌ Erro ao buscar usuário:', e.message);
      res.writeHead(500, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Erro ao buscar usuário: ' + e.message }));
    });
  }
  // Proxy para imagens
  else if (parsedUrl.pathname === '/proxy-image' || parsedUrl.pathname === '/_next/image') {
    const imageUrl = parsedUrl.query.url;
    
    if (!imageUrl) {
      console.error('❌ URL não fornecida para proxy-image');
      res.writeHead(400, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('URL não fornecida');
      return;
    }

    try {
      const decodedUrl = decodeURIComponent(imageUrl);
      console.log(`📸 Proxy imagem - URL recebida: ${decodedUrl.substring(0, 100)}...`);
      
      const urlObj = new URL(decodedUrl);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/jpeg,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.instagram.com/',
        }
      };

      console.log(`📸 Fazendo requisição para: ${urlObj.hostname}${urlObj.pathname}`);

      // Gerar ETag baseado na URL (mesma URL = mesmo ETag)
      const etag = crypto.createHash('md5').update(decodedUrl).digest('hex');
      
      // Verificar cache em memória primeiro
      const cached = imageCache.get(decodedUrl);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        // Verificar se há If-None-Match
        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch && (ifNoneMatch === `"${etag}"` || ifNoneMatch === etag || ifNoneMatch === cached.etag)) {
          console.log(`✅ Imagem em cache (memória + ETag match), retornando 304`);
          res.writeHead(304, {
            'ETag': `"${etag}"`,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*'
          });
          res.end();
          return;
        }
        
        // Se não tem If-None-Match mas está em cache, retornar do cache
        console.log(`✅ Imagem em cache (memória), retornando do cache sem buscar do servidor`);
        res.writeHead(200, {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'ETag': `"${etag}"`,
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff'
        });
        res.end(cached.data);
        return;
      }
      
      // Verificar se há If-None-Match ou If-Modified-Since (requisição condicional)
      const ifNoneMatch = req.headers['if-none-match'];
      const ifModifiedSince = req.headers['if-modified-since'];
      
      // Log para debug
      if (ifNoneMatch) {
        console.log(`🔍 Requisição com If-None-Match: ${ifNoneMatch}, ETag gerado: "${etag}"`);
      }
      
      // Se a requisição tem If-None-Match e é igual ao ETag, retornar 304 Not Modified
      if (ifNoneMatch && (ifNoneMatch === `"${etag}"` || ifNoneMatch === etag)) {
        console.log(`✅ Imagem em cache (ETag match), retornando 304 - sem buscar do servidor`);
        res.writeHead(304, {
          'ETag': `"${etag}"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        });
        res.end();
        return;
      }
      
      const proxyReq = protocol.request(options, (proxyRes) => {
        const contentType = proxyRes.headers['content-type'] || 'image/jpeg';
        const contentLength = proxyRes.headers['content-length'] || 0;
        
        if (proxyRes.statusCode !== 200) {
          console.error(`❌ Status code não é 200: ${proxyRes.statusCode}`);
          if (!res.headersSent) {
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(`Erro ao buscar imagem: ${proxyRes.statusCode}`);
          }
          return;
        }
        
        // Acumular dados da imagem para cache
        const chunks = [];
        proxyRes.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        proxyRes.on('end', () => {
          const imageData = Buffer.concat(chunks);
          console.log(`✅ Proxy imagem: ${proxyRes.statusCode} ${contentType} (${Math.round(imageData.length / 1024)}KB)`);
          
          // Salvar no cache em memória
          imageCache.set(decodedUrl, {
            data: imageData,
            contentType: contentType,
            etag: etag,
            timestamp: Date.now()
          });
          
          // Limpar cache antigo (manter apenas últimas 1000 imagens)
          if (imageCache.size > 1000) {
            const entries = Array.from(imageCache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            const toKeep = entries.slice(0, 1000);
            imageCache.clear();
            toKeep.forEach(([url, data]) => imageCache.set(url, data));
          }
          
          if (!res.headersSent) {
            // Usar ETag e headers de cache mais agressivos
            const lastModified = proxyRes.headers['last-modified'] || new Date().toUTCString();
            res.writeHead(proxyRes.statusCode, {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'ETag': `"${etag}"`,
              'Last-Modified': lastModified,
              'Access-Control-Allow-Origin': '*',
              'X-Content-Type-Options': 'nosniff'
            });
            res.end(imageData);
          }
        });
      });
      
      proxyReq.on('error', (error) => {
        console.error('❌ Erro no proxy de imagem:', error.message);
        console.error('Stack:', error.stack);
        if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        });
        res.end('Erro ao buscar imagem: ' + error.message);
        }
      });
      
      proxyReq.setTimeout(10000, () => {
        console.error('❌ Timeout ao buscar imagem');
        proxyReq.destroy();
        if (!res.headersSent) {
        res.writeHead(504, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        });
        res.end('Timeout ao buscar imagem');
        }
      });
      
      proxyReq.end();
    } catch (error) {
      console.error('❌ Erro ao processar URL da imagem:', error.message);
      console.error('Stack:', error.stack);
      res.writeHead(400, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('URL inválida: ' + error.message);
    }
  }
  // Endpoint para buscar lista de posts de um usuário
  else if (parsedUrl.pathname === '/api/user/posts') {
    const username = parsedUrl.query.username;
    const userId = parsedUrl.query.user_id;
    const limit = parsedUrl.query.limit ? parseInt(parsedUrl.query.limit) : null;
    
    if (!username && !userId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Username ou user_id não fornecido' }));
      return;
    }

    console.log(`📸 Buscando posts do usuário: ${username || userId}${limit ? ` (limit: ${limit})` : ''}`);
    
    // Função para buscar posts usando user_id
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
        
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        
        apiRes.on('end', () => {
          if (apiRes.statusCode === 200) {
            try {
              const jsonData = JSON.parse(data);
              // A API pode retornar em diferentes formatos
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
              
              // Aplicar limit se fornecido
              if (limit && posts.length > limit) {
                posts = posts.slice(0, limit);
              }
              
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ posts: posts }));
            } catch (e) {
              console.error('❌ Erro ao parsear resposta de posts:', e.message);
              res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ error: 'Erro ao processar resposta da API' }));
            }
          } else {
            res.writeHead(apiRes.statusCode, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
          }
        });
      }).on('error', (e) => {
        console.error(`❌ Erro ao buscar posts:`, e.message);
        res.writeHead(500, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Erro ao buscar posts: ' + e.message }));
      });
    };
    
    // Se temos user_id, buscar diretamente
    if (userId) {
      fetchPostsByUserId(userId);
    } else {
      // Se temos username, buscar user_id primeiro
      const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
      
      const userOptions = {
        headers: {
          'accept': 'application/json',
          'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
        }
      };

      https.get(userUrl, userOptions, (userRes) => {
        let userData = '';
        
        userRes.on('data', (chunk) => {
          userData += chunk;
        });
        
        userRes.on('end', () => {
          if (userRes.statusCode === 200) {
            try {
              const userJson = JSON.parse(userData);
              const targetUserId = userJson.user?.pk || userJson.user?.id || userJson.pk || userJson.id;
              
              if (!targetUserId) {
                res.writeHead(404, { 
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ error: 'User ID não encontrado' }));
                return;
              }
              
              fetchPostsByUserId(targetUserId);
            } catch (e) {
              console.error('❌ Erro ao parsear resposta do usuário:', e.message);
              res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ error: 'Erro ao processar resposta da API' }));
            }
          } else {
            res.writeHead(userRes.statusCode, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(userData);
          }
        });
      }).on('error', (e) => {
        console.error(`❌ Erro ao buscar usuário:`, e.message);
        res.writeHead(500, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Erro ao buscar usuário: ' + e.message }));
      });
    }
  }
  // Endpoint para buscar detalhes de um post específico
  else if (parsedUrl.pathname === '/api/post') {
    const postId = parsedUrl.query.id;
    
    if (!postId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Post ID não fornecido' }));
      return;
    }

    console.log(`📸 Buscando post pelo ID: ${postId}`);
    
    // Tentar primeiro /v2/media/by/id
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
        
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        
        apiRes.on('end', () => {
          if (apiRes.statusCode === 200) {
            try {
              const jsonData = JSON.parse(data);
              // Formato v2 retorna {items: [post]}
              let post = null;
              if (jsonData.items && Array.isArray(jsonData.items) && jsonData.items.length > 0) {
                post = jsonData.items[0];
              } else if (jsonData.item) {
                post = jsonData.item;
              } else if (!Array.isArray(jsonData) && jsonData.pk) {
                post = jsonData;
              }
              
              if (post) {
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(post));
              } else {
                // Se v2 não funcionou, tentar v1
                tryV1Endpoint();
              }
            } catch (e) {
              console.error('❌ Erro ao parsear resposta v2:', e.message);
              tryV1Endpoint();
            }
          } else {
            // Se v2 retornou erro, tentar v1
            tryV1Endpoint();
          }
        });
      }).on('error', (e) => {
        console.error(`❌ Erro ao buscar post (v2):`, e.message);
        tryV1Endpoint();
      });
    };
    
    // Tentar /v1/media/by/id como fallback
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
        
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        
        apiRes.on('end', () => {
          if (apiRes.statusCode === 200) {
            try {
              const jsonData = JSON.parse(data);
              // Formato v1 retorna post diretamente
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify(jsonData));
            } catch (e) {
              console.error('❌ Erro ao parsear resposta v1:', e.message);
              res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ error: 'Erro ao processar resposta da API' }));
            }
          } else {
            res.writeHead(apiRes.statusCode, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Post não encontrado' }));
          }
        });
      }).on('error', (e) => {
        console.error(`❌ Erro ao buscar post (v1):`, e.message);
        res.writeHead(500, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Erro ao buscar post: ' + e.message }));
      });
    };
    
    // Começar tentando v2
    tryV2Endpoint();
  }
  // Endpoint para limpar cache de imagens
  else if (parsedUrl.pathname === '/api/clear-cache' && req.method === 'POST') {
    console.log('🧹 Limpando cache de imagens...');
    const cacheSizeBefore = imageCache.size;
    imageCache.clear();
    console.log(`✅ Cache limpo: ${cacheSizeBefore} imagens removidas`);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Cache limpo com sucesso',
      cleared: cacheSizeBefore 
    }));
  }
  // Endpoint BATCH para buscar posts de múltiplos usuários de uma vez
  else if (parsedUrl.pathname === '/api/posts/batch' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { usernames, limit = 1 } = JSON.parse(body);
        
        if (!Array.isArray(usernames) || usernames.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'usernames array é obrigatório' }));
          return;
        }
        
        if (usernames.length > 25) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Máximo de 25 usernames por batch' }));
          return;
        }
        
        console.log(`🔥 BATCH: Buscando posts de ${usernames.length} perfis (limit: ${limit})`);
        const batchStartTime = Date.now();
        
        // Função auxiliar para buscar posts de um usuário
        const fetchUserPosts = (username) => {
          return new Promise((resolve) => {
            const userStartTime = Date.now();
            // Primeiro buscar o user_id
            const userUrl = `https://api.hikerapi.com/v2/user/by/username?username=${encodeURIComponent(username)}`;
            
            const userOptions = {
              headers: {
                'accept': 'application/json',
                'x-access-key': 'w46il1jfubi68wdnkci4m1i0udru9zdc'
              },
              timeout: 3000 // Timeout de 3 segundos
            };
            
            const userReq = https.get(userUrl, userOptions, (userRes) => {
              let userData = '';
              userRes.on('data', (chunk) => { userData += chunk; });
              userRes.on('end', () => {
                try {
                  const userJson = JSON.parse(userData);
                  const userId = userJson.user?.pk || userJson.user?.id;
                  
                  if (!userId) {
                    const userEndTime = Date.now();
                    console.log(`   ❌ @${username}: user_id não encontrado (${userEndTime - userStartTime}ms)`);
                    resolve({ username, success: false, error: 'user_id não encontrado', post: null });
                    return;
                  }
                  
                  // Agora buscar posts
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
                        
                        const post = posts[0] || null;
                        const userEndTime = Date.now();
                        console.log(`   ✅ @${username}: ${post ? 'post encontrado' : 'sem posts'} (${userEndTime - userStartTime}ms)`);
                        resolve({ username, success: true, post });
                      } catch (e) {
                        const userEndTime = Date.now();
                        console.log(`   ❌ @${username}: erro ao parsear posts (${userEndTime - userStartTime}ms)`);
                        resolve({ username, success: false, error: e.message, post: null });
                      }
                    });
                  }).on('error', (e) => {
                    const userEndTime = Date.now();
                    console.log(`   ❌ @${username}: erro na requisição de posts (${userEndTime - userStartTime}ms)`);
                    resolve({ username, success: false, error: e.message, post: null });
                  });
                  
                  postsReq.setTimeout(3000, () => {
                    postsReq.destroy();
                    const userEndTime = Date.now();
                    console.log(`   ⏱️ @${username}: timeout na busca de posts (${userEndTime - userStartTime}ms)`);
                    resolve({ username, success: false, error: 'timeout', post: null });
                  });
                  
                } catch (e) {
                  const userEndTime = Date.now();
                  console.log(`   ❌ @${username}: erro ao parsear user (${userEndTime - userStartTime}ms)`);
                  resolve({ username, success: false, error: e.message, post: null });
                }
              });
            }).on('error', (e) => {
              const userEndTime = Date.now();
              console.log(`   ❌ @${username}: erro na requisição de user (${userEndTime - userStartTime}ms)`);
              resolve({ username, success: false, error: e.message, post: null });
            });
            
            userReq.setTimeout(3000, () => {
              userReq.destroy();
              const userEndTime = Date.now();
              console.log(`   ⏱️ @${username}: timeout na busca de user (${userEndTime - userStartTime}ms)`);
              resolve({ username, success: false, error: 'timeout', post: null });
            });
          });
        };
        
        // Processar todos em paralelo
        const results = await Promise.all(usernames.map(u => fetchUserPosts(u)));
        
        const batchEndTime = Date.now();
        const successCount = results.filter(r => r.success && r.post).length;
        console.log(`🔥 BATCH concluído: ${successCount}/${usernames.length} posts encontrados em ${batchEndTime - batchStartTime}ms`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ results }));
        
      } catch (error) {
        console.error('❌ Erro no batch:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  }
  
  // Servir página de debug
  else if (parsedUrl.pathname === '/debug' || parsedUrl.pathname === '/debug.html') {
    const debugPath = path.join(__dirname, 'debug.html');
    console.log('🔍 Tentando servir debug.html do caminho:', debugPath);
    try {
      if (!fs.existsSync(debugPath)) {
        console.error('❌ Arquivo debug.html não encontrado em:', debugPath);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>404 - Debug page not found</h1><p>Caminho: ${debugPath}</p>`);
        return;
      }
      const content = fs.readFileSync(debugPath, 'utf8');
      console.log('✅ Debug.html carregado com sucesso, tamanho:', content.length, 'bytes');
      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    } catch (error) {
      console.error('❌ Erro ao ler debug.html:', error.message);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>500 - Erro ao carregar debug page</h1><p>Erro: ${error.message}</p>`);
    }
  }
  // Servir arquivos estáticos (HTML, CSS, JS, imagens)
  else {
    // Remover query string do pathname
    const pathname = parsedUrl.pathname;
    // Construir caminho do arquivo relativo à pasta pai (Oficial/)
    const filePath = path.join(__dirname, '..', pathname);
    
    // Determinar Content-Type baseado na extensão
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Ler e servir o arquivo
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // Se for uma fonte que não existe, retornar 200 vazio ao invés de 404
          // para evitar erros no console do navegador
          if (['.woff', '.woff2', '.ttf', '.otf'].includes(extname)) {
            console.log(`⚠️ Fonte não encontrada (ignorando): ${filePath}`);
            res.writeHead(200, { 
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*'
            });
            res.end();
          } else {
            console.log(`❌ Arquivo não encontrado: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Arquivo não encontrado</h1>');
          }
        } else {
          console.error(`❌ Erro ao ler arquivo ${filePath}:`, error.message);
          res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h1>500 - Erro do servidor</h1><p>${error.message}</p>`);
        }
      } else {
        console.log(`✅ Servindo: ${filePath}`);
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
      }
    });
  }
});

// Tratamento de erros não capturados para evitar que o servidor caia
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  console.error('Stack:', error.stack);
  // NÃO encerrar o processo - apenas logar o erro
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  console.error('Promise:', promise);
  // NÃO encerrar o processo - apenas logar o erro
});

server.listen(PORT, () => {
  console.log(`🚀 API Server rodando em http://localhost:${PORT}`);
  console.log('✅ Endpoints disponíveis:');
  console.log(`   - GET /api/user?username=USERNAME`);
  console.log(`   - GET /api/stories?username=USERNAME (DESABILITADO - API não retorna stories)`);
  console.log(`   - GET /api/followers?username=USERNAME`);
  console.log(`   - GET /api/following?username=USERNAME`);
  console.log(`   - GET /api/chaining-results?username=USERNAME`);
  console.log(`   - GET /api/user/posts?username=USERNAME ou ?user_id=USER_ID - Buscar lista de posts de um usuário`);
  console.log(`   - GET /api/post?id=POST_ID - Buscar detalhes de um post específico`);
  console.log(`   - 🔥 POST /api/posts/batch - Buscar posts de múltiplos usuários (max 25) - NOVO!`);
  console.log(`   - GET /proxy-image?url=IMAGE_URL`);
  console.log(`   - POST /api/clear-cache - Limpar cache de imagens`);
  console.log(`   - GET /api/health - Health check`);
  console.log(`   - GET /debug - Página de debug do localStorage`);
});
