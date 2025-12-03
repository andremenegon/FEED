// ============================================
// ARQUIVO GERAL - FUNÇÕES E CONFIGURAÇÕES COMPARTILHADAS
// ============================================

// ============================================
// CONFIGURAÇÕES DO SITE
// ============================================
const SITE_CONFIG = {
    name: "In'Stalker",
    fullName: "In'Stalker - O maior software de espionagem de Instagram da América Latina",
    description: "In'Stalker - O maior software de espionagem de Instagram da América Latina. Descubra a verdade sobre qualquer pessoa do Instagram.",
    apiPort: 8002,
    defaultPort: 8001,
    cookieName: 'localStorage_active',
    cookieExpirationDays: 365,
    redirectUrl: '../Inicio1/index.html'
};

// ============================================
// FUNÇÕES DE COOKIE
// ============================================

/**
 * Define um cookie
 * @param {string} name - Nome do cookie
 * @param {string} value - Valor do cookie
 * @param {number} days - Dias até expirar (padrão: 365)
 */
function setCookie(name, value, days = SITE_CONFIG.cookieExpirationDays) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
}

/**
 * Lê um cookie
 * @param {string} name - Nome do cookie
 * @returns {string|null} - Valor do cookie ou null se não existir
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Deleta um cookie específico
 * @param {string} name - Nome do cookie a deletar
 */
