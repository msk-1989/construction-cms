'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, ListTodo, Users, BarChart3, Bell, MessageSquare,
  Settings, ShieldCheck, Building2, ChevronLeft, LogOut, ChevronRight, X,
  Briefcase, HardHat, Globe, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { usePermissions } from '@/hooks/usePermissions'
import { getRoleLabel } from '@/lib/permissions'
import type { ViewType } from '@/types/cms'

interface MenuItem {
  view: ViewType
  label: string
  icon: React.ElementType
  permission: string
  badge?: string
}

interface BadgeCounts {
  tasks?: number
  notifications?: number
  projects?: number
  chat?: number
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const currentView = useAppStore((s) => s.currentView)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const { can, isAdmin, isSuperAdmin, role } = usePermissions()

  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({})
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await globalThis.fetch('/api/dashboard')
        if (res.ok && !cancelled) {
          const data = await res.json()
          const d = data.data || data
          setBadgeCounts({
            tasks: d.pendingTasks || 0,
            notifications: d.totalTasks ? 0 : 0,
            projects: d.activeProjects || 0,
          })
        }
      } catch {
        // silently fail
      }
    }
    const id = setInterval(load, 60000)
    void load()
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const menuItems: MenuItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'view:dashboard' },
    { view: 'projects', label: 'Projects', icon: FolderKanban, permission: 'view:projects', badge: badgeCounts.projects },
    { view: 'tasks', label: 'Tasks', icon: ListTodo, permission: 'view:tasks', badge: badgeCounts.tasks },
    { view: 'team', label: 'Team', icon: Users, permission: 'view:team' },
    { view: 'reports', label: 'Reports', icon: BarChart3, permission: 'view:reports' },
  ]

  const siteItems: MenuItem[] = [
    { view: 'site', label: 'Site Panel', icon: HardHat, permission: 'view:dashboard' },
  ]

  const corporateItems: MenuItem[] = [
    { view: 'corporate', label: 'Corporate', icon: Briefcase, permission: 'view:reports' },
  ]

  const externalItems: MenuItem[] = [
    { view: 'external', label: 'External', icon: Globe, permission: 'view:projects' },
  ]

  const adminItems: MenuItem[] = [
    { view: 'admin', label: isSuperAdmin ? 'Super Admin' : 'Admin Panel', icon: isSuperAdmin ? Shield : ShieldCheck, permission: 'view:admin' },
    { view: 'settings', label: 'Settings', icon: Settings, permission: 'view:settings' },
  ]

  const commItems: MenuItem[] = [
    { view: 'notifications', label: 'Notifications', icon: Bell, permission: 'view:notifications' },
    { view: 'chat', label: 'Chat', icon: MessageSquare, permission: 'view:chat' },
  ]

  const visibleItems = menuItems.filter((item) => can(item.permission as never))
  const visibleSiteItems = siteItems.filter((item) => can(item.permission as never))
  const visibleCorporateItems = corporateItems.filter((item) => can(item.permission as never))
  const visibleExternalItems = externalItems.filter((item) => can(item.permission as never))
  const visibleAdminItems = adminItems.filter((item) => can(item.permission as never))
  const visibleCommItems = commItems.filter((item) => can(item.permission as never))

  const handleNav = (view: ViewType) => {
    setCurrentView(view)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const renderNavSection = (items: MenuItem[], collapsed: boolean) => (
    <nav className="space-y-1 px-3">
      {items.map((item) => {
        const isActive = currentView === item.view
        const btn = (
          <button
            key={item.view}
            onClick={() => handleNav(item.view)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
          >
            <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-white')} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {item.badge && item.badge > 0 && !collapsed && (
              <Badge className="ml-auto h-5 min-w-5 px-1.5 text-[10px] bg-white/90 text-amber-700 border-0 font-bold">
                {item.badge > 99 ? '99+' : item.badge}
              </Badge>
            )}
            {item.badge && item.badge > 0 && collapsed && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </button>
        )
        if (collapsed) {
          return (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>{btn}</TooltipTrigger>
              <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
            </Tooltip>
          )
        }
        return btn
      })}
    </nav>
  )

  const sidebarContent = (collapsed: boolean) => (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h2 className="font-bold text-lg tracking-tight">CMS</h2>
                <p className="text-[10px] text-muted-foreground -mt-0.5 leading-tight">Construction Mgmt</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Nav Items */}
        <ScrollArea className="flex-1 py-3">
          {/* Main Navigation */}
          {renderNavSection(visibleItems, collapsed)}

          {/* Site Panel Section */}
          {visibleSiteItems.length > 0 && (isAdmin || role === 'MEMBER') && (
            <>
              <Separator className="my-3 mx-3" />
              {!collapsed && <p className="px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Site Operations</p>}
              {renderNavSection(visibleSiteItems, collapsed)}
            </>
          )}

          {/* Corporate Panel Section */}
          {visibleCorporateItems.length > 0 && isAdmin && (
            <>
              <Separator className="my-3 mx-3" />
              {!collapsed && <p className="px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Corporate</p>}
              {renderNavSection(visibleCorporateItems, collapsed)}
            </>
          )}

          {/* External Panel Section */}
          {visibleExternalItems.length > 0 && !isAdmin && (
            <>
              <Separator className="my-3 mx-3" />
              {!collapsed && <p className="px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">External</p>}
              {renderNavSection(visibleExternalItems, collapsed)}
            </>
          )}

          {/* Communication */}
          {visibleCommItems.length > 0 && (
            <>
              <Separator className="my-3 mx-3" />
              {renderNavSection(visibleCommItems, collapsed)}
            </>
          )}

          {/* Admin Section */}
          {visibleAdminItems.length > 0 && (
            <>
              <Separator className="my-3 mx-3" />
              {!collapsed && <p className="px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Administration</p>}
              {renderNavSection(visibleAdminItems, collapsed)}
            </>
          )}
        </ScrollArea>

        <Separator />

        {/* User Info */}
        <div className="shrink-0 p-3">
          <div className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5', collapsed && 'justify-center px-2')}>
            <Avatar className="h-8 w-8 shrink-0 ring-2 ring-amber-500/20">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.role ? getRoleLabel(user.role) : ''}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex shrink-0 px-3 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-center text-muted-foreground hover:text-foreground h-8"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col border-r bg-card h-screen sticky top-0 z-30 shrink-0"
        animate={{ width: sidebarOpen ? 256 : 68 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {sidebarContent(!sidebarOpen)}
      </motion.aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-3.5 left-3 z-50 bg-card/80 backdrop-blur border shadow-sm"
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            {sidebarContent(false)}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}