#!/usr/bin/env python3
"""Script simples para capturar API do IAStalker"""

import json
import asyncio
from datetime import datetime
from playwright.async_api import async_playwright

URL = "https://iastalker.com.br/congrats-plus"
USERNAME = "andre.menegon"
MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"

requests_data = []
api_keys = {}

async def run():
    from pathlib import Path
    
    async with async_playwright() as p:
        # Usar o perfil do Chrome pessoal do usuário
        chrome_user_data = Path.home() / "Library/Application Support/Google/Chrome"
        
        print("🔌 Usando seu Chrome pessoal...")
        
        # Tentar conectar ao Chrome existente primeiro
        try:
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            contexts = browser.contexts
            ctx = contexts[0] if contexts else await browser.new_context(
                user_agent=MOBILE_UA,
                viewport={'width': 375, 'height': 812},
                device_scale_factor=2,
                is_mobile=True,
                has_touch=True,
                locale='pt-BR',
                timezone_id='America/Sao_Paulo',
                extra_http_headers={
                    'Accept-Language': 'pt-BR,pt;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                }
            )
            pages = ctx.pages
            page = pages[0] if pages else await ctx.new_page()
            print("✅ Conectado ao Chrome existente")
        except:
            # Usar launch_persistent_context para usar o perfil real do Chrome
            print("🚀 Abrindo seu Chrome pessoal...")
            try:
                # Usar o perfil real do Chrome do usuário
                ctx = await p.chromium.launch_persistent_context(
                    user_data_dir=str(chrome_user_data),
                    headless=False,
                    channel="chrome",
                    args=['--user-agent=' + MOBILE_UA],
                    ignore_default_args=['--disable-extensions'],  # Manter extensões
                    user_agent=MOBILE_UA,
                    viewport={'width': 375, 'height': 812},
                    device_scale_factor=2,
                    is_mobile=True,
                    has_touch=True,
                    locale='pt-BR',
                    timezone_id='America/Sao_Paulo',
                    extra_http_headers={
                        'Accept-Language': 'pt-BR,pt;q=0.9',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'none',
                        'Sec-Fetch-User': '?1',
                    }
                )
                page = await ctx.new_page()
                print("✅ Seu Chrome pessoal aberto em modo MOBILE")
            except Exception as e:
                print(f"⚠️ Erro: {e}")
                # Fallback
                browser = await p.chromium.launch(headless=False, channel="chrome")
                ctx = await browser.new_context(
                    user_agent=MOBILE_UA,
                    viewport={'width': 375, 'height': 812},
                    is_mobile=True
                )
                page = await ctx.new_page()
                print("✅ Chrome alternativo aberto")
        
        # Capturar requisições
        async def on_request(request):
            try:
                resp = await request.response()
                req = {
                    'url': request.url,
                    'method': request.method,
                    'headers': dict(request.headers),
                    'body': request.post_data,
                }
                if resp:
                    req['status'] = resp.status
                    req['resp_headers'] = dict(resp.headers)
                    try:
                        req['resp_body'] = await resp.text()
                    except:
                        pass
                
                # Verificar se é API
                if any(x in request.url for x in ['api', 'hiker', 'spyinsta', 'v1', 'v2', 'v3']):
                    print(f"🔑 API: {request.method} {request.url}")
                    # Extrair keys
                    for h, v in request.headers.items():
                        if any(k in h.lower() for k in ['key', 'token', 'auth', 'api']):
                            api_keys[request.url] = {h: v}
                            print(f"   🔑 {h}: {v}")
                
                requests_data.append(req)
            except:
                pass
        
        page.on('request', on_request)
        
        # Injetar JavaScript para parecer mais mobile
        await page.add_init_script("""
            Object.defineProperty(navigator, 'platform', {get: () => 'iPhone'});
            Object.defineProperty(navigator, 'maxTouchPoints', {get: () => 5});
            Object.defineProperty(navigator, 'hardwareConcurrency', {get: () => 6});
            Object.defineProperty(navigator, 'deviceMemory', {get: () => 4});
        """)
        
        # Executar ações
        print(f"🌐 Abrindo {URL}")
        await page.goto(URL, wait_until='networkidle', timeout=60000)
        await asyncio.sleep(2)
        
        # Clicar em "outro perfil"
        print("🔍 Clicando em 'outro perfil'...")
        btn = await page.query_selector("text=outro perfil") or await page.query_selector("text=Outro Perfil")
        if btn:
            await btn.click()
        await asyncio.sleep(0.5)
        
        # Digitar e pesquisar
        print(f"⌨️ Digitando {USERNAME}...")
        inp = await page.query_selector("input")
        if inp:
            await inp.fill(USERNAME)
            await asyncio.sleep(0.3)
            await inp.press("Enter")
        
        # Aguardar
        print("⏳ Capturando (10s)...")
        await asyncio.sleep(10)
        
        # Salvar
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        with open(f"iastalker_{ts}.json", "w") as f:
            json.dump(requests_data, f, indent=2)
        print(f"💾 Salvo: iastalker_{ts}.json")
        
        if api_keys:
            with open(f"iastalker_api_{ts}.txt", "w") as f:
                for url, keys in api_keys.items():
                    f.write(f"{url}\n")
                    for k, v in keys.items():
                        f.write(f"  {k}: {v}\n")
            print(f"🔑 API keys salvas!")
        
        await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(run())
