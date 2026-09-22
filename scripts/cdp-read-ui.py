"""Read the LIVE Repo Cockpit render over CDP: real git data or not?"""
import json
import urllib.request
from websocket import create_connection  # websocket-client

targets = json.load(urllib.request.urlopen("http://127.0.0.1:9334/json/list"))
page = next(t for t in targets if t["type"] == "page")
ws = create_connection(page["webSocketDebuggerUrl"], suppress_origin=True, timeout=30)

counter = 0


def evaluate(expr: str):
    global counter
    counter += 1
    ws.send(json.dumps({
        "id": counter,
        "method": "Runtime.evaluate",
        "params": {"expression": expr, "returnByValue": True, "awaitPromise": True},
    }))
    while True:
        msg = json.loads(ws.recv())
        if msg.get("id") == counter:
            res = msg.get("result", {}).get("result", {})
            if "value" in res:
                return res["value"]
            return res.get("description") or res


script = r"""
(() => {
  const txt = (el) => (el ? el.innerText.replace(/\s+/g, ' ').trim() : null);
  const q = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));

  // shell chrome
  const sidebarItems = qa('aside button, aside a').map((b) => txt(b)).filter(Boolean).slice(0, 20);
  const tabs = qa('[class*="tab"], nav button').map((b) => txt(b)).filter(Boolean).slice(0, 25);

  // KPI stat tiles actually rendered
  const tiles = qa('.glass .stat-number').map((n) => txt(n));

  // repo rows: repo name + branch + changed count
  const bodyText = document.body.innerText;

  // is the PTY panel present?
  const xterm = qa('.xterm').length;
  const xtermRows = txt(q('.xterm-screen'));

  // right rail
  const railText = q('.xterm') ? null : null;

  return {
    title: document.title,
    theme: document.documentElement.getAttribute('data-theme'),
    preset: document.documentElement.getAttribute('data-preset'),
    sidebarItems,
    tabs,
    kpiTiles: tiles,
    xtermCount: xterm,
    xtermTail: xtermRows ? xtermRows.slice(-400) : null,
    hasErrorBoundaryMessage: /Something went wrong|Maximum update depth/i.test(bodyText),
    bodyHead: bodyText.slice(0, 1500),
  };
})()
"""

data = evaluate(script)
print(json.dumps(data, indent=2, ensure_ascii=False))
ws.close()
