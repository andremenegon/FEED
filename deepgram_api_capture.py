#!/usr/bin/env python3
"""
Script de Engenharia Reversa - API DeepGram
Captura todas as requisições de rede, extrai API keys e documenta a API
"""

import json
import time
import re
from datetime import datetime
from seleniumwire import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# URL do DeepGram
DEEPGRAM_URL = "https://www.deepgram.online/?utm_source=FB&utm_campaign=%F0%9F%94%B4+P0+B11+C1++-+%5BABO%5D+-+%5BTESTE+2%5D%7C120236383279250010&utm_medium=3%7C120236383482120010&utm_content=1%7C120236383482130010&utm_term=Instagram_Stories&utm_id=120236383279250010&fbclid=PAdGRleAORifRleHRuA2FlbQEwAGFkaWQBqypaqo5dGnNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp9M-ljXlGwdSPem6F9GF3J89RgVSSbfMs7-zQEXhg57kDUU82vOCqt5hN1x0_aem_qq1wpRdrrAQBmMzhJrtYfg"
USERNAME = "andre.menegon"

# Armazenar todas as requisições capturadas
captured_requests = []
api_keys = {}
console_logs = []


def setup_driver():
    """Configura o driver do Chrome com Selenium Wire para capturar requisições"""
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Configurar Selenium Wire para capturar requisições
    seleniumwire_options = {
        'suppress_connection_errors': False,
    }
    
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options,
        seleniumwire_options=seleniumwire_options
    )
    
    return driver


def extract_api_key_from_headers(headers):
    """Extrai possíveis API keys dos headers"""
    api_key_fields = [
        'authorization', 'x-api-key', 'api-key', 'x-auth-token',
        'authorization-token', 'bearer', 'access-token', 'token',
        'x-access-token', 'apikey', 'api_key'
    ]
    
    found_keys = {}
    for header_name, header_value in headers.items():
        header_lower = header_name.lower()
        for key_field in api_key_fields:
            if key_field in header_lower:
                found_keys[header_name] = header_value
                break
    
    return found_keys


def extract_api_key_from_url(url):
    """Extrai possíveis API keys da URL (query parameters)"""
    found_keys = {}
    if '?' in url:
        query_string = url.split('?')[1]
        params = query_string.split('&')
        api_key_params = ['api_key', 'apikey', 'key', 'token', 'auth', 'access_token']
        
        for param in params:
            if '=' in param:
                key, value = param.split('=', 1)
                if key.lower() in api_key_params:
                    found_keys[key] = value
    
    return found_keys


def extract_api_key_from_body(body):
    """Extrai possíveis API keys do body da requisição"""
    found_keys = {}
    if not body:
        return found_keys
    
    try:
        # Tentar parsear como JSON
        if isinstance(body, str):
            try:
                body_json = json.loads(body)
            except:
                body_json = {}
        else:
            body_json = body
        
        api_key_fields = ['api_key', 'apikey', 'key', 'token', 'auth_token', 'access_token', 'bearer']
        
        if isinstance(body_json, dict):
            for key, value in body_json.items():
                if any(field in key.lower() for field in api_key_fields):
                    found_keys[key] = value
    except:
        pass
    
    return found_keys


