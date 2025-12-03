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
const stickerBtn = document.getElementById('stickerBtn');

// Variáveis globais
let selectedMessage = null;
let isRecordingVoice = false;
let isLoadingMessages = false;
let oldestMessageTime = new Date();

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
    
    blurWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        processedText = processedText.replace(regex, (match) => {
            return `<span class="blur-word">${match}</span>`;
        });
    });
    
    return processedText;
}

// Mensagens aleatórias para scroll infinito
const randomMessages = [
    { type: 'text', content: 'Oi, tudo bem?', received: true },
    { type: 'text', content: 'Tudo sim, e você?', received: false },
    { type: 'text', content: 'Que foto linda! 😍', received: true },
    { type: 'text', content: 'Obrigada! ❤️', received: false },
    { type: 'text', content: 'Vamos sair hoje?', received: true },
    { type: 'text', content: 'Adoraria!', received: false },
    { type: 'text', content: 'Estou com saudades', received: true },
    { type: 'text', content: 'Também estou 💕', received: false },
    { type: 'text', content: 'Você está linda hoje', received: true },
    { type: 'text', content: 'Ai, obrigada 😊', received: false },
    { type: 'text', content: 'Me manda foto', received: true },
    { type: 'text', content: 'Que tipo de foto? 👀', received: false },
    { type: 'text', content: 'Você sabe... sexy', received: true },
    { type: 'text', content: 'Hmm talvez mais tarde 😏', received: false },
    { type: 'text', content: 'Estou pensando em você', received: true },
    { type: 'text', content: 'Que tesão', received: false },
    { type: 'text', content: 'Manda nude', received: true },
    { type: 'text', content: 'Só se você mandar também', received: false },
    { type: 'text', content: 'Combinado 😈', received: true },
    { type: 'text', content: 'Vem aqui em casa', received: false },
    { type: 'text', content: 'Quero te ver pelada', received: true },
    { type: 'text', content: 'Nossa que safado', received: false },
    { type: 'text', content: 'Você me deixa excitado', received: true },
    { type: 'text', content: 'Também estou com tesão', received: false },
    { type: 'text', content: 'Que buceta gostosa', received: true },
    { type: 'text', content: 'Para com isso 🙈', received: false },
    { type: 'text', content: 'Me manda pack', received: true },
    { type: 'text', content: 'Quanto você paga? 😂', received: false },
    { type: 'text', content: 'Tudo que você quiser', received: true },
    { type: 'text', content: 'Então vem buscar', received: false }
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
    
    isLoadingMessages = true;
    
    // Adicionar indicador de loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'messages-loading';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Carregando mensagens...</span>
    `;
    chatMessages.insertBefore(loadingDiv, chatMessages.firstChild);
    
    // Salvar posição atual do scroll
    const oldScrollHeight = chatMessages.scrollHeight;
    
    // Simular delay de carregamento
    setTimeout(() => {
        // Gerar entre 3 e 8 mensagens aleatórias (ENCHEÇÃO DE LINGUIÇA)
        const numMessages = Math.floor(Math.random() * 6) + 3;
        
        for (let i = 0; i < numMessages; i++) {
            const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
            
            // Diminuir o tempo da mensagem antiga
            oldestMessageTime = new Date(oldestMessageTime.getTime() - Math.random() * 3600000);
            const time = oldestMessageTime.getHours().toString().padStart(2, '0') + ':' + 
                        oldestMessageTime.getMinutes().toString().padStart(2, '0');
            
            const messageDiv = document.createElement('div');
            // ENCHEÇÃO DE LINGUIÇA: adicionar classe de blur forte
            messageDiv.className = `message ${randomMsg.received ? 'received' : 'sent'} enchacao-de-linguica`;
            
            // Aplicar blur no conteúdo
            const processedContent = applyBlurToText(randomMsg.content);
            
            if (randomMsg.received) {
                messageDiv.innerHTML = `
                    <img src="https://i.pravatar.cc/150?img=1" alt="User" class="message-avatar">
                    <div class="message-bubble">
                        <div class="message-content">${processedContent}</div>
                    </div>
                `;
            } else {
                messageDiv.innerHTML = `
                    <div class="message-bubble">
                        <div class="message-content">${processedContent}</div>
                    </div>
                `;
            }
            
            // Inserir após o loading (que está no topo)
            chatMessages.insertBefore(messageDiv, loadingDiv.nextSibling);
            // NÃO adicionar listeners para encheção de linguiça (não interativas)
        }
        
        // Remover loading
        loadingDiv.remove();
        
        // Manter a posição do scroll
        chatMessages.scrollTop = chatMessages.scrollHeight - oldScrollHeight;
        
        isLoadingMessages = false;
    }, 800);
}

// Scroll inicial
chatMessages.scrollTop = chatMessages.scrollHeight;

// Enviar mensagem com Enter
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        sendMessage(this.value);
        this.value = '';
    }
});

// Mostrar/esconder botão de curtir
messageInput.addEventListener('input', function() {
    if (this.value.trim() === '') {
        likeBtn.style.display = 'block';
        voiceBtn.style.display = 'block';
    } else {
        likeBtn.style.display = 'none';
        voiceBtn.style.display = 'none';
    }
});

// Função para enviar mensagem
function sendMessage(text) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // Aplicar blur no texto
    const processedText = applyBlurToText(escapeHtml(text));
    
    // APENAS mensagem enviada - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent';
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">${processedText}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    addMessageListeners(messageDivSent);
    scrollToBottom();
    
    // Mostrar erro de "não é MEMBRO-VIP"
    setTimeout(() => {
        showVIPError();
    }, 1500);
}

// Mostrar erro de MEMBRO-VIP
function showVIPError() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message-system error-vip';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>Não foi possível enviar. Você não é MEMBRO-VIP</span>
    `;
    chatMessages.appendChild(errorDiv);
    scrollToBottom();
    
    // Remover após 5 segundos
    setTimeout(() => {
        errorDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
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
        showContextMenu(e.clientX, e.clientY, messageElement);
    });
    
    // Segurar para reações (mobile)
    let pressTimer;
    bubble.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return; // Apenas botão esquerdo
        pressTimer = setTimeout(() => {
            showQuickReactions(e.clientX, e.clientY, messageElement);
        }, 500);
    });
    
    bubble.addEventListener('mouseup', function() {
        clearTimeout(pressTimer);
    });
    
    bubble.addEventListener('mouseleave', function() {
        clearTimeout(pressTimer);
    });
}

