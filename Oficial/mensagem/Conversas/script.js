// Elementos
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const contextMenu = document.getElementById('contextMenu');
const quickReactions = document.getElementById('quickReactions');
const likeBtn = document.getElementById('likeBtn');
const callBtn = document.getElementById('callBtn');
const videoBtn = document.getElementById('videoBtn');
const voiceBtn = document.getElementById('voiceBtn');
const photoBtn = document.getElementById('photoBtn');
const menusOverlay = document.getElementById('menusOverlay');
const stickerBtn = document.getElementById('stickerBtn');

// ============================================================================
// VARIÁVEIS DINÂMICAS DO FUNIL (SERÃO CAPTURADAS ANTES)
// ============================================================================
// 
// 1. NOME DO USUÁRIO ESPIONADO:
//    - Variável: userSpiedName (ex: "André")
//    - Fallback: "" (vazio - não deixar nada)
//    - Uso: Substituir em mensagens como "Por favor {userSpiedName}" ou "{userSpiedName}???"
//
// 2. CIDADE DO IP DO USUÁRIO:
//    - Variável: userCity (ex: "Londrina")
//    - Fallback 1: Cidade vizinha mais próxima (buscar via API)
//    - Fallback 2: "praça"
//    - Uso: "Fala pra ela que tem sim em {userCity}"
//
// 3. PONTO TURÍSTICO/LOCAL PRÓXIMO:
//    - Variável: nearbyLocation (ex: "Praça da Catedral")
//    - Fallback: "Casa da Fernanda"
//    - Uso: Mensagem de localização recebida
//
// 4. DIA DA SEMANA ANTERIOR:
//    - Variável: previousWeekday (ex: "QUA" para quarta-feira)
//    - Cálculo: Dia da semana anterior à data atual
//    - Uso: "Dboa, amanhã ou quinta {previousWeekday}"
//
// 5. FORMATO DE HORÁRIO:
//    - Hoje (mesmo dia): "12:23"
//    - Ontem: "ONTEM, 12:23"
//    - Semana (dia 18-14): "SEX, 12:23" (dia da semana abreviado)
//    - Mais antigo (1 semana+): "31 DE OUT., 13:23" (número do dia + mês abreviado)
//
// ============================================================================

// Variáveis globais
let selectedMessage = null;
let isRecordingVoice = false;
let isLoadingMessages = false;
let oldestMessageTime = new Date();

// Função para obter o identificador único do chat atual
function getChatId() {
    // Usar o nome do arquivo HTML como identificador único (chat-1, chat-2, chat-3, etc)
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop() || pathname.split('\\').pop();
    
    if (filename.includes('chat-1.html')) {
        return 'chat_1';
    } else if (filename.includes('chat-2.html')) {
        return 'chat_2';
    } else if (filename.includes('chat-3.html')) {
        return 'chat_3';
    } else if (filename.includes('chat-4.html')) {
        return 'chat_4';
    } else if (filename.includes('chat-5.html')) {
        return 'chat_5';
    } else if (filename.includes('index.html')) {
        return 'chat_index';
    }
    
    // Fallback: usar nome do usuário se não conseguir identificar pela URL
    const chatUserName = document.getElementById('chatUserName');
    if (chatUserName) {
        return `chat_${chatUserName.textContent.trim()}`;
    }
    return 'chat_default';
}

// Palavras para aplicar blur (conteúdo sexual)
const blurWords = [
    'sexo', 'nude', 'nudes', 'pelado', 'pelada', 'buceta', 'pau', 'pênis', 
    'vagina', 'tesão', 'gostosa', 'gostoso', 'safada', 'safado', 'putaria',
    'foder', 'transar', 'sexy', 'sensual', 'peitos', 'bunda', 'raba',
    'excitado', 'excitada', 'tesuda', 'tesudo', 'pornô', 'porno', 'xvideos',
    'pack', 'foto íntima', 'video intimo', 'chamada de vídeo pelada'
];

// Função para aplicar blur em palavras
function applyBlurToText(text) {
    let processedText = text;
    
    // Primeiro, processar texto entre ** (asteriscos duplos)
    processedText = processedText.replace(/\*\*(.+?)\*\*/g, (match, content) => {
        return `<span class="blur-word">${content}</span>`;
    });
    
    // Depois, processar palavras da lista de blur
    blurWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        processedText = processedText.replace(regex, (match) => {
            // Não aplicar blur se já está dentro de um span blur-word
            if (processedText.includes(`<span class="blur-word">${match}</span>`)) {
                return match;
            }
            return `<span class="blur-word">${match}</span>`;
        });
    });
    
    return processedText;
}

// Mensagens aleatórias para scroll infinito (textos variados - curtos e longos)
const randomMessages = [
    // Textos curtos
    { type: 'text', content: 'Oi!', received: true },
    { type: 'text', content: 'Oi', received: false },
    { type: 'text', content: 'Tudo bem?', received: true },
    { type: 'text', content: 'Sim', received: false },
    { type: 'text', content: 'E você?', received: true },
    { type: 'text', content: 'Tudo certo', received: false },
    { type: 'text', content: 'Que bom!', received: true },
    { type: 'text', content: '😊', received: false },
    { type: 'text', content: '❤️', received: true },
    { type: 'text', content: 'Obrigada', received: false },
    { type: 'text', content: 'De nada', received: true },
    { type: 'text', content: 'Beleza', received: false },
    { type: 'text', content: 'Ok', received: true },
    { type: 'text', content: 'Entendi', received: false },
    { type: 'text', content: 'Legal', received: true },
    { type: 'text', content: 'Valeu', received: false },
    // Textos médios
    { type: 'text', content: 'Oi, tudo bem? Como você está?', received: true },
    { type: 'text', content: 'Tudo sim, e você? Como foi seu dia?', received: false },
    { type: 'text', content: 'Que foto linda! Você está muito bonita 😍', received: true },
    { type: 'text', content: 'Obrigada! Você também está lindo ❤️', received: false },
    { type: 'text', content: 'Vamos sair hoje? Que tal um cinema?', received: true },
    { type: 'text', content: 'Adoraria! Que horas você quer ir?', received: false },
    { type: 'text', content: 'Estou com saudades de você', received: true },
    { type: 'text', content: 'Também estou com saudades 💕', received: false },
    { type: 'text', content: 'Você está linda hoje! Que roupa linda', received: true },
    { type: 'text', content: 'Ai, obrigada! Você é muito gentil 😊', received: false },
    { type: 'text', content: 'Me manda uma foto sua', received: true },
    { type: 'text', content: 'Que tipo de foto você quer? 👀', received: false },
    { type: 'text', content: 'Você sabe... uma foto mais íntima', received: true },
    { type: 'text', content: 'Hmm talvez mais tarde 😏', received: false },
    { type: 'text', content: 'Estou pensando em você agora', received: true },
    { type: 'text', content: 'Que bom! Eu também estou pensando em você', received: false },
    // Textos longos
    { type: 'text', content: 'Oi! Tudo bem? Faz tempo que não conversamos, como você está? Espero que esteja tudo certo por aí!', received: true },
    { type: 'text', content: 'Oi! Tudo sim, obrigada por perguntar! Estou bem, trabalhando bastante mas tudo tranquilo. E você, como está?', received: false },
    { type: 'text', content: 'Que bom que você está bem! Eu também estou tudo certo, só trabalhando muito mas não posso reclamar. Estava com saudades de conversar com você!', received: true },
    { type: 'text', content: 'Também estava com saudades! Vamos marcar de nos vermos logo? Faz tempo que não nos vemos pessoalmente, seria muito bom!', received: false },
    { type: 'text', content: 'Claro! Adoraria! Que tal esse fim de semana? Podemos ir em algum lugar legal, talvez um restaurante novo que abriu perto daqui?', received: true },
    { type: 'text', content: 'Perfeito! Adorei a ideia! Vou verificar minha agenda e te aviso, mas acho que consigo sim. Já estou ansiosa!', received: false },
    { type: 'text', content: 'Que ótimo! Vou ficar no aguardo então. Enquanto isso, me conta o que você tem feito de novo, o que tem acontecido na sua vida?', received: true },
    { type: 'text', content: 'Nossa, muita coisa! Comecei um curso novo, estou aprendendo coisas interessantes. E você? O que tem feito de diferente?', received: false },
    { type: 'text', content: 'Que legal! Fico feliz que esteja fazendo coisas novas. Eu também comecei alguns projetos interessantes, está sendo bem produtivo!', received: true },
    { type: 'text', content: 'Que incrível! Adoro quando você fica empolgada com projetos novos. Você sempre tem ideias muito criativas, admiro muito isso em você!', received: false }
];

// Detectar scroll no topo para carregar mensagens
chatMessages.addEventListener('scroll', function() {
    if (this.scrollTop === 0 && !isLoadingMessages) {
        loadOlderMessages();
    }
});

