// Dados das mensagens (mesmas URLs do HTML original)
const messagesData = [
    {
        id: 1,
        username: "l*****",
        fullName: "Lucas",
        avatar: "/home - chat/fotos/chat1.png",
        lastMessage: "Oi, você já chegou?",
        time: "8 h",
        unread: true,
        online: true,
        verified: true,
        blurred: false
    },
    {
        id: 2,
        username: "j*****",
        fullName: "João",
        avatar: "/home - chat/fotos/chat2.png",
        lastMessage: "eii, tá aí?🔥",
        time: "5 h",
        unread: true,
        online: false,
        verified: true,
        blurred: false
    },
    {
        id: 3,
        username: "m*****",
        fullName: "Maria",
        avatar: "/home - chat/fotos/chat2-1.png",
        lastMessage: "preciso falar contigo parada séria",
        time: "19 min",
        unread: true,
        online: true,
        verified: true,
        blurred: false
        // Esta mensagem NÃO tem cursor-pointer no original
    },
    {
        id: 4,
        username: "w*****",
        fullName: "Wendel Da Costa Neves",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/459529566_1743818203040477_3798857640595357453_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDAuYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=uIM6IQhHkPAQ7kNvwH81P_R&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GF7dYxvdiotQ-jEGAA3-9pvlQLg0bkULAAAB1501500j-ccb7-5&oh=00_Afim4jq-atzoTaGwdRMXXsDkha54zDXyTymfxNUC0exfgA&oe=6923AFC7&_nc_sid=ce9561",
        lastMessage: "1 novas mensagens",
        time: "3 min",
        unread: false,
        online: false,
        verified: false,
        blurred: true
    },
    {
        id: 5,
        username: "j*****",
        fullName: "Jhow.adolf",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/520287826_17871779235401533_5096651832106473216_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=Ya1FBU0k2-IQ7kNvwGbLDZg&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GFL2Ah89j9TcSX4-AADXjIzW8bpGbmNDAQAB1501500j-ccb7-5&oh=00_AfjJ1yXfTqbmOJ6vorFY4pdVT9Cgf81XIC1Vh4WtRbz4Rg&oe=6923CC0F&_nc_sid=ce9561",
        lastMessage: "tão falando de voce viu kkk sob.....",
        time: "1 h",
        unread: false,
        online: false,
        verified: false,
        blurred: false,
        locked: true
    },
    {
        id: 6,
        username: "l*****",
        fullName: "Lucas Barbosa",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/431606186_1098948041527091_1058969948976854147_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=PYh88QtuFoYQ7kNvwFV46Si&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GKrJuRkzT6THfOcDAIM0lNSON7IObkULAAAB1501500j-ccb7-5&oh=00_AfiTswi4DeSL3QZEL16F2S-eIfEmJzr7AyH0YBfadLTUxw&oe=6923AD93&_nc_sid=ce9561",
        lastMessage: "vazou tudo kkkkk",
        time: "5 h",
        unread: false,
        online: false,
        verified: false,
        blurred: true
    },
    {
        id: 7,
        username: "r*****",
        fullName: "Rodrigo Lemes",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/532546559_18292084498251273_1715336688088979303_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=Tvuu4jtS5cgQ7kNvwFNNN90&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GP8Dvh8JPrjOjfxAAGcXvSuhGc4XbmNDAQAB1501500j-ccb7-5&oh=00_AfgovyzpiTfCsxs8DaLvfGjztSQSLXVINM-uaqLLKc6uNA&oe=6923ACED&_nc_sid=ce9561",
        lastMessage: "desculpa a demora estava...",
        time: "3 h",
        unread: false,
        online: true,
        verified: false,
        blurred: true
    },
    {
        id: 8,
        username: "m*****",
        fullName: "marcelo rici",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/543662182_17919118383119832_1644257086702263408_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby44MjguYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=vPWZM_8z3xQQ7kNvwGJIQ9d&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GGagZyDY-endV6k-AHCcTtQbk9EWbmNDAQAB1501500j-ccb7-5&oh=00_AfgCBzSZcYGe1fMXYYZMuWChW5xAjaJwWn383MGK8_ErRA&oe=69239D99&_nc_sid=ce9561",
        lastMessage: "3 novas mensagens",
        time: "4 h",
        unread: true,
        online: false,
        verified: false,
        blurred: true
    },
    {
        id: 9,
        username: "a*****",
        fullName: "Gabriel Alencar",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/239610592_272476944315110_7320251277990173446_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=IUlyYwc2DIQQ7kNvwFxPDps&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GOAqSA7msnn70PcAAAYbNMPAwZZlbkULAAAB1501500j-ccb7-5&oh=00_AfiGtBiVr0N01-Kx3zGEv8uQDUZQlUwixryy1zwByg7LYQ&oe=6923A364&_nc_sid=ce9561",
        lastMessage: "3 novas mensagens",
        time: "6 h",
        unread: true,
        online: false,
        verified: false,
        blurred: true,
        locked: true
    },
    {
        id: 10,
        username: "i*****",
        fullName: "Igor Belasque de Castro",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/453850189_1049609309862107_3241352671746022878_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby44MjguYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=CDuvAiyzm8gQ7kNvwFjGALu&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GE00DRvbOBE2nboDAN5dL98UmfssbkULAAAB1501500j-ccb7-5&oh=00_AfgEqwCmnFAOTMMqzBteDcnD3hrKFigH9wPJD1M69bs-Og&oe=6923AE17&_nc_sid=ce9561",
        lastMessage: "🔥🔥",
        time: "5 h",
        unread: false,
        online: false,
        verified: false,
        blurred: true
    }
];

