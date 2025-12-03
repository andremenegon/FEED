#!/usr/bin/env python3
"""
Captura rápida da API do IAStalker - modo mobile
"""

import json
import asyncio
from datetime import datetime
from playwright.async_api import async_playwright

URL = "https://iastalker.com.br/congrats-plus"
USERNAME = "andre.menegon"
MOBILE_USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"

captured_requests = []
api_keys = {}


def extract_api_keys(headers, url, body):
    keys = {}
    for name, value in headers.items():
        if any(k in name.lower() for k in ['auth', 'key', 'token', 'api', 'bearer', 'x-access', 'x-api']):
            keys[f"header_{name}"] = value
    return keys


async def run():
    global captured_requests, api_keys
    
    async with async_playwright() as p:
        print("🚀 Abrindo Chrome MOBILE rapidamente...")
        
        # PRIMEIRO: Tentar conectar ao Chrome existente
        print("🔌 Tentando conectar ao Chrome existente...")
        browser = None
        context = None
        page = None
        
        try:
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            print("✅ Conectado ao Chrome existente!")
            contexts = browser.contexts
            if contexts:
                context = contexts[0]
                print("✅ Usando contexto existente")
            else:
                context = await browser.new_context(
                    user_agent=MOBILE_USER_AGENT,
                    viewport={'width': 375, 'height': 812},
                    is_mobile=True,
                    has_touch=True
                )
            pages = context.pages
            page = pages[0] if pages else await context.new_page()
            print("✅ Usando página do Chrome existente")
        except Exception as e:
            print(f"❌ Não conseguiu conectar: {e}")
            print("🚀 Abrindo Chrome com remote debugging...")
            
            # Abrir Chrome com remote debugging
            import subprocess
            import os
            chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            if os.path.exists(chrome_path):
                subprocess.Popen([chrome_path, "--remote-debugging-port=9222", "--user-data-dir=/tmp/chrome-debug"])
                await asyncio.sleep(3)
                try:
                    browser = await p.chromium.connect_over_cdp("http://localhost:9222")
                    print("✅ Conectado ao Chrome recém-aberto!")
                    contexts = browser.contexts
                    context = contexts[0] if contexts else await browser.new_context(
                        user_agent=MOBILE_USER_AGENT,
                        viewport={'width': 375, 'height': 812},
                        is_mobile=True,
                        has_touch=True
                    )
                    pages = context.pages
                    page = pages[0] if pages else await context.new_page()
                except:
                    print("⚠️ Ainda não conectou, usando método alternativo...")
                    browser = await p.chromium.launch(
                        headless=False,
                        channel="chrome",
                        args=['--start-maximized', '--remote-debugging-port=9222']
                    )
                    context = await browser.new_context(
                        user_agent=MOBILE_USER_AGENT,
                        viewport={'width': 375, 'height': 812},
                        is_mobile=True,
                        has_touch=True
                    )
                    page = await context.new_page()
            else:
                browser = await p.chromium.launch(
                    headless=False,
                    channel="chrome",
                    args=['--start-maximized', '--remote-debugging-port=9222']
                )
                context = await browser.new_context(
                    user_agent=MOBILE_USER_AGENT,
                    viewport={'width': 375, 'height': 812},
                    is_mobile=True,
                    has_touch=True
                )
                page = await context.new_page()
        
        # Capturar requisições
        async def handle_request(request):
            try:
                response = await request.response()
                req_data = {
                    'url': request.url,
                    'method': request.method,
                    'headers': request.headers,
                    'post_data': request.post_data,
                }
                if response:
                    req_data['status'] = response.status
                    req_data['response_headers'] = response.headers
                    try:
                        req_data['response_body'] = await response.text()
                    except:
                        pass
                
                is_api = any(x in request.url for x in ['api', 'hiker', 'instagram', 'spyinsta', 'v1', 'v2', 'v3'])
                if is_api:
                    print(f"🔑 API: {request.method} {request.url}")
                    keys = extract_api_keys(request.headers, request.url, request.post_data)
                    if keys:
                        api_keys[request.url] = keys
                        print(f"   🔑 CHAVE: {keys}")
                
                captured_requests.append(req_data)
            except:
                pass
        
        page.on('request', handle_request)
        
        # NAVEGAR RAPIDAMENTE
        print(f"🌐 Abrindo: {URL}")
        await page.goto(URL, wait_until='domcontentloaded', timeout=30000)
        await asyncio.sleep(1)
        
        # CLICAR EM "OUTRO PERFIL" IMEDIATAMENTE
        print("🔍 Procurando botão 'outro perfil'...")
        try:
            # Tentar vários seletores
            button = await page.query_selector("text=outro perfil")
            if not button:
                button = await page.query_selector("text=Outro Perfil")
            if not button:
                button = await page.query_selector("text=OUTRO PERFIL")
            if not button:
                button = await page.query_selector("button:has-text('outro')")
            if not button:
                button = await page.query_selector("a:has-text('outro')")
            if not button:
                # Procurar qualquer botão/link que contenha "outro" ou "perfil"
                buttons = await page.query_selector_all("button, a, [role='button']")
                for btn in buttons:
                    text = (await btn.inner_text()).lower() if await btn.is_visible() else ""
                    if 'outro' in text or 'perfil' in text:
                        button = btn
                        break
            
            if button:
                print("✅ Clicando em 'outro perfil'...")
                await button.click()
                await asyncio.sleep(0.5)
            else:
                print("⚠️ Botão não encontrado, tentando clicar em qualquer botão...")
                buttons = await page.query_selector_all("button, a")
                if buttons:
                    await buttons[0].click()
                    await asyncio.sleep(0.5)
        except Exception as e:
            print(f"⚠️ Erro ao clicar: {e}")
        
        # DIGITAR USERNAME RAPIDAMENTE
        print(f"⌨️ Digitando: {USERNAME}")
        try:
            inputs = await page.query_selector_all("input, textarea")
            if inputs:
                await inputs[0].click()
                await asyncio.sleep(0.2)
                await inputs[0].fill(USERNAME)
                await asyncio.sleep(0.3)
                
                # PESQUISAR
                print("🔍 Pesquisando...")
                submit_btn = await page.query_selector("button[type='submit'], input[type='submit'], button:has-text('pesquisar'), button:has-text('buscar')")
                if submit_btn:
                    await submit_btn.click()
                else:
                    await inputs[0].press("Enter")
                await asyncio.sleep(0.5)
        except Exception as e:
            print(f"⚠️ Erro: {e}")
        
        # AGUARDAR REQUISIÇÕES (10 segundos apenas)
        print("⏳ Capturando requisições (10 segundos)...")
        await asyncio.sleep(10)
        
        # SALVAR IMEDIATAMENTE
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        with open(f"iastalker_fast_{timestamp}.json", "w", encoding="utf-8") as f:
            json.dump(captured_requests, f, indent=2, ensure_ascii=False)
        print(f"💾 Salvo: iastalker_fast_{timestamp}.json")
        
        if api_keys:
            with open(f"iastalker_fast_api_key_{timestamp}.txt", "w", encoding="utf-8") as f:
                f.write("CHAVES DE API DO IASTALKER\n")
                f.write("="*80 + "\n\n")
                for url, keys in api_keys.items():
                    f.write(f"URL: {url}\n")
                    for k, v in keys.items():
                        f.write(f"  {k}: {v}\n")
                    f.write("\n")
            print(f"🔑 API Keys salvas!")
        
        print(f"✅ Total: {len(captured_requests)} requisições")
        print(f"✅ APIs encontradas: {len(api_keys)}")
        
        await asyncio.sleep(2)
        try:
            await context.close()
        except:
            pass

if __name__ == "__main__":
    asyncio.run(run())
