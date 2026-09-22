#Requires -Version 5.1
<#
.SYNOPSIS
    Signs Windows executables with signtool — a .pfx file or a store thumbprint.

.DESCRIPTION
    Wraps signtool.exe with sensible defaults: SHA-256 digests and an RFC 3161
    timestamp, both of which you want. The timestamp matters more than people
    realise — without it, every signature you have ever produced becomes invalid
    the day your certificate expires. With it, signatures stay valid forever.

    Two ways to point at a key:
      -PfxPath      a .pfx/.p12 file plus -Password
      -Thumbprint   a certificate already in Cert:\CurrentUser\My (used by
                    hardware tokens and HSMs, which cannot be exported)

    Since June 2023 all new OV code signing certificates are issued on hardware
    tokens or HSMs, so -Thumbprint is the path most people will actually use.

.PARAMETER Path
    A file, or a directory to scan recursively for .exe/.msi/.dll.

.PARAMETER PfxPath
    Path to a .pfx / .p12 containing the private key.

.PARAMETER Password
    Password for the .pfx.

.PARAMETER Thumbprint
    Certificate thumbprint in Cert:\CurrentUser\My (for token/HSM-backed certs).

.PARAMETER TimestampUrl
    RFC 3161 timestamp server. Default is DigiCert's free public one.

.PARAMETER SignTool
    Explicit path to signtool.exe. If omitted, it is located automatically.

.EXAMPLE
    pwsh scripts/signing/sign.ps1 -PfxPath .signing/demo-codesign.pfx -Password 'demo-password' -Path release

.EXAMPLE
    pwsh scripts/signing/sign.ps1 -Thumbprint ABC123... -Path release
#>
[CmdletBinding(DefaultParameterSetName = 'Pfx')]
param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $true, ParameterSetName = 'Pfx')]
    [string]$PfxPath,

    [Parameter(ParameterSetName = 'Pfx')]
    [string]$Password = '',

    [Parameter(Mandatory = $true, ParameterSetName = 'Store')]
    [string]$Thumbprint,

    [Parameter(ParameterSetName = 'Store')]
    [switch]$MachineStore,

    [string]$TimestampUrl = 'http://timestamp.digicert.com',

    [string]$SignTool
)

$ErrorActionPreference = 'Stop'

# --- locate signtool ---------------------------------------------------------
function Find-SignTool {
    $cmd = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $roots = @(
        "${env:ProgramFiles(x86)}\Windows Kits\10\bin",
        "$env:ProgramFiles\Windows Kits\10\bin"
    ) | Where-Object { Test-Path $_ }

    $candidates = foreach ($root in $roots) {
        Get-ChildItem -Path $root -Filter 'signtool.exe' -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match '\\x64\\' } |
            Sort-Object FullName -Descending
    }
    $best = $candidates | Select-Object -First 1
    if ($best) { return $best.FullName }

    throw "signtool.exe not found. Install the Windows SDK (Windows Kits 10) or pass -SignTool <path>."
}

if ($SignTool) {
    if (-not (Test-Path $SignTool)) { throw "-SignTool not found: $SignTool" }
} else {
    $SignTool = Find-SignTool
}

Write-Host ''
Write-Host '  signtool — sign' -ForegroundColor Cyan
Write-Host '  ---------------' -ForegroundColor Cyan
Write-Host ("  signtool    {0}" -f $SignTool) -ForegroundColor DarkGray

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

if (-not $targets) {
    Write-Host '  ! No .exe / .msi / .dll found to sign.' -ForegroundColor Yellow
    exit 0
}

Write-Host ("  targets     {0} file(s)" -f $targets.Count) -ForegroundColor DarkGray

# --- build the common arguments ---------------------------------------------
$common = @('sign', '/fd', 'SHA256', '/td', 'SHA256', '/tr', $TimestampUrl, '/v')

if ($PSCmdlet.ParameterSetName -eq 'Pfx') {
    if (-not (Test-Path $PfxPath)) { throw "PFX not found: $PfxPath" }
    $common += @('/f', (Resolve-Path $PfxPath).Path)
    if ($Password) { $common += @('/p', $Password) }
    Write-Host ("  key         .pfx  {0}" -f (Resolve-Path $PfxPath).Path) -ForegroundColor DarkGray
} else {
    # Store lookup. /sm = machine store, but the default here is the USER store,
    # because New-SelfSignedCertificate drops certs in Cert:\CurrentUser\My.
    # Most USB-token drivers also register in the user store. Pass -MachineStore
    # only if your certificate genuinely lives in Cert:\LocalMachine\My.
    $common += @('/sha1', $Thumbprint)
    if ($MachineStore) { $common += '/sm' }
    $storeName = if ($MachineStore) { 'LocalMachine\My' } else { 'CurrentUser\My' }
    Write-Host ("  key         cert store ({0}) thumbprint {1}" -f $storeName, $Thumbprint) -ForegroundColor DarkGray
}

Write-Host ''

# --- sign --------------------------------------------------------------------
$ok = 0
$failed = 0
foreach ($t in $targets) {
    Write-Host ("  -> {0}" -f $t.Name) -ForegroundColor Blue
    & $SignTool @common $t.FullName
    if ($LASTEXITCODE -eq 0) {
        $ok++
    } else {
        Write-Host ("     ! signtool exit {0}" -f $LASTEXITCODE) -ForegroundColor Red
        $failed++
    }
}

Write-Host ''
if ($failed -eq 0) {
    Write-Host ("  Signed {0} file(s)." -f $ok) -ForegroundColor Green
} else {
    Write-Host ("  Signed {0}, failed {1}." -f $ok, $failed) -ForegroundColor Yellow
}
Write-Host ''
Write-Host '  Verify with: pwsh scripts/signing/verify-signature.ps1 -Path release' -ForegroundColor DarkGray
Write-Host ''

if ($failed -gt 0) { exit 1 }
