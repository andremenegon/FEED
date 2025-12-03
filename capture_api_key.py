#!/usr/bin/env python3
"""
Script FOCADO em capturar APENAS a chave da API do DeepGram
"""

import json
import asyncio
from datetime import datetime
from playwright.async_api import async_playwright

URL = "https://www.deepgram.online/?utm_source=FB&utm_campaign=%F0%9F%94%B4+P0+B11+C1++-+%5BABO%5D+-+%5BTESTE+2%5D%7C120236383279250010&utm_medium=3%7C120236383482120010&utm_content=1%7C120236383482130010&utm_term=Instagram_Stories&utm_id=120236383279250010&fbclid=PAdGRleAORifRleHRuA2FlbQEwAGFkaWQBqypaqo5dGnNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp9M-ljXlGwdSPem6F9GF3J89RgVSSbfMs7-zQEXhg57kDUU82vOCqt5hN1x0_aem_qq1wpRdrrAQBmMzhJrtYfg"
USERNAME = "andre.menegon"

api_key_found = None
hikerapi_request = None


async def run():
    global api_key_found, hikerapi_request
    
    async with async_playwright() as p:
        print("🚀 Abrindo Chrome...")
        
        try:
            browser = await p.chromium.launch(
                headless=False,
                channel="chrome",
                args=['--start-maximized']
            )
        except:
            browser = await p.chromium.launch(headless=False, args=['--start-maximized'])
        
        context = await browser.new_context()
        page = await context.new_page()
        
        # Capturar APENAS requisições da HikerAPI
        async def handle_request(request):
            global api_key_found, hikerapi_request
            
            if 'hikerapi.com' in request.url:
                print(f"\n🔑 REQUISIÇÃO HIKERAPI ENCONTRADA!")
                print(f"   URL: {request.url}")
                print(f"   Método: {request.method}")
                print(f"   Headers:")
                
                # Verificar TODOS os headers
                for name, value in request.headers.items():
                    print(f"      {name}: {value}")
                    
                    # Procurar chave da API nos headers
                    name_lower = name.lower()
                    if any(k in name_lower for k in ['auth', 'key', 'token', 'api', 'bearer', 'x-api']):
                        api_key_found = {
                            'header_name': name,
                            'header_value': value,
                            'url': request.url
                        }
                        print(f"\n   ✅ CHAVE DA API ENCONTRADA NO HEADER!")
                        print(f"      {name}: {value}")
                
                # Verificar URL parameters
                if '?' in request.url:
                    params = request.url.split('?')[1].split('&')
                    for param in params:
                        if '=' in param:
                            k, v = param.split('=', 1)
                            if any(keyword in k.lower() for keyword in ['key', 'token', 'auth', 'api']):
                                api_key_found = {
                                    'param_name': k,
                                    'param_value': v,
                                    'url': request.url
                                }
                                print(f"\n   ✅ CHAVE DA API ENCONTRADA NA URL!")
                                print(f"      {k}: {v}")
                
                # Verificar POST data
                if request.post_data:
                    try:
                        post_json = json.loads(request.post_data)
                        for k, v in post_json.items():
                            if any(keyword in k.lower() for keyword in ['key', 'token', 'auth', 'api']):
                                api_key_found = {
                                    'body_key': k,
                                    'body_value': v,
                                    'url': request.url
                                }
                                print(f"\n   ✅ CHAVE DA API ENCONTRADA NO BODY!")
                                print(f"      {k}: {v}")
                    except:
                        pass
                
                # Salvar requisição completa
                hikerapi_request = {
                    'url': request.url,
                    'method': request.method,
                    'headers': dict(request.headers),
                    'post_data': request.post_data,
                }
                
                # Tentar pegar response
                try:
                    response = await request.response()
                    if response:
                        hikerapi_request['status'] = response.status
                        hikerapi_request['response_headers'] = dict(response.headers)
                except:
                    pass
        
        page.on('request', handle_request)
        
        print(f"🌐 Navegando para o site...")
        try:
            await page.goto(URL, wait_until='domcontentloaded', timeout=30000)
        except:
            print("⚠️ Continuando mesmo com timeout...")
        
        await asyncio.sleep(3)
        
        # Clicar em "Espionar Agora"
        print("🔍 Procurando botão 'Espionar Agora'...")
        try:
            button = await page.query_selector("text=Espionar Agora")
            if not button:
                button = await page.query_selector("text=Espionar")
            if not button:
                button = await page.query_selector("button:has-text('Espionar')")
            if not button:
                button = await page.query_selector("a:has-text('Espionar')")
            
            if button:
                print("✅ Clicando no botão...")
                await button.click()
                await asyncio.sleep(2)
        except Exception as e:
            print(f"⚠️ Erro ao clicar: {e}")
        
        # Digitar username
        print(f"⌨️ Digitando: {USERNAME}")
        try:
            inputs = await page.query_selector_all("input")
            if inputs:
                await inputs[0].fill(USERNAME)
                await asyncio.sleep(1)
                await inputs[0].press("Enter")
                await asyncio.sleep(1)
        except Exception as e:
            print(f"⚠️ Erro ao digitar: {e}")
        
        # Aguardar requisição da API
        print("\n⏳ Aguardando requisição da API (20 segundos)...")
        await asyncio.sleep(20)
        
        # Salvar chave da API
        if api_key_found:
            print("\n" + "="*80)
            print("✅ CHAVE DA API CAPTURADA!")
            print("="*80)
            
            with open("API_KEY.txt", "w", encoding="utf-8") as f:
                f.write("="*80 + "\n")
                f.write("CHAVE DA API DO DEEPGRAM (HIKERAPI)\n")
                f.write("="*80 + "\n\n")
                
                if 'header_name' in api_key_found:
                    f.write(f"Header: {api_key_found['header_name']}\n")
                    f.write(f"Valor: {api_key_found['header_value']}\n\n")
                    print(f"Header: {api_key_found['header_name']}")
                    print(f"Valor: {api_key_found['header_value']}")
                
                if 'param_name' in api_key_found:
                    f.write(f"Parâmetro URL: {api_key_found['param_name']}\n")
                    f.write(f"Valor: {api_key_found['param_value']}\n\n")
                    print(f"Parâmetro URL: {api_key_found['param_name']}")
                    print(f"Valor: {api_key_found['param_value']}")
                
                if 'body_key' in api_key_found:
                    f.write(f"Body Key: {api_key_found['body_key']}\n")
                    f.write(f"Valor: {api_key_found['body_value']}\n\n")
                    print(f"Body Key: {api_key_found['body_key']}")
                    print(f"Valor: {api_key_found['body_value']}")
                
                f.write(f"\nURL da Requisição: {api_key_found['url']}\n")
                f.write("\n" + "="*80 + "\n")
                f.write("COMO USAR:\n")
                f.write("="*80 + "\n\n")
                
                if 'header_name' in api_key_found:
                    f.write(f"curl -H '{api_key_found['header_name']}: {api_key_found['header_value']}' \\\n")
                    f.write(f"     'https://api.hikerapi.com/v2/user/by/username?username=USERNAME'\n")
                
            print(f"\n💾 Chave salva em: API_KEY.txt")
        else:
            print("\n⚠️ Chave da API não encontrada automaticamente.")
            if hikerapi_request:
                print("📋 Salvando requisição completa para análise manual...")
                with open("hikerapi_request.json", "w", encoding="utf-8") as f:
                    json.dump(hikerapi_request, f, indent=2, ensure_ascii=False)
                print("💾 Requisição salva em: hikerapi_request.json")
                print("\nVerifique os headers manualmente no arquivo JSON!")
        
        print("\n⏳ Mantendo navegador aberto por 5 segundos...")
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
        print("\n⚠️ Interrompido. Verificando se capturou a chave...")
        if api_key_found:
            with open("API_KEY.txt", "w", encoding="utf-8") as f:
                json.dump(api_key_found, f, indent=2, ensure_ascii=False)
            print("💾 Dados salvos em: API_KEY.txt")
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        if api_key_found:
            with open("API_KEY.txt", "w", encoding="utf-8") as f:
                json.dump(api_key_found, f, indent=2, ensure_ascii=False)
            print("💾 Chave salva em: API_KEY.txt")