// Dados dos stories (mesmas URLs do HTML original)
const storiesData = [
    {
        id: 1,
        username: "andre.menegon",
        avatar: "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-19/469280503_618774417244536_6789387411220436489_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ams2-1.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QE3PDz7pXVIHKpeFgw--_2C2I_TRcHcs0G6hdkT2CRs3WsQ6SEHVsjLx0FS36HxO3c&_nc_ohc=MuL8LYn7GsQQ7kNvwFEAnPE&_nc_gid=8nkVJHT_-bd0N7I0PA-clg&edm=AO4kU9EBAAAA&ccb=7-5&ig_cache_key=GPem_Bt4AValxTICAAmWTfjgvzhebkULAAAB0j-ccb7-5&oh=00_Afh3pBPqPiniHhkxnIBsDWWnCX63firRAGmiClTNqv9Mtw&oe=6923BAB4&_nc_sid=164c1d",
        label: "Conte as novidades",
        blurred: false,
        isOwn: true
    },
    {
        id: 2,
        username: "w*****",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/459529566_1743818203040477_3798857640595357453_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDAuYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=uIM6IQhHkPAQ7kNvwH81P_R&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GF7dYxvdiotQ-jEGAA3-9pvlQLg0bkULAAAB1501500j-ccb7-5&oh=00_Afim4jq-atzoTaGwdRMXXsDkha54zDXyTymfxNUC0exfgA&oe=6923AFC7&_nc_sid=ce9561",
        label: "de olho 👀",
        blurred: true
    },
    {
        id: 3,
        username: "j*****",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/520287826_17871779235401533_5096651832106473216_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=Ya1FBU0k2-IQ7kNvwGbLDZg&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GFL2Ah89j9TcSX4-AADXjIzW8bpGbmNDAQAB1501500j-ccb7-5&oh=00_AfjJ1yXfTqbmOJ6vorFY4pdVT9Cgf81XIC1Vh4WtRbz4Rg&oe=6923CC0F&_nc_sid=ce9561",
        label: "ai gente não aguento mais",
        blurred: true
    },
    {
        id: 4,
        username: "l*****",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/431606186_1098948041527091_1058969948976854147_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=PYh88QtuFoYQ7kNvwFV46Si&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GKrJuRkzT6THfOcDAIM0lNSON7IObkULAAAB1501500j-ccb7-5&oh=00_AfiTswi4DeSL3QZEL16F2S-eIfEmJzr7AyH0YBfadLTUxw&oe=6923AD93&_nc_sid=ce9561",
        label: "queria fazer tal coisa..",
        blurred: true
    },
    {
        id: 5,
        username: "r*****",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/532546559_18292084498251273_1715336688088979303_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=Tvuu4jtS5cgQ7kNvwFNNN90&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GP8Dvh8JPrjOjfxAAGcXvSuhGc4XbmNDAQAB1501500j-ccb7-5&oh=00_AfgovyzpiTfCsxs8DaLvfGjztSQSLXVINM-uaqLLKc6uNA&oe=6923ACED&_nc_sid=ce9561",
        label: "q tédio",
        blurred: true
    },
    {
        id: 6,
        username: "m*****",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/543662182_17919118383119832_1644257086702263408_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby44MjguYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=vPWZM_8z3xQQ7kNvwGJIQ9d&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GGagZyDY-endV6k-AHCcTtQbk9EWbmNDAQAB1501500j-ccb7-5&oh=00_AfgCBzSZcYGe1fMXYYZMuWChW5xAjaJwWn383MGK8_ErRA&oe=69239D99&_nc_sid=ce9561",
        label: "pensando...",
        blurred: true
    },
    {
        id: 7,
        username: "a*****",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/239610592_272476944315110_7320251277990173446_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=IUlyYwc2DIQQ7kNvwFxPDps&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GOAqSA7msnn70PcAAAYbNMPAwZZlbkULAAAB1501500j-ccb7-5&oh=00_AfiGtBiVr0N01-Kx3zGEv8uQDUZQlUwixryy1zwByg7LYQ&oe=6923A364&_nc_sid=ce9561",
        label: "alguém??",
        blurred: true
    },
    {
        id: 8,
        username: "i*****",
        avatar: "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/453850189_1049609309862107_3241352671746022878_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby44MjguYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QEjKLoJBuXnSaNSc_gfuOS_coAgm1xMThwJCjV9EcSe2_XZiArhQY_C2TH3I70-cH4&_nc_ohc=CDuvAiyzm8gQ7kNvwFjGALu&_nc_gid=O8AsL33CeLi_yWSpvR6CgA&edm=ALB854YBAAAA&ccb=7-5&ig_cache_key=GE00DRvbOBE2nboDAN5dL98UmfssbkULAAAB1501500j-ccb7-5&oh=00_AfgEqwCmnFAOTMMqzBteDcnD3hrKFigH9wPJD1M69bs-Og&oe=6923AE17&_nc_sid=ce9561",
        label: "Que musica top 🔥",
        blurred: true
    }
];

