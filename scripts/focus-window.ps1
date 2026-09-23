Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  public class Win32Window {
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  }
"@

$electronPids = (Get-Process electron -ErrorAction SilentlyContinue).Id
Write-Host "Electron PIDs: $($electronPids -join ', ')"

[Win32Window]::EnumWindows({
  param($hwnd, $lparam)
  $pidOut = [uint32]0
  [Win32Window]::GetWindowThreadProcessId($hwnd, [ref]$pidOut)
  if ($electronPids -contains $pidOut -and [Win32Window]::IsWindowVisible($hwnd)) {
    $sb = New-Object System.Text.StringBuilder 256
    [Win32Window]::GetWindowText($hwnd, $sb, 256) | Out-Null
    $title = $sb.ToString()
    Write-Host "Found Window HWND: $hwnd PID: $pidOut Title: '$title'"
    # SW_RESTORE = 9, SW_SHOW = 5
    [Win32Window]::ShowWindow($hwnd, 9) | Out-Null
    [Win32Window]::ShowWindow($hwnd, 5) | Out-Null
    [Win32Window]::SetForegroundWindow($hwnd) | Out-Null
  }
  return $true
}, [IntPtr]::Zero) | Out-Null