// Função para carregar mensagens antigas (ENCHEÇÃO DE LINGUIÇA)
function loadOlderMessages() {
    if (isLoadingMessages) return;
    
    // Obter contador específico do chat
    const chatId = getChatId();
    const loadCountKey = `${chatId}_messagesLoadCount`;
    let messagesLoadCount = parseInt(localStorage.getItem(loadCountKey) || '0');
    
    // Verificar se já foram 3 carregamentos
    if (messagesLoadCount >= 3) {
        // Mostrar popup bloqueado na 4ª tentativa
        showBlockedPopup("Seja um membro VIP do In'Stalker para carregar mais mensagens");
        return;
    }
    
    isLoadingMessages = true;
    
    // Adicionar indicador de loading (só a animação, sem texto)
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'messages-loading';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
    `;
    chatMessages.insertBefore(loadingDiv, chatMessages.firstChild);
    
    // Salvar posição atual do scroll
    const oldScrollHeight = chatMessages.scrollHeight;
    
    // Simular delay de carregamento
    setTimeout(() => {
        // Gerar entre 3 e 8 mensagens aleatórias (ENCHEÇÃO DE LINGUIÇA)
        const numMessages = Math.floor(Math.random() * 6) + 3;
        
        // Obter avatar do usuário atual para usar nas mensagens recebidas
        const chatUserAvatar = document.getElementById('chatUserAvatar');
        const avatarSrc = chatUserAvatar ? chatUserAvatar.src : 'https://i.pravatar.cc/150?img=1';
        
        // Tipos de mensagens para encheção de linguiça
        // Para chat-5 (chat de memes), adicionar mais stories
        const isMemesChat = chatId === 'chat_5';
        
        const messageTypes = isMemesChat ? [
            'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story',
            'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story',
            'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story',
            'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story',
            'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story',
            'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story',
            'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story',
            'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story', 'story',
            'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text',
            'audio'
        ] : [
            'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 
            'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text',
            'heart', 'heart', 'heart',
            'audio', 'audio',
            'call', 'call',
            'video',
            'photo'
        ];
        
        for (let i = 0; i < numMessages; i++) {
            // Diminuir o tempo da mensagem antiga
            oldestMessageTime = new Date(oldestMessageTime.getTime() - Math.random() * 3600000);
            const time = oldestMessageTime.getHours().toString().padStart(2, '0') + ':' + 
                        oldestMessageTime.getMinutes().toString().padStart(2, '0');
            
            const messageDiv = document.createElement('div');
            const isReceived = Math.random() > 0.4; // 60% recebidas, 40% enviadas
            const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
            
            // ENCHEÇÃO DE LINGUIÇA: adicionar classe de blur forte
            messageDiv.className = `message ${isReceived ? 'received' : 'sent'} enchacao-de-linguica`;
            
            let messageHTML = '';
            
            if (messageType === 'photo') {
                // Foto recebida ou Nudes enviado - usar imagens do Unsplash com IDs válidos
                const photoIds = [
                    '1506905925346-21bda4d32df4',
                    '1469474968028-56623f02e42e',
                    '1511367461989-f85a21fda167',
                    '1682687220742-aba13b6e50ba',
                    '1498050108023-c5249f4df085',
                    '1506905925346-21bda4d32df4',
                    '1511367461989-f85a21fda167'
                ];
                const randomPhotoId = photoIds[Math.floor(Math.random() * photoIds.length)];
                
                if (isReceived) {
                    // Foto recebida - com video-sensitive-icon
                    messageHTML = `
                        <img src="${avatarSrc}" alt="User" class="message-avatar">
                        <div class="message-bubble">
                            <div class="message-video">
                                <img src="../../imagens/fotoblur1.jpg" alt="Vídeo" class="video-blurred">
                                <div class="video-sensitive-overlay">
                                    <div class="video-sensitive-content">
                                        <div class="video-sensitive-icon">
                                            <i class="fas fa-eye-slash"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // Nudes enviado - com video-sensitive-icon
                    messageHTML = `
                        <div class="message-bubble">
                            <div class="message-photo">
                                <img src="https://images.unsplash.com/photo-${randomPhotoId}?w=400" alt="Nudes">
                                <div class="video-sensitive-overlay">
                                    <div class="video-sensitive-content">
                                        <div class="video-sensitive-icon">
                                            <i class="fas fa-eye-slash"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            } else if (messageType === 'audio') {
                // Áudio (só recebido)
                if (isReceived) {
                    const duration = Math.floor(Math.random() * 30) + 5; // 5-35 segundos
                    // Gerar barras com alturas suaves (evitando contrastes muito grandes)
                    // Para áudios dinâmicos, usar duração + contador para chave estável
                    const chatId = getChatId();
                    const audioCounterKey = `${chatId}_audio_counter`;
                    let audioCounter = parseInt(localStorage.getItem(audioCounterKey) || '0');
                    audioCounter++;
                    localStorage.setItem(audioCounterKey, audioCounter.toString());
                    
                    const audioKey = `${chatId}_audio_dynamic_${duration}_${audioCounter}`;
                    let savedHeights = localStorage.getItem(audioKey);
                    
                    let heights = [];
                    if (savedHeights) {
                        heights = JSON.parse(savedHeights);
                    } else {
                        // Gerar alturas fixas (aleatórias mas sempre as mesmas para este áudio)
                        let currentHeight = Math.floor(Math.random() * 21) + 15; // 15-36px
                        
                        for (let i = 0; i < 30; i++) {
                            const rand = Math.random();
                            const variation = rand < 0.5 
                                ? Math.floor(Math.random() * 17) - 8   // 50%: -8 a +8
                                : rand < 0.8 
                                    ? Math.floor(Math.random() * 31) - 15  // 30%: -15 a +15
                                    : Math.floor(Math.random() * 41) - 20; // 20%: -20 a +20
                            
                            currentHeight = Math.max(12, Math.min(40, currentHeight + variation));
                            heights.push(currentHeight);
                        }
                        localStorage.setItem(audioKey, JSON.stringify(heights));
                    }
                    
                    let waveformBars = '';
                    heights.forEach(height => {
                        waveformBars += `<div class="audio-recebido-waveform-bar" style="height: ${height}px;"></div>`;
                    });
                    messageHTML = `
                        <img src="${avatarSrc}" alt="User" class="message-avatar">
                        <div class="message-bubble">
                            <div class="audio-recebido">
                                <button class="audio-recebido-play-btn">
                                    <i class="fas fa-play"></i>
                                </button>
                                <div class="audio-recebido-waveform">
                                    ${waveformBars}
                                </div>
                                <span class="audio-recebido-duration">0:${duration.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    `;
                } else {
                    // Se for enviado, vira texto
                    const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
            const processedContent = applyBlurToText(randomMsg.content);
                    messageHTML = `
                        <div class="message-bubble">
                            <div class="message-content">${processedContent}</div>
                        </div>
                    `;
                }
            } else if (messageType === 'video') {
                // Vídeo com blur (só recebido)
                if (isReceived) {
                    messageHTML = `
                        <img src="${avatarSrc}" alt="User" class="message-avatar">
                        <div class="message-bubble">
                            <div class="message-video">
                                <img src="../../imagens/fotoblur1.jpg" alt="Vídeo" class="video-blurred">
                                <div class="video-sensitive-overlay">
                                    <div class="video-sensitive-content">
                                        <div class="video-sensitive-icon">
                                            <i class="fas fa-eye-slash"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // Se for enviado, vira texto
                    const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
                    const processedContent = applyBlurToText(randomMsg.content);
                    messageHTML = `
                        <div class="message-bubble">
                            <div class="message-content">${processedContent}</div>
                        </div>
                    `;
                }
            } else if (messageType === 'heart') {
                // Mensagem de coração (só enviada)
                if (!isReceived) {
                    messageHTML = `
                        <div class="message-bubble">
                            <div class="message-content-heart">❤️</div>
                        </div>
                    `;
                } else {
                    // Se for recebida, vira texto
                    const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
                    const processedContent = applyBlurToText(randomMsg.content);
                    messageHTML = `
                        <img src="${avatarSrc}" alt="User" class="message-avatar">
                        <div class="message-bubble">
                            <div class="message-content">${processedContent}</div>
                        </div>
                    `;
                }
            } else if (messageType === 'call') {
                // Chamada de vídeo (sistema)
                const callTypes = ['lost', 'ended', 'normal'];
                const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
                const callTime = time;
                
                if (callType === 'lost') {
                    messageHTML = `
                        <div class="message-system">
                            <div class="message-system-content">
                                <i class="fas fa-video"></i>
                                <span>Ligação de vídeo perdida</span>
                            </div>
                            <button class="message-system-btn">Ligar de volta</button>
                        </div>
                    `;
                } else if (callType === 'ended') {
                    messageHTML = `
                        <div class="message-system ended">
                            <div class="message-system-content">
                                <i class="fas fa-video"></i>
                                <div class="message-system-text-wrapper">
                                    <span>Ligação de vídeo encerrada</span>
                                    <span class="message-system-time">${callTime}</span>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    messageHTML = `
                        <div class="message-system normal">
                            <div class="message-system-content">
                                <i class="fas fa-video"></i>
                                <div class="message-system-text-wrapper">
                                    <span>Chamada de vídeo</span>
                                    <span class="message-system-time">${callTime}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            } else if (messageType === 'story') {
                // Story/Reel (para chat de memes)
                const storyIndex = Math.floor(Math.random() * 1000) + 1;
                const maskId = isReceived ? `play-mask-received-${storyIndex}` : `play-mask-sent-${storyIndex}`;
                const userName = isReceived ? (chatUserAvatar ? chatUserAvatar.getAttribute('alt') || 'carla_memes' : 'carla_memes') : 'você';
                const userAvatar = isReceived ? avatarSrc : 'https://i.pravatar.cc/150?img=2';
                
                // 30% com 😂, 60% sem reação (sem ❤️ para chat-5)
                const reactionRand = Math.random();
                let reactionHTML = '';
                if (reactionRand < 0.3) {
                    reactionHTML = '<div class="message-reaction">😂</div>';
                }
                
                if (isReceived) {
                    messageHTML = `
                        <img src="${avatarSrc}" alt="User" class="message-avatar">
                        <div class="message-bubble">
                            <div class="story-encaminhado-recebido">
                                <div class="story-encaminhado-header">
                                    <img src="${userAvatar}" alt="User" class="story-encaminhado-avatar">
                                    <div class="story-encaminhado-info">
                                        <span class="story-encaminhado-name">${userName}</span>
                                    </div>
                                </div>
                                <img src="../../imagens/fotoblur1.jpg" alt="Story" class="story-encaminhado-image">
                                <div class="story-encaminhado-play-btn">
                                    <svg width="32.5" height="32.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 5 L8 19 L19 12 Z" fill="white" stroke="white" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
                                    </svg>
                                </div>
                                <div class="story-encaminhado-clip-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <mask id="${maskId}">
                                                <rect width="24" height="24" fill="white"/>
                                                <path d="M10 8 L10 16 L16 12 Z" fill="black" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
                                            </mask>
                                        </defs>
                                        <rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="white" mask="url(#${maskId})"/>
                                    </svg>
                                </div>
                            </div>
                            ${reactionHTML}
                        </div>
                    `;
                } else {
                    messageHTML = `
                        <div class="message-bubble">
                            <div class="story-encaminhado-recebido">
                                <div class="story-encaminhado-header">
                                    <img src="${userAvatar}" alt="User" class="story-encaminhado-avatar">
                                    <div class="story-encaminhado-info">
                                        <span class="story-encaminhado-name">${userName}</span>
                                    </div>
                                </div>
                                <img src="../../imagens/fotoblur1.jpg" alt="Story" class="story-encaminhado-image">
                                <div class="story-encaminhado-play-btn">
                                    <svg width="32.5" height="32.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 5 L8 19 L19 12 Z" fill="white" stroke="white" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
                                    </svg>
                                </div>
                                <div class="story-encaminhado-clip-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <mask id="${maskId}">
                                                <rect width="24" height="24" fill="white"/>
                                                <path d="M10 8 L10 16 L16 12 Z" fill="black" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
                                            </mask>
                                        </defs>
                                        <rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="white" mask="url(#${maskId})"/>
                                    </svg>
                                </div>
                            </div>
                            ${reactionHTML}
                        </div>
                    `;
                }
            } else {
                // Texto normal
                const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
                const processedContent = applyBlurToText(randomMsg.content);
                
                if (isReceived) {
                    messageHTML = `
                        <img src="${avatarSrc}" alt="User" class="message-avatar">
                    <div class="message-bubble">
                        <div class="message-content">${processedContent}</div>
                    </div>
                `;
            } else {
                    // Às vezes adicionar reação
                    const hasReaction = Math.random() > 0.7;
                    const reactions = ['❤️', '👍', '😂', '😍', '🔥'];
                    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
                    
                    messageHTML = `
                    <div class="message-bubble">
                        <div class="message-content">${processedContent}</div>
                            ${hasReaction ? `<div class="message-reaction">${reaction}</div>` : ''}
                    </div>
                `;
                }
            }
            
            messageDiv.innerHTML = messageHTML;
            
            // Inserir após o loading (que está no topo)
            chatMessages.insertBefore(messageDiv, loadingDiv.nextSibling);
            // NÃO adicionar listeners para encheção de linguiça (não interativas)
        }
        
        // Configurar botões de transcrição para novos áudios
        setupTranscricaoButtons();
        
        // Dividir textos em divs por linha
        setTimeout(() => {
            wrapTextLinesInDivs();
        }, 100);
        
        // Remover loading
        loadingDiv.remove();
        
        // Incrementar contador de carregamentos (específico do chat)
        messagesLoadCount++;
        localStorage.setItem(loadCountKey, messagesLoadCount.toString());
        
        // Manter a posição do scroll
        chatMessages.scrollTop = chatMessages.scrollHeight - oldScrollHeight;
        
        isLoadingMessages = false;
    }, 800);
}

// Scroll inicial
chatMessages.scrollTop = chatMessages.scrollHeight;

// Gerenciar ícones do input e envio de mensagens
if (messageInput) {
    const inputActions = document.querySelector('.message-input-actions');
    const inputActionIcons = inputActions ? inputActions.querySelectorAll('.input-action-icon:not(.input-send-icon)') : [];
    const inputSendIcon = document.getElementById('inputSendIcon');
    const cameraIcon = document.getElementById('cameraIcon');
    const searchIcon = document.getElementById('searchIcon');
    
    // Função para atualizar visibilidade dos ícones
    function updateInputIcons(hasText) {
        if (hasText) {
            // Esconder os 4 ícones e a DIV ROXA (câmera)
            inputActionIcons.forEach(icon => {
                icon.style.display = 'none';
            });
            if (cameraIcon) cameraIcon.style.display = 'none';
            // Mostrar a lupa (sem fundo roxo) e o botão de enviar
            if (searchIcon) searchIcon.style.display = 'flex';
            if (inputSendIcon) inputSendIcon.style.display = 'flex';
        } else {
            // Mostrar os 4 ícones e a DIV ROXA (câmera), esconder o de enviar e a lupa
            inputActionIcons.forEach(icon => {
                icon.style.display = 'flex';
            });
            if (inputSendIcon) inputSendIcon.style.display = 'none';
            if (cameraIcon) cameraIcon.style.display = 'flex';
            if (searchIcon) searchIcon.style.display = 'none';
        }
    }

// Enviar mensagem com Enter
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        sendMessage(this.value);
        this.value = '';
            updateInputIcons(false);
    }
});

    // Mostrar/esconder ícones do input baseado no texto
messageInput.addEventListener('input', function() {
        updateInputIcons(this.value.trim() !== '');
    });
    
    // Event listener para o ícone de enviar
    if (inputSendIcon) {
        inputSendIcon.addEventListener('click', function() {
            if (messageInput.value.trim() !== '') {
                sendMessage(messageInput.value);
                messageInput.value = '';
                updateInputIcons(false);
            }
        });
    }
}

// Função para enviar mensagem de coração
function sendHeartMessage() {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Salvar mensagem no localStorage (específico do chat)
    const chatId = getChatId();
    const storageKey = `${chatId}_sentMessages`;
    const sentMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    sentMessages.push({
        id: messageId,
        text: '❤️',
        time: time,
        timestamp: Date.now(),
        isHeart: true
    });
    localStorage.setItem(storageKey, JSON.stringify(sentMessages));
    
    // Mensagem de coração com estilo diferente
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent message-heart';
    messageDivSent.setAttribute('data-message-id', messageId);
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="message-content-heart">❤️</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    addMessageListeners(messageDivSent);
    
    // Aplicar bordas arredondadas após adicionar nova mensagem
    applyMessageRoundedCorners();
    
    // Atualizar gradiente da mensagem de coração (não tem .message-content, então não precisa)
    
    scrollToBottom();
    
    // Remover erro VIP de mensagens anteriores (mas manter as bordas)
    const previousErrors = document.querySelectorAll('.message-vip-error');
    previousErrors.forEach(error => error.remove());
    
    // Mostrar erro de "não é MEMBRO-VIP" embaixo da última mensagem enviada (permanente)
    setTimeout(() => {
        showVIPError(messageDivSent);
    }, 1500);
}

// Função para enviar mensagem
function sendMessage(text) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Aplicar blur no texto
    const processedText = applyBlurToText(escapeHtml(text));
    
    // Salvar mensagem no localStorage (específico do chat)
    const chatId = getChatId();
    const storageKey = `${chatId}_sentMessages`;
    const sentMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    sentMessages.push({
        id: messageId,
        text: text,
        time: time,
        timestamp: Date.now()
    });
    localStorage.setItem(storageKey, JSON.stringify(sentMessages));
    
    // APENAS mensagem enviada - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent new-message';
    messageDivSent.setAttribute('data-message-id', messageId);
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">${processedText}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    addMessageListeners(messageDivSent);
    
    // Aplicar bordas arredondadas após adicionar nova mensagem
    applyMessageRoundedCorners();
    
    // Atualizar gradiente da nova mensagem
    setTimeout(() => {
        updateMessageGradient(messageDivSent);
        // Dividir texto em divs por linha
        wrapTextLinesInDivs();
    }, 100);
    
    scrollToBottom();
    
    // Remover erro VIP de mensagens anteriores (mas manter as bordas)
    const previousErrors = document.querySelectorAll('.message-vip-error');
    previousErrors.forEach(error => error.remove());
    
    // Mostrar erro de "não é MEMBRO-VIP" embaixo da última mensagem enviada (permanente)
    setTimeout(() => {
        showVIPError(messageDivSent);
    }, 1500);
}