def capture_request(request):
    """Captura e processa uma requisição de rede"""
    try:
        # Capturar informações básicas
        request_data = {
            'url': request.url,
            'method': request.method,
            'headers': dict(request.headers),
            'response_headers': dict(request.response.headers) if hasattr(request, 'response') and request.response else {},
            'status_code': request.response.status_code if hasattr(request, 'response') and request.response else None,
            'timestamp': datetime.now().isoformat(),
        }
        
        # Capturar request body
        try:
            if request.body:
                if isinstance(request.body, bytes):
                    request_data['request_body'] = request.body.decode('utf-8', errors='ignore')
                else:
                    request_data['request_body'] = str(request.body)
        except:
            request_data['request_body'] = None
        
        # Capturar response body
        try:
            if hasattr(request, 'response') and request.response:
                response_body = request.response.body
                if response_body:
                    if isinstance(response_body, bytes):
                        request_data['response_body'] = response_body.decode('utf-8', errors='ignore')
                    else:
                        request_data['response_body'] = str(response_body)
        except:
            request_data['response_body'] = None
        
        # Extrair API keys
        keys_from_headers = extract_api_key_from_headers(request_data['headers'])
        keys_from_url = extract_api_key_from_url(request_data['url'])
        keys_from_body = extract_api_key_from_body(request_data.get('request_body'))
        
        if keys_from_headers:
            api_keys[f"headers_{request_data['url']}"] = keys_from_headers
        if keys_from_url:
            api_keys[f"url_{request_data['url']}"] = keys_from_url
        if keys_from_body:
            api_keys[f"body_{request_data['url']}"] = keys_from_body
        
        captured_requests.append(request_data)
        
        # Log no console
        print(f"[CAPTURADO] {request.method} {request.url}")
        if keys_from_headers or keys_from_url or keys_from_body:
            print(f"  🔑 API KEY ENCONTRADA!")
        
    except Exception as e:
        print(f"[ERRO ao capturar requisição] {str(e)}")


def interact_with_site(driver):
    """Interage com o site DeepGram"""
    print(f"\n🌐 Navegando para: {DEEPGRAM_URL}")
    driver.get(DEEPGRAM_URL)
    
    # Aguardar página carregar
    time.sleep(3)
    
    try:
        # Procurar e clicar no botão "Espionar Agora"
        print("\n🔍 Procurando botão 'Espionar Agora'...")
        wait = WebDriverWait(driver, 10)
        
        # Tentar diferentes seletores possíveis
        button_selectors = [
            "//button[contains(text(), 'Espionar')]",
            "//a[contains(text(), 'Espionar')]",
            "//*[contains(text(), 'Espionar Agora')]",
            "//button[contains(., 'Espionar')]",
            "//a[contains(., 'Espionar')]",
        ]
        
        button_clicked = False
        for selector in button_selectors:
            try:
                button = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                print(f"✅ Botão encontrado com seletor: {selector}")
                button.click()
                button_clicked = True
                break
            except:
                continue
        
        if not button_clicked:
            # Tentar encontrar por classe ou ID
            try:
                button = driver.find_element(By.CSS_SELECTOR, "button, a.btn, .btn, [class*='button']")
                button.click()
                button_clicked = True
                print("✅ Botão encontrado por CSS selector genérico")
            except:
                pass
        
        if not button_clicked:
            print("⚠️  Não foi possível encontrar o botão automaticamente. Continuando...")
        
        time.sleep(2)
        
        # Procurar campo de input para digitar o username
        print(f"\n⌨️  Digitando username: {USERNAME}")
        input_selectors = [
            "input[type='text']",
            "input[type='search']",
            "input[name*='user']",
            "input[name*='username']",
            "input[name*='instagram']",
            "input[placeholder*='@']",
            "input",
        ]
        
        input_found = False
        for selector in input_selectors:
            try:
                input_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                input_field.clear()
                input_field.send_keys(USERNAME)
                input_found = True
                print(f"✅ Input encontrado e preenchido")
                break
            except:
                continue
        
        if not input_found:
            print("⚠️  Campo de input não encontrado. Tentando enviar via JavaScript...")
            driver.execute_script(f"""
                var inputs = document.querySelectorAll('input');
                for(var i = 0; i < inputs.length; i++) {{
                    inputs[i].value = '{USERNAME}';
                    inputs[i].dispatchEvent(new Event('input', {{ bubbles: true }}));
                }}
            """)
        
        time.sleep(1)
        
        # Confirmar (pode ser um botão de submit, Enter, ou outro botão)
        print("\n✅ Confirmando ação...")
        try:
            # Tentar encontrar botão de submit/confirmar
            submit_selectors = [
                "button[type='submit']",
                "input[type='submit']",
                "//button[contains(text(), 'Confirmar')]",
                "//button[contains(text(), 'Buscar')]",
                "//button[contains(text(), 'Pesquisar')]",
                "//button[contains(text(), 'Enviar')]",
            ]
            
            for selector in submit_selectors:
                try:
                    if selector.startswith("//"):
                        submit_btn = driver.find_element(By.XPATH, selector)
                    else:
                        submit_btn = driver.find_element(By.CSS_SELECTOR, selector)
                    submit_btn.click()
                    print("✅ Botão de confirmação clicado")
                    break
                except:
                    continue
            else:
                # Se não encontrou botão, tentar pressionar Enter
                from selenium.webdriver.common.keys import Keys
                input_field = driver.find_element(By.CSS_SELECTOR, "input")
                input_field.send_keys(Keys.RETURN)
                print("✅ Enter pressionado no campo de input")
        except Exception as e:
            print(f"⚠️  Erro ao confirmar: {str(e)}")
        
        # Aguardar requisições serem feitas
        print("\n⏳ Aguardando requisições de rede (15 segundos)...")
        time.sleep(15)
        
    except Exception as e:
        print(f"⚠️  Erro durante interação: {str(e)}")
        print("Continuando para capturar requisições já feitas...")


