"""
Prove "open mode": read a repo in full WITHOUT cloning it.

Asserts the detail fetch returns metadata + tree + readme + commits + branches,
then reads an actual file's text — all through the GitHub API, with the clone
root untouched before and after.
"""
import json
import os
import time
import urllib.request

from websocket import create_connection

CLONE_ROOT = r"C:\Users\tab_Hub\GitHub"


def dir_size_kb(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return round(total / 1024, 1)


before = dir_size_kb(CLONE_ROOT)
print(f"clone root before: {before} KB  ({CLONE_ROOT})")

targets = json.load(urllib.request.urlopen("http://127.0.0.1:9334/json/list"))
page = next(t for t in targets if t["type"] == "page")
ws = create_connection(page["webSocketDebuggerUrl"], suppress_origin=True, timeout=180)

_id = 0


def ev(expr, timeout_s=180):
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


# Pick a NON-cloned repo so the read is provably not coming from disk.
target = ev("""
window.api.cockpit.snapshot().then((s) => {
  const r = s.remote.repos.find(x => !x.cloned && x.name === 'electron-shell-framework')
          || s.remote.repos.find(x => !x.cloned);
  return r ? { slug: r.slug, cloned: r.cloned } : null;
})
""")
print("\ntarget:", json.dumps(target))

if not target:
    print("no remote repo available")
    raise SystemExit(1)

print("\n=== repoDetail (no clone) ===")
detail = ev(f"""
window.api.cockpit.repoDetail({json.dumps(target['slug'])}).then(d => ({{
  error: d.error,
  requests: d.requests,
  description: (d.description||'').slice(0,90),
  stars: d.stars, license: d.license, topics: d.topics,
  defaultBranch: d.defaultBranch,
  treeEntries: d.tree.length,
  dirs: d.tree.filter(t=>t.type==='dir').map(t=>t.path).slice(0,12),
  files: d.tree.filter(t=>t.type!=='dir').map(t=>t.path).slice(0,12),
  commits: d.commits.length,
  newestCommit: d.commits[0] ? d.commits[0].message.slice(0,70) : null,
  branches: d.branches.length,
  readmeName: d.readme ? d.readme.name : null,
  readmeChars: d.readme ? d.readme.text.length : 0
}}))
""")
print(json.dumps(detail, indent=2, ensure_ascii=False))

print("\n=== read a real file's text (no clone) ===")
# pick package.json if present, else the first file
path = None
for f in (detail.get("files") or []):
    if f.endswith(".json") or f.endswith(".md") or f.endswith(".txt"):
        path = f
        break
if not path and detail.get("files"):
    path = detail["files"][0]

if path:
    file = ev(f"""
window.api.cockpit.repoFile({json.dumps(target['slug'])}, {json.dumps(path)}, null).then(f => ({{
  path: f.path, size: f.size, binary: f.binary, truncated: f.truncated,
  error: f.error || null,
  head: (f.text||'').slice(0, 240)
}}))
""")
    print(json.dumps(file, indent=2, ensure_ascii=False))
else:
    print("no file to read")

after = dir_size_kb(CLONE_ROOT)
print(f"\nclone root after:  {after} KB")
print("DISK UNCHANGED:", before == after)

ws.close()
