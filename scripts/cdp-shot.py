"""Set the app preset, reload, and capture a real screenshot of the UI."""
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


def call(method, params=None, timeout_s=120):
    global _id
    _id += 1
    ws.send(json.dumps({"id": _id, "method": method, "params": params or {}}))
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        msg = json.loads(ws.recv())
        if msg.get("id") == _id:
            return msg
    return {"error": "timeout"}


def ev(expr, timeout_s=120):
    r = call("Runtime.evaluate", {"expression": expr, "returnByValue": True, "awaitPromise": True}, timeout_s)
    res = r.get("result", {}).get("result", {})
    return res.get("value", res.get("description"))


# Make sure the cockpit panel is open and the app uses the intended preset.
print("setting preset + opening the terminal panel…")
print(ev("window.api.config.set('theme:preset','poiesis-blue')"))
print(ev("window.api.config.set('theme','dark')"))
print(ev("window.api.config.get('theme:preset')"))

# Reload so the ThemeProvider re-reads the persisted preference.
call("Page.enable")
call("Page.reload", {"ignoreCache": True})
time.sleep(14)

# Give the PTY a moment to attach and paint its prompt.
time.sleep(4)

state = ev(r"""
(() => {
  const root = document.documentElement;
  return {
    theme: root.getAttribute('data-theme'),
    preset: root.getAttribute('data-preset'),
    xterm: document.querySelectorAll('.xterm').length,
    tabs: Array.from(document.querySelectorAll('nav button')).map(b => b.innerText.trim()).filter(Boolean),
    body: document.body.innerText.slice(0, 900)
  };
})()
""")
print("\nSTATE:", json.dumps(state, indent=2, ensure_ascii=False) if isinstance(state, dict) else state)

# Screenshot the real window.
shot = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
data = shot.get("result", {}).get("data")
out = Path(r"C:\Users\tab_Hub\codex\electron_app\docs\cockpit-ui.png")
out.parent.mkdir(parents=True, exist_ok=True)
if data:
    out.write_bytes(base64.b64decode(data))
    print(f"\nSCREENSHOT: {out}  ({out.stat().st_size} bytes)")
else:
    print("\nSCREENSHOT FAILED:", json.dumps(shot)[:300])

ws.close()
