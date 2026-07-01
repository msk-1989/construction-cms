'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, ListTodo, Users, BarChart3, Bell, MessageSquare,
  Settings, ShieldCheck, Building2, ChevronLeft, LogOut, ChevronRight, X,
  Briefcase, HardHat, Globe, Shield,
  UserCog, UserPlus, Clock, DollarSign, FileText, ShoppingCart, Truck,
  CreditCard, CheckSquare, AlertTriangle, FileCheck, ClipboardList,
  Warehouse, Package, PackageCheck, Box, FileSpreadsheet, Camera,
  FileQuestion, FileSearch, ClipboardCheck, Megaphone, ShieldAlert,
  BookOpen, PenTool, Wrench, CalendarDays,
  Clipboard, FileBarChart, FileDown, Timer, Receipt, FolderOpen,
  Eye, PenLine, Ruler, Compass, BadgeDollarSign, Handshake, Archive,
  ClipboardPaste, CheckCircle2, XCircle, AlertOctagon, Flame,
  BookMarked, GraduationCap, UsersRound, TestTubes, FlaskConical, Layers,
  WarehouseIcon, ArrowDownToLine, ArrowUpFromLine, BarChartBig, ListChecks,
  Target, TrendingUp, PieChart,
  FilePlus, FilePen, FileSignature, Scale, FileBadge, FolderCog,
  BadgeInfo, FileClock, FilePlus2, ScanSearch, SearchCheck
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

// ========================
// Icon Map
// ========================
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, FolderKanban, ListTodo, Users, BarChart3, Bell, MessageSquare,
  Settings, ShieldCheck, Building2, Briefcase, HardHat, Globe, Shield,
  UserCog, UserPlus, Clock, DollarSign, FileText, ShoppingCart, Truck,
  CreditCard, CheckSquare, AlertTriangle, FileCheck, ClipboardList,
  Warehouse, Package, PackageCheck, Box, FileSpreadsheet, Camera,
  FileQuestion, FileSearch, ClipboardCheck, Megaphone, ShieldAlert,
  BookOpen, PenTool, Wrench, CalendarDays,
  Clipboard, FileBarChart, FileDown, Timer, Receipt, FolderOpen,
  Eye, PenLine, Ruler, Compass, BadgeDollarSign, Handshake, Archive,
  ClipboardPaste, CheckCircle2, XCircle, AlertOctagon, Flame,
  BookMarked, GraduationCap, UsersRound, TestTubes, FlaskConical, Layers,
  ArrowDownToLine, ArrowUpFromLine, BarChartBig, ListChecks,
  Target, TrendingUp, PieChart, Briefcase, FilePlus, FilePen,
  FileSignature, Scale, FileBadge, FolderCog, BadgeInfo, Calendar,
  FileClock, FilePlus2, ScanSearch, SearchCheck, ShieldCheck,
}

// ========================
// Menu Types
// ========================
interface SidebarMenuItem {
  view: ViewType
  label: string
  icon: string
  children?: { view: ViewType; label: string; icon?: string }[]
}

interface SidebarMenuSection {
  label?: string
  items: SidebarMenuItem[]
}

