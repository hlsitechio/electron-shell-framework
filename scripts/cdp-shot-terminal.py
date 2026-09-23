"""Open the bottom terminal panel and capture a screenshot."""
import base64
import json
import time
import urllib.request
from pathlib import Path
from websocket import create_connection

targets = json.load(urllib.request.urlopen("http://127.0.0.1:9334/json/list"))
page = next(t for t in targets if t["type"] == "page")
ws = create_connection(page["webSocketDebuggerUrl"], suppress_origin=True, timeout=120)

_id = 0

def call(method, params=None, timeout_s=30):
    global _id
    _id += 1
    ws.send(json.dumps({"id": _id, "method": method, "params": params or {}}))
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        msg = json.loads(ws.recv())
        if msg.get("id") == _id:
            return msg
    return {"error": "timeout"}

def ev(expr, timeout_s=30):
    r = call("Runtime.evaluate", {"expression": expr, "returnByValue": True, "awaitPromise": True}, timeout_s)
    res = r.get("result", {}).get("result", {})
    return res.get("value", res.get("description"))

artifact_dir = Path(r"C:\Users\tab_Hub\.gemini\antigravity\brain\25b8703c-adfe-403c-8bcb-b797629e272a")
docs_dir = Path(r"C:\Users\tab_Hub\codex\electron_app\docs")

# Click the terminal toggle in the bottom panel
ev("""
(() => {
  const btn = document.querySelector('button[aria-label="Open panel"]');
  if (btn) {
    btn.click();
    return 'clicked open';
  }
  return 'already open or not found';
})()
""")

# Wait for PTY to attach and paint
time.sleep(4.0)

shot = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
data = shot.get("result", {}).get("data")
if data:
    raw = base64.b64decode(data)
    (docs_dir / "terminal-panel.png").write_bytes(raw)
    (artifact_dir / "terminal-panel.png").write_bytes(raw)
    print(f"Captured terminal-panel.png ({len(raw)} bytes)")

ws.close()
