'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  User, Moon, Sun, Bell, BellOff, Clock, Info, Save, Loader2,
  Mail, Shield, HardHat, FileText, DollarSign, MessageSquare, Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/useAuthStore'
import { useTheme } from 'next-themes'

interface NotificationPrefs {
  taskUpdates: boolean
  projectUpdates: boolean
  rfiSubmittals: boolean
  financialAlerts: boolean
  dailyLogs: boolean
  safetyReports: boolean
  chatMessages: boolean
  systemUpdates: boolean
  emailDigest: 'realtime' | 'daily' | 'weekly' | 'off'
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
}

const DEFAULT_PREFS: NotificationPrefs = {
  taskUpdates: true,
  projectUpdates: true,
  rfiSubmittals: true,
  financialAlerts: true,
  dailyLogs: false,
  safetyReports: true,
  chatMessages: true,
  systemUpdates: false,
  emailDigest: 'realtime',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
}

const NOTIFICATION_TOGGLES: { key: keyof NotificationPrefs; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'taskUpdates', label: 'Task Updates', icon: FileText, desc: 'Task assignments, status changes, due date reminders' },
  { key: 'projectUpdates', label: 'Project Updates', icon: HardHat, desc: 'Project status changes, milestones, progress updates' },
  { key: 'rfiSubmittals', label: 'RFI & Submittals', icon: FileText, desc: 'New RFIs, submittal reviews, and responses' },
  { key: 'financialAlerts', label: 'Financial Alerts', icon: DollarSign, desc: 'Budget thresholds, expense approvals, payment updates' },
  { key: 'dailyLogs', label: 'Daily Logs', icon: FileText, desc: 'Daily log entries and field reports' },
  { key: 'safetyReports', label: 'Safety Reports', icon: Shield, desc: 'Safety incidents, inspections, and compliance alerts' },
  { key: 'chatMessages', label: 'Chat Messages', icon: MessageSquare, desc: 'Direct messages and channel mentions' },
  { key: 'systemUpdates', label: 'System Updates', icon: Settings, desc: 'Platform updates, maintenance notices' },
]

export function SettingsView() {
  const { user, updateUser } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Profile form
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' })

  // Notification prefs
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email, phone: user.phone || '' })
    }
  }, [user])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cms-notification-prefs')
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) })
    } catch { /* use defaults */ }
  }, [])

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    try {
      const res = await globalThis.fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user?.id, name: profile.name, email: profile.email, phone: profile.phone }),
      })
      const json = await res.json()
      if (json.success) {
        if (user) updateUser({ ...user, name: profile.name, email: profile.email, phone: profile.phone })
        toast.success('Profile updated successfully')
      } else {
        toast.error(json.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePref = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      localStorage.setItem('cms-notification-prefs', JSON.stringify(updated))
      return updated
    })
  }

  const handleSetPref = (key: keyof NotificationPrefs, value: string) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('cms-notification-prefs', JSON.stringify(updated))
      return updated
    })
  }

  const handleSavePrefs = () => {
    localStorage.setItem('cms-notification-prefs', JSON.stringify(prefs))
    toast.success('Notification preferences saved')
  }

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm"><CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3"><div className="h-5 w-5 bg-muted rounded" /><div className="h-5 w-40 bg-muted rounded" /></div>
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, j) => <div key={j} className="h-10 bg-muted rounded" />)}</div>
            </CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* =================== PROFILE SECTION =================== */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Profile</CardTitle>
                  <CardDescription className="text-xs">Update your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Full Name</Label>
                <Input
                  id="settings-name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email Address</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-phone">Phone Number</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <span>Role:</span>
                <span className="font-medium text-foreground">{user?.role || 'MEMBER'}</span>
                <span className="mx-1">·</span>
                <span>Status:</span>
                <span className={cn('font-medium', user?.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600')}>
                  {user?.status || 'ACTIVE'}
                </span>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" /> Save Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* =================== APPEARANCE SECTION =================== */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">Appearance</CardTitle>
                  <CardDescription className="text-xs">Customize the look and feel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Theme Preview</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      theme === 'light' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-transparent bg-white dark:bg-zinc-900 hover:border-muted'
                    )}
                  >
                    <Sun className="h-5 w-5 mb-2 text-amber-500" />
                    <p className="text-xs font-medium">Light</p>
                    <p className="text-[10px] text-muted-foreground">Clean and bright</p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      theme === 'dark' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-transparent bg-zinc-800 hover:border-muted'
                    )}
                  >
                    <Moon className="h-5 w-5 mb-2 text-amber-500" />
                    <p className="text-xs font-medium">Dark</p>
                    <p className="text-[10px] text-muted-foreground">Easy on the eyes</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* =================== NOTIFICATION PREFERENCES =================== */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs">Choose what notifications you receive and how</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NOTIFICATION_TOGGLES.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={prefs[item.key] as boolean}
                      onCheckedChange={() => handleTogglePref(item.key)}
                      className="shrink-0 ml-3"
                    />
                  </div>
                ))}
              </div>

              <Separator />

              {/* Email Digest */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Digest</p>
                    <p className="text-xs text-muted-foreground">How often to receive email summaries</p>
                  </div>
                </div>
                <Select value={prefs.emailDigest} onValueChange={(v) => handleSetPref('emailDigest', v)}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Quiet Hours */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Quiet Hours</p>
                      <p className="text-xs text-muted-foreground">Pause notifications during specific hours</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.quietHoursEnabled}
                    onCheckedChange={() => handleTogglePref('quietHoursEnabled')}
                  />
                </div>
                {prefs.quietHoursEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 pl-8"
                  >
                    <div className="space-y-1">
                      <Label htmlFor="quiet-start" className="text-xs">Start</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={prefs.quietHoursStart}
                        onChange={(e) => handleSetPref('quietHoursStart', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <span className="text-muted-foreground mt-5">to</span>
                    <div className="space-y-1">
                      <Label htmlFor="quiet-end" className="text-xs">End</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={prefs.quietHoursEnd}
                        onChange={(e) => handleSetPref('quietHoursEnd', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePrefs} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Save className="h-4 w-4 mr-2" /> Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* =================== ABOUT SECTION =================== */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base">About</CardTitle>
                  <CardDescription className="text-xs">Application information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">0.2.0</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Framework</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">Next.js 16</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">UI Library</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">shadcn/ui + Tailwind</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Database</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">SQLite + Prisma</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Charts</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">Recharts</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">State Management</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">Zustand</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Animations</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">Framer Motion</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Language</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">TypeScript 5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}