// ========================
// Role-Based Sidebar Config
// ========================
const ROLES_SIDEBAR_CONFIG: Record<string, SidebarMenuSection[]> = {
  SUPER_ADMIN: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'admin', label: 'User Management', icon: 'UserCog' },
      ],
    },
    {
      label: 'System',
      items: [
        { view: 'admin', label: 'Company Management', icon: 'Building2' },
        { view: 'admin', label: 'Exceptional Grants', icon: 'ShieldAlert' },
        { view: 'settings', label: 'System Settings', icon: 'Settings' },
        { view: 'reports', label: 'Audit Logs', icon: 'FileClock' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'projects', label: 'All Projects', icon: 'FolderKanban' },
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
      ],
    },
  ],

  CEO: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'projects', label: 'All Projects', icon: 'FolderKanban' },
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'team', label: 'Team', icon: 'Users' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  CFO: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Financial Management',
      items: [
        { view: 'finance', label: 'Invoices', icon: 'FileText' },
        { view: 'finance', label: 'Payment Approval', icon: 'CreditCard' },
        { view: 'finance', label: 'Budget', icon: 'DollarSign' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'projects', label: 'Projects', icon: 'FolderKanban' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  COO: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'projects', label: 'All Projects', icon: 'FolderKanban' },
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'team', label: 'Team', icon: 'Users' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  HR_MANAGER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Human Resources',
      items: [
        { view: 'hr', label: 'Employee Management', icon: 'UserCog' },
        { view: 'hr', label: 'Attendance', icon: 'Clock' },
        { view: 'hr', label: 'Payroll', icon: 'DollarSign' },
        { view: 'hr', label: 'Recruitment', icon: 'UserPlus' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  PROCUREMENT_HEAD: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Procurement',
      items: [
        { view: 'procurement', label: 'Vendor Management', icon: 'Truck' },
        { view: 'procurement', label: 'Purchase Orders', icon: 'ShoppingCart' },
        { view: 'procurement', label: 'Material Management', icon: 'Package' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  PROJECT_DIRECTOR: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'projects', label: 'All Projects', icon: 'FolderKanban' },
        { view: 'team', label: 'Team Management', icon: 'Users' },
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  PROJECT_MANAGER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'projects', label: 'My Projects', icon: 'FolderKanban' },
        { view: 'tasks', label: 'Task Management', icon: 'ListTodo' },
        { view: 'team', label: 'Team Management', icon: 'Users' },
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
      ],
    },
  ],

  SITE_MANAGER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Site Operations',
      items: [
        { view: 'site', label: 'Site Diary', icon: 'CalendarDays' },
        { view: 'site', label: 'Daily Planning', icon: 'ClipboardList' },
        { view: 'site', label: 'Site Reports', icon: 'FileBarChart' },
      ],
    },
    {
      label: 'Labour & Engineering',
      items: [
        { view: 'site', label: 'Labour Management', icon: 'UsersRound' },
        { view: 'site', label: 'RFI', icon: 'FileQuestion' },
        { view: 'qa', label: 'NCR', icon: 'AlertTriangle' },
        { view: 'site', label: 'Technical Queries', icon: 'FileSearch' },
        { view: 'site', label: 'Method Statements', icon: 'ClipboardCheck' },
        { view: 'site', label: 'Site Photos', icon: 'Camera' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  SITE_ENGINEER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Site',
      items: [
        { view: 'site', label: 'Site Diary', icon: 'CalendarDays' },
        { view: 'tasks', label: 'My Tasks', icon: 'ListTodo' },
        { view: 'site', label: 'Site Photos', icon: 'Camera' },
      ],
    },
    {
      label: 'Engineering',
      items: [
        { view: 'site', label: 'RFI', icon: 'FileQuestion' },
        { view: 'qa', label: 'NCR', icon: 'AlertTriangle' },
        { view: 'site', label: 'Technical Queries', icon: 'FileSearch' },
        { view: 'site', label: 'Method Statements', icon: 'ClipboardCheck' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  QA_QC_ENGINEER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Quality Assurance',
      items: [
        { view: 'qa', label: 'Quality Checks', icon: 'ClipboardCheck' },
        { view: 'qa', label: 'Test Records', icon: 'TestTubes' },
        { view: 'qa', label: 'NCR Management', icon: 'AlertTriangle' },
        { view: 'qa', label: 'Quality Audits', icon: 'ShieldCheck' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  SAFETY_OFFICER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Safety Management',
      items: [
        { view: 'safety', label: 'Safety Inspections', icon: 'ShieldAlert' },
        { view: 'safety', label: 'Incident Reporting', icon: 'AlertOctagon' },
        { view: 'safety', label: 'Near Miss Reporting', icon: 'AlertTriangle' },
        { view: 'safety', label: 'Safety Training', icon: 'GraduationCap' },
        { view: 'safety', label: 'Safety Documents', icon: 'FileCheck' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  STORE_KEEPER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Store Management',
      items: [
        { view: 'store-panel', label: 'Inventory Management', icon: 'Warehouse' },
        { view: 'store-panel', label: 'Material Request', icon: 'PackageCheck' },
        { view: 'store-panel', label: 'Goods Receipt', icon: 'ArrowDownToLine' },
        { view: 'store-panel', label: 'Stock Reports', icon: 'FileBarChart' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  CLIENT: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'projects', label: 'My Projects', icon: 'FolderKanban' },
        { view: 'site', label: 'Payments', icon: 'CreditCard' },
        { view: 'site', label: 'Documents', icon: 'FolderOpen' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  CONSULTANT: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Design & Review',
      items: [
        { view: 'site', label: 'Drawings', icon: 'Ruler' },
        { view: 'site', label: 'RFI Response', icon: 'FileQuestion' },
        { view: 'site', label: 'Inspection', icon: 'ClipboardCheck' },
        { view: 'site', label: 'Design Review', icon: 'Compass' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  ARCHITECT: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Design & Review',
      items: [
        { view: 'site', label: 'Drawings', icon: 'Ruler' },
        { view: 'site', label: 'RFI Response', icon: 'FileQuestion' },
        { view: 'site', label: 'Inspection', icon: 'ClipboardCheck' },
        { view: 'site', label: 'Design Review', icon: 'Compass' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  SUBCONTRACTOR: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Work',
      items: [
        { view: 'site', label: 'Work Orders', icon: 'ClipboardList' },
        { view: 'site', label: 'Timesheets', icon: 'Timer' },
        { view: 'site', label: 'Payments', icon: 'CreditCard' },
        { view: 'site', label: 'Documents', icon: 'FolderOpen' },
      ],
    },
    {
      label: 'Overview',
      items: [
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
        { view: 'settings', label: 'Settings', icon: 'Settings' },
      ],
    },
  ],

  // Fallback for legacy roles
  ADMIN: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'projects', label: 'Projects', icon: 'FolderKanban' },
        { view: 'tasks', label: 'Tasks', icon: 'ListTodo' },
        { view: 'team', label: 'Team', icon: 'Users' },
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { view: 'procurement', label: 'Procurement', icon: 'ShoppingCart' },
        { view: 'hr', label: 'HR Management', icon: 'UserCog' },
        { view: 'finance', label: 'Finance', icon: 'DollarSign' },
        { view: 'qa', label: 'Quality Assurance', icon: 'ClipboardCheck' },
        { view: 'safety', label: 'Safety', icon: 'ShieldAlert' },
        { view: 'store-panel', label: 'Store', icon: 'Warehouse' },
      ],
    },
  ],

  MANAGER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'projects', label: 'Projects', icon: 'FolderKanban' },
        { view: 'tasks', label: 'Tasks', icon: 'ListTodo' },
        { view: 'team', label: 'Team', icon: 'Users' },
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { view: 'procurement', label: 'Procurement', icon: 'ShoppingCart' },
        { view: 'hr', label: 'HR Management', icon: 'UserCog' },
        { view: 'finance', label: 'Finance', icon: 'DollarSign' },
        { view: 'qa', label: 'Quality Assurance', icon: 'ClipboardCheck' },
        { view: 'safety', label: 'Safety', icon: 'ShieldAlert' },
        { view: 'store-panel', label: 'Store', icon: 'Warehouse' },
      ],
    },
  ],

  MEMBER: [
    {
      label: 'Main',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { view: 'projects', label: 'Projects', icon: 'FolderKanban' },
        { view: 'tasks', label: 'Tasks', icon: 'ListTodo' },
        { view: 'team', label: 'Team', icon: 'Users' },
        { view: 'reports', label: 'Reports', icon: 'BarChart3' },
      ],
    },
  ],
}

// Communication section added to every role
const COMM_SECTION: SidebarMenuSection = {
  label: 'Communication',
  items: [
    { view: 'notifications', label: 'Notifications', icon: 'Bell' },
    { view: 'chat', label: 'Chat', icon: 'MessageSquare' },
  ],
}

// Settings section added to every role (if not already present)
const SETTINGS_ITEM: SidebarMenuSection = {
  items: [
    { view: 'settings', label: 'Settings', icon: 'Settings' },
  ],
}

// ========================
// Badge Counts
// ========================
interface BadgeCounts {
  tasks?: number
  notifications?: number
  projects?: number
  chat?: number
}

// ========================
// SubMenu Component
// ========================
function SubMenu({
  item,
  collapsed,
  currentView,
  onNav,
}: {
  item: SidebarMenuItem
  collapsed: boolean
  currentView: ViewType
  onNav: (view: ViewType) => void
}) {
  const [open, setOpen] = useState(false)
  const Icon = iconMap[item.icon] || LayoutDashboard
  const hasChildren = item.children && item.children.length > 0
  const isActive = !hasChildren && currentView === item.view
  const isChildActive = hasChildren && item.children!.some((c) => c.view === currentView)

  const btn = (
    <button
      onClick={() => {
        if (hasChildren) {
          setOpen(!open)
        } else {
          onNav(item.view)
        }
      }}
      className={cn(
        'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
        isActive
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
          : isChildActive
            ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', (isActive || isChildActive) && !collapsed && 'text-amber-600 dark:text-amber-400')} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap flex-1 text-left"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && hasChildren && (
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      )}
    </button>
  )

  return (
    <div>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
        </Tooltip>
      ) : (
        btn
      )}
      <AnimatePresence>
        {hasChildren && open && !collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 pl-4 border-l border-border/50 space-y-0.5 mt-1 mb-1">
              {item.children!.map((child) => {
                const ChildIcon = iconMap[child.icon || 'ListTodo'] || ListTodo
                const childActive = currentView === child.view
                const childBtn = (
                  <button
                    key={`${item.view}-${child.view}-${child.label}`}
                    onClick={() => onNav(child.view)}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-200',
                      childActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <ChildIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{child.label}</span>
                  </button>
                )
                return childBtn
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ========================
// Main Sidebar Component
// ========================
export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const currentView = useAppStore((s) => s.currentView)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const { role } = usePermissions()

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

  // Get role-based menu config
  const userRole = role || user?.role || 'MEMBER'
  let sections = ROLES_SIDEBAR_CONFIG[userRole] || ROLES_SIDEBAR_CONFIG['MEMBER']

  // Check if Communication is already in the config
  const hasComm = sections.some((s) =>
    s.items.some((i) => i.view === 'notifications' || i.view === 'chat')
  )
  if (!hasComm) {
    sections = [...sections, COMM_SECTION]
  }

  // Check if Settings is already in the config
  const hasSettings = sections.some((s) =>
    s.items.some((i) => i.view === 'settings')
  )
  if (!hasSettings) {
    sections = [...sections, SETTINGS_ITEM]
  }

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

  const renderNavSection = (section: SidebarMenuSection, collapsed: boolean) => {
    const items = section.items
    return (
      <div key={section.label || 'unnamed'}>
        {section.label && !collapsed && (
          <p className="px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-2 first:mt-0">
            {section.label}
          </p>
        )}
        <nav className="space-y-0.5 px-3">
          {items.map((item) => {
            const hasChildren = item.children && item.children.length > 0
            if (hasChildren) {
              return (
                <SubMenu
                  key={`${item.view}-${item.label}`}
                  item={item}
                  collapsed={collapsed}
                  currentView={currentView}
                  onNav={handleNav}
                />
              )
            }

            const Icon = iconMap[item.icon] || LayoutDashboard
            const isActive = currentView === item.view

            const btn = (
              <button
                key={`${item.view}-${item.label}`}
                onClick={() => handleNav(item.view)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-white')} />
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
                {item.view === 'tasks' && badgeCounts.tasks && badgeCounts.tasks > 0 && !collapsed && (
                  <Badge className="ml-auto h-5 min-w-5 px-1.5 text-[10px] bg-white/90 text-amber-700 border-0 font-bold">
                    {badgeCounts.tasks > 99 ? '99+' : badgeCounts.tasks}
                  </Badge>
                )}
                {item.view === 'tasks' && badgeCounts.tasks && badgeCounts.tasks > 0 && collapsed && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badgeCounts.tasks > 9 ? '9+' : badgeCounts.tasks}
                  </span>
                )}
                {item.view === 'projects' && badgeCounts.projects && badgeCounts.projects > 0 && !collapsed && (
                  <Badge className="ml-auto h-5 min-w-5 px-1.5 text-[10px] bg-white/90 text-amber-700 border-0 font-bold">
                    {badgeCounts.projects > 99 ? '99+' : badgeCounts.projects}
                  </Badge>
                )}
              </button>
            )

            if (collapsed) {
              return (
                <Tooltip key={`${item.view}-${item.label}`}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return btn
          })}
        </nav>
      </div>
    )
  }

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
                <h2 className="font-bold text-lg tracking-tight">CBOS</h2>
                <p className="text-[10px] text-muted-foreground -mt-0.5 leading-tight">Business Operating System</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Nav Items */}
        <ScrollArea className="flex-1 py-3">
          {sections.map((section, idx) => (
            <div key={section.label || idx}>
              {idx > 0 && <Separator className="my-2 mx-3" />}
              {renderNavSection(section, collapsed)}
            </div>
          ))}
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
                  <p className="text-[11px] text-muted-foreground truncate">{userRole ? getRoleLabel(userRole) : ''}</p>
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