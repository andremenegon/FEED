#!/usr/bin/env python3
import urllib.request
import ssl
import sys

# Desabilitar verificação SSL
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = sys.argv[1] if len(sys.argv) > 1 else 'https://www.deepgram.online/direct/andre.menegon?utm_source=FB&utm_campaign=%F0%9F%94%B4+P0+B11+C1++-+%5BABO%5D+-+%5BTESTE+2%5D%7C120236383279250010&utm_medium=3%7C120236383482120010&utm_content=1%7C120236383482130010&utm_term=Instagram_Stories&utm_id=120236383279250010&fbclid=PAdGRleAORifRleHRuA2FlbQEwAGFkaWQBqypaqo5dGnNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp9M-ljXlGwdSPem6F9GF3J89RgVSSbfMs7-zQEXhg57kDUU82vOCqt5hN1x0_aem_qq1wpRdrrAQBmMzhJrtYfg'

headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Referer': 'https://www.facebook.com/',
}

try:
    req = urllib.request.Request(url, headers=headers)
    response = urllib.request.urlopen(req, context=ctx, timeout=15)
    html = response.read().decode('utf-8', errors='ignore')
    
    with open('deepgram_page.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ HTML salvo em deepgram_page.html ({len(html)} caracteres)")
    print(f"\nPrimeiros 5000 caracteres:")
    print(html[:5000])
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()