// Mostrar erro de MEMBRO-VIP embaixo da mensagem (permanente)
function showVIPError(messageElement) {
    if (!messageElement) return;
    
    // Verificar se já existe erro após esta mensagem
    const nextSibling = messageElement.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('message-vip-error')) {
        return; // Não criar duplicado
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message-vip-error';
    errorDiv.innerHTML = '<span>Mensagem não enviada. <span class="saiba-mais">Saiba mais</span></span>';
    messageElement.insertAdjacentElement('afterend', errorDiv);
    
    // Adicionar event listener para "Saiba mais"
    const saibaMais = errorDiv.querySelector('.saiba-mais');
    if (saibaMais) {
        saibaMais.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showBlockedPopup();
        });
    }
    
    scrollToBottom();
}

// Escape HTML para segurança
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll suave para o final
function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// Menu de contexto (clique direito nas mensagens)
function addMessageListeners(messageElement) {
    const bubble = messageElement.querySelector('.message-bubble');
    if (!bubble) return;
    
    // Clique direito
    bubble.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const rect = bubble.getBoundingClientRect();
        showBothMenus(rect, messageElement);
    });
    
    // Segurar para reações (mobile)
    let pressTimer;
    bubble.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return; // Apenas botão esquerdo
        pressTimer = setTimeout(() => {
            const rect = bubble.getBoundingClientRect();
            showBothMenus(rect, messageElement);
        }, 500);
    });
    
    bubble.addEventListener('mouseup', function() {
        clearTimeout(pressTimer);
    });
    
    bubble.addEventListener('mouseleave', function() {
        clearTimeout(pressTimer);
    });
}

// Converter hex para RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Interpolar entre duas cores RGB
function interpolateColor(color1, color2, factor) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Atualizar cor sólida das mensagens enviadas baseado na posição
function updateMessageGradient(messageElement) {
    const content = messageElement.querySelector('.message-content') || messageElement.querySelector('.audio-recebido');
    if (!content || !messageElement.classList.contains('sent')) return;
    
    const rect = messageElement.getBoundingClientRect();
    const headerHeight = 60;
    const inputHeight = 70;
    const viewportHeight = window.innerHeight;
    
    // Calcular posição relativa (0 = próximo do header, 1 = próximo do input)
    const topPosition = rect.top - headerHeight;
    const availableHeight = viewportHeight - headerHeight - inputHeight;
    const relativePosition = Math.max(0, Math.min(1, topPosition / availableHeight));
    
    // Interpolar entre as cores
    // Quanto mais próximo do input (relativePosition próximo de 1), mais #584FF9 (azul)
    // Quanto mais próximo do header (relativePosition próximo de 0), mais #ae34e2 (roxo)
    const colorInput = '#584FF9'; // Cor quando próximo do input (embaixo) - azul
    const colorHeader = '#ae34e2'; // Cor quando próximo do header (em cima) - roxo
    
    // Interpolar: relativePosition = 0 (topo) → mais roxo, relativePosition = 1 (embaixo) → mais azul
    const interpolatedColor = interpolateColor(colorHeader, colorInput, relativePosition);
    
    content.style.background = interpolatedColor;
}

// Atualizar gradientes de todas as mensagens enviadas
function updateAllMessageGradients() {
    const sentMessages = document.querySelectorAll('.message.sent');
    sentMessages.forEach(msg => {
        updateMessageGradient(msg);
    });
}

// Fechar todos os menus e overlay
function closeAllMenus() {
    contextMenu.classList.remove('show');
    quickReactions.classList.remove('show');
    if (menusOverlay) {
        menusOverlay.classList.remove('show');
    }
    // Limpar transform e z-index das mensagens
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => {
        msg.style.transition = '';
        msg.style.transform = '';
        msg.style.position = '';
        msg.style.zIndex = '';
    });
}

// Mostrar ambos os menus juntos
function showBothMenus(rect, messageElement) {
    selectedMessage = messageElement;
    
    const padding = 10;
    const headerHeight = 60; // altura aproximada do header
    const reactionsWidth = (6 * 48) + (5 * 2) + 28; // 6 emojis + 5 gaps + padding total
    const reactionsHeight = 68; // altura aproximada (48px emoji + padding)
    
    // Obter altura real do menu de contexto
    contextMenu.classList.add('show');
    const menuHeight = contextMenu.offsetHeight;
    contextMenu.classList.remove('show');
    
    // Calcular onde as reações ficariam (em cima da mensagem)
    let reactionsY = rect.top - reactionsHeight - 10;
    
    // Calcular onde o menu ficaria (embaixo da mensagem)
    let menuY = rect.bottom + 10;
    
    // Verificar se as reações vão cortar no topo
    const reactionsWillCutTop = reactionsY < headerHeight + padding;
    
    // Verificar se o menu vai cortar embaixo
    const menuWillCutBottom = menuY + menuHeight > window.innerHeight - padding;
    
    // Calcular escala necessária para caber tudo SEM CORTAR
    let scale = 1;
    let moveY = 0;
    
    if (reactionsWillCutTop || menuWillCutBottom) {
        // Calcular espaço disponível
        const availableHeight = window.innerHeight - headerHeight - padding;
        const totalNeeded = reactionsHeight + 10 + rect.height + 10 + menuHeight;
        
        // Se não cabe, reduzir escala até caber tudo
        if (totalNeeded > availableHeight) {
            // Calcular escala para que tudo caiba
            scale = (availableHeight - reactionsHeight - 10 - menuHeight - 10) / rect.height;
            // Limitar escala mínima e máxima
            scale = Math.max(0.4, Math.min(1, scale));
        }
        
        // Após reduzir, verificar posições novamente
        const scaledMessageHeight = rect.height * scale;
        const newReactionsY = rect.top - (scaledMessageHeight - rect.height) / 2 - reactionsHeight - 10;
        const newMenuY = rect.bottom + (scaledMessageHeight - rect.height) / 2 + 10;
        
        // Se ainda corta, ajustar posição vertical
        if (newReactionsY < headerHeight + padding) {
            // Reações ainda cortam: mover mensagem para baixo
            const neededSpace = headerHeight + padding + reactionsHeight + 10;
            const messageTopAfterScale = rect.top - (scaledMessageHeight - rect.height) / 2;
            moveY = neededSpace - messageTopAfterScale + (scaledMessageHeight - rect.height) / 2;
        } else if (newMenuY + menuHeight > window.innerHeight - padding) {
            // Menu ainda corta: mover mensagem para cima
            const neededSpace = window.innerHeight - padding - menuHeight - 10;
            const messageBottomAfterScale = rect.bottom + (scaledMessageHeight - rect.height) / 2;
            moveY = neededSpace - messageBottomAfterScale - (scaledMessageHeight - rect.height) / 2;
        }
    }
    
    // Aplicar transform na mensagem
    messageElement.style.position = 'relative';
    messageElement.style.zIndex = '1002';
    messageElement.style.transition = 'transform 0.2s ease-out';
    messageElement.style.transformOrigin = 'center center';
    
    if (scale !== 1 || moveY !== 0) {
        messageElement.style.transform = `translateY(${moveY}px) scale(${scale})`;
    } else {
        messageElement.style.transition = '';
        messageElement.style.transform = '';
    }
    
    // Recalcular posições após transformar a mensagem
    const scaledHeight = rect.height * scale;
    const newMessageTop = rect.top + moveY - (scaledHeight - rect.height) / 2;
    const newMessageBottom = newMessageTop + scaledHeight;
    let newReactionsY = newMessageTop - reactionsHeight - 10;
    let newMenuY = newMessageBottom + 10;
    
    // Garantir que o menu NUNCA seja cortado
    if (newMenuY + menuHeight > window.innerHeight - padding) {
        // Menu vai cortar: ajustar posição do menu para cima
        newMenuY = window.innerHeight - padding - menuHeight;
        // Recalcular posição da mensagem baseado no menu
        const newMessageBottomFromMenu = newMenuY - 10;
        const newMessageTopFromMenu = newMessageBottomFromMenu - scaledHeight;
        // Ajustar moveY para que a mensagem fique na posição correta
        moveY = newMessageTopFromMenu - (rect.top - (scaledHeight - rect.height) / 2);
        // Recalcular reações baseado na nova posição da mensagem
        newReactionsY = newMessageTopFromMenu - reactionsHeight - 10;
    }
    
    // Garantir que as reações NUNCA sejam cortadas
    if (newReactionsY < headerHeight + padding) {
        // Reações vão cortar: ajustar posição das reações
        newReactionsY = headerHeight + padding;
        // Recalcular posição da mensagem baseado nas reações
        const newMessageTopFromReactions = newReactionsY + reactionsHeight + 10;
        // Ajustar moveY
        moveY = newMessageTopFromReactions - (rect.top - (scaledHeight - rect.height) / 2);
        // Recalcular menu baseado na nova posição da mensagem
        const newMessageBottomFromReactions = newMessageTopFromReactions + scaledHeight;
        newMenuY = newMessageBottomFromReactions + 10;
        
        // Se o menu ainda corta após ajustar reações, reduzir mais a mensagem
        if (newMenuY + menuHeight > window.innerHeight - padding) {
            const availableForMessage = window.innerHeight - padding - (headerHeight + padding) - reactionsHeight - 10 - menuHeight - 10;
            scale = availableForMessage / rect.height;
            scale = Math.max(0.3, Math.min(1, scale));
            // Recalcular tudo novamente
            const finalScaledHeight = rect.height * scale;
            const finalMessageTop = headerHeight + padding + reactionsHeight + 10;
            const finalMessageBottom = finalMessageTop + finalScaledHeight;
            newMenuY = finalMessageBottom + 10;
            moveY = finalMessageTop - (rect.top - (finalScaledHeight - rect.height) / 2);
        }
    }
    
    // Aplicar transform final
    messageElement.style.position = 'relative';
    messageElement.style.zIndex = '1002';
    messageElement.style.transition = 'transform 0.2s ease-out';
    messageElement.style.transformOrigin = 'center center';
    
    if (scale !== 1 || moveY !== 0) {
        messageElement.style.transform = `translateY(${moveY}px) scale(${scale})`;
    } else {
        messageElement.style.transition = '';
        messageElement.style.transform = '';
    }
    
    // Calcular posições horizontais (centralizadas)
    const messageCenterX = rect.left + (rect.width / 2);
    
    // Reações - posição horizontal
    let reactionsX = messageCenterX - (reactionsWidth / 2);
    if (reactionsX < padding) {
        reactionsX = padding;
    } else if (reactionsX + reactionsWidth > window.innerWidth - padding) {
        reactionsX = window.innerWidth - reactionsWidth - padding;
    }
    
    // Menu - posição horizontal
    const menuWidth = 200;
    let menuX = messageCenterX - (menuWidth / 2);
    if (menuX < padding) {
        menuX = padding;
    } else if (menuX + menuWidth > window.innerWidth - padding) {
        menuX = window.innerWidth - menuWidth - padding;
    }
    
    // Resetar animações removendo e adicionando a classe
    quickReactions.classList.remove('show');
    void quickReactions.offsetWidth; // Forçar reflow
    
    // Posicionar reações (SEMPRE em cima da mensagem)
    quickReactions.style.left = reactionsX + 'px';
    quickReactions.style.top = newReactionsY + 'px';
    quickReactions.classList.add('show');
    
    // Posicionar menu (SEMPRE embaixo da mensagem) - GARANTIR QUE NÃO CORTA
    contextMenu.style.left = menuX + 'px';
    contextMenu.style.top = Math.min(newMenuY, window.innerHeight - padding - menuHeight) + 'px';
    contextMenu.classList.add('show');
    
    // Mostrar overlay com blur
    if (menusOverlay) {
        menusOverlay.classList.add('show');
    }
    
    // Verificar tipo de mensagem e mostrar/esconder opções
    const copiarItem = document.getElementById('contextItemCopiar');
    const baixarItem = document.getElementById('contextItemBaixar');
    
    // Verificar se é mídia (foto, vídeo, áudio, localização, story, pack, post encaminhado)
    const isMedia = !!(
        messageElement.querySelector('.message-photo') ||
        messageElement.querySelector('.message-video') ||
        messageElement.querySelector('.message-video-pack') ||
        messageElement.querySelector('.story-encaminhado-recebido') ||
        messageElement.querySelector('.audio-recebido') ||
        messageElement.querySelector('.message-location') ||
        messageElement.querySelector('.post-encaminhado-recebido')
    );
    
    // Verificar se é texto - pegar o .message-content que NÃO está dentro de .message-reply
    const allMessageContents = messageElement.querySelectorAll('.message-content');
    let mainMessageContent = null;
    for (let content of allMessageContents) {
        if (!content.closest('.message-reply')) {
            mainMessageContent = content;
            break;
        }
    }
    const hasText = mainMessageContent && mainMessageContent.textContent.trim();
    const isText = hasText && !isMedia;
    
    // Mostrar/esconder opções baseado no tipo
    if (copiarItem) {
        copiarItem.style.display = isText ? 'flex' : 'none';
    }
    if (baixarItem) {
        baixarItem.style.display = isMedia ? 'flex' : 'none';
    }
    
    // Verificar se é mensagem enviada para mudar "Denunciar" para "Cancelar envio"
    const denunciarItem = document.getElementById('contextItemDenunciar');
    const denunciarIcon = document.getElementById('denunciarIcon');
    const denunciarText = document.getElementById('denunciarText');
    const isSent = messageElement.classList.contains('sent');
    
    if (denunciarItem && denunciarIcon && denunciarText) {
        if (isSent) {
            // Mensagem enviada: mostrar "Cancelar envio" com ícone de círculo vazado e seta para trás (igual responder)
            denunciarText.textContent = 'Cancelar envio';
            denunciarIcon.setAttribute('aria-label', 'Cancelar envio');
            denunciarIcon.innerHTML = '<title>Cancelar envio</title><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12.5 9.5H8.2l3.3-3.3M8.2 9.5l3.3 3.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M8.2 9.5h4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
        } else {
            // Mensagem recebida: manter "Denunciar"
            denunciarText.textContent = 'Denunciar';
            denunciarIcon.setAttribute('aria-label', 'Denunciar');
            denunciarIcon.innerHTML = '<title>Denunciar</title><path d="M18.001 1h-12a5.006 5.006 0 0 0-5 5v9.005a5.006 5.006 0 0 0 5 5h2.514l2.789 2.712a1 1 0 0 0 1.394 0l2.787-2.712h2.516a5.006 5.006 0 0 0 5-5V6a5.006 5.006 0 0 0-5-5Zm3 14.005a3.003 3.003 0 0 1-3 3h-2.936a1 1 0 0 0-.79.387l-2.274 2.212-2.276-2.212a1 1 0 0 0-.79-.387H6a3.003 3.003 0 0 1-3-3V6a3.003 3.003 0 0 1 3-3h12a3.003 3.003 0 0 1 3 3Zm-9-1.66a1.229 1.229 0 1 0 1.228 1.228A1.23 1.23 0 0 0 12 13.344Zm0-8.117a1.274 1.274 0 0 0-.933.396 1.108 1.108 0 0 0-.3.838l.347 4.861a.892.892 0 0 0 1.77 0l.348-4.86a1.106 1.106 0 0 0-.3-.838A1.272 1.272 0 0 0 12 5.228Z" fill="currentColor"/>';
        }
    }
}


