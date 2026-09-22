---
name: electron-shell-packaging
description: Build, sign, and package Electron desktop releases.
version: 1.0.0
author: hlsitechio, Hermes Agent
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [electron, packaging, code-signing, nsis, release, smartcreen]
    related_skills: [electron-shell-framework]
---

# Packaging & code signing

Getting from source to an installer someone else can run — including the part
everyone underestimates: Windows will call you an unknown publisher until you pay
for the privilege of not being one.

## When to Use

- Producing an installer or portable exe
- Setting up or debugging code signing
- A user reports "Windows protected your PC" or "unknown publisher"
- Don't use for: running the app in dev (`npm run dev`)

## Build

```bash
npm run dist:win     # NSIS installer + portable exe → release/
npm run dist:dir     # unpacked build, faster for checking output
npm run dist         # current platform
```

Config lives in `electron-builder.yml`. Output: `release/${version}/`.

## Signing — the honest version

```bash
node scripts/shell-cli.js sign demo     # self-signed demo cert → .signing/
pwsh scripts/signing/sign.ps1 -PfxPath .signing/demo-codesign.pfx -Password <pw> -Path release
pwsh scripts/signing/sign.ps1 -Thumbprint <thumbprint> -Path release   # USB token / HSM
node scripts/shell-cli.js sign check    # verify everything in release/
pwsh scripts/signing/verify-signature.ps1 -Path release
```

`sign.ps1` always attaches an RFC 3161 timestamp. **Keep it.** Without a
timestamp every signature you ever produced becomes invalid the day your
certificate expires; with it they stay valid forever.

### What actually clears SmartScreen

| Option                                            | Cost        | Effect                                                  |
| ------------------------------------------------- | ----------- | ------------------------------------------------------- |
| Self-signed                                       | Free        | **None** for other people. Learning + internal only     |
| Azure Artifact Signing (formerly Trusted Signing) | ~$9.99/mo   | Real fix. No hardware. **US + Canada individuals**      |
| OV certificate                                    | $150–300/yr | Real fix, worldwide, on a USB token/HSM since June 2023 |
| EV certificate                                    | $300–600/yr | The only tier that skips reputation warm-up             |

**The trap to never repeat to a user:** a brand-new paid certificate does **not**
immediately silence SmartScreen. Reputation accrues per certificate over time, so
you see warnings for days or weeks despite technically perfect signing. Buy before
launch, not the week you ship.

Full detail, the 2023 hardware-token change, CI wiring for Azure:
**`docs/CODE-SIGNING.md`**.

## Pitfalls

- **`release/` is gitignored — and so are `*.pfx` / `*.p12`.** Keep it that way.
  A leaked signing key lets someone publish malware as you.
- Never put a signing password in the repo, in `electron-builder.yml`, or in CI
  logs. Secret store only.
- Since June 2023 OV keys live on hardware and **cannot be exported** —
  `Export-PfxCertificate` fails, and CI must use a cloud signer or a runner with
  the token attached. Don't design a pipeline around a downloadable `.pfx`.
- `npm start` builds _and_ launches; for a bundle only use `npm run build`.
- Verify on a **clean machine you've never built on**. That is the only test that
  reflects a stranger's experience.
- Don't disable the security posture (`sandbox`, `contextIsolation`, electron
  fuses) to make packaging easier. It's there for a reason.

## Verification

1. `node scripts/shell-cli.js sign check` — every `.exe` signed, timestamp present
2. Install the artifact **on a clean machine** and launch it
3. Confirm the publisher name matches what you claim publicly
4. Certificate expiry is on a calendar with a reminder — renewal is not automatic
