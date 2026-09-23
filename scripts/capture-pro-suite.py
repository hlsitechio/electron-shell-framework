"""Capture screenshots of the Pro Developer Suite features over CDP."""
import base64
import json
import time
import urllib.request
from pathlib import Path
from websocket import create_connection

artifact_dir = Path(r"C:\Users\tab_Hub\.gemini\antigravity\brain\25b8703c-adfe-403c-8bcb-b797629e272a")
docs_dir = Path(r"C:\Users\tab_Hub\codex\electron_app\docs")
artifact_dir.mkdir(parents=True, exist_ok=True)
docs_dir.mkdir(parents=True, exist_ok=True)

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

def save_shot(filename):
    shot = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
    data = shot.get("result", {}).get("data")
    if data:
        raw = base64.b64decode(data)
        (docs_dir / filename).write_bytes(raw)
        (artifact_dir / filename).write_bytes(raw)
        print(f"Captured {filename} ({len(raw)} bytes)")
        return True
    else:
        print(f"Failed to capture {filename}")
        return False

# 1. Main Repos View with Pro actions
print("1. Capturing Repos page...")
time.sleep(1)
save_shot("pro-repos.png")

# 2. Command Palette View
print("2. Opening Command Palette...")
ev("""
(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Command Palette'));
  if (btn) btn.click();
})()
""")
time.sleep(1)
save_shot("pro-command-palette.png")

# Close Command Palette
ev("""
(() => {
  const overlay = document.querySelector('[role="dialog"]');
  if (overlay) {
    const esc = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true });
    window.dispatchEvent(esc);
  }
})()
""")
time.sleep(1)

# 3. Visual Diff & Staging Modal View
print("3. Opening Git Diff & Staging Modal...")
ev("""
(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Diff & Stage'));
  if (btn) btn.click();
})()
""")
time.sleep(2)
save_shot("pro-diff-modal.png")

# Close Diff Modal
ev("""
(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const done = btns.find(b => b.innerText && b.innerText.trim() === 'Done');
  if (done) done.click();
})()
""")
time.sleep(1)

# 4. Branch Switchboard View
print("4. Opening Branch Switchboard...")
ev("""
(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Branches'));
  if (btn) btn.click();
})()
""")
time.sleep(2)
save_shot("pro-branches.png")

# Close Branch Switchboard
ev("""
(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const close = btns.find(b => b.innerText && b.innerText.trim() === 'Close');
  if (close) close.click();
})()
""")
time.sleep(1)

ws.close()
print("All Pro Suite views captured successfully.")
