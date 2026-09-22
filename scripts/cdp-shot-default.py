"""Capture the app's DEFAULT state — no reload, no preset write.

`cdp-shot.py` reloads the page (a devtools-only action) which collapses the
bottom panel, so it is the wrong tool for a reference screenshot. This one
attaches to whatever the app booted into and captures that.
"""
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


def call(method, params=None):
    global _id
    _id += 1
    ws.send(json.dumps({"id": _id, "method": method, "params": params or {}}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get("id") == _id:
            return msg


def ev(expr):
    r = call(
        "Runtime.evaluate",
        {"expression": expr, "returnByValue": True, "awaitPromise": True},
    )
    res = r.get("result", {}).get("result", {})
    return res.get("value", res.get("description"))


# Let the PTY paint its prompt before the shot.
time.sleep(4)

state = ev(r"""
(() => {
  const b = document.body.innerText;
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    preset: document.documentElement.getAttribute('data-preset'),
    xterm: document.querySelectorAll('.xterm').length,
    panelOpen: /\bTERMINAL\b/.test(b),
    terminalLine: (document.querySelector('.xterm-screen') || {}).innerText || null,
    errorBoundary: /Something broke/.test(b)
  };
})()
""")
print("STATE:", json.dumps(state, indent=2, ensure_ascii=False) if isinstance(state, dict) else state)

shot = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
data = shot.get("result", {}).get("data")
out = Path(r"C:\Users\tab_Hub\codex\electron_app\docs\cockpit-ui.png")
if data:
    out.write_bytes(base64.b64decode(data))
    print(f"\nSCREENSHOT: {out}  ({out.stat().st_size} bytes)")
else:
    print("SCREENSHOT FAILED:", json.dumps(shot)[:300])

ws.close()
