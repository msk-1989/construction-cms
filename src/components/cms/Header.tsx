'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Search, Bell, Sun, Moon, User, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { useTheme } from 'next-themes'
import type { Notification } from '@/types/cms'

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  'project-detail': 'Project Details',
  tasks: 'Tasks',
  team: 'Team',
  reports: 'Reports',
  settings: 'Settings',
  notifications: 'Notifications',
  admin: 'Super Admin',
  chat: 'Chat',
  procurement: 'Procurement',
  hr: 'HR Management',
  finance: 'Financial Management',
  qa: 'Quality Assurance',
  safety: 'Safety Management',
  'store-panel': 'Store Management',
  corporate: 'Corporate',
  site: 'Site Operations',
  external: 'External Portal',
}

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const currentView = useAppStore((s) => s.currentView)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const { theme, setTheme } = useTheme()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setNotifLoading(true)
        const res = await globalThis.fetch('/api/notifications')
        if (res.ok && !cancelled) {
          const data = await res.json()
          const items = Array.isArray(data) ? data : data.notifications || []
          setNotifications(items.slice(0, 10))
          setUnreadCount(items.filter((n: Notification) => !n.read).length)
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setNotifLoading(false)
      }
    }
    const id = setInterval(load, 30000)
    void load()
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    try {
      await globalThis.fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true, userId: user?.id }) })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    // Search could navigate or show results - for now just toast
    setCurrentView('projects')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-20 h-16 border-b bg-card/80 backdrop-blur-xl flex items-center px-4 sm:px-6 gap-3 shrink-0">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb */}
      <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-muted-foreground font-medium">CBOS</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground truncate">{VIEW_LABELS[currentView] || 'Dashboard'}</span>
      </nav>

      {/* Mobile title */}
      <span className="sm:hidden font-semibold text-sm truncate">{VIEW_LABELS[currentView] || 'Dashboard'}</span>

      <div className="flex-1" />

      {/* Search */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-xs w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-amber-500/30"
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </Button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative"
            onClick={() => {
              const next = !notifOpen
              setNotifOpen(next)
              if (next) {
                void (async () => {
                  try {
                    setNotifLoading(true)
                    const res = await globalThis.fetch('/api/notifications')
                    if (res.ok) {
                      const data = await res.json()
                      const items = Array.isArray(data) ? data : data.notifications || []
                      setNotifications(items.slice(0, 10))
                      setUnreadCount(items.filter((n: Notification) => !n.read).length)
                    }
                  } catch { /* silent */ }
                  finally { setNotifLoading(false) }
                })()
              }
            }}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border shadow-xl rounded-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 hover:text-amber-700" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-80">
                {notifLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { setCurrentView('notifications'); setNotifOpen(false) }}
                        className={cn(
                          'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                          !n.read && 'bg-amber-50/50 dark:bg-amber-900/10'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm truncate', !n.read && 'font-medium')}>{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => { setCurrentView('notifications'); setNotifOpen(false) }}
                >
                  View all notifications
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium max-w-24 truncate">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">{user?.name}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setCurrentView('settings')}>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}