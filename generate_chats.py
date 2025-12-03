#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Dados dos 15 chats
chats = [
    {
        "name": "Maria",
        "avatar": "/_next/image?url=/home - chat/fotos/chat2-1.png&w=128&q=75",
        "message": "Preciso falar contigo parada séria veiii",
        "time": "1 min",
        "verified": True,
        "online": True,
        "blurred": False,
        "locked": False,
        "clickable": True,
        "camera": False
    },
    {
        "name": "Wendel Da Costa Neves",
        "avatar": "",
        "message": "1 novas mensagens",
        "time": "8 min",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": False,
        "clickable": False,
        "camera": True
    },
    {
        "name": "Lucas Barbosa",
        "avatar": "",
        "message": "vazou tudo kkkkk",
        "time": "23 min",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": False,
        "clickable": False,
        "camera": True
    },
    {
        "name": "Lucas",
        "avatar": "/_next/image?url=/home - chat/fotos/chat1.png&w=128&q=75",
        "message": "Oi, você já chegou?",
        "time": "47 min",
        "verified": True,
        "online": True,
        "blurred": False,
        "locked": False,
        "clickable": True,
        "camera": False
    },
    {
        "name": "João",
        "avatar": "/_next/image?url=/home - chat/fotos/chat2.png&w=128&q=75",
        "message": "eii, tá aí?🔥",
        "time": "1 h",
        "verified": True,
        "online": False,
        "blurred": False,
        "locked": False,
        "clickable": True,
        "camera": False
    },
    {
        "name": "Rodrigo Lemes",
        "avatar": "",
        "message": "Oii delícia, perdão pela demora estava tomando",
        "time": "3 h",
        "verified": False,
        "online": True,
        "blurred": True,
        "locked": False,
        "clickable": False,
        "camera": True
    },
    {
        "name": "marcelo rici",
        "avatar": "",
        "message": "3 novas mensagens",
        "time": "7 h",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": False,
        "clickable": False,
        "camera": True
    },
    {
        "name": "Igor Belasque de Castro",
        "avatar": "",
        "message": "🔥🔥",
        "time": "14 h",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": False,
        "clickable": False,
        "camera": True
    },
    {
        "name": "**********",
        "avatar": "",
        "message": "Reagiu a sua mensagem: ❤️",
        "time": "22 h",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": True,
        "clickable": False,
        "camera": True
    },
    {
        "name": "**********",
        "avatar": "",
        "message": "Enviado X feira",
        "time": "1 d",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": True,
        "clickable": False,
        "camera": True
    },
    {
        "name": "**********",
        "avatar": "",
        "message": "Delícia você 😈 😈",
        "time": "2 d",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": True,
        "clickable": False,
        "camera": True
    },
    {
        "name": "**********",
        "avatar": "",
        "message": "Curtiu sua mensagem",
        "time": "3 d",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": True,
        "clickable": False,
        "camera": True
    },
    {
        "name": "**********",
        "avatar": "",
        "message": "Enviado X feira",
        "time": "5 d",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": True,
        "clickable": False,
        "camera": True
    },
    {
        "name": "**********",
        "avatar": "",
        "message": "Ah sim entendi",
        "time": "1 sem",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": True,
        "clickable": False,
        "camera": True
    },
    {
        "name": "**********",
        "avatar": "",
        "message": "😈😈",
        "time": "2 sem",
        "verified": False,
        "online": False,
        "blurred": True,
        "locked": True,
        "clickable": False,
        "camera": True
    }
]

# SVG icons
verified_svg = '<svg width="18" height="18" viewBox="0 0 40 40"><path fill="#0095F6" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"></path></svg>'

lock_svg = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 21.6px; height: 21.6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>'

camera_svg = '<svg width="24" height="24" viewBox="0 0 66 64" fill="none" class="chat-camera-icon"><path fill-rule="evenodd" clip-rule="evenodd" d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959ZM43.216 9.57496C44.622 12.66 48.789 15 52.878 15C54.903 15 56.518 15.843 57.927 17.635C59.831 20.055 60 21.594 60 36.524C60 59.297 62.313 57.5 33.052 57.5C3.655 57.5 6 59.35 6 36.204C6 20.562 6.122 19.499 8.174 17.314C9.469 15.936 11.511 15 13.224 15C17.15 15 21.289 12.696 22.954 9.58496C24.282 7.10396 24.693 6.99996 33.19 6.99996C41.731 6.99996 42.084 7.09096 43.216 9.57496ZM27 19.722C15.76 23.945 13.183 40.493 22.611 47.908C30.698 54.27 42.974 51.753 47.612 42.783C51.201 35.844 48.564 25.701 42.015 21.25C38.771 19.046 30.925 18.247 27 19.722ZM40.077 27.923C46.612 34.459 42.201 45.273 33 45.273C23.799 45.273 19.388 34.459 25.923 27.923C30.039 23.807 35.961 23.807 40.077 27.923Z" fill="white"></path></svg>'

html_output = '''        <!-- Messages List -->
        <div class="px-4 pb-16" id="messagesList">
            
'''

for i, chat in enumerate(chats, 1):
    clickable_class = " clickable" if chat["clickable"] else ""
    blur_class = " blurred" if chat["blurred"] or chat["locked"] else ""
    message_blur = ' class="chat-message-content blurred"' if (chat["blurred"] or chat["locked"]) else ' class="chat-message-content"'
    
    html_output += f'''            <!-- ========== CHAT {i}: {chat["name"]} ========== -->
            <div class="chat-item{clickable_class}">
                <div class="chat-avatar-container">
                    <div class="chat-avatar-wrapper{blur_class}">
                        <div class="chat-avatar-inner">
                            <img class="chat-avatar" src="{chat["avatar"]}" alt="{chat["name"]}" loading="lazy" width="56" height="56" decoding="async">
                        </div>
                    </div>
'''
    
    # Lock overlay (apenas para bloqueados/blurred)
    if chat["blurred"] or chat["locked"]:
        html_output += f'''                    <div class="chat-lock-overlay">
                        {lock_svg}
                    </div>
'''
    
    # Online indicator
    if chat["online"]:
        html_output += '''                    <div class="chat-online-indicator"></div>
'''
    
    html_output += '''                </div>
                
                <div class="chat-content">
                    <div class="chat-header">
                        <h3 class="chat-name">''' + chat["name"] + '''</h3>
'''
    
    # Verified badge
    if chat["verified"]:
        html_output += f'''                        <span style="display: inline-flex; margin-left: 4px;">{verified_svg}</span>
'''
    
    html_output += '''                    </div>
                    <div class="chat-message-row">
                        <div class="chat-message-text">
                            <span''' + message_blur + '''>''' + chat["message"] + '''</span>
                            <span class="chat-time"> • ''' + chat["time"] + '''</span>
                        </div>
                    </div>
                </div>
'''
    
    # Camera icon
    if chat["camera"]:
        html_output += f'''                
                <div class="chat-icons">
                    {camera_svg}
                </div>
'''
    
    html_output += '''            </div>

'''

html_output += '''        </div>'''

print(html_output)
