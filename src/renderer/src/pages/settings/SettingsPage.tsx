import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Slider } from '@renderer/components/ui/slider'
import { Separator } from '@renderer/components/ui/separator'
import { Switch } from '@renderer/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { useBranding } from '@renderer/lib/useBranding'
import { useTheme } from '@renderer/components/theme/ThemeProvider'
import type { UpdateStatus } from '@shared/updater-types'

type ThemePref = 'dark' | 'light'

const PREF_KEY = 'settings:appearance'
const PROFILE_KEY = 'settings:profile'

function UpdateState({ status }: { status: UpdateStatus }): React.JSX.Element {
  switch (status.state) {
    case 'dev':
      return (
        <p className="text-xs text-muted-foreground">
          Auto-update is active in packaged builds only (dev mode: off).
        </p>
      )
    case 'idle':
      return (
        <p className="text-xs text-muted-foreground">
          Click check to look for a newer release on GitHub.
        </p>
      )
    case 'checking':
      return <p className="text-xs text-muted-foreground">Checking for updates…</p>
    case 'available':
      return (
        <p className="text-xs text-emerald-600">Update v{status.version} found — downloading…</p>
      )
    case 'not-available':
      return <p className="text-xs text-muted-foreground">You're on the latest version.</p>
    case 'downloading':
      return <p className="text-xs text-muted-foreground">Downloading… {status.percent}%</p>
    case 'downloaded':
      return (
        <p className="text-xs text-emerald-600">v{status.version} ready — restart to install.</p>
      )
    case 'error':
      return <p className="text-xs text-destructive">Update failed: {status.message}</p>
    default:
      return <p className="text-xs text-muted-foreground" />
  }
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [animations, setAnimations] = useState(true)
  const [appVersion, setAppVersion] = useState('0.1.0')

  // profile
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')

  // opacity
  const [opacity, setOpacity] = useState(100)

  // branding
  const { branding, setAppName, setLogo } = useBranding()

  // updates
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ state: 'idle' })

  useEffect(() => {
    void window.api?.update
      ?.getStatus?.()
      .then(setUpdateStatus)
      .catch(() => {})
    const off = window.api?.update?.onStatus?.((s) => setUpdateStatus(s))
    return off
  }, [])

  useEffect(() => {
    void window.api?.app
      ?.version?.()
      .then((v) => setAppVersion(v))
      .catch(() => {})
    void window.api?.config
      ?.get?.('settings:opacity')
      .then((o) => {
        if (typeof o === 'number') setOpacity(Math.round(o * 100))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const pref = await window.api?.config?.get?.(PREF_KEY)
        if (pref && typeof pref === 'object') {
          const p = pref as { sidebarCollapsed?: boolean; animations?: boolean }
          if (typeof p.sidebarCollapsed === 'boolean') setSidebarCollapsed(p.sidebarCollapsed)
          if (typeof p.animations === 'boolean') setAnimations(p.animations)
        }
        const prof = await window.api?.config?.get?.(PROFILE_KEY)
        if (prof && typeof prof === 'object') {
          const p = prof as { displayName?: string; email?: string }
          if (typeof p.displayName === 'string') setDisplayName(p.displayName)
          if (typeof p.email === 'string') setEmail(p.email)
        }
      } catch {
        /* preload missing */
      }
    }
    void load()
  }, [])

  const persist = useCallback(async (key: string, partial: Record<string, unknown>) => {
    try {
      const existing = await window.api?.config?.get?.(key)
      const merged = {
        ...(typeof existing === 'object' && existing ? (existing as object) : {}),
        ...partial
      }
      await window.api?.config?.set?.(key, merged)
    } catch {
      /* preload missing */
    }
  }, [])

  const onSidebarToggle = (checked: boolean) => {
    setSidebarCollapsed(checked)
    void persist(PREF_KEY, { sidebarCollapsed: checked })
  }

  const onAnimationsToggle = (checked: boolean) => {
    setAnimations(checked)
    void persist(PREF_KEY, { animations: checked })
  }

  const onOpacityChange = (value: number[]) => {
    const v = value[0]
    setOpacity(v)
    window.api?.window?.setOpacity?.(v / 100)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Framework preferences are persisted to an encrypted config file.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Theme and shell behaviour</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-xs text-muted-foreground">Persisted across restarts</p>
                </div>
                <Select value={theme} onValueChange={(v) => setTheme(v as ThemePref)}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Start with sidebar collapsed</Label>
                  <p className="text-xs text-muted-foreground">Applies on next launch</p>
                </div>
                <Switch checked={sidebarCollapsed} onCheckedChange={onSidebarToggle} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Animations</Label>
                  <p className="text-xs text-muted-foreground">Transitions on collapse / expand</p>
                </div>
                <Switch checked={animations} onCheckedChange={onAnimationsToggle} />
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between">
                  <Label>Window opacity</Label>
                  <span className="text-xs tabular-nums text-muted-foreground">{opacity}%</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Transparency of the whole app window
                </p>
                <Slider
                  className="mt-3"
                  value={[opacity]}
                  min={30}
                  max={100}
                  step={1}
                  onValueChange={onOpacityChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Framework version</span>
                <Badge variant="secondary">{appVersion}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Backend</span>
                <span className="text-sm">Not connected — IPC contract ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage</span>
                <span className="text-sm">Encrypted safeStorage config</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <span className="text-sm">Light / Dark — neutral grey palette</span>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
              <CardDescription>Auto-update via GitHub releases (packaged builds)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Version {appVersion}</Label>
                  <div className="mt-1">
                    <UpdateState status={updateStatus} />
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {updateStatus.state === 'downloaded' ? (
                    <Button size="sm" onClick={() => window.api?.update?.quitAndInstall?.()}>
                      Restart & install
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        updateStatus.state === 'checking' || updateStatus.state === 'downloading'
                      }
                      onClick={() => void window.api?.update?.check?.()}
                    >
                      <RefreshCw
                        className={`mr-1.5 h-3.5 w-3.5 ${updateStatus.state === 'checking' || updateStatus.state === 'downloading' ? 'animate-spin' : ''}`}
                      />
                      Check for updates
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>App name and logo — shown across the shell</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="app-name">App name</Label>
                <Input
                  id="app-name"
                  value={branding.appName}
                  placeholder="App Shell"
                  onChange={(e) => setAppName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used in the sidebar brand and the footer.
                </p>
              </div>

              <Separator />

              <div className="flex items-center gap-4">
                {branding.logo ? (
                  <img
                    src={branding.logo}
                    alt="logo"
                    className="h-12 w-12 rounded-lg object-contain"
                    style={{ background: 'hsl(var(--muted))' }}
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-primary-foreground"
                    style={{ background: 'hsl(var(--primary))' }}
                  >
                    {branding.appName.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <span className="inline-flex h-8 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-xs shadow-xs transition-colors hover:bg-accent">
                      Upload logo
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () =>
                          setLogo(typeof reader.result === 'string' ? reader.result : null)
                        reader.readAsDataURL(file)
                      }}
                    />
                  </label>
                  {branding.logo && (
                    <Button size="sm" variant="ghost" onClick={() => setLogo(null)}>
                      Reset to default
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your identity across the framework</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rounded profile picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    <User className="h-7 w-7" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button size="sm" variant="outline">
                    Change picture
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG or SVG — square works best.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Display name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    placeholder="Your name"
                    onChange={(e) => setDisplayName(e.target.value)}
                    onBlur={() => void persist(PROFILE_KEY, { displayName })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => void persist(PROFILE_KEY, { email })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