// Mostrar menu de contexto
function showContextMenu(x, y, messageElement) {
    selectedMessage = messageElement;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('show');
    
    // Verificar tipo de mensagem
    const copiarItem = document.getElementById('contextItemCopiar');
    const baixarItem = document.getElementById('contextItemBaixar');
    
    // Verificar se é mídia (foto, vídeo, áudio, localização, story, pack, post encaminhado)
    const isMedia = !!(
        messageElement.querySelector('.message-photo') ||
        messageElement.querySelector('.message-video') ||
        messageElement.querySelector('.message-video-pack') ||
        messageElement.querySelector('.story-encaminhado-recebido') ||
        messageElement.querySelector('.audio-recebido') ||
        messageElement.querySelector('.message-location') ||
        messageElement.querySelector('.post-encaminhado-recebido')
    );
    
    // Verificar se é texto - pegar o .message-content que NÃO está dentro de .message-reply
    const allMessageContents = messageElement.querySelectorAll('.message-content');
    let mainMessageContent = null;
    for (let content of allMessageContents) {
        if (!content.closest('.message-reply')) {
            mainMessageContent = content;
            break;
        }
    }
    const hasText = mainMessageContent && mainMessageContent.textContent.trim();
    const isText = hasText && !isMedia;
    
    // Mostrar/esconder opções baseado no tipo
    if (copiarItem) {
        copiarItem.style.display = isText ? 'flex' : 'none';
    }
    if (baixarItem) {
        baixarItem.style.display = isMedia ? 'flex' : 'none';
    }
    
    // Verificar se é mensagem enviada para mudar "Denunciar" para "Cancelar envio"
    const denunciarItem = document.getElementById('contextItemDenunciar');
    const denunciarIcon = document.getElementById('denunciarIcon');
    const denunciarText = document.getElementById('denunciarText');
    const isSent = messageElement.classList.contains('sent');
    
    if (denunciarItem && denunciarIcon && denunciarText) {
        if (isSent) {
            // Mensagem enviada: mostrar "Cancelar envio" com ícone de círculo vazado e seta para trás (igual responder)
            denunciarText.textContent = 'Cancelar envio';
            denunciarIcon.setAttribute('aria-label', 'Cancelar envio');
            denunciarIcon.innerHTML = '<title>Cancelar envio</title><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12.5 9.5H8.2l3.3-3.3M8.2 9.5l3.3 3.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M8.2 9.5h4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
        } else {
            // Mensagem recebida: manter "Denunciar"
            denunciarText.textContent = 'Denunciar';
            denunciarIcon.setAttribute('aria-label', 'Denunciar');
            denunciarIcon.innerHTML = '<title>Denunciar</title><path d="M18.001 1h-12a5.006 5.006 0 0 0-5 5v9.005a5.006 5.006 0 0 0 5 5h2.514l2.789 2.712a1 1 0 0 0 1.394 0l2.787-2.712h2.516a5.006 5.006 0 0 0 5-5V6a5.006 5.006 0 0 0-5-5Zm3 14.005a3.003 3.003 0 0 1-3 3h-2.936a1 1 0 0 0-.79.387l-2.274 2.212-2.276-2.212a1 1 0 0 0-.79-.387H6a3.003 3.003 0 0 1-3-3V6a3.003 3.003 0 0 1 3-3h12a3.003 3.003 0 0 1 3 3Zm-9-1.66a1.229 1.229 0 1 0 1.228 1.228A1.23 1.23 0 0 0 12 13.344Zm0-8.117a1.274 1.274 0 0 0-.933.396 1.108 1.108 0 0 0-.3.838l.347 4.861a.892.892 0 0 0 1.77 0l.348-4.86a1.106 1.106 0 0 0-.3-.838A1.272 1.272 0 0 0 12 5.228Z" fill="currentColor"/>';
        }
    }
}

// Mostrar reações rápidas
function showQuickReactions(x, y, messageElement) {
    selectedMessage = messageElement;
    quickReactions.style.left = (x - 150) + 'px';
    quickReactions.style.top = (y - 60) + 'px';
    quickReactions.classList.add('show');
}

// Fechar menus ao clicar fora ou no overlay
document.addEventListener('click', function(e) {
    if (e.target === menusOverlay) {
        closeAllMenus();
    } else if (!contextMenu.contains(e.target) && !quickReactions.contains(e.target)) {
        closeAllMenus();
    }
});

// Ações do menu de contexto
const contextItems = document.querySelectorAll('.context-item');
contextItems.forEach(item => {
    item.addEventListener('click', function() {
        const action = this.textContent.trim();
        
        if (action.includes('Responder')) {
            showBlockedPopup(blockedMessages.reply);
        } else if (action.includes('Encaminhar')) {
            forwardMessage();
        } else if (action.includes('Copiar')) {
            copyMessage();
        } else if (action.includes('Baixar')) {
            downloadMessage();
        } else if (action.includes('Excluir pra você') || action.includes('Cancelar envio')) {
            showBlockedPopup(blockedMessages.cancel);
        } else if (action.includes('Denunciar')) {
            reportMessage();
        }
        
        closeAllMenus();
    });
});

// Adicionar reação
const reactionEmojis = document.querySelectorAll('.reaction-emoji');
reactionEmojis.forEach(emoji => {
    emoji.addEventListener('click', function() {
        if (selectedMessage) {
            addReaction(selectedMessage, this.textContent);
        }
        closeAllMenus();
    });
});

// Função para adicionar reação (nova lógica: aparece → espera → some → popup)
function addReaction(messageElement, emoji) {
    const bubble = messageElement.querySelector('.message-bubble');
    let reaction = bubble.querySelector('.message-reaction');
    
    // Se já existe, remover para criar nova
    if (reaction) {
        reaction.remove();
    }
    
    // Criar nova reação
        reaction = document.createElement('div');
        reaction.className = 'message-reaction';
        reaction.textContent = emoji;
        bubble.appendChild(reaction);
    
    // Fechar menu de reações
    closeAllMenus();
    
    // Após 1.5s, esconder a reação
    setTimeout(() => {
        if (reaction && reaction.parentNode) {
            reaction.classList.add('hidden');
        }
        
        // Após a reação sumir (0.3s de transição), mostrar popup
        setTimeout(() => {
            if (reaction && reaction.parentNode) {
                reaction.remove();
            }
            showBlockedPopup();
        }, 300);
    }, 1500);
}

// Copiar mensagem
function copyMessage() {
    if (selectedMessage) {
        const content = selectedMessage.querySelector('.message-content');
        if (content) {
            navigator.clipboard.writeText(content.textContent);
            showNotification('Mensagem copiada');
        }
    }
}

// Encaminhar mensagem
function forwardMessage() {
    if (selectedMessage) {
        showBlockedPopup();
    }
}

// Baixar mensagem
function downloadMessage() {
    if (selectedMessage) {
        // Criar link de download para o arquivo
        const link = document.createElement('a');
        link.href = '../../imagens/quereracessovip.png';
        link.download = 'quereracessovip.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Apagar mensagem
function deleteMessage() {
    if (selectedMessage) {
        showBlockedPopup();
    }
}

// Denunciar mensagem
function reportMessage() {
    if (selectedMessage) {
        showBlockedPopup();
    }
}

// Notificação
function showNotification(text) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #262626;
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    notification.textContent = text;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Chamada de voz
if (callBtn) {
callBtn.addEventListener('click', function() {
    addSystemMessage('fas fa-phone', 'Chamando...', true);
    
    setTimeout(() => {
        const lastMsg = chatMessages.lastElementChild;
        lastMsg.querySelector('span').textContent = 'Chamada de voz perdida';
        lastMsg.querySelector('i').className = 'fas fa-phone-slash';
    }, 3000);
});
}

// Chamada de vídeo
if (videoBtn) {
videoBtn.addEventListener('click', function() {
    addSystemMessage('fas fa-video', 'Chamando...', true);
    
    setTimeout(() => {
        const lastMsg = chatMessages.lastElementChild;
        lastMsg.querySelector('span').textContent = 'Chamada de vídeo perdida';
        lastMsg.querySelector('i').className = 'fas fa-video-slash';
    }, 3000);
});
}

// Adicionar mensagem do sistema
function addSystemMessage(icon, text, addTime = false) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-system';
    messageDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${text}</span>
        ${addTime ? `<span class="system-time">${time}</span>` : ''}
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Gravar áudio
if (voiceBtn) {
voiceBtn.addEventListener('click', function() {
    if (!isRecordingVoice) {
        // Iniciar gravação
        isRecordingVoice = true;
        this.style.color = '#ed4956';
        showNotification('Gravando áudio...');
        
        // Simular gravação
        setTimeout(() => {
            isRecordingVoice = false;
            voiceBtn.style.color = '#ffffff';
            sendAudioMessage();
        }, 3000);
    }
});
}

// Enviar áudio
function sendAudioMessage() {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const duration = Math.floor(Math.random() * 20) + 5;
    
    // Gerar barras de waveform com alturas suaves (evitando contrastes muito grandes)
    const chatId = getChatId();
    const audioCounterKey = `${chatId}_audio_sent_counter`;
    let audioCounter = parseInt(localStorage.getItem(audioCounterKey) || '0');
    audioCounter++;
    localStorage.setItem(audioCounterKey, audioCounter.toString());
    
    const audioKey = `${chatId}_audio_sent_${duration}_${audioCounter}`;
    let savedHeights = localStorage.getItem(audioKey);
    
    let heights = [];
    if (savedHeights) {
        heights = JSON.parse(savedHeights);
    } else {
        // Gerar alturas fixas (aleatórias mas sempre as mesmas para este áudio)
        let currentHeight = Math.floor(Math.random() * 21) + 15; // 15-36px
    const numBars = 30;
        
    for (let i = 0; i < numBars; i++) {
            const rand = Math.random();
            const variation = rand < 0.5 
                ? Math.floor(Math.random() * 17) - 8   // 50%: -8 a +8
                : rand < 0.8 
                    ? Math.floor(Math.random() * 31) - 15  // 30%: -15 a +15
                    : Math.floor(Math.random() * 41) - 20; // 20%: -20 a +20
            
            currentHeight = Math.max(12, Math.min(40, currentHeight + variation));
            heights.push(currentHeight);
        }
        localStorage.setItem(audioKey, JSON.stringify(heights));
    }
    
    let waveformBars = '';
    heights.forEach(height => {
        waveformBars += `<div class="audio-recebido-waveform-bar" style="height: ${height}px;"></div>`;
    });
    
    // APENAS áudio enviado - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent';
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="audio-recebido">
                <button class="audio-recebido-play-btn">
                    <i class="fas fa-play"></i>
                </button>
                <div class="audio-recebido-waveform">
                    ${waveformBars}
                </div>
                <span class="audio-recebido-duration">0:${duration.toString().padStart(2, '0')}</span>
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    
    // Aplicar bordas arredondadas após adicionar nova mensagem
    applyMessageRoundedCorners();
    
    // Configurar botões de transcrição (se houver áudios recebidos novos)
    setupTranscricaoButtons();
    
    // Adicionar funcionalidade de play no enviado (usa as mesmas classes do recebido)
    const playBtnSent = messageDivSent.querySelector('.audio-recebido-play-btn');
    playBtnSent.addEventListener('click', function() {
        const icon = this.querySelector('i');
        const bars = messageDivSent.querySelectorAll('.audio-recebido-waveform-bar');
        
        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    setTimeout(() => bar.style.backgroundColor = 'rgba(255, 255, 255, 0.6)', 100);
                }, index * 50);
            });
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    });
    
    addMessageListeners(messageDivSent);
    scrollToBottom();
}

// Menu de opções (foto, localização, post)
if (photoBtn) {
photoBtn.addEventListener('click', function() {
    const options = ['foto', 'localização', 'post'];
    const random = options[Math.floor(Math.random() * options.length)];
    
    if (random === 'foto') {
        const photos = [
            '../../imagens/fotoblur1.jpg',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400',
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400'
        ];
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        sendPhotoMessage(randomPhoto);
    } else if (random === 'localização') {
        sendLocationMessage();
    } else {
        sendForwardedPost();
    }
});
}

// Botão de sticker para enviar post ou localização
if (stickerBtn) {
stickerBtn.addEventListener('click', function() {
    const options = ['post', 'localização'];
    const random = options[Math.floor(Math.random() * options.length)];
    
    if (random === 'post') {
        sendForwardedPost();
    } else {
        sendLocationMessage();
    }
});
}

