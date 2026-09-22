"""
End-to-end proof that the build supervisor is REAL.

Connects to the running app over CDP and drives the actual renderer API:
start `npm run typecheck` in the detected repo, watch it move
running -> passed, and read back the captured child output.
"""
import json
import time
import urllib.request

from websocket import create_connection

targets = json.load(urllib.request.urlopen("http://127.0.0.1:9334/json/list"))
page = next(t for t in targets if t["type"] == "page")
ws = create_connection(page["webSocketDebuggerUrl"], suppress_origin=True, timeout=120)

_id = 0


def evaluate(expr: str, timeout_s: int = 120):
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


# 1. Which repo did the app detect, and what scripts did it find?
setup = evaluate(r"""
(() => {
  const s = window.__cockpitProbe = {};
  return window.api.cockpit.snapshot().then((snap) => {
    const repo = snap.repos[0];
    s.repoId = repo ? repo.id : null;
    s.repoName = repo ? repo.name : null;
    s.scripts = repo ? repo.scripts : [];
    s.path = repo ? repo.path : null;
    return { repoId: s.repoId, repoName: s.repoName, path: s.path, scripts: s.scripts };
  });
})()
""")
print("DETECTED:", json.dumps(setup, ensure_ascii=False))

if not setup.get("repoId"):
    print("no repo detected — cannot run the build test")
    raise SystemExit(1)

script = "typecheck" if "typecheck" in setup.get("scripts", []) else setup["scripts"][0]
print(f"\nSTARTING BUILD: npm run {script}")

started = evaluate(f"""
window.api.cockpit.startBuild({json.dumps(setup['repoId'])}, {json.dumps(script)})
  .then((b) => ({{ id: b.id, status: b.status, pid: b.pid, script: b.script }}))
  .catch((e) => ({{ error: String(e) }}))
""")
print("STARTED:", json.dumps(started, ensure_ascii=False))

build_id = started.get("id")
if not build_id:
    print("build did not start")
    raise SystemExit(1)

# 2. Poll until it leaves 'running' (the child is a real process with a real exit).
final = None
for attempt in range(60):
    time.sleep(2)
    state = evaluate(f"""
window.api.cockpit.snapshot().then((snap) => {{
  const b = snap.builds.find((x) => x.id === {json.dumps(build_id)});
  return b ? {{ status: b.status, exitCode: b.exitCode, lineCount: b.lineCount, pid: b.pid }} : null;
}})
""")
    if state is None:
        print(f"  [{attempt}] build vanished from snapshot")
        break
    print(f"  [{attempt}] status={state['status']} exit={state['exitCode']} lines={state['lineCount']}")
    if state["status"] != "running":
        final = state
        break

print("\nFINAL:", json.dumps(final, ensure_ascii=False) if final else "still running / unknown")

# 3. Read back what the child actually printed.
out = evaluate(f"window.api.cockpit.buildOutput({json.dumps(build_id)})")
if isinstance(out, str):
    lines = out.splitlines()
    print(f"\nCAPTURED OUTPUT: {len(lines)} lines")
    for line in lines[:6]:
        print("   |", line[:150])
    if len(lines) > 6:
        print("   | …")
        for line in lines[-4:]:
            print("   |", line[:150])
else:
    print("\nOUTPUT ERROR:", out)

ws.close()
