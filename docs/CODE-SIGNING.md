# Windows code signing — why your app says "unknown publisher", and how to fix it

Every Windows developer hits this the same way. You build a perfectly good app,
send it to someone, and they get a blue box that says **"Windows protected your
PC"** with a publisher of _Unknown_. Some fraction of them close the window and
never come back.

This document is the whole story: what causes it, the three ways to fix it, what
each one actually costs in 2026, and the scripts in this folder that do the work.

> **Short version.** For most people the answer is
> **[Azure Artifact Signing](https://azure.microsoft.com/en-us/pricing/details/artifact-signing/)**
> (formerly Azure Trusted Signing): about **$9.99/month**, no hardware token to
> buy or lose, works from CI. Traditional certificates cost **$150–300/year** and
> since 2023 arrive locked on a USB token or HSM, which is a different kind of
> headache. A self-signed certificate — the one the scripts here generate — is
> free and teaches you the whole pipeline, but it will **not** clear the warning
> on anyone else's machine.

---

## 1. What SmartScreen actually objects to

Windows shows the scary dialog when a downloaded `.exe` is **not signed by a
certificate Windows can trace to a trusted root**. Two separate things have to
be true for your users to stop seeing it:

| Requirement        | What satisfies it                                                             |
| ------------------ | ----------------------------------------------------------------------------- |
| **Chain of trust** | Your signature chains to a CA in Microsoft's trusted root program             |
| **Reputation**     | That specific certificate has accumulated downloads over time without reports |

The second one catches people out. **A brand-new EV or OV certificate does not
immediately silence SmartScreen.** Microsoft builds reputation per certificate,
and a fresh one starts at zero. You will see warnings for days or weeks even
though your signing is technically perfect. This is not a bug and there is no
setting to skip it — it is why you should buy your certificate _before_ you
start distributing, not the week you launch.

That reputation resets if you switch certificates, so treat the publisher
identity as permanent.

---

## 2. The three options, priced honestly

| Option                                                | Cost            | SmartScreen                    | Gets you                                                                                  |
| ----------------------------------------------------- | --------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| **Self-signed** (this folder)                         | Free            | ❌ No effect                   | Learning, internal builds, CI rehearsal                                                   |
| **Azure Artifact Signing** (formerly Trusted Signing) | **~$9.99/mo**   | ⚠️ Builds over time            | Cheapest legitimate path. No token. CI-friendly. **US + Canada individuals only** for now |
| **OV certificate** (DigiCert, Sectigo, …)             | **$150–300/yr** | ⚠️ Builds over time            | Works worldwide, arrives on a USB token/HSM since June 2023                               |
| **EV certificate**                                    | **$300–600/yr** | ✅ Immediate trust, no warm-up | The only one that skips reputation-building                                               |

### The 2023 change nobody warns you about

Since **June 2023**, the CA/Browser Forum requires all new **OV** code signing
certificates to store the private key on hardware — a USB token or an HSM. You
can no longer download a `.pfx` and drop it in your CI secrets. Practical
consequences:

- **You cannot export the key.** `Export-PfxCertificate` fails on a token cert.
  This is the point of the requirement, and it is genuinely annoying.
- **CI needs a different approach.** Either a cloud signing service (Azure
  Artifact Signing exists precisely for this) or a self-hosted runner with the
  physical token attached.
- **Sign by thumbprint**, not by file — see the `-Thumbprint` path in `sign.ps1`.

So the traditional-certificate route now costs money **and** infrastructure. For
a solo developer, Azure Artifact Signing is usually the right call.

### If you're in Canada

You're covered. Azure Artifact Signing accepts verified **US and Canadian**
self-employed individuals and businesses. Expect an identity-validation step
during onboarding, then signing works from CI with no hardware at all.

---

## 3. Try it locally, right now, for free

The scripts in this folder let you exercise the entire pipeline before spending
anything. You sign a real binary, you verify it, you see exactly what the
success and failure states look like.

### Step 1 — create a demo certificate

```powershell
pwsh scripts/signing/new-demo-cert.ps1 -Subject "CN=Your App Name" -OutputDir .signing
```

This writes two files into `.signing/`:

| File                | What it is                                | Safe to share?           |
| ------------------- | ----------------------------------------- | ------------------------ |
| `demo-codesign.pfx` | Private key. **This is the crown jewel.** | ❌ Never. Gitignored.    |
| `demo-codesign.cer` | The public half                           | ✅ Yes, that's the point |

### Step 2 — sign something

```powershell
# with the .pfx
pwsh scripts/signing/sign.ps1 -PfxPath .signing/demo-codesign.pfx -Password 'demo-password' -Path release

# or by thumbprint, for a token/HSM-backed certificate
pwsh scripts/signing/sign.ps1 -Thumbprint <thumbprint> -Path release
```

`-Path` takes a file or a whole directory (it scans recursively for
`.exe`/`.msi`/`.dll` and skips `node_modules`).

### Step 3 — verify and read the verdict

```powershell
pwsh scripts/signing/verify-signature.ps1 -Path release
```

You'll see `UnknownError` for a self-signed cert with `chain does NOT build`.
**That is the correct, expected result** — not a failure of the script. It means
the signature is present and intact, but no trusted root vouches for it.

### Optional — make it validate on this machine

```powershell
# as Administrator
Import-Certificate -FilePath .signing/demo-codesign.cer -CertStoreLocation Cert:\LocalMachine\Root
```

Now verification reports `Valid`. That demonstrates the difference between
_"signed"_ and _"trusted"_ — the same gap your users experience, just resolved
locally by an act of manual trust that you cannot ask of strangers.

---

## 4. Wiring it into electron-builder

`electron-builder` already knows how to sign; you just have to tell it which key
to use.

### With a .pfx (works until you get a token-based cert)

Set these before packaging:

```powershell
$env:CSC_LINK = "C:\path\to\certificate.pfx"      # or a base64 string
$env:CSC_KEY_PASSWORD = "your-password"
```

```bash
npm run dist:win
```

### With Azure Artifact Signing

electron-builder supports it as a signing type (beta). Add to
`electron-builder.yml`:

```yaml
win:
  sign:
    type: azure
    endpoint: https://weu.codesigning.azure.net/ # match your account's region
    codeSigningAccountName: my-signing-account
    certificateProfileName: my-profile
    publisherName: CN=Your Name
```

You will need an Azure app registration with the _Trusted Signing Certificate
Profile Signer_ role, plus these environment variables in CI:

```
AZURE_TENANT_ID
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
```

### With a hardware token / HSM

The key cannot be exported, so point electron-builder at the certificate store.
Use the store-based signing entry, or sign after packaging with the
`-Thumbprint` path of `sign.ps1`.

---

## 5. Timestamping — the one flag people forget

Both `sign.ps1` and the electron-builder defaults attach an
**RFC 3161 timestamp** to every signature.

**Why it matters:** a code signing certificate expires, typically after 1–3
years. Without a timestamp, every file you ever signed becomes invalid the
moment it does — Windows re-evaluates the signature against the current date and
sees an expired certificate. With a timestamp, Windows checks the signature
against _the moment it was made_, so it stays valid forever.

Losing timestamps means your old release installers silently rot. Keep them.

`sign.ps1` uses DigiCert's free public timestamp server by default; override with
`-TimestampUrl` if you prefer another.

---

## 6. What to commit, what to never commit

`.signing/` is already in `.gitignore`. Keep it that way.

| ✅ Commit                                      | ❌ Never commit                             |
| ---------------------------------------------- | ------------------------------------------- |
| `scripts/signing/*`                            | `*.pfx`, `*.p12` — private keys             |
| Documentation of your cert's **subject name**  | `CSC_KEY_PASSWORD`, any password            |
| Your publisher identity (needs to stay stable) | A `.pfx` base64'd into CI "for convenience" |

In CI, put the certificate in a **secret**, never in the repo. On GitHub Actions
that means an encrypted secret holding either the base64 of the `.pfx` or the
Azure credentials. A leaked signing key lets someone publish malware as you, and
no CA will revoke it fast enough to matter.

---

## 7. Pre-flight checklist before you ship a signed release

- [ ] Signed **every** `.exe` — the installer _and_ the app binary inside it
- [ ] Timestamp present (run `verify-signature.ps1`; it checks)
- [ ] Verified on a **clean machine you've never built on** — this is the only
      test that reflects a stranger's experience
- [ ] Publisher name on the cert matches what you claim in marketing
- [ ] Private key is in a secret store, not on a laptop or in the repo
- [ ] Certificate expiry is on a calendar _with a reminder_ — renewal is not
      automatic and a lapsed cert mid-release is a bad day

---

## 8. The honest summary

- **Self-signed** teaches you the pipeline for free. It will never work for
  strangers. That's not a limitation to work around; it's the definition.
- **Azure Artifact Signing (~$9.99/mo, US/Canada individuals)** is the cheapest
  real fix and the one most solo developers should pick.
- **OV (~$150–300/yr, worldwide, USB token)** is the traditional route, now with
  hardware attached.
- **EV (~$300–600/yr)** is the only tier that skips SmartScreen's warm-up and
  the only reason to pay the premium.
- **Whatever you choose, timestamp and keep the publisher identity stable.**

The scripts here get you to the point where signing is a solved step in your
pipeline instead of a support ticket you can't answer.