// Enviar nudes
function sendPhotoMessage(photoUrl) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // APENAS nudes enviado - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent';
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="message-photo">
                <img src="${photoUrl}" alt="Nudes">
                <div class="video-sensitive-overlay">
                    <div class="video-sensitive-content">
                        <div class="video-sensitive-icon">
                            <i class="fas fa-eye-slash"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    addMessageListeners(messageDivSent);
    
    // Atualizar gradiente (nudes não tem .message-content, então não precisa)
    
    scrollToBottom();
}

// Enviar localização
function sendLocationMessage() {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const locations = [
        { name: 'Avenida Paulista', address: 'São Paulo, SP', coords: '-46.6333,-23.5505' },
        { name: 'Cristo Redentor', address: 'Rio de Janeiro, RJ', coords: '-43.2105,-22.9519' },
        { name: 'Parque Ibirapuera', address: 'São Paulo, SP', coords: '-46.6575,-23.5873' },
        { name: 'Copacabana', address: 'Rio de Janeiro, RJ', coords: '-43.1729,-22.9711' },
    ];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // APENAS localização enviada - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent';
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="message-location">
                <div class="location-map">
                    <img src="../../imagens/fundomaps.png" alt="Mapa">
                    <div class="location-profile">
                        <img src="https://i.pravatar.cc/150?img=1" alt="Profile" class="location-profile-img">
                    </div>
                </div>
                <div class="location-info">
                    <div class="location-name">${randomLocation.name}</div>
                    <div class="location-address">${randomLocation.address}</div>
                </div>
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    addMessageListeners(messageDivSent);
    
    // Atualizar gradiente (localização não tem .message-content, então não precisa)
    
    scrollToBottom();
}

// Enviar post encaminhado
function sendForwardedPost() {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const posts = [
        { username: 'maria_photos', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400', caption: 'Pôr do sol incrível hoje! 🌅', avatar: 'https://i.pravatar.cc/150?img=5' },
        { username: 'joao_viagens', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', caption: 'Natureza perfeita! 🌲', avatar: 'https://i.pravatar.cc/150?img=6' },
        { username: 'ana_foodie', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', caption: 'Pizza deliciosa! 🍕', avatar: 'https://i.pravatar.cc/150?img=7' },
        { username: 'pedro_tech', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', caption: 'Codando muito hoje! 💻', avatar: 'https://i.pravatar.cc/150?img=8' },
    ];
    
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    
    // APENAS post enviado - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent';
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="post-encaminhado-enviado">
                <div class="post-encaminhado-header">
                    <img src="${randomPost.avatar}" alt="User" class="post-encaminhado-avatar">
                    <span class="post-encaminhado-username">${randomPost.username}</span>
                </div>
                <img src="${randomPost.image}" alt="Post" class="post-encaminhado-image">
                <div class="post-encaminhado-caption">
                    <span class="post-encaminhado-username-caption">${randomPost.username}</span>
                    <span class="post-encaminhado-text">${randomPost.caption}</span>
                </div>
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    addMessageListeners(messageDivSent);
    scrollToBottom();
}

// Curtir rápido
if (likeBtn) {
likeBtn.addEventListener('click', function() {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // APENAS curtida enviada - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent';
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="message-content" style="font-size: 48px; padding: 8px;">❤️</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    addMessageListeners(messageDivSent);
    
    // Atualizar gradiente (post não tem .message-content, então não precisa)
    
    scrollToBottom();
});
}

// Adicionar event listeners em mensagens existentes
document.querySelectorAll('.message').forEach(msg => {
    addMessageListeners(msg);
    // Atualizar gradiente das mensagens enviadas existentes
    if (msg.classList.contains('sent')) {
        updateMessageGradient(msg);
    }
});

// Play de áudio recebido (EXATAMENTE COMO O PRINT)
document.querySelectorAll('.audio-recebido-play-btn').forEach((btn, index) => {
    // Verificar se o áudio já foi ouvido (persistência)
    const audioContainer = btn.closest('.audio-recebido');
    const chatId = getChatId();
    const audioId = `${chatId}_audio-${index}-${audioContainer.querySelector('.audio-recebido-duration')?.textContent || '0:00'}`;
    
    if (localStorage.getItem(audioId) === 'listened') {
        btn.classList.add('listened');
    }
    
    // Salvar tempo original do áudio (NUNCA muda)
    const durationElement = audioContainer.querySelector('.audio-recebido-duration');
    const originalDurationText = durationElement.textContent;
    const originalSeconds = parseInt(originalDurationText.split(':')[1]);
    const totalDuration = originalSeconds * 1000;
    
    let animationFrameId = null;
    let isPlaying = false;
    let startTime = null;
    let elapsedBeforePause = 0;
    
    btn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        const waveformContainer = audioContainer.querySelector('.audio-recebido-waveform');
        const bars = waveformContainer.querySelectorAll('.audio-recebido-waveform-bar');
        
        const currentAudioId = audioId;
        
        if (icon.classList.contains('fa-play')) {
            if (isPlaying) return; // Já está tocando, ignorar
            
            // Pausar todos os outros áudios (simula clique no pause)
            document.querySelectorAll('.audio-recebido-play-btn').forEach(otherBtn => {
                if (otherBtn !== btn) {
                    const otherIcon = otherBtn.querySelector('i');
                    if (otherIcon && otherIcon.classList.contains('fa-pause')) {
                        otherBtn.click();
                    }
                }
            });
            
            // Mostrar popup VIP
            showAudioVIPPopup();
            
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            isPlaying = true;
            
            bars.forEach(bar => {
                bar.classList.remove('active');
                bar.classList.add('playing');
            });
            
            startTime = Date.now();
            
            const animate = () => {
                if (!isPlaying) {
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                    return;
                }
                
                const currentElapsed = Date.now() - startTime;
                const totalElapsed = elapsedBeforePause + currentElapsed;
                const progress = Math.min(totalElapsed / totalDuration, 1);
                const currentBar = Math.floor(progress * bars.length);
                
                const remainingSeconds = Math.max(0, originalSeconds - Math.floor(totalElapsed / 1000));
                durationElement.textContent = `0:${remainingSeconds.toString().padStart(2, '0')}`;
            
                bars.forEach((bar, barIndex) => {
                    if (barIndex <= currentBar) {
                    bar.classList.add('playing');
                        bar.classList.add('active');
                    } else {
                        bar.classList.add('playing');
                        bar.classList.remove('active');
                    }
                });
                
                if (progress < 1 && isPlaying) {
                    animationFrameId = requestAnimationFrame(animate);
                } else if (progress >= 1) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                    btn.classList.add('listened');
                    isPlaying = false;
                    localStorage.setItem(currentAudioId, 'listened');
                    
                bars.forEach(bar => {
                    bar.classList.remove('playing');
                    bar.classList.remove('active');
                });
                    durationElement.textContent = originalDurationText;
                    elapsedBeforePause = 0;
                    startTime = null;
                }
            };
            
            animationFrameId = requestAnimationFrame(animate);
            
        } else {
            if (!isPlaying) return; // Já está pausado, ignorar
            
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            isPlaying = false;
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            if (startTime) {
                const currentElapsed = Date.now() - startTime;
                elapsedBeforePause += currentElapsed;
                startTime = null;
            }
        }
    });
});

// Modal de conteúdo sensível - tela cheia
const videoFullscreenModal = document.getElementById('videoFullscreenModal');
const videoFullscreenBtn = document.getElementById('videoFullscreenBtn');
const videoFullscreenBack = document.getElementById('videoFullscreenBack');
const videoFullscreenContent = document.getElementById('videoFullscreenContent');
const videoFullscreenContentPurchase = document.getElementById('videoFullscreenContentPurchase');
const videoFullscreenFooter = document.querySelector('.video-fullscreen-footer');
let currentClickedVideo = null;
let hasTriedToView = false;

// Abrir modal ao clicar no vídeo com blur (imagem ou pack) ou no overlay
document.addEventListener('click', function(e) {
    // Detectar clique no overlay ou na imagem
    const overlay = e.target.closest('.video-sensitive-overlay') || e.target.closest('.pack-sensitive-overlay');
    const videoContainer = e.target.closest('.message-video') || e.target.closest('.message-video-pack');
    
    // Se clicou no overlay, pegar o container pai e a imagem específica
    let container = null;
    let blurredImg = null;
    
    if (overlay) {
        // Se clicou no overlay, pegar o pack-item ou message-video que contém esse overlay
        const packItem = overlay.closest('.pack-item');
        if (packItem) {
            // É um pack - pegar a imagem específica desse pack-item
            blurredImg = packItem.querySelector('.pack-blurred');
            container = packItem.closest('.message-video-pack');
        } else {
            // É uma imagem normal
            container = overlay.closest('.message-video');
            blurredImg = container ? container.querySelector('.video-blurred') : null;
        }
    } else if (videoContainer) {
        // Clicou diretamente na imagem ou container
        container = videoContainer;
        blurredImg = container.querySelector('.video-blurred') || container.querySelector('.pack-blurred');
    }
    
    if (container && blurredImg) {
        e.preventDefault();
        e.stopPropagation();
        currentClickedVideo = container;
        hasTriedToView = false;
        const videoImg = blurredImg;
        if (videoImg) {
            // Criar imagem de fundo com blur no modal
            const modalBg = videoFullscreenModal.querySelector('.video-fullscreen-bg');
            if (!modalBg) {
                const bgImg = document.createElement('img');
                bgImg.src = videoImg.src;
                bgImg.className = 'video-fullscreen-bg';
                videoFullscreenModal.insertBefore(bgImg, videoFullscreenModal.firstChild);
            } else {
                modalBg.src = videoImg.src;
                modalBg.classList.remove('revealing');
                modalBg.classList.remove('revealing-back');
                // Remover estilos inline para permitir CSS funcionar
                modalBg.style.filter = '';
                modalBg.style.transform = '';
            }
        }
        // Resetar estados
        if (videoFullscreenContent) {
            videoFullscreenContent.classList.remove('hidden');
        }
        if (videoFullscreenContentPurchase) {
            videoFullscreenContentPurchase.classList.remove('visible');
            videoFullscreenContentPurchase.style.display = 'none';
        }
        if (videoFullscreenBtn) {
            videoFullscreenBtn.textContent = 'Ver imagem';
        }
        if (videoFullscreenFooter) {
            videoFullscreenFooter.classList.remove('hidden');
        }
        if (videoFullscreenBack) {
            videoFullscreenBack.classList.remove('hidden');
        }
        videoFullscreenModal.classList.remove('revealing');
        videoFullscreenModal.classList.remove('revealing-back');
        videoFullscreenModal.classList.add('active');
    }
});

// Função para fechar o modal
function closeVideoFullscreenModal() {
    videoFullscreenModal.classList.remove('active');
    videoFullscreenModal.classList.remove('revealing');
    videoFullscreenModal.classList.remove('revealing-back');
    // NUNCA remover blur - imagem sempre deve permanecer censurada
    if (currentClickedVideo) {
        // Não fazer nada - manter blur e overlay (tanto video-blurred quanto pack-blurred)
    }
    currentClickedVideo = null;
    hasTriedToView = false;
}

// Fechar modal ao clicar no botão de voltar
if (videoFullscreenBack) {
    videoFullscreenBack.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeVideoFullscreenModal();
    });
}

// Clicar no botão "Ver imagem" / "Comprar"
if (videoFullscreenBtn) {
    videoFullscreenBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!hasTriedToView) {
            // Primeira vez: animação de revelação
            hasTriedToView = true;
            const modalBg = videoFullscreenModal.querySelector('.video-fullscreen-bg');
            
            // Esconder conteúdo inicial, footer e seta
            if (videoFullscreenContent) {
                videoFullscreenContent.classList.add('hidden');
            }
            if (videoFullscreenFooter) {
                videoFullscreenFooter.classList.add('hidden');
            }
            if (videoFullscreenBack) {
                videoFullscreenBack.classList.add('hidden');
            }
            
            // Animar revelação tipo "raspadinha" com efeito pixelado
            if (modalBg) {
                modalBg.classList.remove('revealing-back');
                modalBg.classList.add('revealing');
            }
            
            // Adicionar classe ao modal para animar overlay
            videoFullscreenModal.classList.add('revealing');
            
            // Após a revelação completa, "bloquear" a imagem novamente
            setTimeout(() => {
                if (modalBg) {
                    modalBg.classList.remove('revealing');
                    modalBg.classList.add('revealing-back');
                }
                
                // Adicionar classe ao modal para voltar overlay
                videoFullscreenModal.classList.remove('revealing');
                videoFullscreenModal.classList.add('revealing-back');
                
                // Mostrar conteúdo de compra após animação de bloqueio
                setTimeout(() => {
                    if (videoFullscreenContentPurchase) {
                        videoFullscreenContentPurchase.style.display = 'flex';
                        setTimeout(() => {
                            videoFullscreenContentPurchase.classList.add('visible');
                        }, 10);
                    }
                    if (videoFullscreenBtn) {
                        videoFullscreenBtn.textContent = 'Virar VIP';
                    }
                    // Mostrar footer e seta novamente
                    if (videoFullscreenFooter) {
                        videoFullscreenFooter.classList.remove('hidden');
                    }
                    if (videoFullscreenBack) {
                        videoFullscreenBack.classList.remove('hidden');
                    }
                    
                    // Remover classe revealing-back do modal
                    videoFullscreenModal.classList.remove('revealing-back');
                }, 500);
            }, 3000);
        } else {
            // Segunda vez: ação de compra (fechar modal por enquanto)
            closeVideoFullscreenModal();
        }
    });
}

// Fechar modal ao clicar fora
videoFullscreenModal.addEventListener('click', function(e) {
    if (e.target === videoFullscreenModal) {
        videoFullscreenModal.classList.remove('active');
    }
});