// Mostrar menu de contexto
function showContextMenu(x, y, messageElement) {
    selectedMessage = messageElement;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('show');
}

// Mostrar reações rápidas
function showQuickReactions(x, y, messageElement) {
    selectedMessage = messageElement;
    quickReactions.style.left = (x - 150) + 'px';
    quickReactions.style.top = (y - 60) + 'px';
    quickReactions.classList.add('show');
}

// Fechar menus ao clicar fora
document.addEventListener('click', function(e) {
    if (!contextMenu.contains(e.target)) {
        contextMenu.classList.remove('show');
    }
    if (!quickReactions.contains(e.target)) {
        quickReactions.classList.remove('show');
    }
});

// Ações do menu de contexto
const contextItems = document.querySelectorAll('.context-item');
contextItems.forEach(item => {
    item.addEventListener('click', function() {
        const action = this.textContent.trim();
        
        if (action.includes('Copiar')) {
            copyMessage();
        } else if (action.includes('Responder')) {
            replyToMessage();
        } else if (action.includes('Reagir')) {
            const rect = selectedMessage.getBoundingClientRect();
            showQuickReactions(rect.left + rect.width / 2, rect.top);
        } else if (action.includes('Cancelar envio')) {
            deleteMessage();
        }
        
        contextMenu.classList.remove('show');
    });
});

// Adicionar reação
const reactionEmojis = document.querySelectorAll('.reaction-emoji');
reactionEmojis.forEach(emoji => {
    emoji.addEventListener('click', function() {
        if (selectedMessage) {
            addReaction(selectedMessage, this.textContent);
        }
        quickReactions.classList.remove('show');
    });
});