def save_results():
    """Salva todos os resultados capturados"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Salvar requisições em JSON
    output_file = f"deepgram_requests_{timestamp}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(captured_requests, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Requisições salvas em: {output_file}")
    
    # Salvar API keys extraídas
    if api_keys:
        api_key_file = f"deepgram_api_key_{timestamp}.txt"
        with open(api_key_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("CHAVES DE API EXTRAÍDAS DO DEEPGRAM\n")
            f.write("=" * 80 + "\n\n")
            
            for source, keys in api_keys.items():
                f.write(f"Fonte: {source}\n")
                f.write("-" * 80 + "\n")
                for key_name, key_value in keys.items():
                    f.write(f"  {key_name}: {key_value}\n")
                f.write("\n")
            
            f.write("\n" + "=" * 80 + "\n")
            f.write("INSTRUÇÕES DE USO\n")
            f.write("=" * 80 + "\n\n")
            f.write("Use essas chaves nos headers das requisições HTTP.\n")
            f.write("Exemplo com curl:\n\n")
            
            if captured_requests:
                first_request = captured_requests[0]
                f.write(f"curl -X {first_request['method']} '{first_request['url']}' \\\n")
                for header_name, header_value in first_request['headers'].items():
                    if any(k in header_name.lower() for k in ['auth', 'key', 'token', 'api']):
                        f.write(f"  -H '{header_name}: {header_value}' \\\n")
                f.write("\n")
        
        print(f"🔑 API Keys salvas em: {api_key_file}")
    else:
        print("⚠️  Nenhuma API key foi encontrada automaticamente.")
        print("   Verifique o arquivo JSON para headers e parâmetros de autenticação.")
    
    # Gerar documentação markdown
    docs_file = f"deepgram_api_docs_{timestamp}.md"
    generate_documentation(docs_file)
    print(f"📚 Documentação gerada em: {docs_file}")


def generate_documentation(filename):
    """Gera documentação markdown da API"""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("# Documentação da API DeepGram\n\n")
        f.write(f"**Gerado em:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        
        # Seção de API Keys
        if api_keys:
            f.write("## 🔑 Chaves de API Extraídas\n\n")
            for source, keys in api_keys.items():
                f.write(f"### {source}\n\n")
                for key_name, key_value in keys.items():
                    f.write(f"- **{key_name}**: `{key_value}`\n")
                f.write("\n")
        else:
            f.write("## ⚠️ Chaves de API\n\n")
            f.write("Nenhuma chave foi extraída automaticamente. ")
            f.write("Verifique os headers das requisições no arquivo JSON.\n\n")
        
        f.write("---\n\n")
        
        # Endpoints descobertos
        f.write("## 📡 Endpoints Descobertos\n\n")
        
        endpoints = {}
        for req in captured_requests:
            url = req['url']
            method = req['method']
            key = f"{method} {url}"
            if key not in endpoints:
                endpoints[key] = req
        
        for i, (key, req) in enumerate(endpoints.items(), 1):
            f.write(f"### Endpoint {i}: {req['method']} {req['url']}\n\n")
            
            # Headers
            if req.get('headers'):
                f.write("**Headers da Requisição:**\n\n")
                f.write("```\n")
                for header_name, header_value in req['headers'].items():
                    f.write(f"{header_name}: {header_value}\n")
                f.write("```\n\n")
            
            # Request Body
            if req.get('request_body'):
                f.write("**Request Body:**\n\n")
                f.write("```json\n")
                try:
                    body_json = json.loads(req['request_body'])
                    f.write(json.dumps(body_json, indent=2, ensure_ascii=False))
                except:
                    f.write(req['request_body'])
                f.write("\n```\n\n")
            
            # Response
            if req.get('status_code'):
                f.write(f"**Status Code:** {req['status_code']}\n\n")
            
            if req.get('response_body'):
                f.write("**Response Body:**\n\n")
                f.write("```json\n")
                try:
                    response_json = json.loads(req['response_body'])
                    f.write(json.dumps(response_json, indent=2, ensure_ascii=False))
                except:
                    f.write(req['response_body'][:500] + ("..." if len(req['response_body']) > 500 else ""))
                f.write("\n```\n\n")
            
            # Exemplo curl
            f.write("**Exemplo com curl:**\n\n")
            f.write("```bash\n")
            f.write(f"curl -X {req['method']} '{req['url']}' \\\n")
            if req.get('headers'):
                for header_name, header_value in req['headers'].items():
                    f.write(f"  -H '{header_name}: {header_value}' \\\n")
            if req.get('request_body'):
                f.write(f"  -d '{req['request_body']}' \\\n")
            f.write("\n```\n\n")
            f.write("---\n\n")
        
        # Resumo
        f.write("## 📊 Resumo\n\n")
        f.write(f"- **Total de requisições capturadas:** {len(captured_requests)}\n")
        f.write(f"- **Endpoints únicos:** {len(endpoints)}\n")
        f.write(f"- **API Keys encontradas:** {len(api_keys)}\n\n")


def main():
    """Função principal"""
    print("=" * 80)
    print("🔍 ENGENHARIA REVERSA - API DEEPGRAM")
    print("=" * 80)
    
    driver = None
    try:
        # Configurar driver
        print("\n🚀 Inicializando Chrome...")
        driver = setup_driver()
        
        # Interagir com o site
        interact_with_site(driver)
        
        # Capturar todas as requisições feitas
        print("\n📡 Capturando requisições de rede...")
        for request in driver.requests:
            capture_request(request)
        
        print(f"\n✅ Total de requisições capturadas: {len(captured_requests)}")
        
        # Salvar resultados
        save_results()
        
        print("\n" + "=" * 80)
        print("✅ PROCESSO CONCLUÍDO!")
        print("=" * 80)
        print("\nArquivos gerados:")
        print("  - deepgram_requests_*.json (todas as requisições)")
        print("  - deepgram_api_key_*.txt (chaves extraídas)")
        print("  - deepgram_api_docs_*.md (documentação completa)")
        
    except Exception as e:
        print(f"\n❌ ERRO: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        if driver:
            print("\n⏳ Mantendo o navegador aberto por 10 segundos para inspeção...")
            time.sleep(10)
            driver.quit()
            print("🔒 Navegador fechado.")


if __name__ == "__main__":
    main()