// ============= STORY FULLSCREEN MODAL =============
const storyFullscreenModal = document.getElementById('storyFullscreenModal');
const storyFullscreenImage = document.getElementById('storyFullscreenImage');

function openStoryFullscreen(storyImageSrc, sourceElement) {
    // Capturar posição e tamanho da imagem original no chat
    const sourceRect = sourceElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calcular escala necessária para preencher 100% da tela
    const scaleX = viewportWidth / sourceRect.width;
    const scaleY = viewportHeight / sourceRect.height;
    const finalScale = Math.max(scaleX, scaleY); // Usar Math.max para preencher toda a tela
    
    // Calcular posição inicial (centro da imagem original)
    const initialCenterX = sourceRect.left + sourceRect.width / 2;
    const initialCenterY = sourceRect.top + sourceRect.height / 2;
    
    // Calcular posição final (centro da tela)
    const finalCenterX = viewportWidth / 2;
    const finalCenterY = viewportHeight / 2;
    
    // Calcular deslocamento necessário (do centro inicial ao centro final)
    const translateX = finalCenterX - initialCenterX;
    const translateY = finalCenterY - initialCenterY;
    
    // Configurar estado inicial - posicionar imagem centralizada na tela com tamanho original
    storyFullscreenImage.src = storyImageSrc;
    storyFullscreenImage.style.width = sourceRect.width + 'px';
    storyFullscreenImage.style.height = sourceRect.height + 'px';
    storyFullscreenImage.style.top = (finalCenterY - sourceRect.height / 2) + 'px';
    storyFullscreenImage.style.left = (finalCenterX - sourceRect.width / 2) + 'px';
    storyFullscreenImage.style.transform = 'scale(1)';
    storyFullscreenImage.style.transformOrigin = 'center center';
    
    // Mostrar modal
    storyFullscreenModal.classList.add('active');
    
    // Forçar reflow para garantir que o estado inicial seja aplicado
    void storyFullscreenImage.offsetWidth;
    
    // Animar para o estado final - expandir até preencher 100% da tela
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            storyFullscreenImage.style.width = viewportWidth + 'px';
            storyFullscreenImage.style.height = viewportHeight + 'px';
            storyFullscreenImage.style.top = '0px';
            storyFullscreenImage.style.left = '0px';
            storyFullscreenImage.style.transform = 'scale(1)';
        });
    });
    
    // Após a animação completar (300ms) + 0.2s de pausa, fechar automaticamente
    setTimeout(() => {
        closeStoryFullscreen();
    }, 500); // 300ms animação + 200ms pausa = 500ms total
}

function closeStoryFullscreen() {
    storyFullscreenModal.classList.remove('active');
    // Resetar estilos após a transição
    setTimeout(() => {
        storyFullscreenImage.style.width = '';
        storyFullscreenImage.style.height = '';
        storyFullscreenImage.style.top = '';
        storyFullscreenImage.style.left = '';
        storyFullscreenImage.style.transform = '';
        storyFullscreenImage.src = '';
    }, 200);
    
    // Mostrar popup "Ação bloqueada"
    showBlockedPopup();
}

function showAudioVIPPopup() {
    const popup = document.getElementById('audio-vip-popup');
    if (popup) {
        // Remover classe show se já estiver visível para reiniciar animação
        popup.classList.remove('show');
        // Forçar reflow
        void popup.offsetWidth;
        // Adicionar classe show
        popup.classList.add('show');
        // Remover após 3 segundos
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
        }
}

// Mensagens padrão por contexto para popup bloqueado
const blockedMessages = {
    default: "Seja um membro VIP do In'Stalker para poder interagir nas conversas",
    input: "Seja um membro VIP do In'Stalker para enviar mídias e arquivos",
    location: "Seja um membro VIP do In'Stalker para visualizar localizações",
    call: "Seja um membro VIP do In'Stalker para fazer chamadas",
    profile: "Seja um membro VIP do In'Stalker para visualizar perfis",
    reply: "Seja um membro VIP do In'Stalker para responder mensagens",
    cancel: "Seja um membro VIP do In'Stalker para cancelar envios"
};

function showBlockedPopup(customMessage) {
    const popup = document.getElementById('blocked-popup');
    const overlay = document.getElementById('blocked-popup-overlay');
    
    const message = customMessage || blockedMessages.default;
    
    if (popup && overlay) {
        // Criar conteúdo do pop-up estilo iOS glassmorphism
        popup.innerHTML = `
            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 10px 0; letter-spacing: -0.1px; opacity: 0.95;">
                ⚠︎ Ação bloqueada
            </h3>
            <p style="font-size: 13px; opacity: 0.85; margin: 0 0 20px 0; line-height: 1.4; font-weight: 400;">
                ${message}
            </p>
            <button onclick="window.location.href='#'" style="background: rgba(255, 255, 255, 0.3); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 500; font-size: 13px; border: 1px solid rgba(255, 255, 255, 0.3); cursor: pointer; width: 100%; transition: all 0.2s; backdrop-filter: blur(10px);" onmouseover="this.style.background='rgba(255, 255, 255, 0.4)'; this.style.borderColor='rgba(255, 255, 255, 0.4)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'">
                Adquirir Acesso VIP
            </button>
        `;
        
        popup.classList.add('show');
        overlay.classList.add('show');
        
        // Fechar ao clicar no overlay
        overlay.onclick = function() {
            popup.classList.remove('show');
            overlay.classList.remove('show');
        };
        
        // Fechar após 5 segundos
        setTimeout(() => {
            popup.classList.remove('show');
            overlay.classList.remove('show');
        }, 5000);
    }
}

// Detectar clique no story encaminhado
document.addEventListener('click', function(e) {
    const storyContainer = e.target.closest('.story-encaminhado-recebido');
    if (storyContainer) {
        const storyImg = storyContainer.querySelector('.story-encaminhado-image');
        if (storyImg && storyImg.src) {
            e.preventDefault();
            e.stopPropagation();
            openStoryFullscreen(storyImg.src, storyImg);
        }
    }
});

// Fechar ao clicar fora da imagem
storyFullscreenModal.addEventListener('click', function(e) {
    if (e.target === storyFullscreenModal) {
        closeStoryFullscreen();
    }
});

// ============= CLIQUE NO CORAÇÃO =============
document.addEventListener('click', function(e) {
    // Verificar se clicou no ícone de coração
    const heartIcon = e.target.closest('svg[aria-label="Curtir"]');
    if (heartIcon) {
        e.preventDefault();
        e.stopPropagation();
        sendHeartMessage();
        return;
    }
});

// ============= REAÇÃO CLICK (REAÇÃO ANTIGA) =============
// Quando clica em uma reação que já existe na mensagem
document.addEventListener('click', function(e) {
    const reaction = e.target.closest('.message-reaction');
    if (reaction && !reaction.classList.contains('hidden')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Esconder a reação
        reaction.classList.add('hidden');
        
        // Ajustar espaçamento da mensagem (será ajustado automaticamente pelo CSS :has())
        const message = reaction.closest('.message');
        if (message) {
            // Forçar reflow para aplicar o novo margin-bottom
            void message.offsetHeight;
        }
        
        // Após 0.6s, mostrar a reação novamente com animação
        setTimeout(() => {
            reaction.classList.remove('hidden');
            reaction.classList.add('returning');
            
            // Remover classe de animação após a animação completar
            setTimeout(() => {
                reaction.classList.remove('returning');
            }, 300);
        }, 600);
        
        // Após 0.8s total (0.6s + 0.2s), mostrar popup
        setTimeout(() => {
            showBlockedPopup();
        }, 800);
    }
});