// Função para adicionar reação
function addReaction(messageElement, emoji) {
    const bubble = messageElement.querySelector('.message-bubble');
    let reaction = bubble.querySelector('.message-reaction');
    
    if (reaction) {
        reaction.textContent = emoji;
    } else {
        reaction = document.createElement('div');
        reaction.className = 'message-reaction';
        reaction.textContent = emoji;
        bubble.appendChild(reaction);
    }
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

// Responder mensagem
function replyToMessage() {
    if (selectedMessage) {
        const content = selectedMessage.querySelector('.message-content');
        if (content) {
            messageInput.placeholder = `Respondendo: "${content.textContent.substring(0, 30)}..."`;
            messageInput.focus();
        }
    }
}

// Apagar mensagem
function deleteMessage() {
    if (selectedMessage && selectedMessage.classList.contains('sent')) {
        const bubble = selectedMessage.querySelector('.message-bubble');
        const content = bubble.querySelector('.message-content');
        
        // Marcar como apagada
        bubble.classList.add('deleted');
        content.innerHTML = '<i class="fas fa-ban"></i> Você apagou esta mensagem';
        
        // Remover reações
        const reaction = bubble.querySelector('.message-reaction');
        if (reaction) reaction.remove();
        
        showNotification('Mensagem apagada');
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
callBtn.addEventListener('click', function() {
    addSystemMessage('fas fa-phone', 'Chamando...', true);
    
    setTimeout(() => {
        const lastMsg = chatMessages.lastElementChild;
        lastMsg.querySelector('span').textContent = 'Chamada de voz perdida';
        lastMsg.querySelector('i').className = 'fas fa-phone-slash';
    }, 3000);
});

// Chamada de vídeo
videoBtn.addEventListener('click', function() {
    addSystemMessage('fas fa-video', 'Chamando...', true);
    
    setTimeout(() => {
        const lastMsg = chatMessages.lastElementChild;
        lastMsg.querySelector('span').textContent = 'Chamada de vídeo perdida';
        lastMsg.querySelector('i').className = 'fas fa-video-slash';
    }, 3000);
});

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

// Enviar áudio
function sendAudioMessage() {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const duration = Math.floor(Math.random() * 20) + 5;
    
    // Gerar barras de waveform aleatórias
    let waveformBars = '';
    const numBars = 18;
    for (let i = 0; i < numBars; i++) {
        const height = Math.floor(Math.random() * 20) + 4;
        waveformBars += `<div class="waveform-bar" style="height: ${height}px;"></div>`;
    }
    
    // APENAS áudio enviado - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent';
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="audio-enviado">
                <button class="audio-enviado-play-btn">
                    <i class="fas fa-play"></i>
                </button>
                <div class="audio-enviado-waveform">
                    ${waveformBars}
                </div>
                <span class="audio-enviado-duration">0:${duration.toString().padStart(2, '0')}</span>
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    
    // Adicionar funcionalidade de play no enviado
    const playBtnSent = messageDivSent.querySelector('.audio-enviado-play-btn');
    playBtnSent.addEventListener('click', function() {
        const icon = this.querySelector('i');
        const bars = messageDivSent.querySelectorAll('.waveform-bar');
        
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
photoBtn.addEventListener('click', function() {
    const options = ['foto', 'localização', 'post'];
    const random = options[Math.floor(Math.random() * options.length)];
    
    if (random === 'foto') {
        const photos = [
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
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

// Botão de sticker para enviar post ou localização
stickerBtn.addEventListener('click', function() {
    const options = ['post', 'localização'];
    const random = options[Math.floor(Math.random() * options.length)];
    
    if (random === 'post') {
        sendForwardedPost();
    } else {
        sendLocationMessage();
    }
});

// Enviar foto
function sendPhotoMessage(photoUrl) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // APENAS foto enviada - SEM duplicação
    const messageDivSent = document.createElement('div');
    messageDivSent.className = 'message sent';
    messageDivSent.innerHTML = `
        <div class="message-bubble">
            <div class="message-photo">
                <img src="${photoUrl}" alt="Foto">
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(messageDivSent);
    addMessageListeners(messageDivSent);
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
                    <img src="https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${randomLocation.coords},12,0/300x180@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw" alt="Mapa">
                    <div class="location-pin">
                        <i class="fas fa-map-marker-alt"></i>
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
    scrollToBottom();
});

// Adicionar event listeners em mensagens existentes
document.querySelectorAll('.message').forEach(msg => {
    addMessageListeners(msg);
});

// Play de áudio recebido (EXATAMENTE COMO O PRINT)
document.querySelectorAll('.audio-recebido-play-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        const audioContainer = this.closest('.audio-recebido');
        const waveformContainer = audioContainer.querySelector('.audio-recebido-waveform');
        const bars = waveformContainer.querySelectorAll('.audio-recebido-waveform-bar');
        const durationElement = audioContainer.querySelector('.audio-recebido-duration');
        const durationText = durationElement.textContent;
        const seconds = parseInt(durationText.split(':')[1]);
        
        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            
            // Todas as barras ficam BRANCAS quando reproduz
            bars.forEach(bar => {
                bar.classList.remove('active');
                bar.classList.remove('playing');
            });
            
            // Animar barras ficando CINZA progressivamente (progresso)
            const totalDuration = seconds * 1000; // em milissegundos
            const timePerBar = totalDuration / bars.length;
            
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.classList.add('playing');
                }, index * timePerBar);
            });
            
            // Voltar ao play após terminar
            setTimeout(() => {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                bars.forEach(bar => {
                    bar.classList.remove('playing');
                    bar.classList.remove('active');
                });
            }, totalDuration);
        } else {
            // Pausar
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            bars.forEach(bar => {
                bar.classList.remove('playing');
                bar.classList.remove('active');
            });
        }
    });
});

console.log('Instagram Direct Chat carregado! 🎉');
