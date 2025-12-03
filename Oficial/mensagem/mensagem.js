// Inicializar chat
document.addEventListener('DOMContentLoaded', function() {
    // Botão voltar
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '../Direct/direct.html';
        });
    }

    // Buscar dados do primeiro chat do localStorage (mesmo que direct.html usa)
    const currentUsername = localStorage.getItem('username');
    const userId = localStorage.getItem('userId') || localStorage.getItem('userPk');
    const followersKey = userId ? `followers_${userId}` : `followers_${currentUsername}`;
    
    let profiles = [];
    try {
        const profilesRaw = localStorage.getItem(followersKey);
        if (profilesRaw) {
            profiles = JSON.parse(profilesRaw);
        }
    } catch (e) {
        console.error('Erro ao buscar profiles:', e);
    }

    // Determinar índice do chat baseado no nome do arquivo ou URL
    // mensagem-1.html = índice 0, mensagem-2.html = índice 1, etc.
    const currentFile = window.location.pathname.split('/').pop();
    let chatIndex = 0; // padrão: primeiro chat
    
    if (currentFile.includes('mensagem-1.html')) {
        chatIndex = 0;
    } else if (currentFile.includes('mensagem-2.html')) {
        chatIndex = 1;
    } else if (currentFile.includes('mensagem-3.html')) {
        chatIndex = 2;
    } else if (currentFile.includes('mensagem-4.html')) {
        chatIndex = 3;
    }
    
    // Pegar o perfil correspondente ao índice
    const targetProfile = profiles[chatIndex];
    
    // Nome mascarado com fallback
    let maskedName = 'user****';
    let profilePicUrl = '';
    
    if (targetProfile) {
        // Nome mascarado
        maskedName = typeof maskUsername === 'function' 
            ? maskUsername(targetProfile.username || targetProfile.full_name || '')
            : (targetProfile.username || targetProfile.full_name || 'user').substring(0, 3) + '*****';
        
        // Foto de perfil
        const profilePic = targetProfile.profile_pic_url || targetProfile.profile_pic_url_hd || '';
        profilePicUrl = typeof getProxyUrl === 'function' && profilePic
            ? getProxyUrl(profilePic, 128)
            : profilePic;
    }

    // Atualizar header
    const chatUserName = document.getElementById('chatUserName');
    if (chatUserName) {
        chatUserName.textContent = maskedName;
    }

    const chatUserAvatar = document.getElementById('chatUserAvatar');
    if (chatUserAvatar) {
        if (profilePicUrl) {
            chatUserAvatar.src = profilePicUrl;
            chatUserAvatar.alt = maskedName;
        } else {
            // Fallback: SVG placeholder
            chatUserAvatar.style.display = 'none';
            const placeholder = chatUserAvatar.parentElement.querySelector('.avatar-placeholder');
            if (!placeholder) {
                const svgPlaceholder = document.createElement('div');
                svgPlaceholder.className = 'avatar-placeholder';
                svgPlaceholder.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 24px; height: 24px; color: rgb(156, 163, 175);"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                chatUserAvatar.parentElement.appendChild(svgPlaceholder);
            }
        }
    }

    // Atualizar avatares das mensagens
    const messageAvatars = [
        document.getElementById('messageAvatar1'),
        document.getElementById('messageAvatar2'),
        document.getElementById('messageAvatar3'),
        document.getElementById('messageAvatar4')
    ];
    
    messageAvatars.forEach(avatar => {
        if (avatar) {
            if (profilePicUrl) {
                avatar.src = profilePicUrl;
                avatar.alt = maskedName;
            } else {
                // Fallback: mostrar placeholder SVG
                avatar.style.display = 'none';
                const placeholder = avatar.parentElement.querySelector('.avatar-placeholder');
                if (!placeholder) {
                    const svgPlaceholder = document.createElement('div');
                    svgPlaceholder.className = 'avatar-placeholder';
                    svgPlaceholder.style.width = '32px';
                    svgPlaceholder.style.height = '32px';
                    svgPlaceholder.style.borderRadius = '50%';
                    svgPlaceholder.style.backgroundColor = 'rgb(31, 41, 55)';
                    svgPlaceholder.style.display = 'flex';
                    svgPlaceholder.style.alignItems = 'center';
                    svgPlaceholder.style.justifyContent = 'center';
                    svgPlaceholder.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; color: rgb(156, 163, 175);"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                    avatar.parentElement.appendChild(svgPlaceholder);
                }
            }
        }
    });

    // Atualizar avatar da localização (se existir)
    const locationAvatar = document.getElementById('locationAvatar');
    if (locationAvatar) {
        if (profilePicUrl) {
            locationAvatar.src = profilePicUrl;
            locationAvatar.alt = maskedName;
        } else {
            // Fallback: mostrar placeholder
            locationAvatar.style.display = 'none';
            const placeholder = locationAvatar.parentElement.querySelector('.avatar-placeholder');
            if (!placeholder) {
                const svgPlaceholder = document.createElement('div');
                svgPlaceholder.className = 'avatar-placeholder';
                svgPlaceholder.style.width = '64px';
                svgPlaceholder.style.height = '64px';
                svgPlaceholder.style.borderRadius = '50%';
                svgPlaceholder.style.backgroundColor = 'rgb(31, 41, 55)';
                svgPlaceholder.style.display = 'flex';
                svgPlaceholder.style.alignItems = 'center';
                svgPlaceholder.style.justifyContent = 'center';
                svgPlaceholder.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 32px; height: 32px; color: rgb(156, 163, 175);"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                locationAvatar.parentElement.appendChild(svgPlaceholder);
            }
        }
    }

    // Atualizar subtítulo da localização (se existir)
    const locationSubtitle = document.getElementById('locationSubtitle');
    if (locationSubtitle) {
        locationSubtitle.textContent = maskedName + ' está compartilhando';
    }

    // Scroll automático para última mensagem
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    // Função para mostrar pop-up de bloqueio VIP
    function showBlockedPopup(actionText) {
        const popup = document.getElementById('blocked-popup');
        const overlay = document.getElementById('blocked-popup-overlay');
        
        if (popup && overlay) {
            popup.innerHTML = `
                <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 10px 0; letter-spacing: -0.1px; opacity: 0.95;">
                    ⚠︎ Ação bloqueada
                </h3>
                <p style="font-size: 13px; opacity: 0.85; margin: 0 0 20px 0; line-height: 1.4; font-weight: 400;">
                    Seja um membro VIP do In'Stalker para ter acesso ${actionText}
                </p>
                <button onclick="window.location.href='../Inicio1/index.html'" style="background: rgba(255, 255, 255, 0.3); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 500; font-size: 13px; border: 1px solid rgba(255, 255, 255, 0.3); cursor: pointer; width: 100%; transition: all 0.2s; backdrop-filter: blur(10px);" onmouseover="this.style.background='rgba(255, 255, 255, 0.4)'; this.style.borderColor='rgba(255, 255, 255, 0.4)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'">
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
        }
    }

    // Event listeners para elementos bloqueados
    // Áudio
    document.querySelectorAll('.message-audio, .audio-play-btn').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showBlockedPopup('aos áudios');
        });
    });

    // Localização
    document.querySelectorAll('.message-location, .location-button').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showBlockedPopup('à localização');
        });
    });

    // Foto de perfil no header
    const chatAvatarBtn = document.querySelector('.chat-avatar-btn');
    if (chatAvatarBtn) {
        chatAvatarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showBlockedPopup('ao perfil');
        });
    }

    // Ícone de câmera no header
    const cameraBtn = document.querySelector('.header-icon-btn[aria-label="Câmera"]');
    if (cameraBtn) {
        cameraBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showBlockedPopup('à câmera');
        });
    }

    // Ícones de telefone e vídeo
    document.querySelectorAll('.header-icon-btn[aria-label="Telefone"], .header-icon-btn[aria-label="Chamada de vídeo"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showBlockedPopup('às chamadas');
        });
    });

    // Mensagens de mídia (foto/vídeo)
    document.querySelectorAll('.message-media').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showBlockedPopup('às mídias');
        });
    });

    // Conteúdo restrito
    document.querySelectorAll('.message-restricted').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showBlockedPopup('ao conteúdo restrito');
        });
    });

    // Ícones do footer (microfone, galeria, adesivos)
    document.querySelectorAll('.input-action-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const alt = icon.querySelector('img')?.alt || '';
            if (alt.includes('Microfone')) {
                showBlockedPopup('ao microfone');
            } else if (alt.includes('Galeria')) {
                showBlockedPopup('à galeria');
            } else if (alt.includes('Adesivos') || alt.includes('rosto')) {
                showBlockedPopup('aos adesivos');
            }
        });
    });

    // Input de mensagem - permitir escrever mas mostrar erro ao enviar
    const messageInput = document.querySelector('.message-input');
    if (messageInput) {
        messageInput.disabled = false;
        
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && messageInput.value.trim()) {
                e.preventDefault();
                sendMessageWithError(messageInput.value.trim());
                messageInput.value = '';
            }
        });
    }

    // Função para enviar mensagem com erro
    function sendMessageWithError(text) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const messageRow = document.createElement('div');
        messageRow.className = 'message-row message-sent';
        messageRow.style.position = 'relative';
        
        messageRow.innerHTML = `
            <button class="message-bubble message-bubble-sent message-error" style="position: relative;">
                <p class="message-text">${text}</p>
                <div class="message-error-icon">✕</div>
                <div class="message-error-text">
                    Falha ao enviar. <span class="message-error-link" onclick="expandError(this)">Saiba mais</span>
                </div>
                <div class="message-error-expanded" style="display: none;">
                    Falha ao enviar. Somente membros VIP's podem enviar ou responder mensagens do direct, <a href="../Inicio1/index.html" style="color: white; text-decoration: underline;">torne-se VIP</a>
                </div>
            </button>
        `;

        messagesContainer.appendChild(messageRow);
        
        // Scroll para a nova mensagem
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    // Função para expandir erro (global para poder ser chamada do onclick)
    window.expandError = function(element) {
        const expanded = element.closest('.message-bubble').querySelector('.message-error-expanded');
        if (expanded) {
            expanded.style.display = expanded.style.display === 'none' ? 'block' : 'none';
        }
    };

    // Scroll infinito com mensagens blur
    let blurMessagesLoaded = false;
    let isLoadingBlur = false;
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (messagesContainer) {
        messagesContainer.addEventListener('scroll', function() {
            // Se já carregou mensagens blur ou está carregando, não fazer nada
            if (blurMessagesLoaded || isLoadingBlur) return;
            
            // Se scroll está próximo do topo (50px do topo)
            if (messagesContainer.scrollTop < 50) {
                loadBlurMessages();
            }
        });
    }

    function loadBlurMessages() {
        if (isLoadingBlur || blurMessagesLoaded) return;
        
        isLoadingBlur = true;
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        // Mostrar animação de loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'messages-loading';
        loadingDiv.innerHTML = '<div class="messages-loading-spinner"></div> Carregando mais mensagens...';
        messagesContainer.insertBefore(loadingDiv, messagesContainer.firstChild);

        // Simular carregamento
        setTimeout(() => {
            loadingDiv.remove();
            
            // Gerar mensagens blur variadas (10-20 mensagens)
            const blurMessages = generateBlurMessages(chatIndex);
            
            blurMessages.forEach(msg => {
                messagesContainer.insertBefore(msg, messagesContainer.firstChild);
            });

            blurMessagesLoaded = true;
            isLoadingBlur = false;

            // Mostrar mensagem de limite
            setTimeout(() => {
                const limitDiv = document.createElement('div');
                limitDiv.className = 'scroll-limit-message';
                limitDiv.innerHTML = 'Não é possível carregar mais mensagens. <a href="../Inicio1/index.html">Torne-se VIP</a> para ver todo o histórico';
                messagesContainer.insertBefore(limitDiv, messagesContainer.firstChild);
            }, 300);
        }, 1500);
    }

    function generateBlurMessages(chatIndex) {
        const messages = [];
        const messageCount = 15; // Entre 10-20
        
        // Datas variadas
        const dates = [
            { text: 'HÁ 2 DIAS', time: '••:15' },
            { text: 'HÁ 3 DIAS', time: '••:22' },
            { text: 'HÁ 1 SEMANA', time: '••:08' },
            { text: 'HÁ 2 SEMANAS', time: '••:30' },
            { text: 'HÁ 1 MÊS', time: '••:45' }
        ];

        // Mensagens variadas por chat
        const messageTemplates = [
            // Chat 1 - mais romântico
            [
                { type: 'text', received: true, text: 'Você <span class="blur-text">me ama</span> mesmo?' },
                { type: 'text', received: false, text: 'Claro que sim <span class="blur-text">minha vida</span> ❤️' },
                { type: 'audio', received: true, duration: '0:45' },
                { type: 'text', received: true, text: 'Quando vamos <span class="blur-text">nos ver</span> de novo?' },
                { type: 'photo', received: false },
                { type: 'text', received: false, text: 'Saudades <span class="blur-text">de você</span> 😘' },
                { type: 'text', received: true, text: 'Eu também <span class="blur-text">te amo</span> muito' },
                { type: 'video', received: false },
                { type: 'text', received: true, text: 'Que <span class="blur-text">foto linda</span>! 🥰' },
                { type: 'text', received: false, text: 'Foi pensando <span class="blur-text">em você</span>' }
            ],
            // Chat 2 - mais casual
            [
                { type: 'text', received: true, text: 'E aí, <span class="blur-text">como foi</span>?' },
                { type: 'text', received: false, text: 'Foi <span class="blur-text">tranquilo</span> kkk' },
                { type: 'text', received: true, text: 'Que bom! <span class="blur-text">Fico feliz</span>' },
                { type: 'photo', received: false },
                { type: 'text', received: true, text: 'Nossa <span class="blur-text">que legal</span>!' },
                { type: 'audio', received: false, duration: '1:12' },
                { type: 'text', received: true, text: 'Entendi <span class="blur-text">perfeito</span>' },
                { type: 'text', received: false, text: 'Valeu <span class="blur-text">mesmo</span>!' },
                { type: 'video', received: true },
                { type: 'text', received: false, text: 'Show <span class="blur-text">de bola</span> 👏' }
            ],
            // Chat 3 - mais sério
            [
                { type: 'text', received: true, text: 'Precisamos <span class="blur-text">conversar</span>' },
                { type: 'text', received: false, text: 'Sobre <span class="blur-text">o quê</span>?' },
                { type: 'text', received: true, text: 'É <span class="blur-text">importante</span>' },
                { type: 'photo', received: true },
                { type: 'text', received: false, text: 'Ok, <span class="blur-text">entendi</span>' },
                { type: 'audio', received: true, duration: '2:30' },
                { type: 'text', received: false, text: 'Vou <span class="blur-text">pensar</span> nisso' },
                { type: 'text', received: true, text: 'Por favor <span class="blur-text">me avise</span>' },
                { type: 'video', received: false },
                { type: 'text', received: true, text: 'Obrigada <span class="blur-text">por entender</span>' }
            ],
            // Chat 4 - mais descontraído
            [
                { type: 'text', received: true, text: 'Oi <span class="blur-text">sumido</span>! 😄' },
                { type: 'text', received: false, text: 'Oi! <span class="blur-text">Desculpa</span> a demora' },
                { type: 'photo', received: true },
                { type: 'text', received: false, text: 'Que <span class="blur-text">foto incrível</span>!' },
                { type: 'audio', received: true, duration: '0:58' },
                { type: 'text', received: false, text: 'Hahaha <span class="blur-text">verdade</span>' },
                { type: 'text', received: true, text: 'Você é <span class="blur-text">demais</span>! 🎉' },
                { type: 'video', received: false },
                { type: 'text', received: true, text: 'Adorei <span class="blur-text">o vídeo</span>' },
                { type: 'text', received: false, text: 'Fico feliz <span class="blur-text">que gostou</span>!' }
            ]
        ];

        const templates = messageTemplates[chatIndex] || messageTemplates[0];
        
        for (let i = 0; i < messageCount; i++) {
            const template = templates[i % templates.length];
            const date = dates[Math.floor(i / 3) % dates.length];
            
            // Adicionar data a cada 3-4 mensagens
            if (i % 4 === 0 && i > 0) {
                const dateDiv = document.createElement('div');
                dateDiv.className = 'message-date';
                dateDiv.innerHTML = `<span>${date.text}</span>, <span>••</span>:${date.time.split(':')[1]}`;
                messages.push(dateDiv);
            }

            let messageDiv;
            
            if (template.type === 'text') {
                messageDiv = createTextMessage(template.received, template.text, chatIndex);
            } else if (template.type === 'audio') {
                messageDiv = createAudioMessage(template.received, template.duration, chatIndex);
            } else if (template.type === 'photo') {
                messageDiv = createPhotoMessage(template.received, chatIndex);
            } else if (template.type === 'video') {
                messageDiv = createVideoMessage(template.received, chatIndex);
            }
            
            if (messageDiv) {
                messages.push(messageDiv);
            }
        }

        return messages;
    }

    function createTextMessage(received, text, chatIndex) {
        const row = document.createElement('div');
        row.className = received ? 'message-row message-received' : 'message-row message-sent';
        
        if (received) {
            row.innerHTML = `
                <div class="message-avatar">
                    <img src="${getProfilePic(chatIndex)}" alt="" loading="lazy" width="32" height="32" class="message-avatar-img">
                </div>
                <button class="message-bubble message-bubble-received">
                    <p class="message-text">${text}</p>
                </button>
            `;
        } else {
            row.innerHTML = `
                <button class="message-bubble message-bubble-sent">
                    <p class="message-text">${text}</p>
                </button>
            `;
        }
        
        return row;
    }

    function createAudioMessage(received, duration, chatIndex) {
        const row = document.createElement('div');
        row.className = received ? 'message-row message-received' : 'message-row message-sent';
        
        const audioSvg = received 
            ? '<path d="M24.3758 37.8167C25.6026 38.6037 25.6026 40.3965 24.3758 41.1835L3.0799 54.8448C1.74878 55.6987 -6.91281e-08 54.7429 0 53.1614L1.19431e-06 25.8387C1.26344e-06 24.2573 1.74878 23.3014 3.0799 24.1553L24.3758 37.8167Z" fill="#5653FC"></path><rect x="44.7969" y="34.5" width="6" height="10" rx="3" fill="white"></rect><rect x="55.7969" y="34.5" width="6" height="10" rx="3" fill="white"></rect><circle cx="69.7969" cy="39.5" r="3" fill="white"></rect><rect x="77.7969" y="22" width="6" height="35" rx="3" fill="white"></rect><rect x="88.7969" y="4.5" width="6" height="70" rx="3" fill="white"></rect>'
            : '<path d="M24.3758 37.8167C25.6026 38.6037 25.6026 40.3965 24.3758 41.1835L3.0799 54.8448C1.74878 55.6987 -6.91281e-08 54.7429 0 53.1614L1.19431e-06 25.8387C1.26344e-06 24.2573 1.74878 23.3014 3.0799 24.1553L24.3758 37.8167Z" fill="white"></path><rect x="45.2969" width="6" height="79" rx="3" fill="white"></rect><rect x="56.2969" y="2" width="6" height="75" rx="3" fill="white"></rect>';
        
        if (received) {
            row.innerHTML = `
                <div class="message-avatar">
                    <img src="${getProfilePic(chatIndex)}" alt="" loading="lazy" width="32" height="32" class="message-avatar-img">
                </div>
                <button class="message-bubble message-bubble-received message-audio">
                    <div class="audio-wrapper">
                        <div class="audio-content">
                            <button class="audio-play-btn">
                                <svg width="auto" height="40" viewBox="0 0 381 79" fill="none">${audioSvg}</svg>
                            </button>
                            <span class="audio-duration">${duration}</span>
                        </div>
                        <div class="audio-transcript">
                            <span class="transcript-text">Ver transcrição</span>
                        </div>
                    </div>
                </button>
            `;
        } else {
            row.innerHTML = `
                <button class="message-bubble message-bubble-sent message-audio">
                    <div class="audio-wrapper">
                        <div class="audio-content audio-sent">
                            <button class="audio-play-btn">
                                <svg width="auto" height="40" viewBox="0 0 382 79" fill="none">${audioSvg}</svg>
                            </button>
                            <span class="audio-duration audio-duration-sent">${duration}</span>
                        </div>
                        <div class="audio-transcript audio-transcript-sent">
                            <span class="transcript-text">Ver transcrição</span>
                        </div>
                    </div>
                </button>
            `;
        }
        
        return row;
    }

    function createPhotoMessage(received, chatIndex) {
        const row = document.createElement('div');
        row.className = received ? 'message-row message-received' : 'message-row message-sent';
        
        if (received) {
            row.innerHTML = `
                <div class="message-avatar">
                    <img src="${getProfilePic(chatIndex)}" alt="" loading="lazy" width="32" height="32" class="message-avatar-img">
                </div>
                <button class="message-bubble message-bubble-received message-media">
                    <div class="media-content">
                        <svg width="10" height="15" viewBox="0 0 35 39" fill="white">
                            <path d="M0 5.54924V33.4508C0 37.2749 4.11828 39.6835 7.4513 37.8086L32.2527 23.8579C35.6509 21.9464 35.6509 17.0536 32.2527 15.1421L7.45131 1.19136C4.11829 -0.683463 0 1.72511 0 5.54924Z"></path>
                        </svg>
                        <span class="media-text">Foto</span>
                    </div>
                    <div class="media-icon">
                        <svg width="17" height="17" viewBox="0 0 66 64" fill="white">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959Z"></path>
                        </svg>
                    </div>
                </button>
            `;
        } else {
            row.innerHTML = `
                <button class="message-bubble message-bubble-sent message-media">
                    <div class="media-content">
                        <svg width="10" height="15" viewBox="0 0 35 39" fill="white">
                            <path d="M0 5.54924V33.4508C0 37.2749 4.11828 39.6835 7.4513 37.8086L32.2527 23.8579C35.6509 21.9464 35.6509 17.0536 32.2527 15.1421L7.45131 1.19136C4.11829 -0.683463 0 1.72511 0 5.54924Z"></path>
                        </svg>
                        <span class="media-text">Foto</span>
                    </div>
                    <div class="media-icon">
                        <svg width="17" height="17" viewBox="0 0 66 64" fill="white">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959Z"></path>
                        </svg>
                    </div>
                </button>
            `;
        }
        
        return row;
    }

    function createVideoMessage(received, chatIndex) {
        const row = document.createElement('div');
        row.className = received ? 'message-row message-received' : 'message-row message-sent';
        
        if (received) {
            row.innerHTML = `
                <div class="message-avatar">
                    <img src="${getProfilePic(chatIndex)}" alt="" loading="lazy" width="32" height="32" class="message-avatar-img">
                </div>
                <button class="message-bubble message-bubble-received message-media">
                    <div class="media-content">
                        <svg width="10" height="15" viewBox="0 0 35 39" fill="white">
                            <path d="M0 5.54924V33.4508C0 37.2749 4.11828 39.6835 7.4513 37.8086L32.2527 23.8579C35.6509 21.9464 35.6509 17.0536 32.2527 15.1421L7.45131 1.19136C4.11829 -0.683463 0 1.72511 0 5.54924Z"></path>
                        </svg>
                        <span class="media-text">Vídeo</span>
                    </div>
                    <div class="media-icon">
                        <svg width="17" height="17" viewBox="0 0 66 64" fill="white">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959Z"></path>
                        </svg>
                    </div>
                </button>
            `;
        } else {
            row.innerHTML = `
                <button class="message-bubble message-bubble-sent message-media">
                    <div class="media-content">
                        <svg width="10" height="15" viewBox="0 0 35 39" fill="white">
                            <path d="M0 5.54924V33.4508C0 37.2749 4.11828 39.6835 7.4513 37.8086L32.2527 23.8579C35.6509 21.9464 35.6509 17.0536 32.2527 15.1421L7.45131 1.19136C4.11829 -0.683463 0 1.72511 0 5.54924Z"></path>
                        </svg>
                        <span class="media-text">Vídeo</span>
                    </div>
                    <div class="media-icon">
                        <svg width="17" height="17" viewBox="0 0 66 64" fill="white">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959Z"></path>
                        </svg>
                    </div>
                </button>
            `;
        }
        
        return row;
    }

    function getProfilePic(chatIndex) {
        const currentUsername = localStorage.getItem('username');
        const userId = localStorage.getItem('userId') || localStorage.getItem('userPk');
        const followersKey = userId ? `followers_${userId}` : `followers_${currentUsername}`;
        
        try {
            const profilesRaw = localStorage.getItem(followersKey);
            if (profilesRaw) {
                const profiles = JSON.parse(profilesRaw);
                const profile = profiles[chatIndex];
                if (profile) {
                    const profilePic = profile.profile_pic_url || profile.profile_pic_url_hd || '';
                    return typeof getProxyUrl === 'function' && profilePic
                        ? getProxyUrl(profilePic, 128)
                        : profilePic || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%23gray"/%3E%3C/svg%3E';
                }
            }
        } catch (e) {
            console.error('Erro ao buscar profile pic:', e);
        }
        
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%23gray"/%3E%3C/svg%3E';
    }
    
    // Função removida - deixando o CSS ajustar naturalmente a largura das mensagens
});