// Função para obter URL da imagem
// Usa o endpoint /_next/image do servidor (que é um proxy Express, não Next.js)
// Se o proxy falhar, usa URL direta (como o feed faz quando funciona)
function getImageUrl(url, width = 128) {
    if (!url) return '';
    
    // Se for caminho local, usar o proxy do servidor
    if (url.startsWith('/home')) {
        return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
    }
    
    // Para URLs do Instagram CDN, usar URL DIRETA (como o feed faz)
    // O navegador pode acessar diretamente, evitando problemas de proxy
    if (url.includes('cdninstagram.com') && url.startsWith('http')) {
        // Usar URL direta - o navegador consegue carregar diretamente do CDN do Instagram
        return url;
    }
    
    return url;
}

// Função para gerar srcset (igual ao original)
function getSrcset(url) {
    if (!url) return '';
    
    // Gerar srcset com 1x e 2x como no original
    const url64 = getImageUrl(url, 64);
    const url128 = getImageUrl(url, 128);
    
    return `${url64} 1x, ${url128} 2x`;
}

// Função para renderizar stories (exatamente como no HTML original)
function renderStories() {
    const container = document.getElementById('storiesContainer');
    if (!container) return;

    storiesData.forEach((story, index) => {
        const isLast = index === storiesData.length - 1;
        const storyElement = document.createElement('div');
        // No original, há um espaço extra no final da classe
        storyElement.className = `flex-shrink-0 text-center relative ${isLast ? 'pr-8' : ''} `;
        
        if (story.isOwn) {
            // Story próprio (sem botão)
            storyElement.innerHTML = `
                <div class="relative w-fit mx-auto pt-10">
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                        <div class="relative text-center" style="background-color: rgb(43, 48, 54); padding: 6px 10px; border-radius: 12px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 6px; max-width: 90px;">
                            <span class="block" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: rgb(255, 255, 255); line-height: 1.2;">${story.label}</span>
                        </div>
                    </div>
                    <div class="mx-auto rounded-full border-2 border-gray-200 overflow-hidden relative" style="width: 64px; height: 64px; z-index: 1;">
                        <img alt="${story.username}" loading="lazy" width="64" height="64" decoding="async" data-nimg="1" class="w-full h-full object-cover" srcset="${getSrcset(story.avatar)}" src="${getImageUrl(story.avatar, 128)}" style="color: transparent;">
                    </div>
                    <p class="text-center text-sm text-gray-200 mt-1 w-16 truncate">${story.username}</p>
                </div>
            `;
        } else {
            // Story de outros (com botão)
            const labelClass = story.blurred ? 'block blur-sm select-none' : 'block';
            storyElement.innerHTML = `
                <button class="relative w-fit mx-auto pt-10 cursor-pointer">
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                        <div class="relative text-center" style="background-color: rgb(43, 48, 54); padding: 6px 10px; border-radius: 12px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 6px; max-width: 90px;">
                            <span class="${labelClass}" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: rgb(255, 255, 255); line-height: 1.2;">${story.label}</span>
                        </div>
                    </div>
                    <div class="mx-auto rounded-full overflow-hidden relative" style="width: 64px; height: 64px; z-index: 1;">
                        <img alt="${story.username}" loading="lazy" width="64" height="64" decoding="async" data-nimg="1" class="w-full h-full object-cover" srcset="${getSrcset(story.avatar)}" src="${getImageUrl(story.avatar, 128)}" style="color: transparent;">
                    </div>
                    <p class="text-center text-sm text-gray-200 mt-1 w-16 truncate" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif;">${story.username}</p>
                </button>
            `;
        }
        
        container.appendChild(storyElement);
    });
}

