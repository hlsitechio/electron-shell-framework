"""Navigate through all cockpit pages over CDP and capture high-res screenshots."""
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
artifact_dir.mkdir(parents=True, exist_ok=True)
docs_dir.mkdir(parents=True, exist_ok=True)

pages_to_capture = [
    ("Repos", "repos.png"),
    ("GitHub", "github.png"),
    ("Worktrees", "worktrees.png"),
    ("Builds", "builds.png"),
    ("PR Queue", "pull-requests.png"),
    ("CI Runs", "ci-runs.png"),
]

for tab_name, filename in pages_to_capture:
    print(f"Navigating to {tab_name}...")
    # Click the tab button
    ev(f"""
    (() => {{
      const btns = Array.from(document.querySelectorAll('nav button, [class*="tab"]'));
      const target = btns.find(b => b.innerText.trim() === '{tab_name}');
      if (target) {{
        target.click();
        return true;
      }}
      return false;
    }})()
    """)
    time.sleep(1.5)
    
    shot = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
    data = shot.get("result", {}).get("data")
    if data:
        raw = base64.b64decode(data)
        out1 = docs_dir / filename
        out2 = artifact_dir / filename
        out1.write_bytes(raw)
        out2.write_bytes(raw)
        print(f"Captured {filename} ({len(raw)} bytes)")
    else:
        print(f"Failed to capture {filename}")

# Switch back to Repos
ev("""
(() => {
  const btns = Array.from(document.querySelectorAll('nav button, [class*="tab"]'));
  const target = btns.find(b => b.innerText.trim() === 'Repos');
  if (target) target.click();
})()
""")

ws.close()
print("Done capturing all cockpit views.")