// Restaurar mensagens enviadas do localStorage ao carregar a página
function restoreSentMessages() {
    const chatId = getChatId();
    const storageKey = `${chatId}_sentMessages`;
    const sentMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const lastMessageId = sentMessages.length > 0 ? sentMessages[sentMessages.length - 1].id : null;
    
    sentMessages.forEach((msgData, index) => {
        // Verificar se a mensagem já existe no DOM
        const existingMessage = document.querySelector(`[data-message-id="${msgData.id}"]`);
        if (existingMessage) return;
        
        const messageDivSent = document.createElement('div');
        messageDivSent.className = msgData.isHeart ? 'message sent message-heart' : 'message sent new-message';
        messageDivSent.setAttribute('data-message-id', msgData.id);
        
        if (msgData.isHeart) {
            // Mensagem de coração
            messageDivSent.innerHTML = `
                <div class="message-bubble">
                    <div class="message-content-heart">❤️</div>
                    <div class="message-time">${msgData.time}</div>
                </div>
            `;
        } else {
            // Mensagem de texto normal
            const processedText = applyBlurToText(escapeHtml(msgData.text));
            messageDivSent.innerHTML = `
                <div class="message-bubble">
                    <div class="message-content">${processedText}</div>
                    <div class="message-time">${msgData.time}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDivSent);
        addMessageListeners(messageDivSent);
        
        // Aplicar bordas arredondadas após restaurar mensagens
        applyMessageRoundedCorners();
        
        // Atualizar gradiente da mensagem restaurada
        setTimeout(() => {
            updateMessageGradient(messageDivSent);
        }, 50);
        
        // Adicionar erro VIP apenas na última mensagem
        if (msgData.id === lastMessageId) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message-vip-error';
            errorDiv.innerHTML = '<span>Mensagem não enviada. <span class="saiba-mais">Saiba mais</span></span>';
            
            // Adicionar event listener para "Saiba mais"
            const saibaMais = errorDiv.querySelector('.saiba-mais');
            if (saibaMais) {
                saibaMais.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showBlockedPopup();
                });
            }
            messageDivSent.insertAdjacentElement('afterend', errorDiv);
        }
    });
    
    if (sentMessages.length > 0) {
        scrollToBottom();
        // Atualizar gradientes após restaurar todas as mensagens
        setTimeout(() => {
            updateAllMessageGradients();
        }, 200);
    }
}

// Atualizar gradientes ao fazer scroll (sem debounce para atualização em tempo real)
chatMessages.addEventListener('scroll', function() {
    updateAllMessageGradients();
});

// Atualizar gradientes ao redimensionar a janela
window.addEventListener('resize', function() {
    updateAllMessageGradients();
});

// Atualizar gradientes iniciais ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            updateAllMessageGradients();
        }, 300);
    });
} else {
    setTimeout(() => {
        updateAllMessageGradients();
    }, 300);
}

// Event listeners para ações bloqueadas (usando event delegation)
document.addEventListener('click', function(e) {
    // Verificar primeiro se é o coração (para não bloquear)
    const heartIcon = e.target.closest('svg[aria-label="Curtir"]');
    if (heartIcon && heartIcon.closest('.input-action-icon')) {
        return; // Deixar o event listener do coração tratar
    }
    
    // Ícones do input (exceto coração e enviar)
    const inputIcon = e.target.closest('.input-action-icon:not(.input-send-icon)');
    if (inputIcon) {
        e.preventDefault();
        e.stopPropagation();
        showBlockedPopup(blockedMessages.input);
        return;
    }
    
    // Botões de chamada no header
    if (e.target.closest('.header-icon-btn')) {
        e.preventDefault();
        e.stopPropagation();
        showBlockedPopup(blockedMessages.call);
        return;
    }
    
    // Foto de perfil no header
    if (e.target.closest('.chat-avatar-btn')) {
        e.preventDefault();
        e.stopPropagation();
        showBlockedPopup(blockedMessages.profile);
        return;
    }
    
    // Ícone da câmera no input
    if (e.target.closest('#cameraIcon')) {
        e.preventDefault();
        e.stopPropagation();
        showBlockedPopup(blockedMessages.input);
        return;
    }
    
    // Botões de localização e chamada
    const systemBtn = e.target.closest('.message-system-btn');
    if (systemBtn) {
        e.preventDefault();
        e.stopPropagation();
        // Verificar se é "Ligar de volta" (chamada) ou "Ver" (localização)
        const btnText = systemBtn.textContent.trim();
        if (btnText.includes('Ligar de volta')) {
            showBlockedPopup(blockedMessages.call);
        } else {
            // É o botão "Ver" de localização
            showBlockedPopup(blockedMessages.location);
        }
        return;
    }
});

// Gerar alturas fixas para áudios estáticos do HTML
function randomizeAudioBars() {
    const numBars = 30; // Sempre 30 barras
    
    document.querySelectorAll('.audio-recebido').forEach(audioContainer => {
        const waveform = audioContainer.querySelector('.audio-recebido-waveform');
        if (!waveform) return;
        
        const chatId = getChatId();
        const duration = audioContainer.querySelector('.audio-recebido-duration')?.textContent || '0:00';
        const audioKey = `${chatId}_audio_fixed_${duration}`;
        
        // Verificar se já existem barras
        let bars = waveform.querySelectorAll('.audio-recebido-waveform-bar');
        
        // Se não existem barras ou quantidade diferente, gerar novas
        if (bars.length !== numBars) {
            // Limpar barras existentes
            waveform.innerHTML = '';
            
            // Gerar ou recuperar alturas do localStorage
            let heights = JSON.parse(localStorage.getItem(audioKey) || 'null');
            
            // Se não existem alturas ou quantidade diferente de 30, gerar novas
            if (!heights || heights.length !== numBars) {
                let currentHeight = Math.floor(Math.random() * 21) + 15;
                heights = [];
                
                for (let i = 0; i < numBars; i++) {
                    const rand = Math.random();
                    const variation = rand < 0.5 
                        ? Math.floor(Math.random() * 17) - 8
                        : rand < 0.8 
                            ? Math.floor(Math.random() * 31) - 15
                            : Math.floor(Math.random() * 41) - 20;
                    
                    currentHeight = Math.max(12, Math.min(40, currentHeight + variation));
                    heights.push(currentHeight);
                }
                
                localStorage.setItem(audioKey, JSON.stringify(heights));
            }
            
            // Garantir que temos exatamente 30 barras (limitar se houver mais)
            if (heights.length > numBars) {
                heights = heights.slice(0, numBars);
                localStorage.setItem(audioKey, JSON.stringify(heights));
            }
            
            // Criar barras dinamicamente (exatamente 30)
            for (let i = 0; i < numBars; i++) {
                const bar = document.createElement('div');
                bar.className = 'audio-recebido-waveform-bar';
                bar.style.height = `${heights[i]}px`;
                waveform.appendChild(bar);
            }
        } else {
            // Se já existem barras, verificar se são exatamente 30
            if (bars.length !== numBars) {
                // Se quantidade diferente, limpar e regenerar
                waveform.innerHTML = '';
                bars = [];
            }
            
            // Se não há barras ou quantidade diferente, gerar novas
            if (bars.length === 0) {
                let heights = JSON.parse(localStorage.getItem(audioKey) || 'null');
                
                // Se não existem alturas ou quantidade diferente de 30, gerar novas
                if (!heights || heights.length !== numBars) {
                    let currentHeight = Math.floor(Math.random() * 21) + 15;
                    heights = [];
                    
                    for (let i = 0; i < numBars; i++) {
                        const rand = Math.random();
                        const variation = rand < 0.5 
                            ? Math.floor(Math.random() * 17) - 8
                            : rand < 0.8 
                                ? Math.floor(Math.random() * 31) - 15
                                : Math.floor(Math.random() * 41) - 20;
                        
                        currentHeight = Math.max(12, Math.min(40, currentHeight + variation));
                        heights.push(currentHeight);
                    }
                    
                    localStorage.setItem(audioKey, JSON.stringify(heights));
                }
                
                // Garantir que temos exatamente 30 alturas
                if (heights.length > numBars) {
                    heights = heights.slice(0, numBars);
                    localStorage.setItem(audioKey, JSON.stringify(heights));
                }
                
                // Criar barras dinamicamente (exatamente 30)
                for (let i = 0; i < numBars; i++) {
                    const bar = document.createElement('div');
                    bar.className = 'audio-recebido-waveform-bar';
                    bar.style.height = `${heights[i]}px`;
                    waveform.appendChild(bar);
                }
            } else {
                // Se já existem exatamente 30 barras, apenas aplicar alturas do localStorage
                let heights = JSON.parse(localStorage.getItem(audioKey) || 'null');
                
                if (!heights || heights.length !== numBars) {
                    let currentHeight = Math.floor(Math.random() * 21) + 15;
                    heights = [];
                    
                    for (let i = 0; i < numBars; i++) {
                        const rand = Math.random();
                        const variation = rand < 0.5 
                            ? Math.floor(Math.random() * 17) - 8
                            : rand < 0.8 
                                ? Math.floor(Math.random() * 31) - 15
                                : Math.floor(Math.random() * 41) - 20;
                        
                        currentHeight = Math.max(12, Math.min(40, currentHeight + variation));
                        heights.push(currentHeight);
                    }
                    
                    localStorage.setItem(audioKey, JSON.stringify(heights));
                }
                
                // Garantir que temos exatamente 30 alturas
                if (heights.length > numBars) {
                    heights = heights.slice(0, numBars);
                    localStorage.setItem(audioKey, JSON.stringify(heights));
                }
                
                bars.forEach((bar, index) => {
                    if (index < numBars) {
                        bar.style.height = `${heights[index]}px`;
                    }
                });
            }
        }
    });
}

// ============================================================================
// FUNÇÕES DE LOCALIZAÇÃO (API) - Mesmas do feed.html
// ============================================================================

function normalizeRegion(region) {
    if (!region) return '';
    
    const regionMap = {
        'paraná': 'PR', 'parana': 'PR',
        'são paulo': 'SP', 'sao paulo': 'SP',
        'rio de janeiro': 'RJ',
        'minas gerais': 'MG',
        'rio grande do sul': 'RS',
        'santa catarina': 'SC',
        'bahia': 'BA',
        'goiás': 'GO', 'goias': 'GO',
        'pernambuco': 'PE',
        'ceará': 'CE', 'ceara': 'CE',
        'distrito federal': 'DF',
        'espírito santo': 'ES', 'espirito santo': 'ES',
        'mato grosso': 'MT',
        'mato grosso do sul': 'MS',
        'pará': 'PA', 'para': 'PA',
        'amazonas': 'AM'
    };
    
    const regionLower = region.toLowerCase().trim();
    
    // Se já é sigla (2 letras), retornar como está
    if (region.length === 2 && region.match(/^[A-Z]{2}$/i)) {
        return region.toUpperCase();
    }
    
    // Tentar encontrar no mapa
    for (const [key, sigla] of Object.entries(regionMap)) {
        if (regionLower.includes(key) || key.includes(regionLower)) {
            return sigla;
        }
    }
    
    return region;
}

// Função para obter localização do usuário via IP
async function getUserLocation() {
    // Verificar cache primeiro
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
        try {
            const location = JSON.parse(cachedLocation);
            if (location && location.city) {
                console.log('✅ Localização do cache:', location.city);
                return location;
            }
        } catch (e) {
            console.warn('⚠️ Erro ao ler cache de localização');
        }
    }
    
    // Tentar múltiplas APIs para garantir que pegamos a localização
    const apis = [
        {
            url: 'https://ip-api.com/json/?fields=status,message,city,regionName,region,country,lat,lon',
            parser: (data) => {
                if (data.status === 'success' && data.city) {
                    let region = data.region || data.regionName || '';
                    region = normalizeRegion(region);
                    
                    return {
                        city: data.city,
                        region: region,
                        country: data.country || 'Brasil',
                        lat: data.lat,
                        lon: data.lon
                    };
                }
                return null;
            }
        },
        {
            url: 'https://ipapi.co/json/',
            parser: (data) => {
                if (data.city && !data.error) {
                    let region = data.region || data.region_code || '';
                    region = normalizeRegion(region);
                    
                    return {
                        city: data.city,
                        region: region,
                        country: data.country_name || 'Brasil',
                        lat: data.latitude,
                        lon: data.longitude
                    };
                }
                return null;
            }
        },
        {
            url: 'https://geolocation-db.com/json/',
            parser: (data) => {
                if (data.city) {
                    let region = data.state || '';
                    region = normalizeRegion(region);
                    
                    return {
                        city: data.city,
                        region: region,
                        country: data.country_name || 'Brasil',
                        lat: data.latitude,
                        lon: data.longitude
                    };
                }
                return null;
            }
        }
    ];
    
    for (const api of apis) {
        try {
            const response = await fetch(api.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                continue;
            }
            
            const data = await response.json();
            const location = api.parser(data);
            
            if (location && location.city) {
                console.log('✅ Localização obtida:', location.city);
                // Salvar no localStorage
                localStorage.setItem('userLocation', JSON.stringify(location));
                return location;
            }
        } catch (error) {
            console.error('❌ Erro ao obter localização de', api.url, ':', error.message);
            continue;
        }
    }
    
    console.error('❌ Não foi possível obter localização de nenhuma API');
    return null;
}

// Função para obter cidades próximas
async function getNearbyCities(lat, lon, userCity) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        const data = await response.json();
        
        if (data && data.address) {
            const currentCity = data.address.city || data.address.town || data.address.village || userCity;
            
            const nearbyUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentCity)}&limit=10&addressdetails=1`;
            const nearbyResponse = await fetch(nearbyUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
            const nearbyData = await nearbyResponse.json();
            
            if (nearbyData && nearbyData.length > 0) {
                const cities = new Set();
                cities.add(userCity);
                
                nearbyData.forEach(item => {
                    if (item.address) {
                        const city = item.address.city || item.address.town || item.address.village;
                        if (city && city.toLowerCase() !== userCity.toLowerCase()) {
                            cities.add(city);
                        }
                    }
                });
                
                const citiesArray = Array.from(cities).slice(0, 5);
                return citiesArray.length > 0 ? citiesArray[0] : userCity;
            }
        }
    } catch (error) {
        console.error('❌ Erro ao buscar cidades próximas:', error);
    }
    
    return userCity;
}

// Função para obter dia da semana de ontem (abreviado)
function getPreviousWeekday() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const dayIndex = yesterday.getDay();
    
    return weekdays[dayIndex] || 'depois';
}

// Função para obter dia da semana de ontem (por extenso)
function getPreviousWeekdayFull() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const dayIndex = yesterday.getDay();
    
    return weekdays[dayIndex] || 'depois';
}

// Função para aplicar bordas arredondadas dinâmicas baseadas em grupos de mensagens
function applyMessageRoundedCorners() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.log('⚠️ [BORDAS] chatMessages não encontrado');
        return;
    }
    
    // Primeiro, remover todas as classes de bordas arredondadas existentes
    document.querySelectorAll('.message-content').forEach(content => {
        content.classList.remove('rounded-all', 'rounded-bottom', 'rounded-top', 'rounded-middle');
    });
    
    // Percorrer todos os filhos do chatMessages para detectar grupos consecutivos
    const allChildren = Array.from(chatMessages.children);
    let currentGroup = [];
    let currentType = null;
    
    console.log('🔍 [BORDAS] Processando', allChildren.length, 'elementos');
    
    allChildren.forEach((element, index) => {
        // Verificar se é uma mensagem de texto (sent ou received)
        const isTextMessage = element.classList.contains('message') && 
                             (element.classList.contains('sent') || element.classList.contains('received'));
        
        if (!isTextMessage) {
            // Se não é mensagem de texto, finalizar grupo atual e começar novo
            if (currentGroup.length > 0) {
                console.log('📦 [BORDAS] Finalizando grupo de', currentGroup.length, 'mensagens (tipo:', currentType + ')');
                applyRoundedCornersToGroup(currentGroup);
                currentGroup = [];
                currentType = null;
            }
            return; // Pular este elemento
        }
        
        // Verificar se tem message-content (não é heart, photo, etc)
        const hasContent = element.querySelector('.message-content:not(.message-content-heart)');
        if (!hasContent) {
            // Se não tem conteúdo de texto, finalizar grupo atual
            if (currentGroup.length > 0) {
                console.log('📦 [BORDAS] Finalizando grupo de', currentGroup.length, 'mensagens (sem conteúdo)');
                applyRoundedCornersToGroup(currentGroup);
                currentGroup = [];
                currentType = null;
            }
            return;
        }
        
        // Determinar tipo da mensagem
        const isSent = element.classList.contains('sent');
        const isReceived = element.classList.contains('received');
        const msgType = isSent ? 'sent' : (isReceived ? 'received' : null);
        
        // Se mudou o tipo, finalizar grupo anterior e iniciar novo
        if (msgType !== currentType && currentType !== null) {
            if (currentGroup.length > 0) {
                console.log('📦 [BORDAS] Finalizando grupo de', currentGroup.length, 'mensagens (mudou tipo)');
                applyRoundedCornersToGroup(currentGroup);
            }
            currentGroup = [element];
            currentType = msgType;
            console.log('🆕 [BORDAS] Novo grupo iniciado (tipo:', msgType + ')');
        } else {
            // Continuar o grupo atual ou iniciar primeiro grupo
            if (currentType === null) {
                currentGroup = [element];
                currentType = msgType;
                console.log('🆕 [BORDAS] Primeiro grupo iniciado (tipo:', msgType + ')');
            } else {
                currentGroup.push(element);
                console.log('➕ [BORDAS] Adicionando mensagem ao grupo (total:', currentGroup.length + ')');
            }
        }
    });
    
    // Aplicar classes ao último grupo
    if (currentGroup.length > 0) {
        console.log('📦 [BORDAS] Finalizando último grupo de', currentGroup.length, 'mensagens');
        applyRoundedCornersToGroup(currentGroup);
    }
    
    console.log('✅ [BORDAS] Processamento concluído');
}

// Função para aplicar bordas arredondadas a um grupo de mensagens
function applyRoundedCornersToGroup(group) {
    if (group.length === 0) return;
    
    console.log('🎨 [BORDAS] Aplicando classes a grupo de', group.length, 'mensagens');
    
    group.forEach((msg, index) => {
        const content = msg.querySelector('.message-content:not(.message-content-heart)');
        if (!content) {
            console.log('⚠️ [BORDAS] Mensagem sem conteúdo encontrada');
            return;
        }
        
        // Remover classes anteriores
        content.classList.remove('rounded-all', 'rounded-bottom', 'rounded-top', 'rounded-middle');
        
        if (group.length === 1) {
            // Mensagem sozinha - todos os cantos arredondados
            content.classList.add('rounded-all');
            console.log('  ✓ Mensagem', index + 1, ': rounded-all');
        } else if (group.length === 2) {
            // 2 mensagens - primeira com canto menor embaixo, segunda com canto menor em cima
            if (index === 0) {
                content.classList.add('rounded-bottom');
                console.log('  ✓ Mensagem', index + 1, ': rounded-bottom');
            } else {
                content.classList.add('rounded-top');
                console.log('  ✓ Mensagem', index + 1, ': rounded-top');
            }
        } else {
            // 3+ mensagens - primeira com canto menor embaixo, última com canto menor em cima, meio com ambos
            if (index === 0) {
                // Primeira mensagem
                content.classList.add('rounded-bottom');
                console.log('  ✓ Mensagem', index + 1, '(primeira): rounded-bottom');
            } else if (index === group.length - 1) {
                // Última mensagem
                content.classList.add('rounded-top');
                console.log('  ✓ Mensagem', index + 1, '(última): rounded-top');
            } else {
                // Mensagens do meio
                content.classList.add('rounded-middle');
                console.log('  ✓ Mensagem', index + 1, '(meio): rounded-middle');
            }
        }
    });
}

