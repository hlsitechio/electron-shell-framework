#Requires -Version 5.1
<#
.SYNOPSIS
    Verifies Authenticode signatures on Windows executables, and explains the
    verdict in plain language.

.DESCRIPTION
    Get-AuthenticodeSignature tells you Valid / NotSigned / UnknownError, which is
    useful but does not tell you WHY. This script adds the three things that
    actually explain a failure:

      - whether the certificate chain builds (a self-signed cert fails here, and
        that is expected, not a bug)
      - whether a timestamp is present (without one, signatures rot on expiry)
      - whether SmartScreen would likely object

    It also checks the trust stores, so you can see at a glance whether your own
    certificate is installed on this machine.

.PARAMETER Path
    A file, or a directory to scan recursively for .exe/.msi/.dll.

.EXAMPLE
    pwsh scripts/signing/verify-signature.ps1 -Path release
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Path
)

$ErrorActionPreference = 'Stop'

# --- collect targets ---------------------------------------------------------
$targets = @()
if (Test-Path $Path -PathType Container) {
    $targets = Get-ChildItem -Path $Path -Recurse -Include '*.exe', '*.msi', '*.dll' -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch '\\node_modules\\' }
} elseif (Test-Path $Path -PathType Leaf) {
    $targets = @(Get-Item $Path)
} else {
    throw "Path not found: $Path"
}

Write-Host ''
Write-Host '  Signature verification' -ForegroundColor Cyan
Write-Host '  ----------------------' -ForegroundColor Cyan

if (-not $targets) {
    Write-Host '  ! No .exe / .msi / .dll found.' -ForegroundColor Yellow
    exit 0
}

$signed = 0
$unsigned = 0
$untrusted = 0

foreach ($t in $targets) {
    Write-Host ''
    Write-Host ("  {0}" -f $t.Name) -ForegroundColor White
    Write-Host ("    {0}" -f $t.FullName) -ForegroundColor DarkGray

    $sig = Get-AuthenticodeSignature -FilePath $t.FullName

    if ($sig.Status -eq 'NotSigned') {
        Write-Host '    status      NOT SIGNED' -ForegroundColor Red
        Write-Host '    meaning     Windows treats this as an unknown publisher.' -ForegroundColor DarkGray
        $unsigned++
        continue
    }

    # --- signature present ---
    $color = switch ($sig.Status) {
        'Valid'   { 'Green' }
        default   { 'Yellow' }
    }
    Write-Host ("    status      {0}" -f $sig.Status) -ForegroundColor $color

    $cert = $sig.SignerCertificate
    if ($cert) {
        Write-Host ("    subject     {0}" -f $cert.Subject)
        Write-Host ("    issuer      {0}" -f $cert.Issuer)
        Write-Host ("    thumbprint  {0}" -f $cert.Thumbprint)
        Write-Host ("    valid       {0:yyyy-MM-dd} -> {1:yyyy-MM-dd}" -f $cert.NotBefore, $cert.NotAfter)

        # self-signed?
        $isSelfSigned = ($cert.Subject -eq $cert.Issuer)
        if ($isSelfSigned) {
            Write-Host '    type        SELF-SIGNED (demo certificate)' -ForegroundColor Yellow
            Write-Host '                On this machine only. Will NOT clear warnings for other people.' -ForegroundColor DarkGray
        } else {
            Write-Host '    type        CA-issued' -ForegroundColor Green
        }

        # is it trusted here?
        $inRoot     = Test-Path ("Cert:\LocalMachine\Root\{0}" -f $cert.Thumbprint)
        $inTrusted  = Test-Path ("Cert:\LocalMachine\TrustedPeople\{0}" -f $cert.Thumbprint)
        if ($sig.Status -eq 'Valid') {
            Write-Host '    trust       chain builds — trusted on this machine' -ForegroundColor Green
        } else {
            Write-Host ("    trust       chain does NOT build (Root={0}, TrustedPeople={1})" -f $inRoot, $inTrusted) -ForegroundColor Yellow
            if ($isSelfSigned -and -not $inRoot) {
                Write-Host '                Expected for a self-signed cert. Install it to make this Valid:' -ForegroundColor DarkGray
                Write-Host '                Import-Certificate -FilePath <your.cer> -CertStoreLocation Cert:\LocalMachine\Root' -ForegroundColor DarkGray
            }
        }
    }

    # --- timestamp ---
    # A countersignature means the signature survives the certificate expiring.
    # Note: TimeStamperCertificate is the TIMESTAMP AUTHORITY's own certificate,
    # so its dates are the TSA's, not the moment your file was signed. We report
    # presence and who stamped it — never a date that would mislead.
    $hasTimestamp = ($null -ne $sig.TimeStamperCertificate)
    if ($hasTimestamp) {
        $tsa = $sig.TimeStamperCertificate.Subject
        Write-Host '    timestamp   present' -ForegroundColor Green
        Write-Host ("                stamped by {0}" -f $tsa) -ForegroundColor DarkGray
        Write-Host '                Signature stays valid after the certificate expires.' -ForegroundColor DarkGray
    } else {
        Write-Host '    timestamp   MISSING' -ForegroundColor Yellow
        Write-Host '                Signature dies when the certificate expires. Re-sign with' -ForegroundColor DarkGray
        Write-Host '                /tr http://timestamp.digicert.com to fix that.' -ForegroundColor DarkGray
    }

    if ($sig.Status -eq 'Valid') { $signed++ } else { $untrusted++ }
}

Write-Host ''
Write-Host '  Summary' -ForegroundColor Cyan
Write-Host ("    signed + trusted   {0}" -f $signed) -ForegroundColor Green
Write-Host ("    signed, untrusted  {0}" -f $untrusted) -ForegroundColor Yellow
Write-Host ("    not signed         {0}" -f $unsigned) -ForegroundColor Red
Write-Host ''
Write-Host '  Reminder: a valid signature here does NOT mean SmartScreen is satisfied.' -ForegroundColor DarkGray
Write-Host '  SmartScreen builds reputation per certificate over time. See docs/CODE-SIGNING.md.' -ForegroundColor DarkGray
Write-Host ''
