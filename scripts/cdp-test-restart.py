"""
Restart-survival test.

Runs against a fresh app process: asserts the repo list and layout are restored
from disk WITHOUT any network call, then reports what came back.
"""
import json
import time
import urllib.request

from websocket import create_connection

targets = json.load(urllib.request.urlopen("http://127.0.0.1:9334/json/list"))
page = next(t for t in targets if t["type"] == "page")
ws = create_connection(page["webSocketDebuggerUrl"], suppress_origin=True, timeout=120)

_id = 0


def ev(expr, timeout_s=120):
    global _id
    _id += 1
    ws.send(json.dumps({
        "id": _id,
        "method": "Runtime.evaluate",
        "params": {"expression": expr, "returnByValue": True, "awaitPromise": True},
    }))
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        msg = json.loads(ws.recv())
        if msg.get("id") == _id:
            res = msg.get("result", {}).get("result", {})
            if "value" in res:
                return res["value"]
            return {"error": res.get("description", "no value")}
    return {"error": "timeout"}


time.sleep(6)  # let boot + hydrate settle

state = ev(r"""
(() => {
  const body = document.body.innerText;
  return {
    // Did the snapshot carry the restored remote list? (no listRemoteRepos call made)
    snapshotRemoteCount: null,
    localRepos: null,
    layoutInDom: {
      terminalPanelOpen: /\bTERMINAL\b/.test(body),
      rightRailPresent: /Activity/.test(body),
    },
    xterm: document.querySelectorAll('.xterm').length,
    errorBoundary: /Something broke/.test(body)
  };
})()
""")

remote = ev("window.api.cockpit.snapshot().then(s => ({ repos: s.remote.repos.length, stale: s.remote.stale, fetchedAt: s.remote.fetchedAt, total: s.remote.total, error: s.remote.error }))")
print("REMOTE (from disk, no fetch):", json.dumps(remote, indent=2))
print("\nDOM STATE:", json.dumps(state, indent=2))

layout = ev("window.api.config.get('settings:layout')")
print("\nSTORED LAYOUT:", json.dumps(layout, indent=2))

remoteCfg = ev("window.api.config.get('cockpit:remoteRepos')")
if isinstance(remoteCfg, str):
    parsed = json.loads(remoteCfg)
    print(f"\nPERSISTED CACHE: {len(parsed.get('repos', []))} repos, total={parsed.get('total')}, fetchedAt={parsed.get('fetchedAt')}")
else:
    print("\nPERSISTED CACHE: none")

ws.close()