// Função para calcular e formatar datas das mensagens
function calculateMessageDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    document.querySelectorAll('.message-date').forEach(dateElement => {
        const text = dateElement.textContent.trim();
        
        // Se contém "dias atrás", calcular dinamicamente
        const diasAtrasMatch = text.match(/(\d+)\s*dias?\s*atrás/i);
        if (diasAtrasMatch) {
            const diasAtras = parseInt(diasAtrasMatch[1]);
            const messageDate = new Date(today);
            messageDate.setDate(today.getDate() - diasAtras);
            
            // Extrair horário se existir
            const horaMatch = text.match(/(\d{1,2}):(\d{2})/);
            const hora = horaMatch ? `${horaMatch[1]}:${horaMatch[2]}` : '';
            
            // Calcular diferença real de dias
            const diffTime = today - messageDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let formattedDate = '';
            if (diffDays === 0) {
                formattedDate = hora || '';
            } else if (diffDays === 1) {
                formattedDate = hora ? `ONTEM, ${hora}` : 'ONTEM';
            } else if (diffDays < 7) {
                const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
                const dayIndex = messageDate.getDay();
                formattedDate = hora ? `${weekdays[dayIndex]}, ${hora}` : weekdays[dayIndex];
            } else if (diffDays < 30) {
                const day = messageDate.getDate();
                const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
                const month = months[messageDate.getMonth()];
                formattedDate = hora ? `${day} DE ${month}, ${hora}` : `${day} DE ${month}`;
            } else {
                formattedDate = hora ? `${diffDays} dias atrás, ${hora}` : `${diffDays} dias atrás`;
            }
            
            dateElement.textContent = formattedDate;
        }
        // Se é "ONTEM", calcular se realmente foi ontem
        else if (text === 'ONTEM' || text.startsWith('ONTEM,')) {
            const horaMatch = text.match(/(\d{1,2}):(\d{2})/);
            const hora = horaMatch ? `${horaMatch[1]}:${horaMatch[2]}` : '';
            
            // Verificar se realmente foi ontem (pode ser que o HTML tenha "ONTEM" mas já passou mais tempo)
            // Por enquanto, manter "ONTEM" se estiver no HTML
            if (hora) {
                dateElement.textContent = `ONTEM, ${hora}`;
            } else {
                dateElement.textContent = 'ONTEM';
            }
        }
    });
}

// Função para substituir placeholders de localização nas mensagens
async function replaceLocationPlaceholders() {
    // Verificar se já temos valores salvos no localStorage
    let cityToUse = localStorage.getItem('placeholder_city') || null;
    let ipCity = localStorage.getItem('placeholder_ip_city') || null;
    let yesterdayWeekdayFull = localStorage.getItem('placeholder_weekday_full') || null;
    let yesterdayWeekday = localStorage.getItem('placeholder_weekday') || null;
    
    // Se não tiver salvos, calcular e salvar
    if (!cityToUse || !ipCity) {
        const location = await getUserLocation();
        
        // Cidade do IP (para "aqui.")
        if (!ipCity) {
            ipCity = location && location.city ? location.city : 'aqui';
            localStorage.setItem('placeholder_ip_city', ipCity);
        }
        
        // Cidade vizinha (para "casa.")
        if (!cityToUse) {
            cityToUse = 'casa'; // Fallback final: "casa"
            
            if (location && location.city) {
                // Tentar obter cidade vizinha
                if (location.lat && location.lon) {
                    const nearbyCity = await getNearbyCities(location.lat, location.lon, location.city);
                    if (nearbyCity && nearbyCity !== location.city) {
                        cityToUse = nearbyCity;
                    } else {
                        // Fallback 1: usar a cidade do IP
                        cityToUse = location.city;
                    }
                } else {
                    // Fallback 1: usar a cidade do IP
                    cityToUse = location.city;
                }
            }
            
            // Salvar no localStorage
            localStorage.setItem('placeholder_city', cityToUse);
        }
    }
    
    // Se não tiver salvos, calcular e salvar
    if (!yesterdayWeekdayFull || !yesterdayWeekday) {
        yesterdayWeekdayFull = 'depois'; // Fallback fixo
        yesterdayWeekday = 'depois'; // Fallback fixo
        
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            
            const weekdaysFull = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
            const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
            const yesterdayDayIndex = yesterday.getDay();
            
            if (yesterdayDayIndex >= 0 && yesterdayDayIndex < 7) {
                yesterdayWeekdayFull = weekdaysFull[yesterdayDayIndex] || 'depois';
                yesterdayWeekday = weekdays[yesterdayDayIndex] || 'depois';
            }
        } catch (error) {
            // Se houver erro no cálculo, mantém "depois" como fallback
            console.error('Erro ao calcular dia da semana:', error);
        }
        
        // Salvar no localStorage
        localStorage.setItem('placeholder_weekday_full', yesterdayWeekdayFull);
        localStorage.setItem('placeholder_weekday', yesterdayWeekday);
    }
    
    // Sempre substituir os placeholders (nunca deixar aparecer)
    // Substituir tanto em .message-content quanto em .message-content-line (caso já tenha sido dividido)
    const allElements = document.querySelectorAll('.message-content, .message-content-line');
    allElements.forEach(element => {
        const text = element.textContent || element.innerText || '';
        const html = element.innerHTML || '';
        
        if (text.includes('casa.')) {
            element.innerHTML = html.replace(/casa\./g, cityToUse);
        }
        if (text.includes('aqui.')) {
            element.innerHTML = html.replace(/aqui\./g, ipCity);
        }
        if (text.includes('depois de amanhã')) {
            // Se o texto contém "amanhã ou", usar dia por extenso (dia de ontem)
            if (text.includes('amanhã ou')) {
                element.innerHTML = html.replace(/depois de amanhã/g, yesterdayWeekdayFull);
            } else {
                // Caso contrário, usar abreviação
                element.innerHTML = html.replace(/depois de amanhã/g, yesterdayWeekday);
            }
        }
    });
}

// Função para dividir texto em divs por linha (facilita cálculo de largura no CSS)
function wrapTextLinesInDivs() {
    document.querySelectorAll('.message-content:not([data-lines-wrapped="true"])').forEach(element => {
        // Ignorar se já tem divs de linha
        if (element.querySelector('.message-content-line')) {
            element.dataset.linesWrapped = 'true';
            return;
        }
        
        // Preservar HTML original completo
        const originalHTML = element.innerHTML;
        const text = element.textContent.trim();
        
        if (!text) {
            element.dataset.linesWrapped = 'true';
            return;
        }
        
        // Verificar se realmente quebrou linha usando Range API
        const range = document.createRange();
        range.selectNodeContents(element);
        const rects = range.getClientRects();
        
        // Se tem apenas 1 retângulo, não quebrou linha - não dividir
        if (rects.length <= 1) {
            element.dataset.linesWrapped = 'true';
            return;
        }
        
        // Verificar altura vs line-height para confirmar quebra real
        const computedStyle = window.getComputedStyle(element);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
        const elementHeight = element.offsetHeight;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const contentHeight = elementHeight - paddingTop - paddingBottom;
        
        // Se altura é menor que 1.5x line-height, provavelmente não quebrou
        if (contentHeight < lineHeight * 1.5) {
            element.dataset.linesWrapped = 'true';
            return;
        }
        
        // Usar Range API para obter linhas reais preservando HTML completo
        const availableWidth = element.offsetWidth - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight));
        
        // Criar elemento temporário com mesmo estilo para medir
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = computedStyle.cssText;
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.width = availableWidth + 'px';
        tempDiv.style.whiteSpace = 'normal';
        document.body.appendChild(tempDiv);
        
        // Dividir preservando HTML original completo (emojis, spans, etc)
        // Trabalhar diretamente com HTML original
        const clone = element.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.width = availableWidth + 'px';
        document.body.appendChild(clone);
        
        // Dividir por palavras preservando HTML
        const words = text.split(/\s+/);
        const finalLines = [];
        let currentLine = '';
        let currentLineHTML = '';
        
        words.forEach((word, index) => {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            // Medir usando texto puro
            tempDiv.textContent = testLine;
            
            if (tempDiv.offsetHeight > lineHeight * 1.1 && currentLine) {
                // Quebrou linha - reconstruir HTML da linha preservando estrutura original
                let lineHTML = currentLine;
                
                // Preservar HTML original (emojis, spans) baseado no texto
                if (originalHTML === text) {
                    // HTML é igual ao texto (sem spans), preservar emojis
                    lineHTML = currentLine;
                } else {
                    // Tem HTML adicional (spans), tentar preservar
                    // Extrair parte do HTML original correspondente à linha
                    const lineStart = text.indexOf(currentLine.trim());
                    if (lineStart !== -1) {
                        // Usar substring do HTML preservando estrutura
                        // Método simples: preservar spans de blur
                        const blurSpans = element.querySelectorAll('.blur-word');
                        blurSpans.forEach(span => {
                            const blurText = span.textContent;
                            if (currentLine.includes(blurText)) {
                                lineHTML = currentLine.replace(blurText, span.outerHTML);
                            }
                        });
                    }
                }
                
                finalLines.push(lineHTML);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
            
            if (index === words.length - 1 && currentLine) {
                let lineHTML = currentLine;
                
                // Preservar HTML se necessário
                if (originalHTML !== text) {
                    const blurSpans = element.querySelectorAll('.blur-word');
                    blurSpans.forEach(span => {
                        const blurText = span.textContent;
                        if (currentLine.includes(blurText)) {
                            lineHTML = currentLine.replace(blurText, span.outerHTML);
                        }
                    });
                }
                
                finalLines.push(lineHTML);
            }
        });
        
        document.body.removeChild(tempDiv);
        document.body.removeChild(clone);
        
        // Se realmente tem mais de uma linha, criar divs separadas
        if (finalLines.length > 1) {
            element.innerHTML = finalLines.map(line => 
                `<div class="message-content-line">${line}</div>`
            ).join('');
            element.dataset.linesWrapped = 'true';
        } else {
            // Apenas uma linha, marcar como processado
            element.dataset.linesWrapped = 'true';
        }
    });
    
    // Aplicar bordas arredondadas após processar todas as mensagens
    applyMessageRoundedCorners();
}

// Adicionar elemento de transcrição clicável
function setupTranscricaoButtons() {
    document.querySelectorAll('.audio-recebido').forEach(audioContainer => {
        // Verificar se já existe o botão de transcrição
        if (audioContainer.querySelector('.audio-recebido-transcricao')) return;
        
        // Criar elemento de transcrição
        const transcricaoBtn = document.createElement('span');
        transcricaoBtn.className = 'audio-recebido-transcricao';
        transcricaoBtn.textContent = 'Ver transcrição';
        
        // Adicionar event listener
        transcricaoBtn.addEventListener('click', function() {
            if (this.textContent === 'Ver transcrição') {
                this.textContent = 'Transcrevendo...';
                
                setTimeout(() => {
                    // Criar HTML com quebra de linha
                    this.innerHTML = 'Não foi possível transcrever a mensagem.<br>Requer acesso VIP';
                    // Remover clicabilidade
                    this.style.cursor = 'default';
                    this.style.pointerEvents = 'none';
                    // Reduzir espaçamento entre linhas
                    this.style.lineHeight = '1.1';
                    // Ajustar padding-bottom da div para acomodar o texto maior
                    const audioContainer = this.closest('.audio-recebido');
                    if (audioContainer) {
                        // Aguardar um frame para o texto renderizar
                        requestAnimationFrame(() => {
                            // Aumentar padding-bottom apenas o necessário (mantém 12px de espaço abaixo do texto)
                            audioContainer.style.paddingBottom = `${12}px`;
                        });
                    }
                }, 1500);
            }
        });
        
        audioContainer.appendChild(transcricaoBtn);
    });
}

// Executar ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Resetar contador de carregamentos ao recarregar a página
        const chatId = getChatId();
        const loadCountKey = `${chatId}_messagesLoadCount`;
        localStorage.setItem(loadCountKey, '0');
        
        // Gerar alturas aleatórias para áudios estáticos
        randomizeAudioBars();
        
        // Configurar botões de transcrição
        setupTranscricaoButtons();
        
        // Substituir placeholders de localização (ANTES de dividir em linhas)
        replaceLocationPlaceholders().then(() => {
            // Calcular datas das mensagens
            calculateMessageDates();
            
            // Dividir textos em divs por linha
            setTimeout(() => {
                wrapTextLinesInDivs();
                // Após dividir, substituir placeholders novamente nas linhas (caso tenham sido quebrados)
                replaceLocationPlaceholders();
            }, 100);
        });
        
        restoreSentMessages();
    });
} else {
    // Resetar contador de carregamentos ao recarregar a página
    const chatId = getChatId();
    const loadCountKey = `${chatId}_messagesLoadCount`;
    localStorage.setItem(loadCountKey, '0');
    
    // Gerar alturas aleatórias para áudios estáticos
    randomizeAudioBars();
    
    // Configurar botões de transcrição
    setupTranscricaoButtons();
    
        // Substituir placeholders de localização (ANTES de dividir em linhas)
        replaceLocationPlaceholders().then(() => {
            // Calcular datas das mensagens
            calculateMessageDates();
            
            // Dividir textos em divs por linha
            setTimeout(() => {
                wrapTextLinesInDivs();
                // Após dividir, substituir placeholders novamente nas linhas (caso tenham sido quebrados)
                replaceLocationPlaceholders();
                // Aplicar bordas arredondadas após processar todas as mensagens
                applyMessageRoundedCorners();
            }, 100);
        });
    
    restoreSentMessages();
    
    // Aplicar bordas arredondadas após restaurar mensagens e processar tudo
    setTimeout(() => {
        applyMessageRoundedCorners();
    }, 300);
}

console.log('Instagram Direct Chat carregado! 🎉');