// Função para renderizar mensagens (exatamente como no HTML original)
function renderMessages() {
    const container = document.getElementById('messagesList');
    if (!container) return;

    messagesData.forEach(message => {
        const messageElement = document.createElement('div');
        // Verificar quais mensagens têm cursor-pointer no original
        // Apenas as 2 primeiras têm cursor-pointer
        const hasCursor = message.id <= 2;
        messageElement.className = hasCursor 
            ? `flex items-center py-3 cursor-pointer transition-colors duration-150`
            : `flex items-center py-3  transition-colors duration-150`;
        
        const imgClasses = message.locked ? 'w-full h-full object-cover blur-sm' : 'w-full h-full object-cover';
        const onlineIndicator = message.online ? `<div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 rounded-full" style="border-color: rgb(11, 16, 20);"></div>` : '';
        const unreadIndicator = message.unread ? `<div class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: rgb(81, 122, 255);"></div>` : '';
        const verifiedBadge = message.verified ? `
            <svg width="24" height="24" viewBox="0 0 66 64" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959ZM43.216 9.57496C44.622 12.66 48.789 15 52.878 15C54.903 15 56.518 15.843 57.927 17.635C59.831 20.055 60 21.594 60 36.524C60 59.297 62.313 57.5 33.052 57.5C3.655 57.5 6 59.35 6 36.204C6 20.562 6.122 19.499 8.174 17.314C9.469 15.936 11.511 15 13.224 15C17.15 15 21.289 12.696 22.954 9.58496C24.282 7.10396 24.693 6.99996 33.19 6.99996C41.731 6.99996 42.084 7.09096 43.216 9.57496ZM27 19.722C15.76 23.945 13.183 40.493 22.611 47.908C30.698 54.27 42.974 51.753 47.612 42.783C51.201 35.844 48.564 25.701 42.015 21.25C38.771 19.046 30.925 18.247 27 19.722ZM40.077 27.923C46.612 34.459 42.201 45.273 33 45.273C23.799 45.273 19.388 34.459 25.923 27.923C30.039 23.807 35.961 23.807 40.077 27.923Z" fill="white"></path>
            </svg>
        ` : '';
        
        // No original, quando não há blur, a classe é vazia (class="")
        // Quando há blur, a classe é "blur-sm"
        const messageTextClass = message.blurred ? 'blur-sm' : '';
        // O style é sempre o mesmo (branco, bold)
        const messageTextStyle = 'color: rgb(255, 255, 255); font-weight: 700;';
        
        const lockedOverlay = message.locked ? `
            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
            </div>
        ` : '';
        
        // Para mensagens locked, o online indicator vai depois do avatar wrapper
        const onlineIndicatorForLocked = message.locked && message.online 
            ? `<div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 rounded-full" style="border-color: rgb(11, 16, 20);"></div>` 
            : '';
        
        // Estrutura exata do HTML original
        const avatarWrapper = message.locked 
            ? `<div class="relative mr-3"><div class="relative w-14 h-14"><div class="w-full h-full rounded-full overflow-hidden relative"><img alt="${message.fullName}" loading="lazy" width="56" height="56" decoding="async" data-nimg="1" class="${imgClasses}" srcset="${getSrcset(message.avatar)}" src="${getImageUrl(message.avatar, 128)}" style="color: transparent;">${lockedOverlay}</div></div>${onlineIndicatorForLocked}</div>`
            : `<div class="relative mr-3"><div class="relative w-14 h-14"><div class="w-full h-full rounded-full overflow-hidden"><img alt="${message.fullName}" loading="lazy" width="56" height="56" decoding="async" data-nimg="1" class="${imgClasses}" srcset="${getSrcset(message.avatar)}" src="${getImageUrl(message.avatar, 128)}" style="color: transparent;"></div></div>${onlineIndicator}</div>`;
        
        messageElement.innerHTML = `
            ${avatarWrapper}
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-gray-200 truncate" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif; font-size: 15px;">${message.username}</h3>
                </div>
                <div class="flex items-center">
                    <p class="text-sm truncate mr-2" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif; font-size: 13px;">
                        <span class="${messageTextClass}" style="${messageTextStyle}">${message.lastMessage}</span>
                        <span style="color: rgb(142, 147, 153); font-weight: 400;"> • ${message.time}</span>
                    </p>
                </div>
            </div>
            <div class="flex items-center space-x-2 ml-3 flex-shrink-0">
                ${unreadIndicator}
                ${verifiedBadge}
            </div>
        `;
        
        // Adicionar evento de clique
        if (hasCursor) {
            messageElement.addEventListener('click', () => {
                console.log('Mensagem clicada:', message.id);
            });
        }
        
        container.appendChild(messageElement);
    });
}

// Função para inicializar
function init() {
    renderStories();
    renderMessages();
    
    // Adicionar evento ao botão de voltar
    const backButton = document.querySelector('button[aria-label="Voltar"]');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
