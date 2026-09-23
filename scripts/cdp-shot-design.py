import base64
import json
import time
import urllib.request
from pathlib import Path
from websocket import create_connection

targets = json.load(urllib.request.urlopen('http://127.0.0.1:9334/json/list'))
page = next(t for t in targets if t['type'] == 'page')
ws = create_connection(page['webSocketDebuggerUrl'], suppress_origin=True, timeout=30)
_id = 0

def call(method, params=None):
    global _id
    _id += 1
    ws.send(json.dumps({'id': _id, 'method': method, 'params': params or {}}))
    deadline = time.time() + 30
    while time.time() < deadline:
        msg = json.loads(ws.recv())
        if msg.get('id') == _id:
            return msg

def ev(expr):
    r = call('Runtime.evaluate', {'expression': expr, 'returnByValue': True, 'awaitPromise': True})
    return r.get('result', {}).get('result', {}).get('value')

for name, fname in [('Themes', 'themes.png'), ('Widgets', 'widgets.png')]:
    ev(f'''
    (() => {{
      const btns = Array.from(document.querySelectorAll('nav button, [class*="tab"]'));
      const t = btns.find(b => b.innerText.trim() === "{name}");
      if (t) t.click();
    }})()
    ''')
    time.sleep(1.5)
    shot = call('Page.captureScreenshot', {'format': 'png'})
    data = shot.get('result', {}).get('data')
    if data:
        raw = base64.b64decode(data)
        Path(rf'C:\Users\tab_Hub\.gemini\antigravity\brain\25b8703c-adfe-403c-8bcb-b797629e272a\{fname}').write_bytes(raw)
        Path(rf'C:\Users\tab_Hub\codex\electron_app\docs\{fname}').write_bytes(raw)
        print(f'Captured {fname}')

ws.close()
