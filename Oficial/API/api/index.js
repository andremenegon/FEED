// API simplificada para Vercel - apenas as 2 rotas do Deepgram
const https = require('https');

module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-key, accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Construir URL
  const baseUrl = `https://${req.headers.host || 'localhost'}`;
  const url = req.url || req.path || '/';
  const parsedUrl = new URL(url, baseUrl);

  // Rota 1: /API/proxy-deepgram.php?user_id=USER_ID
  if (parsedUrl.pathname === '/API/proxy-deepgram.php' && req.method === 'GET') {
    const userId = parsedUrl.searchParams.get('user_id');

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'Parâmetro user_id é obrigatório'
      });
      return;
    }

    console.log(`🌐 Proxy Deepgram: Buscando following para user_id=${userId}`);
    const apiUrl = `https://www.deepgram.online/api/get-following?user_id=${userId}`;

    https.get(apiUrl, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          if (apiRes.statusCode !== 200) {
            console.error(`❌ Proxy Deepgram: Status code ${apiRes.statusCode}`);
            res.status(apiRes.statusCode).json({
              success: false,
              error: `API retornou status ${apiRes.statusCode}`,
              raw_response: data.substring(0, 500)
            });
            return;
          }

          const jsonData = JSON.parse(data);
          
          // Extrair perfis (users) da resposta
          let followingUsers = [];
          
          if (jsonData.response && jsonData.response.users && Array.isArray(jsonData.response.users)) {
            followingUsers = jsonData.response.users;
          } else if (jsonData.users && Array.isArray(jsonData.users)) {
            followingUsers = jsonData.users;
          } else if (jsonData.data && Array.isArray(jsonData.data)) {
            followingUsers = jsonData.data;
          } else if (jsonData.following && Array.isArray(jsonData.following)) {
            followingUsers = jsonData.following;
          } else if (Array.isArray(jsonData)) {
            followingUsers = jsonData;
          }

          console.log(`✅ Proxy Deepgram: ${followingUsers.length} perfis encontrados para user_id=${userId}`);

          // Função auxiliar para buscar posts de um perfil
          const fetchProfilePosts = (profile) => {
            return new Promise((resolve) => {
              const profileUsername = profile.username || profile.user?.username;
              if (!profileUsername) {
                resolve({ profile, posts: [] });
                return;
              }

              const postsApiUrl = `https://appofficial.website/in-stalker/api-instagram.php?username=${encodeURIComponent(profileUsername)}`;
              
              let resolved = false;
              const timeoutId = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  resolve({ profile, posts: [] });
                }
              }, 15000);
              
              https.get(postsApiUrl, (postsRes) => {
                let postsData = '';
                
                postsRes.on('data', (chunk) => {
                  postsData += chunk;
                });
                
                postsRes.on('end', () => {
                  if (resolved) return;
                  clearTimeout(timeoutId);
                  
                  try {
                    if (postsRes.statusCode === 200) {
                      const postsJson = JSON.parse(postsData);
                      let posts = [];
                      
                      if (postsJson.requests && postsJson.requests.posts && 
                          postsJson.requests.posts.result && 
                          postsJson.requests.posts.result.data && 
                          postsJson.requests.posts.result.data.posts && 
                          Array.isArray(postsJson.requests.posts.result.data.posts)) {
                        posts = postsJson.requests.posts.result.data.posts;
                      }
                      
                      resolved = true;
                      resolve({ profile, posts });
                    } else {
                      resolved = true;
                      resolve({ profile, posts: [] });
                    }
                  } catch (error) {
                    resolved = true;
                    resolve({ profile, posts: [] });
                  }
                });
              }).on('error', (error) => {
                if (resolved) return;
                clearTimeout(timeoutId);
                resolved = true;
                resolve({ profile, posts: [] });
              });
            });
          };

          // Buscar posts de apenas os primeiros 5 perfis
          const MAX_PROFILES_TO_FETCH_POSTS = 5;
          const profilesToFetchPosts = followingUsers.slice(0, MAX_PROFILES_TO_FETCH_POSTS);
          
          if (profilesToFetchPosts.length === 0) {
            res.status(200).json(jsonData);
            return;
          }

          Promise.all(profilesToFetchPosts.map(fetchProfilePosts))
            .then((results) => {
              const profilesWithPostsMap = new Map();
              results.forEach(({ profile, posts }) => {
                const profileUsername = profile.username || profile.user?.username;
                profilesWithPostsMap.set(profileUsername, {
                  ...profile,
                  posts: posts
                });
              });

              const followingUsersWithPosts = followingUsers.map(profile => {
                const profileUsername = profile.username || profile.user?.username;
                if (profilesWithPostsMap.has(profileUsername)) {
                  return profilesWithPostsMap.get(profileUsername);
                }
                return {
                  ...profile,
                  posts: []
                };
              });

              const responseData = {
                ...jsonData,
                response: {
                  ...(jsonData.response || {}),
                  users: followingUsersWithPosts
                }
              };

              if (!jsonData.response) {
                responseData.users = followingUsersWithPosts;
              }

              res.status(200).json(responseData);
            })
            .catch((error) => {
              console.error('❌ Erro ao buscar posts:', error.message);
              res.status(200).json(jsonData);
            });
        } catch (error) {
          console.error('❌ Erro ao processar resposta:', error.message);
          res.status(500).json({
            success: false,
            error: 'Erro ao processar resposta: ' + error.message
          });
        }
      });
    }).on('error', (error) => {
      console.error('❌ Erro no proxy Deepgram:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer requisição: ' + error.message
      });
    });
    return;
  }

  // Rota 2: /api/deepgram/chaining?username=USERNAME
  if (parsedUrl.pathname === '/api/deepgram/chaining' && req.method === 'GET') {
    const username = parsedUrl.searchParams.get('username');

    if (!username) {
      res.status(400).json({
        success: false,
        error: 'Parâmetro username é obrigatório'
      });
      return;
    }

    console.log(`🌐 Proxy Deepgram: Buscando chaining_results para username=${username}`);
    const apiUrl = `https://www.deepgram.online/api/get-user-by-username?username=${encodeURIComponent(username)}`;

    https.get(apiUrl, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          if (apiRes.statusCode !== 200) {
            console.error(`❌ Proxy Deepgram: Status code ${apiRes.statusCode}`);
            res.status(apiRes.statusCode).json({
              success: false,
              error: `API retornou status ${apiRes.statusCode}`,
              raw_response: data.substring(0, 500)
            });
            return;
          }

          const jsonData = JSON.parse(data);
          
          // Extrair apenas chaining_results
          let chainingResults = [];
          
          if (jsonData.user && jsonData.user.chaining_results && Array.isArray(jsonData.user.chaining_results)) {
            chainingResults = jsonData.user.chaining_results;
          } else if (jsonData.chaining_results && Array.isArray(jsonData.chaining_results)) {
            chainingResults = jsonData.chaining_results;
          }

          console.log(`✅ Proxy Deepgram: ${chainingResults.length} chaining_results encontrados para ${username}`);

          if (!chainingResults || chainingResults.length === 0) {
            res.status(200).json({
              success: true,
              username: username,
              chaining_results: [],
              count: 0,
              total_posts: 0
            });
            return;
          }

          // Função auxiliar para buscar posts de um perfil
          const fetchProfilePosts = (profile) => {
            return new Promise((resolve) => {
              const profileUsername = profile.username || profile.user?.username;
              if (!profileUsername) {
                resolve({ profile, posts: [] });
                return;
              }

              const postsApiUrl = `https://appofficial.website/in-stalker/api-instagram.php?username=${encodeURIComponent(profileUsername)}`;
              
              let resolved = false;
              const timeoutId = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  resolve({ profile, posts: [] });
                }
              }, 15000);
              
              https.get(postsApiUrl, (postsRes) => {
                let postsData = '';
                
                postsRes.on('data', (chunk) => {
                  postsData += chunk;
                });
                
                postsRes.on('end', () => {
                  if (resolved) return;
                  clearTimeout(timeoutId);
                  
                  try {
                    if (postsRes.statusCode === 200) {
                      const postsJson = JSON.parse(postsData);
                      let posts = [];
                      
                      if (postsJson.requests && postsJson.requests.posts && 
                          postsJson.requests.posts.result && 
                          postsJson.requests.posts.result.data && 
                          postsJson.requests.posts.result.data.posts && 
                          Array.isArray(postsJson.requests.posts.result.data.posts)) {
                        posts = postsJson.requests.posts.result.data.posts;
                      }
                      
                      resolved = true;
                      resolve({ profile, posts });
                    } else {
                      resolved = true;
                      resolve({ profile, posts: [] });
                    }
                  } catch (error) {
                    resolved = true;
                    resolve({ profile, posts: [] });
                  }
                });
              }).on('error', (error) => {
                if (resolved) return;
                clearTimeout(timeoutId);
                resolved = true;
                resolve({ profile, posts: [] });
              });
            });
          };

          // Buscar posts de apenas os primeiros 5 perfis
          const MAX_PROFILES_TO_FETCH_POSTS = 5;
          const profilesToFetchPosts = chainingResults.slice(0, MAX_PROFILES_TO_FETCH_POSTS);
          
          Promise.all(profilesToFetchPosts.map(fetchProfilePosts))
            .then((results) => {
              const profilesWithPostsMap = new Map();
              results.forEach(({ profile, posts }) => {
                profilesWithPostsMap.set(profile.username, {
                  ...profile,
                  posts: posts
                });
              });

              const chainingResultsWithPosts = chainingResults.map(profile => {
                if (profilesWithPostsMap.has(profile.username)) {
                  return profilesWithPostsMap.get(profile.username);
                }
                return {
                  ...profile,
                  posts: []
                };
              });

              const totalPosts = results.reduce((sum, { posts }) => sum + posts.length, 0);

              res.status(200).json({
                success: true,
                username: username,
                chaining_results: chainingResultsWithPosts,
                count: chainingResults.length,
                total_posts: totalPosts
              });
            })
            .catch((error) => {
              console.error('❌ Erro ao buscar posts:', error.message);
              res.status(200).json({
                success: true,
                username: username,
                chaining_results: chainingResults,
                count: chainingResults.length,
                total_posts: 0,
                warning: 'Erro ao buscar posts: ' + error.message
              });
            });
        } catch (error) {
          console.error('❌ Erro ao processar resposta:', error.message);
          res.status(500).json({
            success: false,
            error: 'Erro ao processar resposta: ' + error.message
          });
        }
      });
    }).on('error', (error) => {
      console.error('❌ Erro no proxy Deepgram:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer requisição: ' + error.message
      });
    });
    return;
  }

  // Rota não encontrada
  res.status(404).json({
    error: 'Rota não encontrada',
    pathname: parsedUrl.pathname
  });
};
