#!/usr/bin/env python3
"""
Script simples para capturar API do DeepGram usando Playwright
"""

import json
import asyncio
from datetime import datetime
from playwright.async_api import async_playwright

URL = "https://www.deepgram.online/?utm_source=FB&utm_campaign=%F0%9F%94%B4+P0+B11+C1++-+%5BABO%5D+-+%5BTESTE+2%5D%7C120236383279250010&utm_medium=3%7C120236383482120010&utm_content=1%7C120236383482130010&utm_term=Instagram_Stories&utm_id=120236383279250010&fbclid=PAdGRleAORifRleHRuA2FlbQEwAGFkaWQBqypaqo5dGnNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp9M-ljXlGwdSPem6F9GF3J89RgVSSbfMs7-zQEXhg57kDUU82vOCqt5hN1x0_aem_qq1wpRdrrAQBmMzhJrtYfg"
USERNAME = "andre.menegon"

captured_requests = []
api_keys = {}


def extract_api_keys(headers, url, body):
    """Extrai possíveis API keys"""
    keys = {}
    
    # Dos headers
    for name, value in headers.items():
        name_lower = name.lower()
        if any(k in name_lower for k in ['auth', 'key', 'token', 'api', 'bearer']):
            keys[f"header_{name}"] = value
    
    # Da URL
    if '?' in url:
        params = url.split('?')[1].split('&')
        for param in params:
            if '=' in param:
                k, v = param.split('=', 1)
                if any(keyword in k.lower() for keyword in ['key', 'token', 'auth', 'api']):
                    keys[f"url_{k}"] = v
    
    # Do body
    if body:
        try:
            if isinstance(body, str):
                body_json = json.loads(body)
            else:
                body_json = body
            
            if isinstance(body_json, dict):
                for k, v in body_json.items():
                    if any(keyword in k.lower() for keyword in ['key', 'token', 'auth', 'api']):
                        keys[f"body_{k}"] = v
        except:
            pass
    
    return keys


async def run():
    async with async_playwright() as p:
        print("🚀 Abrindo Chrome...")
        
        # Abrir Chrome com DevTools habilitado
        try:
            browser = await p.chromium.launch(
                headless=False,
                channel="chrome",  # Usa Chrome instalado
                args=['--start-maximized', '--remote-debugging-port=9222']
            )
        except:
            # Se não conseguir usar Chrome instalado, usa Chromium
            browser = await p.chromium.launch(
                headless=False,
                args=['--start-maximized', '--remote-debugging-port=9222']
            )
        
        context = await browser.new_context()
        page = await context.new_page()
        
        # Capturar todas as requisições
        async def handle_request(request):
            try:
                response = await request.response()
                
                req_data = {
                    'url': request.url,
                    'method': request.method,
                    'headers': request.headers,
                    'post_data': request.post_data,
                    'timestamp': datetime.now().isoformat(),
                }
                
                if response:
                    req_data['status'] = response.status
                    req_data['response_headers'] = response.headers
                try:
                    # Tentar diferentes encodings
                    try:
                        req_data['response_body'] = await response.text()
                    except:
                        # Se falhar, tentar como bytes
                        body_bytes = await response.body()
                        try:
                            req_data['response_body'] = body_bytes.decode('utf-8', errors='ignore')
                        except:
                            req_data['response_body'] = str(body_bytes)[:500]  # Limitar tamanho
                except:
                    req_data['response_body'] = None
                
                # Extrair API keys
                keys = extract_api_keys(
                    request.headers,
                    request.url,
                    request.post_data
                )
                if keys:
                    api_keys[request.url] = keys
                    print(f"🔑 API KEY ENCONTRADA em {request.url}")
                
                captured_requests.append(req_data)
                print(f"📡 {request.method} {request.url}")
                
            except Exception as e:
                print(f"Erro ao capturar: {e}")
        
        page.on('request', handle_request)
        
        print(f"🌐 Navegando para: {URL}")
        try:
            await page.goto(URL, wait_until='networkidle', timeout=60000)
        except:
            print("⚠️ Timeout na navegação, mas continuando...")
        await asyncio.sleep(2)
        
        # Procurar e clicar em "Espionar Agora"
        print("🔍 Procurando botão 'Espionar Agora'...")
        try:
            # Tentar vários seletores
            button = await page.query_selector("text=Espionar Agora")
            if not button:
                button = await page.query_selector("text=Espionar")
            if not button:
                button = await page.query_selector("button:has-text('Espionar')")
            if not button:
                button = await page.query_selector("a:has-text('Espionar')")
            
            if button:
                print("✅ Botão encontrado! Clicando...")
                await button.click()
                await asyncio.sleep(2)
            else:
                print("⚠️ Botão não encontrado, tentando clicar em qualquer botão...")
                buttons = await page.query_selector_all("button, a")
                if buttons:
                    await buttons[0].click()
                    await asyncio.sleep(2)
        except Exception as e:
            print(f"⚠️ Erro ao clicar: {e}")
        
        # Digitar username
        print(f"⌨️ Digitando: {USERNAME}")
        try:
            inputs = await page.query_selector_all("input[type='text'], input[type='search'], input")
            if inputs:
                await inputs[0].fill(USERNAME)
                await asyncio.sleep(1)
                
                # Confirmar (Enter ou botão)
                await inputs[0].press("Enter")
                await asyncio.sleep(1)
                
                # Tentar clicar em botão de submit
                submit = await page.query_selector("button[type='submit'], input[type='submit']")
                if submit:
                    await submit.click()
        except Exception as e:
            print(f"⚠️ Erro ao digitar: {e}")
        
        # Aguardar requisições
        print("⏳ Aguardando requisições (20 segundos)...")
        await asyncio.sleep(20)
        
        # Salvar resultados (mesmo se houver erro)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Salvar requisições
        with open(f"deepgram_requests_{timestamp}.json", "w", encoding="utf-8") as f:
            json.dump(captured_requests, f, indent=2, ensure_ascii=False)
        print(f"💾 Requisições salvas: deepgram_requests_{timestamp}.json")
        
        # Salvar API keys
        if api_keys:
            with open(f"deepgram_api_key_{timestamp}.txt", "w", encoding="utf-8") as f:
                f.write("=" * 80 + "\n")
                f.write("CHAVES DE API EXTRAÍDAS\n")
                f.write("=" * 80 + "\n\n")
                for url, keys in api_keys.items():
                    f.write(f"URL: {url}\n")
                    f.write("-" * 80 + "\n")
                    for k, v in keys.items():
                        f.write(f"  {k}: {v}\n")
                    f.write("\n")
            print(f"🔑 API Keys salvas: deepgram_api_key_{timestamp}.txt")
        
        print(f"\n✅ Total de requisições capturadas: {len(captured_requests)}")
        print("⏳ Mantendo navegador aberto por 5 segundos...")
        await asyncio.sleep(5)
        
        try:
            await browser.close()
        except:
            pass
        print("✅ Concluído!")


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        print("\n⚠️ Interrompido pelo usuário. Salvando dados capturados...")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if captured_requests:
            with open(f"deepgram_requests_{timestamp}.json", "w", encoding="utf-8") as f:
                json.dump(captured_requests, f, indent=2, ensure_ascii=False)
            print(f"💾 Dados salvos em: deepgram_requests_{timestamp}.json")
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        # Salvar mesmo assim
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if captured_requests:
            with open(f"deepgram_requests_{timestamp}.json", "w", encoding="utf-8") as f:
                json.dump(captured_requests, f, indent=2, ensure_ascii=False)
            print(f"💾 Dados salvos em: deepgram_requests_{timestamp}.json")