function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname};`;
}

// ============================================
// FUNÇÃO DE LIMPEZA COMPLETA DE DADOS
// ============================================

/**
 * Limpa TODOS os dados armazenados: localStorage, sessionStorage, cookies, IndexedDB e cache do servidor
 */
function clearAllData() {
    // 1. Limpar localStorage completamente (incluindo chaves específicas)
    try {
        const prefixes = ['feed', 'direct', 'processed_stories', 'user_data', 
                          'followers', 'following', 'chaining_results', 'posts',
                          'feedPostsOrder', 'feedPostsHash', 'feed_real_posts',
                          'feed_posts_html', 'feed_timestamp', 'last_searched_username'];
        
        Object.keys(localStorage).forEach(key => {
            if (prefixes.some(prefix => key.includes(prefix))) {
                localStorage.removeItem(key);
            }
        });
        
        localStorage.clear();
    } catch (e) {
        console.error('❌ Erro ao limpar localStorage:', e);
    }
    
    // 2. Limpar sessionStorage completamente
    try {
        sessionStorage.clear();
    } catch (e) {
        console.error('❌ Erro ao limpar sessionStorage:', e);
    }
    
    // 3. Limpar TODOS os cookies relacionados ao site
    try {
        const allCookies = document.cookie.split(';');
        allCookies.forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim();
            if (cookieName) {
                if (cookieName.includes('banner_shown') || 
                    cookieName.includes('direct_chat') || 
                    cookieName.includes('localStorage_active') ||
                    cookieName.includes('notification_shown') ||
                    cookieName.includes('feed_cache') ||
                    cookieName === SITE_CONFIG.cookieName) {
                    deleteCookie(cookieName);
                }
            }
        });
        
        deleteCookie('localStorage_active');
    } catch (e) {
        console.error('❌ Erro ao limpar cookies:', e);
    }
    
    // 4. Tentar limpar IndexedDB (se existir)
    try {
        if ('indexedDB' in window) {
            indexedDB.databases().then(databases => {
                databases.forEach(db => {
                    if (db.name) {
                        indexedDB.deleteDatabase(db.name).catch(() => {});
                    }
                });
            }).catch(() => {});
        }
    } catch (e) {
        // Silencioso
    }
    
    // 5. Limpar cache do servidor (opcional - via API)
    try {
        const apiUrl = getApiUrl('/api/clear-cache');
        fetch(apiUrl, { method: 'POST' }).catch(() => {});
    } catch (e) {
        // Silencioso
    }
}

// ============================================
// FUNÇÕES DE API E PROXY
// ============================================

/**
 * Retorna a URL completa da API
 * @param {string} endpoint - Endpoint da API (ex: '/api/user')
 * @returns {string} - URL completa
 */
function getApiUrl(endpoint) {
    // URL do servidor PHP
    const PHP_BACKEND = 'https://appofficial.website/in-stalker';
    
    // Se for /proxy-image, SEMPRE usar PHP backend (não existe mais Node.js)
    if (endpoint.startsWith('/proxy-image') || endpoint.startsWith('/_next/image') || endpoint.startsWith('/image-proxy')) {
        // SEMPRE usar PHP backend
        return `${PHP_BACKEND}/image-proxy.php`;
    }
    
    // Para todas as outras requisições, usar o servidor PHP
    // O endpoint PHP é único: /api-instagram.php?username=...&api=plagio
    // Se o endpoint já contém parâmetros, adicionar ao final
    if (endpoint.includes('?')) {
        return `${PHP_BACKEND}/api-instagram.php?${endpoint.split('?')[1]}&api=plagio`;
    }
    
    // Se não tem parâmetros, retornar base (será usado com parâmetros na chamada)
    return `${PHP_BACKEND}/api-instagram.php`;
}

/**
 * Converte URL do Instagram para URL do proxy
 * @param {string} url - URL original
 * @returns {string} - URL do proxy ou URL original
 */
function getProxyUrl(url) {
    if (!url) return '';
    // Se já é uma URL do proxy, retornar como está
    if (url.includes('/proxy-image') || url.includes('/image-proxy')) return url;
    // Se for URL do Instagram, usar proxy
    if (url && url.includes('cdninstagram.com')) {
        // SEMPRE usar PHP backend (não existe mais Node.js)
        const PHP_BACKEND = 'https://appofficial.website/in-stalker';
        return `${PHP_BACKEND}/image-proxy.php?url=${encodeURIComponent(url)}`;
    }
    return url;
}

// ============================================
// VERIFICAÇÃO E INICIALIZAÇÃO DE COOKIE
// ============================================

/**
 * Verifica se o cookie existe e limpa tudo se não existir
 * @param {boolean} redirect - Se deve redirecionar após limpar (padrão: true)
 * @returns {boolean} - true se cookie existe, false se foi limpo
 */
function checkCookieAndClean(redirect = true) {
    const storageCookie = getCookie(SITE_CONFIG.cookieName);
    
    if (!storageCookie) {
        clearAllData();
        
        // Se redirect=true, sempre redirecionar (exceto se já estiver na página inicial)
        if (redirect) {
            const isInitial = isInitialPage();
            if (!isInitial) {
                console.log('🔄 Redirecionando para página inicial...');
                // Redirecionar de forma que garanta o carregamento da página
                setTimeout(function() {
                    window.location.href = SITE_CONFIG.redirectUrl;
                }, 50);
            } else {
                console.log('✅ Já está na página inicial, não precisa redirecionar');
            }
        }
        return false;
    } else {
        console.log('✅ Cookie encontrado, dados mantidos');
        return true;
    }
}

/**
 * Verifica se estamos na página inicial
 * @returns {boolean} - true se estiver na página inicial
 */
function isInitialPage() {
    const pathname = window.location.pathname;
    return pathname.includes('Inicio1') || 
           pathname.includes('index.html') ||
           pathname.endsWith('/') ||
           pathname === '/' ||
           pathname === '/index.html';
}

/**
 * Inicializa a verificação de cookie na inicialização da página
 * Executa ANTES de qualquer outra coisa
 */
function initCookieCheck() {
    // Debug: verificar cookie imediatamente
    
    // Verificar cookie na inicialização
    // Se não estiver na página inicial, sempre redirecionar se não tiver cookie
    const shouldRedirect = !isInitialPage();
    checkCookieAndClean(shouldRedirect);
}

/**
 * Configura listeners para verificar cookie quando a página ganha foco ou fica visível
 */
function setupCookieWatchers() {
    function checkCookie() {
        const storageCookie = getCookie(SITE_CONFIG.cookieName);
        if (!storageCookie) {
            console.log('🍪 Cookie foi apagado! Limpando TODOS os dados e redirecionando...');
            clearAllData();
            
            // Sempre redirecionar se não estiver na página inicial
            const isInitial = isInitialPage();
            if (!isInitial) {
                console.log('🔄 Redirecionando para página inicial...');
                // Redirecionar de forma que garanta o carregamento da página
                setTimeout(function() {
                    window.location.href = SITE_CONFIG.redirectUrl;
                }, 50);
            } else {
                console.log('✅ Já está na página inicial, não precisa redirecionar');
            }
            return;
        }
    }
    
    // Verificar quando a página ganha foco (usuário volta para a aba)
    window.addEventListener('focus', checkCookie);
    
    // Verificar quando a página fica visível
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            checkCookie();
        }
    });
    
    // Verificar periodicamente (a cada 2 segundos) se o cookie foi apagado
    // Isso garante que mesmo se o usuário apagar o cookie manualmente, será detectado
    setInterval(function() {
        const storageCookie = getCookie(SITE_CONFIG.cookieName);
        if (!storageCookie) {
            console.log('🍪 Cookie foi apagado durante a navegação! Limpando e redirecionando...');
            clearAllData();
            const isInitial = isInitialPage();
            if (!isInitial) {
                console.log('🔄 Redirecionando para página inicial...');
                window.location.href = SITE_CONFIG.redirectUrl;
            }
        }
    }, 2000); // Verificar a cada 2 segundos
}

/**
 * Inicialização completa: verifica cookie e configura watchers
 * Chame esta função no início de cada página
 */
function initSite() {
    // Verificar cookie na inicialização
    initCookieCheck();
    
    // Configurar watchers para verificar cookie quando necessário
    setupCookieWatchers();
    
    // Criar/atualizar cookie sempre que a página carregar (se ainda não foi limpo)
    if (getCookie(SITE_CONFIG.cookieName)) {
        setCookie(SITE_CONFIG.cookieName, '1', SITE_CONFIG.cookieExpirationDays);
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Mascara um username (mostra 3 letras + *****)
 * @param {string} username - Username a mascarar
 * @returns {string} - Username mascarado
 */
function maskUsername(username) {
    if (!username || username.length === 0) {
        return 'xxx*****';
    }
    // Se o username já contém asteriscos, extrair as letras antes dos asteriscos
    if (username.includes('*')) {
        const lettersOnly = username.split('*')[0];
        if (lettersOnly.length >= 3) {
            return lettersOnly.substring(0, 3) + '*****';
        } else if (lettersOnly.length > 0) {
            return lettersOnly + '*****';
        }
        return 'xxx*****';
    }
    // Mostrar 3 letras + *****
    const visibleChars = username.length >= 3 ? username.substring(0, 3) : username;
    return visibleChars + '*****';
}

/**
 * Formata um número (ex: 1000 -> 1K, 1000000 -> 1M)
 * @param {number} num - Número a formatar
 * @returns {string} - Número formatado
 */
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ============================================
// EXPORTAR FUNÇÕES (para compatibilidade)
// ============================================

// Tornar funções disponíveis globalmente
if (typeof window !== 'undefined') {
    window.SITE_CONFIG = SITE_CONFIG;
    window.setCookie = setCookie;
    window.getCookie = getCookie;
    window.deleteCookie = deleteCookie;
    window.clearAllData = clearAllData;
    window.getApiUrl = getApiUrl;
    window.getProxyUrl = getProxyUrl;
    window.checkCookieAndClean = checkCookieAndClean;
    window.isInitialPage = isInitialPage;
    window.initCookieCheck = initCookieCheck;
    window.setupCookieWatchers = setupCookieWatchers;
    window.initSite = initSite;
    window.maskUsername = maskUsername;
    window.formatNumber = formatNumber;
}
