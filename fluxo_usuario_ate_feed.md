# FLUXO DO USUÁRIO ATÉ CHEGAR NO FEED

## 📋 RESUMO DAS ETAPAS

Baseado na análise do código, o usuário percorre as seguintes etapas antes de chegar no feed:

---

## ETAPA 1: Página Inicial (Landing Page)
**URL:** `/` (index.html)

**Descrição:**
- Página inicial do site DeepGram
- Exibe um card central com:
  - Logo do projeto
  - Título: "O que realmente ele(a) faz quando tá no Insta?"
  - Subtítulo: "Descubra a verdade sobre qualquer pessoa do Instagram. Só com o @."
  - Botão principal: **"Espionar Agora"**
  - Badge: "100% Anônimo. A pessoa **NUNCA** saberá."
  - Contador: "+8.485 perfis analisados hoje"

**Ações do Usuário:**
- Usuário visualiza a landing page
- Usuário clica no botão **"Espionar Agora"**

**Ações em Background (JavaScript):**
- Sistema busca localização do usuário automaticamente (via APIs de geolocalização IP)
- Salva localização no localStorage para uso posterior
- Não bloqueia a navegação

---

## ETAPA 2: Página de Pitch/Vendas (CTA)
**URL:** `/pitch/[username]` ou `/cta` (home.html)

**Descrição:**
- Página de vendas mostrando:
  - "Acesso completo ao perfil de: @andre.menegon" (ou outro username)
  - Estatísticas do perfil (posts, seguidores, seguindo)
  - Destaque: "Sem precisar de senha. Sem deixar rastros. Sem que a pessoa saiba."
  - Banner com contador regressivo: "Seu Acesso Exclusivo Expira em: 05:00"
  - Seções mostrando funcionalidades:
    - Todas as mídias recebidas e enviadas
    - Localização em tempo real
    - Stories e posts ocultos
    - Mensagens privadas (Directs)
  - Planos de pagamento (R$ 39,90 ou R$ 59,90)

**Observação:** 
- Esta etapa pode aparecer ANTES do feed para usuários não pagos
- Usuários que já pesquisaram podem ver um popup: "Você já pesquisou um @ em nossa ferramenta, pra ter acesso completo ao perfil ou poder pesquisar outro @ adquira algum plano."

---

## ETAPA 3: Redirecionamento para Feed
**URL:** `/feed/[username]` → redirecionado para `/feed`

**Descrição:**
- Quando o usuário acessa `/feed/[username]`, o servidor redireciona automaticamente para `/feed`
- Código no server.js linha 137-138:
  ```javascript
  app.get('/feed/:username', (req, res) => {
    res.redirect('/feed');
  });
  ```

**Interceptação no Cliente:**
- Código JavaScript na página intercepta redirecionamentos para `/feed/[username]` e força redirecionamento para `/feed` apenas
- Linhas 160-199 do index.html

---

## ETAPA 4: Feed Principal
**URL:** `/feed` (feed.html)

**Descrição:**
- Página final que simula o feed do Instagram
- Contém:
  - Header com logo Instagram e botões de ações (curtidas, directs)
  - Stories (histórias) horizontais
  - Posts do feed com:
    - Imagens (algumas com conteúdo restrito/bloqueado)
    - Interações (curtidas, comentários, reposts, enviar)
    - Comentários (com blur para conteúdo restrito)
  - Barra de navegação inferior (home, buscar, adicionar, reels, perfil)

**Funcionalidades no Feed:**
- Banners de bloqueio para conteúdo restrito
- Popup de bloqueio: "No momento o seu acesso só permite visualização do conteúdo. Para poder mexer e ver de forma completa adquira a ferramenta do DeepGram."
- Botão "Tornar-se VIP" que redireciona para `/cta`

---

## 🔄 FLUXO COMPLETO EM DIAGRAMA

```
┌─────────────────────────────────────┐
│   ETAPA 1: Página Inicial (/)      │
│   - Landing page                    │
│   - Botão "Espionar Agora"          │
│   - Busca localização (background)  │
└──────────────┬──────────────────────┘
               │
               │ [Clique no botão]
               ▼
┌─────────────────────────────────────┐
│   ETAPA 2: Página Pitch/CTA         │
│   /pitch/[username] ou /cta         │
│   - Apresentação de funcionalidades │
│   - Planos de pagamento             │
│   - Contador regressivo             │
└──────────────┬──────────────────────┘
               │
               │ [Redirecionamento]
               │ (pode ser automático
               │  ou após pesquisa)
               ▼
┌─────────────────────────────────────┐
│   ETAPA 3: Redirecionamento         │
│   /feed/[username]                  │
│   → Redirecionado para /feed        │
└──────────────┬──────────────────────┘
               │
               │ [Acesso final]
               ▼
┌─────────────────────────────────────┐
│   ETAPA 4: Feed Principal           │
│   /feed (feed.html)                 │
│   - Stories                         │
│   - Posts                           │
│   - Conteúdo restrito (bloqueado)   │
└─────────────────────────────────────┘
```

---

## 📝 DETALHES TÉCNICOS

### Interceptações e Redirecionamentos

1. **No Cliente (index.html):**
   - Intercepta `window.location.replace`
   - Intercepta `window.location.assign`
   - Intercepta `router.push` do Next.js
   - Todos convertem `/feed/[username]` para `/feed`

2. **No Servidor (server.js):**
   - Rota `/feed/:username` → redireciona para `/feed`
   - Rota `/feed` → serve `feed.html`
   - Rota `/cta` → serve `home.html` (página de vendas)

### Coleta de Dados

- **Localização:** Buscada automaticamente ao carregar a página inicial
- **UTM Parameters:** Capturados e salvos no localStorage
- **Cache:** Perfil do usuário e outros dados salvos no localStorage

---

## 🎯 RESUMO DAS ETAPAS

1. **Landing Page** (`/`) - Usuário vê proposta e clica "Espionar Agora"
2. **Pitch/CTA** (`/pitch/[username]` ou `/cta`) - Página de vendas com planos
3. **Redirecionamento** (`/feed/[username]` → `/feed`) - Processo automático
4. **Feed** (`/feed`) - Feed principal com conteúdo (parcialmente bloqueado)

**Nota:** Pode haver variações neste fluxo dependendo se o usuário já pesquisou um perfil antes ou se é a primeira visita.

