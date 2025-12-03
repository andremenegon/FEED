const https = require('https');

const API_KEY = 'w46il1jfubi68wdnkci4m1i0udru9zdc';
const username = 'andre.menegon';

console.log('🔍 Testando API HikerAPI...\n');
console.log(`Username: ${username}\n`);

const options = {
  hostname: 'api.hikerapi.com',
  path: `/v2/user/by/username?username=${username}`,
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'x-access-key': API_KEY
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.user) {
        const user = response.user;
        console.log('✅ Perfil encontrado!\n');
        console.log(`Username: ${user.username}`);
        console.log(`User ID (pk): ${user.pk}`);
        console.log(`Nome completo: ${user.full_name || 'N/A'}`);
        console.log(`É privado: ${user.is_private ? 'Sim' : 'Não'}`);
        console.log(`Seguidores: ${user.follower_count || 0}`);
        console.log(`Seguindo: ${user.following_count || 0}`);
        console.log(`Posts: ${user.media_count || 0}\n`);
        
        console.log('📸 URLs da foto de perfil:');
        console.log(`\n1. profile_pic_url:`);
        console.log(`   ${user.profile_pic_url || 'N/A'}`);
        
        if (user.hd_profile_pic_url_info) {
          console.log(`\n2. hd_profile_pic_url_info.url:`);
          console.log(`   ${user.hd_profile_pic_url_info.url || 'N/A'}`);
          console.log(`   Dimensões: ${user.hd_profile_pic_url_info.width}x${user.hd_profile_pic_url_info.height}`);
        } else {
          console.log(`\n2. hd_profile_pic_url_info: N/A`);
        }
        
        if (user.hd_profile_pic_versions && user.hd_profile_pic_versions.length > 0) {
          console.log(`\n3. hd_profile_pic_versions:`);
          user.hd_profile_pic_versions.forEach((version, index) => {
            console.log(`   [${index + 1}] ${version.width}x${version.height}: ${version.url}`);
          });
        }
        
        console.log('\n📋 URL que está sendo salva no localStorage:');
        const savedUrl = user.hd_profile_pic_url_info?.url || user.profile_pic_url;
        console.log(`   ${savedUrl}`);
        
        console.log('\n🔗 Testando acesso à URL:');
        console.log(`   URL: ${savedUrl}`);
        
        // Testar se a URL é acessível
        const urlObj = new URL(savedUrl);
        const testOptions = {
          hostname: urlObj.hostname,
          path: urlObj.pathname + urlObj.search,
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        };
        
        const testReq = https.request(testOptions, (testRes) => {
          console.log(`   Status: ${testRes.statusCode}`);
          console.log(`   Content-Type: ${testRes.headers['content-type']}`);
          console.log(`   Content-Length: ${testRes.headers['content-length'] || 'N/A'}`);
          
          if (testRes.statusCode === 200) {
            console.log('\n✅ URL é acessível!');
          } else {
            console.log(`\n⚠️ URL retornou status ${testRes.statusCode}`);
          }
        });
        
        testReq.on('error', (error) => {
          console.log(`\n❌ Erro ao testar URL: ${error.message}`);
        });
        
        testReq.end();
        
      } else {
        console.log('❌ Perfil não encontrado');
        console.log('Resposta:', JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.error('❌ Erro ao parsear resposta:', error.message);
      console.log('Resposta raw:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
});

req.end();

