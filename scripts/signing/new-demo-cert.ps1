#Requires -Version 5.1
<#
.SYNOPSIS
    Creates a SELF-SIGNED code signing certificate — for learning and local testing only.

.DESCRIPTION
    This produces a certificate you can use to sign your app and verify the whole
    pipeline works, end to end, without paying for anything.

    IT DOES NOT SOLVE SMARTSREEN. A self-signed certificate only establishes trust
    on machines where you have manually installed it into "Trusted Root
    Certification Authorities" and "Trusted Publishers". On a stranger's PC it is
    worth exactly nothing — Windows will still warn. Read docs/CODE-SIGNING.md for
    what actually works in production.

    What it IS good for:
      - learning the signtool / electron-builder wiring
      - testing your CI signing step before you buy a real certificate
      - internal builds on machines you control

.PARAMETER Subject
    Certificate subject. Use CN=Your App Name.

.PARAMETER OutputDir
    Where to write the .pfx and the public .cer.

.PARAMETER Password
    Password protecting the exported .pfx.

.PARAMETER ValidYears
    Validity period in years.

.EXAMPLE
    pwsh scripts/signing/new-demo-cert.ps1 -Subject "CN=Demo App Shell" -OutputDir .signing
#>
[CmdletBinding()]
param(
    [string]$Subject   = 'CN=Demo App Shell',
    [string]$OutputDir = '.signing',
    [string]$Password  = 'demo-password',
    [int]$ValidYears   = 2
)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '  Self-signed code signing certificate (DEMO ONLY)' -ForegroundColor Cyan
Write-Host '  -------------------------------------------------' -ForegroundColor Cyan
Write-Host ''

# --- 1. create the certificate in the user's personal store -------------------
Write-Host '  [1/4] Creating certificate...' -ForegroundColor Blue

$cert = New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject $Subject `
    -KeyUsage DigitalSignature `
    -FriendlyName 'electron-shell-framework demo signing cert' `
    -CertStoreLocation 'Cert:\CurrentUser\My' `
    -NotAfter (Get-Date).AddYears($ValidYears) `
    -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.3')   # EKU: Code Signing

Write-Host ("        thumbprint {0}" -f $cert.Thumbprint) -ForegroundColor DarkGray

# --- 2. export the .pfx (private key) ---------------------------------------
Write-Host '  [2/4] Exporting .pfx (private key)...' -ForegroundColor Blue

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }
$OutputDir = (Resolve-Path $OutputDir).Path

$pfxPath = Join-Path $OutputDir 'demo-codesign.pfx'
$securePw = ConvertTo-SecureString -String $Password -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePw | Out-Null
Write-Host ("        {0}" -f $pfxPath) -ForegroundColor DarkGray

# --- 3. export the .cer (public half, safe to share) ------------------------
Write-Host '  [3/4] Exporting .cer (public certificate)...' -ForegroundColor Blue
$cerPath = Join-Path $OutputDir 'demo-codesign.cer'
Export-Certificate -Cert $cert -FilePath $cerPath -Type CERT | Out-Null
Write-Host ("        {0}" -f $cerPath) -ForegroundColor DarkGray

# --- 4. print the wiring ------------------------------------------------------
Write-Host '  [4/4] Done.' -ForegroundColor Green
Write-Host ''
Write-Host '  Sign a build:' -ForegroundColor Yellow
Write-Host ("    pwsh scripts/signing/sign.ps1 -PfxPath {0} -Password '{1}' -Path release" -f $pfxPath, $Password)
Write-Host ''
Write-Host '  Trust it on THIS machine (required for the signature to validate):' -ForegroundColor Yellow
Write-Host ("    Import-Certificate -FilePath '{0}' -CertStoreLocation Cert:\LocalMachine\TrustedPeople" -f $cerPath)
Write-Host '    # then, as Administrator, add it to Trusted Root:'
Write-Host ("    Import-Certificate -FilePath '{0}' -CertStoreLocation Cert:\LocalMachine\Root" -f $cerPath)
Write-Host ''
Write-Host '  REMINDER: this does NOT clear SmartScreen on other people''s PCs.' -ForegroundColor Red
Write-Host '  See docs/CODE-SIGNING.md for the real options.' -ForegroundColor Red
Write-Host ''

# machine-readable line for scripts
Write-Host ("THUMBPRINT={0}" -f $cert.Thumbprint)
Write-Host ("PFX={0}" -f $pfxPath)
Write-Host ("CER={0}" -f $cerPath)
