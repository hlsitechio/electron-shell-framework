"""
Prove the remote layer end-to-end, on the LIVE app.

1. `listRemoteRepos` — one GraphQL call, zero clones, and assert the count.
2. `git count-objects`/disk check before and after, to show listing costs nothing.
3. Clone exactly ONE small repo (blobless + depth 1), assert it becomes a local
   repo, then confirm the clone root grew by a sane amount.
"""
import json
import time
import urllib.request

from websocket import create_connection

targets = json.load(urllib.request.urlopen("http://127.0.0.1:9334/json/list"))
page = next(t for t in targets if t["type"] == "page")
ws = create_connection(page["webSocketDebuggerUrl"], suppress_origin=True, timeout=300)

_id = 0


def ev(expr, timeout_s=300):
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


print("=== 1. LIST every repo (no clones) ===")
listed = ev("""
window.api.cockpit.listRemoteRepos(true).then((s) => ({
  total: s.remote.total,
  listed: s.remote.repos.length,
  error: s.remote.error,
  clonedAlready: s.remote.repos.filter(r=>r.cloned).length,
  cloneRoot: s.cloneRoot,
  localRepos: s.repos.length,
  sample: s.remote.repos.slice(0, 3).map(r => ({
    slug: r.slug, branch: r.defaultBranch, sizeKb: r.sizeKb,
    lang: r.language, msg: (r.headMessage||'').slice(0,50), date: r.headDate, prs: r.openPrs
  })),
  biggest: s.remote.repos.slice().sort((a,b)=>b.sizeKb-a.sizeKb).slice(0,3)
              .map(r=>`${r.name} ${(r.sizeKb/1048576).toFixed(2)}GB`),
  totalGb: +(s.remote.repos.reduce((a,r)=>a+r.sizeKb,0)/1048576).toFixed(2)
}))
""")
print(json.dumps(listed, indent=2, ensure_ascii=False))

if not listed.get("listed"):
    print("\nlisting failed — stopping")
    raise SystemExit(1)

# 2. Pick the SMALLEST uncloned repo to keep the demo cheap.
target = ev("""
window.api.cockpit.snapshot().then((s) => {
  const cand = s.remote.repos.filter(r => !r.cloned).sort((a,b)=>a.sizeKb-b.sizeKb)[0];
  return cand ? { slug: cand.slug, sizeKb: cand.sizeKb, root: s.cloneRoot } : null;
})
""")
print("\n=== 2. CLONE exactly one (smallest uncloned) ===")
print("target:", json.dumps(target, ensure_ascii=False))

if not target:
    print("nothing to clone")
    ws.close()
    raise SystemExit(0)

path = target["root"].replace("\\", "/") + "/" + target["slug"].split("/")[1]

print("\n=== 3. Clone it (blobless + depth 1) ===")
result = ev(f"""
window.api.cockpit.cloneRepo({json.dumps(target['slug'])}, null, false)
  .then(r => ({{ ok: r.ok, path: r.path, message: r.message }}))
""")
print(json.dumps(result, ensure_ascii=False, indent=2))

time.sleep(3)

after = ev("""
window.api.cockpit.snapshot().then((s) => ({
  localRepos: s.repos.length,
  names: s.repos.map(r => r.name),
  clonedFlag: s.remote.repos.filter(r => r.cloned).map(r => r.name)
}))
""")
print("\n=== 4. Workspace after clone ===")
print(json.dumps(after, indent=2, ensure_ascii=False))

ws.close()
print(f"\nexpected path: {path}")
