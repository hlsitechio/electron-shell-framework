import json
import base64
import time
import urllib.request
from pathlib import Path
from websocket import create_connection

targets = json.load(urllib.request.urlopen("http://127.0.0.1:9334/json/list"))
page = next(t for t in targets if t["type"] == "page")
ws = create_connection(page["webSocketDebuggerUrl"], suppress_origin=True, timeout=60)

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

# Make sure we are in builder mode first
ev(r"""
(() => {
  const returnBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Return to Builder'));
  if (returnBtn) returnBtn.click();
})()
""")
time.sleep(1)

# Select "executive" or "devforge" template
res = ev(r"""
(() => {
  const select = document.querySelector('select');
  if (!select) return 'No select';
  const opt = Array.from(select.options).find(o => o.text.includes('Executive') || o.value === 'executive');
  if (opt) {
    select.value = opt.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return 'Loaded template: ' + opt.text;
  }
  return 'No executive option';
})()
""")
print("LOAD TEMPLATE:", res)
time.sleep(2)

# Check rendered panels
panels = ev(r"""
(() => {
  return Array.from(document.querySelectorAll('.dockview-panel, [class*="reframe-panel"], .reframe-panel-body')).map(p => p.innerText.slice(0, 80));
})()
""")
print("PANELS:", panels)

# Capture Builder Mode with full Dockview layout
shot = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
data = shot.get("result", {}).get("data")
if data:
    Path("docs/playground-executive-builder.png").write_bytes(base64.b64decode(data))
    print("Saved docs/playground-executive-builder.png")

# Now switch to Client View (Interactive Live App deliverable)
ev(r"""
(() => {
  const clientBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Client View'));
  if (clientBtn) clientBtn.click();
})()
""")
time.sleep(1.5)

shot_client = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
data_client = shot_client.get("result", {}).get("data")
if data_client:
    Path("docs/playground-executive-client.png").write_bytes(base64.b64decode(data_client))
    print("Saved docs/playground-executive-client.png")

# Return to builder and test "devforge"
ev(r"""
(() => {
  const returnBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Return to Builder'));
  if (returnBtn) returnBtn.click();
})()
""")
time.sleep(1)

ev(r"""
(() => {
  const select = document.querySelector('select');
  if (!select) return;
  const opt = Array.from(select.options).find(o => o.text.includes('DevForge') || o.value === 'devforge');
  if (opt) {
    select.value = opt.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
})()
""")
time.sleep(2)

shot_dev = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
data_dev = shot_dev.get("result", {}).get("data")
if data_dev:
    Path("docs/playground-devforge-builder.png").write_bytes(base64.b64decode(data_dev))
    print("Saved docs/playground-devforge-builder.png")
print("Done capturing playgrounds!")
