Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  public class WinCheck {
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  }
"@

$pids = (Get-Process electron -ErrorAction SilentlyContinue).Id
$found = 0
[WinCheck]::EnumWindows({
  param($hwnd, $lparam)
  $pidOut = [uint32]0
  [WinCheck]::GetWindowThreadProcessId($hwnd, [ref]$pidOut)
  if ($pids -contains $pidOut) {
    $sb = New-Object System.Text.StringBuilder 256
    [WinCheck]::GetWindowText($hwnd, $sb, 256) | Out-Null
    $vis = [WinCheck]::IsWindowVisible($hwnd)
    Write-Host "HWND: $hwnd, PID: $pidOut, Vis: $vis, Title: '$($sb.ToString())'"
  }
  return $true
}, [IntPtr]::Zero) | Out-Null
