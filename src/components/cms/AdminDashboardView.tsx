'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Users, BarChart3, Activity, Plus, Trash2,
  Edit3, UserCheck, UserX, Loader2, Search, X, Filter,
  AlertTriangle, Clock, CheckCircle2, XCircle, Zap, Copy,
  ShieldAlert, Key, History, TrendingUp, Ban,
  Lock, Unlock, UserCog, UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/store/useAuthStore'
import { getRoleBadgeClass, getRoleLabel } from '@/lib/permissions'
import type {
  User, ExceptionalGrant, PermissionOverride, GrantTemplate,
  ActivityLog, Project, GrantStatus, GrantType, GrantScopeType,
} from '@/types/cms'

// ========================
// Constants
// ========================

const PERMISSIONS_LIST = [
  { id: 'project.create', label: 'Create Projects' },
  { id: 'project.edit', label: 'Edit Projects' },
  { id: 'project.delete', label: 'Delete Projects' },
  { id: 'project.view_all', label: 'View All Projects' },
  { id: 'boq.create', label: 'Create BOQ' },
  { id: 'boq.edit', label: 'Edit BOQ' },
  { id: 'boq.approve', label: 'Approve BOQ' },
  { id: 'po.create', label: 'Create Purchase Orders' },
  { id: 'po.approve', label: 'Approve Purchase Orders' },
  { id: 'payment.approve', label: 'Approve Payments' },
  { id: 'user.create', label: 'Create Users' },
  { id: 'user.edit', label: 'Edit Users' },
  { id: 'user.delete', label: 'Delete Users' },
  { id: 'user.role', label: 'Change User Roles' },
  { id: 'site.diary', label: 'Access Site Diary' },
  { id: 'rfi.respond', label: 'Respond to RFIs' },
  { id: 'ncr.resolve', label: 'Resolve NCRs' },
  { id: 'financial.view', label: 'View Financial Data' },
  { id: 'reports.export', label: 'Export Reports' },
  { id: 'system.settings', label: 'Change System Settings' },
  { id: 'audit.view', label: 'View Audit Logs' },
  { id: 'grant.create', label: 'Create Exceptional Grants' },
  { id: 'contract.approve', label: 'Approve Contracts' },
  { id: 'change.order.approve', label: 'Approve Change Orders' },
]

const TEMPLATES: GrantTemplate[] = [
  {
    id: 'emergency-boq',
    name: 'Emergency BOQ Approval',
    description: 'Temporary BOQ approval for urgent work',
    permissions: ['boq.approve', 'boq.edit'],
    duration: 24,
    isActive: true,
    createdBy: '',
    createdAt: '',
  },
  {
    id: 'project-access',
    name: 'Project Access Grant',
    description: 'Full access to a specific project',
    permissions: ['project.view_all', 'project.edit', 'project.delete'],
    duration: 48,
    isActive: true,
    createdBy: '',
    createdAt: '',
  },
  {
    id: 'financial-review',
    name: 'Financial Review Access',
    description: 'View financial data for audit',
    permissions: ['financial.view', 'reports.export'],
    duration: 72,
    isActive: true,
    createdBy: '',
    createdAt: '',
  },
  {
    id: 'site-emergency',
    name: 'Site Emergency Access',
    description: 'Full site operations access',
    permissions: ['site.diary', 'rfi.respond', 'ncr.resolve'],
    duration: 12,
    isActive: true,
    createdBy: '',
    createdAt: '',
  },
  {
    id: 'procurement-full',
    name: 'Full Procurement Access',
    description: 'Complete procurement workflow',
    permissions: ['po.create', 'po.approve', 'payment.approve'],
    duration: 168,
    isActive: true,
    createdBy: '',
    createdAt: '',
  },
]

// ========================
// Interfaces
// ========================

interface AdminUser extends User {
  _count?: {
    projectMemberships?: number
    assignedTasks?: number
    createdProjects?: number
  }
}

interface AuditEntry extends ActivityLog {
  user?: { id: string; name: string; avatar: string | null } | null
  project?: { id: string; name: string; code: string } | null
}

// ========================
// Animation Variants
// ========================

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

// ========================
// Helper Functions
// ========================

function getGrantStatusBadge(status: GrantStatus) {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Active</Badge>
    case 'EXPIRED':
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100">Expired</Badge>
    case 'REVOKED':
      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Revoked</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getGrantTypeBadge(type: GrantType) {
  switch (type) {
    case 'TEMPORARY':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Temporary</Badge>
    case 'PERMANENT':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Permanent</Badge>
    case 'EMERGENCY':
      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Emergency</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

function getScopeBadge(scope: GrantScopeType) {
  switch (scope) {
    case 'GLOBAL':
      return <Badge variant="outline" className="text-purple-700 border-purple-300">Global</Badge>
    case 'PROJECT':
      return <Badge variant="outline" className="text-teal-700 border-teal-300">Project</Badge>
    case 'SITE':
      return <Badge variant="outline" className="text-orange-700 border-orange-300">Site</Badge>
    default:
      return <Badge variant="outline">{scope}</Badge>
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ========================
// Main Component
// ========================

export function AdminDashboardView() {
  const { can } = usePermissions()
  const { user: currentUser } = useAuthStore()

  // ===== Data State =====
  const [users, setUsers] = useState<AdminUser[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [grants, setGrants] = useState<ExceptionalGrant[]>([])
  const [grantTemplates, setGrantTemplates] = useState<GrantTemplate[]>([])
  const [overrides, setOverrides] = useState<PermissionOverride[]>([])

  // ===== Loading State =====
  const [loading, setLoading] = useState(true)
  const [grantsLoading, setGrantsLoading] = useState(true)
  const [overridesLoading, setOverridesLoading] = useState(true)
  const [auditLoading, setAuditLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ===== Users Tab State =====
  const [userSearch, setUserSearch] = useState('')
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [editRole, setEditRole] = useState('MEMBER')

  // ===== Grants Tab State =====
  const [grantSearch, setGrantSearch] = useState('')
  const [grantStatusFilter, setGrantStatusFilter] = useState<string>('ALL')
  const [createGrantOpen, setCreateGrantOpen] = useState(false)
  const [revokeGrantOpen, setRevokeGrantOpen] = useState(false)
  const [emergencyOverrideOpen, setEmergencyOverrideOpen] = useState(false)
  const [selectedGrant, setSelectedGrant] = useState<ExceptionalGrant | null>(null)

  // Grant form state
  const [grantForm, setGrantForm] = useState({
    userId: '',
    grantType: 'TEMPORARY' as GrantType,
    duration: 24,
    scopeType: 'GLOBAL' as GrantScopeType,
    scopeId: '',
    reason: '',
    selectedPermissions: [] as string[],
  })
  const [revokeReason, setRevokeReason] = useState('')
  const [emergencyForm, setEmergencyForm] = useState({
    userId: '',
    reason: '',
    selectedPermissions: [] as string[],
  })

  // ===== Overrides Tab State =====
  const [createOverrideOpen, setCreateOverrideOpen] = useState(false)
  const [overrideForm, setOverrideForm] = useState({
    userId: '',
    resource: '',
    action: '',
    isAllowed: true,
    reason: '',
    duration: 24,
  })

  // ===== Audit Tab State =====
  const [auditProjectFilter, setAuditProjectFilter] = useState('')
  const [auditActionFilter, setAuditActionFilter] = useState('')

  // ========================
  // Data Fetching
  // ========================

  const fetchUsers = useCallback(async () => {
    try {
      const res = await globalThis.fetch('/api/team')
      const json = await res.json()
      if (json.success) setUsers(json.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    try {
      const res = await globalThis.fetch('/api/projects')
      const json = await res.json()
      if (json.success) setProjects(json.data)
    } catch {
      /* silent */
    }
  }, [])

  const fetchGrants = useCallback(async () => {
    setGrantsLoading(true)
    try {
      const res = await globalThis.fetch('/api/grants')
      const json = await res.json()
      if (json.success) setGrants(json.data || [])
    } catch {
      toast.error('Failed to load grants')
    } finally {
      setGrantsLoading(false)
    }
  }, [])

  const fetchGrantTemplates = useCallback(async () => {
    try {
      const res = await globalThis.fetch('/api/grants/templates')
      const json = await res.json()
      if (json.success) setGrantTemplates(json.data || [])
    } catch {
      /* use local templates as fallback */
    }
  }, [])

  const fetchOverrides = useCallback(async () => {
    setOverridesLoading(true)
    try {
      const res = await globalThis.fetch('/api/grants/overrides')
      const json = await res.json()
      if (json.success) setOverrides(json.data || [])
    } catch {
      toast.error('Failed to load overrides')
    } finally {
      setOverridesLoading(false)
    }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      const params = new URLSearchParams()
      if (auditProjectFilter) params.set('projectId', auditProjectFilter)
      const res = await globalThis.fetch(`/api/activity?${params.toString()}`)
      const json = await res.json()
      if (json.success) setAuditLogs(json.data || [])
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setAuditLoading(false)
    }
  }, [auditProjectFilter])

  useEffect(() => {
    fetchUsers()
    fetchProjects()
    fetchGrants()
    fetchGrantTemplates()
    fetchOverrides()
    fetchAuditLogs()
  }, [fetchUsers, fetchProjects, fetchGrants, fetchGrantTemplates, fetchOverrides, fetchAuditLogs])

  // ========================
  // Computed Data
  // ========================

  const activeUsers = useMemo(() => users.filter((u) => u.status === 'ACTIVE'), [users])
  const usersByRole = useMemo(() => {
    const map: Record<string, number> = {}
    users.forEach((u) => { map[u.role] = (map[u.role] || 0) + 1 })
    return map
  }, [users])
  const activeProjects = useMemo(() => projects.filter((p) => p.status === 'ACTIVE'), [projects])

  const grantsStats = useMemo(() => {
    const now = new Date()
    const active = grants.filter((g) => g.status === 'ACTIVE')
    const expiringSoon = active.filter((g) => {
      if (!g.endDate) return false
      const end = new Date(g.endDate)
      const diff = end.getTime() - now.getTime()
      return diff > 0 && diff < 24 * 60 * 60 * 1000
    })
    const expired = grants.filter((g) => g.status === 'EXPIRED')
    const usersAffected = new Set(grants.filter((g) => g.status === 'ACTIVE').map((g) => g.userId)).size
    return {
      active: active.length,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
      total: grants.length,
      usersAffected,
    }
  }, [grants])

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users
    const q = userSearch.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    )
  }, [users, userSearch])

  const filteredGrants = useMemo(() => {
    let result = grants
    if (grantSearch.trim()) {
      const q = grantSearch.toLowerCase()
      result = result.filter(
        (g) =>
          g.permission.toLowerCase().includes(q) ||
          g.reason.toLowerCase().includes(q) ||
          (g.user?.name || '').toLowerCase().includes(q)
      )
    }
    if (grantStatusFilter !== 'ALL') {
      result = result.filter((g) => g.status === grantStatusFilter)
    }
    return result
  }, [grants, grantSearch, grantStatusFilter])

  const filteredLogs = useMemo(() => {
    let result = auditLogs
    if (auditProjectFilter) {
      result = result.filter((l) => l.projectId === auditProjectFilter)
    }
    if (auditActionFilter) {
      const q = auditActionFilter.toLowerCase()
      result = result.filter((l) => l.action.toLowerCase().includes(q))
    }
    return result
  }, [auditLogs, auditProjectFilter, auditActionFilter])

  // ========================
  // User Actions
  // ========================

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Name, email, and password are required')
      return
    }
    setSaving(true)
    try {
      const res = await globalThis.fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`User "${createForm.name}" created`)
        setCreateUserOpen(false)
        setCreateForm({ name: '', email: '', password: '', role: 'MEMBER' })
        fetchUsers()
      } else {
        toast.error(json.error || 'Failed to create user')
      }
    } catch {
      toast.error('Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const res = await globalThis.fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`)
        fetchUsers()
      } else {
        toast.error(json.error || 'Failed to update status')
      }
    } catch {
      toast.error('Failed to update user status')
    }
  }

  const handleEditRole = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const res = await globalThis.fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, role: editRole }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Role updated to ${getRoleLabel(editRole)}`)
        setEditRoleOpen(false)
        fetchUsers()
      } else {
        toast.error(json.error || 'Failed to update role')
      }
    } catch {
      toast.error('Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const res = await globalThis.fetch(`/api/team?id=${selectedUser.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('User deleted')
        setDeleteUserOpen(false)
        fetchUsers()
      } else {
        toast.error(json.error || 'Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setSaving(false)
    }
  }

  // ========================
  // Grant Actions
  // ========================

  const handleCreateGrant = async () => {
    if (!grantForm.userId || grantForm.selectedPermissions.length === 0) {
      toast.error('User and at least one permission are required')
      return
    }
    if (grantForm.grantType === 'TEMPORARY' && grantForm.duration <= 0) {
      toast.error('Duration must be greater than 0 hours')
      return
    }
    if (!grantForm.reason.trim()) {
      toast.error('Reason is required')
      return
    }
    setSaving(true)
    try {
      const res = await globalThis.fetch('/api/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: grantForm.userId,
          permissions: grantForm.selectedPermissions,
          grantType: grantForm.grantType,
          duration: grantForm.grantType === 'TEMPORARY' ? grantForm.duration : undefined,
          scope: { type: grantForm.scopeType, id: grantForm.scopeId || undefined },
          reason: grantForm.reason,
          grantedBy: currentUser?.id,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Exceptional grant created')
        setCreateGrantOpen(false)
        resetGrantForm()
        fetchGrants()
      } else {
        toast.error(json.error || 'Failed to create grant')
      }
    } catch {
      toast.error('Failed to create grant')
    } finally {
      setSaving(false)
    }
  }

  const handleRevokeGrant = async () => {
    if (!selectedGrant || !revokeReason.trim()) {
      toast.error('Revocation reason is required')
      return
    }
    setSaving(true)
    try {
      const params = new URLSearchParams({
        id: selectedGrant.id,
        revokedBy: currentUser?.id || '',
        reason: revokeReason,
      })
      const res = await globalThis.fetch(`/api/grants?${params.toString()}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Grant revoked')
        setRevokeGrantOpen(false)
        setRevokeReason('')
        setSelectedGrant(null)
        fetchGrants()
      } else {
        toast.error(json.error || 'Failed to revoke grant')
      }
    } catch {
      toast.error('Failed to revoke grant')
    } finally {
      setSaving(false)
    }
  }

  const handleEmergencyOverride = async () => {
    if (!emergencyForm.userId || emergencyForm.selectedPermissions.length === 0) {
      toast.error('User and at least one permission are required')
      return
    }
    if (!emergencyForm.reason.trim()) {
      toast.error('Reason is required for emergency override')
      return
    }
    setSaving(true)
    try {
      const res = await globalThis.fetch('/api/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: emergencyForm.userId,
          permissions: emergencyForm.selectedPermissions,
          grantType: 'EMERGENCY',
          scope: { type: 'GLOBAL' },
          reason: `[EMERGENCY OVERRIDE] ${emergencyForm.reason}`,
          grantedBy: currentUser?.id,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Emergency override granted')
        setEmergencyOverrideOpen(false)
        setEmergencyForm({ userId: '', reason: '', selectedPermissions: [] })
        fetchGrants()
      } else {
        toast.error(json.error || 'Failed to create emergency override')
      }
    } catch {
      toast.error('Failed to create emergency override')
    } finally {
      setSaving(false)
    }
  }

  const handleApplyTemplate = (template: GrantTemplate) => {
    setGrantForm({
      userId: '',
      grantType: 'TEMPORARY',
      duration: template.duration || 24,
      scopeType: 'GLOBAL',
      scopeId: '',
      reason: `Applied from template: ${template.name}`,
      selectedPermissions: [...template.permissions],
    })
    setCreateGrantOpen(true)
  }

  const resetGrantForm = () => {
    setGrantForm({
      userId: '',
      grantType: 'TEMPORARY',
      duration: 24,
      scopeType: 'GLOBAL',
      scopeId: '',
      reason: '',
      selectedPermissions: [],
    })
  }

  const toggleGrantPermission = (permId: string) => {
    setGrantForm((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permId)
        ? prev.selectedPermissions.filter((p) => p !== permId)
        : [...prev.selectedPermissions, permId],
    }))
  }

  const toggleEmergencyPermission = (permId: string) => {
    setEmergencyForm((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permId)
        ? prev.selectedPermissions.filter((p) => p !== permId)
        : [...prev.selectedPermissions, permId],
    }))
  }

  // ========================
  // Override Actions
  // ========================

  const handleCreateOverride = async () => {
    if (!overrideForm.userId || !overrideForm.resource || !overrideForm.action) {
      toast.error('User, resource, and action are required')
      return
    }
    setSaving(true)
    try {
      const res = await globalThis.fetch('/api/grants/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: overrideForm.userId,
          resource: overrideForm.resource,
          action: overrideForm.action,
          isAllowed: overrideForm.isAllowed,
          reason: overrideForm.reason || undefined,
          createdBy: currentUser?.id,
          duration: overrideForm.duration > 0 ? overrideForm.duration : undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Permission override created')
        setCreateOverrideOpen(false)
        setOverrideForm({ userId: '', resource: '', action: '', isAllowed: true, reason: '', duration: 24 })
        fetchOverrides()
      } else {
        toast.error(json.error || 'Failed to create override')
      }
    } catch {
      toast.error('Failed to create override')
    } finally {
      setSaving(false)
    }
  }

  // ========================
  // Permission Guard
  // ========================

  if (!can('view:admin')) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You do not have permission to view the admin dashboard.
        </p>
      </div>
    )
  }

  // ========================
  // Loading Skeletons
  // ========================

  const StatsSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // ========================
  // Overview Tab
  // ========================

  const OverviewTab = () => (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold mt-1">{users.length}</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {activeUsers.length} active
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold mt-1">{activeProjects.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">of {projects.length} total</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Grants</p>
                  <p className="text-2xl font-bold mt-1">{grantsStats.active}</p>
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {grantsStats.expiringSoon} expiring soon
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Key className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">Healthy</p>
                  <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Users by Role */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCog className="h-4 w-4 text-amber-600" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadgeClass(role)}>{getRoleLabel(role)}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-amber-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / users.length) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Status Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-600" />
              User Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">Active Users</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">{activeUsers.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Inactive Users</span>
                  </div>
                  <span className="text-lg font-bold text-red-700">
                    {users.length - activeUsers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Admin Users</span>
                  </div>
                  <span className="text-lg font-bold text-amber-700">
                    {usersByRole['ADMIN'] || 0}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-amber-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {auditLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                        {getInitials(log.user?.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">{log.user?.name || 'Unknown'}</span>
                        <span className="text-muted-foreground mx-1">—</span>
                        {log.action}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  // ========================
  // Users Tab
  // ========================

  const UsersTab = () => (
    <motion.div {...fadeIn} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or role..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="pl-9"
          />
          {userSearch && (
            <button
              onClick={() => setUserSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={() => setCreateUserOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">User</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Role</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Projects</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {userSearch ? 'No users found matching your search' : 'No users yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeClass(user.role)}>{getRoleLabel(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-xs',
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            )}
                          >
                            {user.status === 'ACTIVE' ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> Inactive
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {user._count?.projectMemberships || 0}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedUser(user)
                                setEditRole(user.role)
                                setEditRoleOpen(true)
                              }}
                              title="Change role"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'h-8 w-8 p-0',
                                user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'
                              )}
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {user.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedUser(user)
                                setDeleteUserOpen(true)
                              }}
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  // ========================
  // Exceptional Grants Tab
  // ========================

  const GrantsTab = () => (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Grant Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Active Grants', value: grantsStats.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Expiring Soon', value: grantsStats.expiringSoon, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Expired', value: grantsStats.expired, icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' },
          { label: 'Total Grants', value: grantsStats.total, icon: Key, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { label: 'Users Affected', value: grantsStats.usersAffected, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...fadeIn} transition={{ delay: i * 0.03 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', stat.bg)}>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search grants..."
              value={grantSearch}
              onChange={(e) => setGrantSearch(e.target.value)}
              className="pl-9"
            />
            {grantSearch && (
              <button onClick={() => setGrantSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={grantStatusFilter} onValueChange={setGrantStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="REVOKED">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setEmergencyOverrideOpen(true)}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <ShieldAlert className="h-4 w-4 mr-2" />
            Emergency Override
          </Button>
          <Button
            onClick={() => {
              resetGrantForm()
              setCreateGrantOpen(true)
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Grant
          </Button>
        </div>
      </div>

      {/* Grants Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {grantsLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">User</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Permission</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Type</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Scope</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Start</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">End</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {grantSearch || grantStatusFilter !== 'ALL'
                          ? 'No grants match your filters'
                          : 'No exceptional grants created yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrants.map((grant) => (
                      <TableRow key={grant.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                                {getInitials(grant.user?.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{grant.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground truncate">{grant.user?.role || ''}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{grant.permission}</code>
                        </TableCell>
                        <TableCell>{getGrantTypeBadge(grant.grantType)}</TableCell>
                        <TableCell className="hidden md:table-cell">{getScopeBadge(grant.scopeType)}</TableCell>
                        <TableCell>{getGrantStatusBadge(grant.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {formatDate(grant.startDate)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {formatDate(grant.endDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {grant.status === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedGrant(grant)
                                setRevokeReason('')
                                setRevokeGrantOpen(true)
                              }}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grant Templates */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Copy className="h-4 w-4 text-amber-600" />
          Quick Apply Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {TEMPLATES.map((template) => (
            <motion.div key={template.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => handleApplyTemplate(template)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <Badge variant="outline" className="text-xs">{template.duration}h</Badge>
                  </div>
                  <h4 className="text-sm font-semibold mb-1 group-hover:text-amber-600 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.permissions.map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs py-0 px-1.5">
                        {p.split('.').pop()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )

  // ========================
  // Permission Overrides Tab
  // ========================

  const OverridesTab = () => (
    <motion.div {...fadeIn} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {overrides.length} override{overrides.length !== 1 ? 's' : ''} configured
        </p>
        <Button
          onClick={() => {
            setOverrideForm({ userId: '', resource: '', action: '', isAllowed: true, reason: '', duration: 24 })
            setCreateOverrideOpen(true)
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Override
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {overridesLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">User</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Resource</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Action</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Access</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Expires</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overrides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No permission overrides configured
                      </TableCell>
                    </TableRow>
                  ) : (
                    overrides.map((override) => (
                      <TableRow key={override.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                                {getInitials(override.user?.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{override.user?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{override.resource}</code>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{override.action}</code>
                        </TableCell>
                        <TableCell>
                          {override.isAllowed ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <Unlock className="h-3 w-3 mr-1" /> Allowed
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <Lock className="h-3 w-3 mr-1" /> Denied
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge className={cn(
                            override.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                          )}>
                            {override.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {formatDate(override.expiresAt)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {formatDate(override.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  // ========================
  // Audit Log Tab
  // ========================

  const AuditTab = () => (
    <motion.div {...fadeIn} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by action..."
            value={auditActionFilter}
            onChange={(e) => setAuditActionFilter(e.target.value)}
            className="pl-9"
          />
          {auditActionFilter && (
            <button onClick={() => setAuditActionFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={auditProjectFilter} onValueChange={setAuditProjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {auditLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Timestamp</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">User</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Action</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Project</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/50">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                                {getInitials(log.user?.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{log.user?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-mono">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {log.project?.name || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs truncate">
                          {log.details || '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  // ========================
  // Render
  // ========================

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <motion.div {...fadeIn}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Shield className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Super Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              System administration, user management, and exceptional grants
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            Users
          </TabsTrigger>
          <TabsTrigger value="grants" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs sm:text-sm">
            <Key className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            Grants
            {grantsStats.active > 0 && (
              <Badge className="ml-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-amber-600 text-white border-0">
                {grantsStats.active}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overrides" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs sm:text-sm">
            <ShieldAlert className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            Overrides
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs sm:text-sm">
            <History className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {loading ? <StatsSkeleton /> : <OverviewTab />}
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="grants">
          <GrantsTab />
        </TabsContent>

        <TabsContent value="overrides">
          <OverridesTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab />
        </TabsContent>
      </Tabs>

      {/* ======================== */}
      {/* Dialogs                  */}
      {/* ======================== */}

      {/* Create User Dialog */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-600" />
              Create New User
            </DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Full Name</Label>
              <Input
                id="create-name"
                placeholder="Enter full name"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="user@company.com"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(v) => setCreateForm((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger id="create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="MANAGER">Project Manager</SelectItem>
                  <SelectItem value="MEMBER">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-amber-600" />
              Change User Role
            </DialogTitle>
            <DialogDescription>
              Update role for <span className="font-medium">{selectedUser?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-role">New Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="MANAGER">Project Manager</SelectItem>
                  <SelectItem value="MEMBER">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 inline-block mr-2" />
              Changing roles will affect the user&apos;s permissions immediately.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleOpen(false)}>Cancel</Button>
            <Button onClick={handleEditRole} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selectedUser?.name}</span>?
              This action cannot be undone. All data associated with this user will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Grant Dialog */}
      <Dialog open={createGrantOpen} onOpenChange={(open) => {
        if (!open) resetGrantForm()
        setCreateGrantOpen(open)
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-600" />
              Create Exceptional Grant
            </DialogTitle>
            <DialogDescription>
              Grant temporary or permanent elevated permissions to a user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* User Select */}
            <div className="space-y-2">
              <Label htmlFor="grant-user">User</Label>
              <Select
                value={grantForm.userId}
                onValueChange={(v) => setGrantForm((p) => ({ ...p, userId: v }))}
              >
                <SelectTrigger id="grant-user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                        <span className="text-xs text-muted-foreground">({u.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grant Type & Scope Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grant-type">Grant Type</Label>
                <Select
                  value={grantForm.grantType}
                  onValueChange={(v) => setGrantForm((p) => ({ ...p, grantType: v as GrantType }))}
                >
                  <SelectTrigger id="grant-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEMPORARY">Temporary</SelectItem>
                    <SelectItem value="PERMANENT">Permanent</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grant-scope">Scope</Label>
                <Select
                  value={grantForm.scopeType}
                  onValueChange={(v) => setGrantForm((p) => ({ ...p, scopeType: v as GrantScopeType }))}
                >
                  <SelectTrigger id="grant-scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                    <SelectItem value="PROJECT">Project</SelectItem>
                    <SelectItem value="SITE">Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration (for temporary grants) */}
            {grantForm.grantType === 'TEMPORARY' && (
              <div className="space-y-2">
                <Label htmlFor="grant-duration">Duration (hours)</Label>
                <Input
                  id="grant-duration"
                  type="number"
                  min={1}
                  max={720}
                  value={grantForm.duration}
                  onChange={(e) => setGrantForm((p) => ({ ...p, duration: parseInt(e.target.value) || 24 }))}
                />
                <p className="text-xs text-muted-foreground">
                  Grant will expire after {grantForm.duration} hour{grantForm.duration !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Scope ID (for project/site scope) */}
            {grantForm.scopeType !== 'GLOBAL' && (
              <div className="space-y-2">
                <Label htmlFor="grant-scope-id">
                  {grantForm.scopeType === 'PROJECT' ? 'Project' : 'Site'} ID
                </Label>
                <Input
                  id="grant-scope-id"
                  placeholder={`Enter the ${grantForm.scopeType.toLowerCase()} ID`}
                  value={grantForm.scopeId}
                  onChange={(e) => setGrantForm((p) => ({ ...p, scopeId: e.target.value }))}
                />
              </div>
            )}

            {/* Permissions Checkbox Grid */}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <p className="text-xs text-muted-foreground">
                Select one or more permissions to grant. {grantForm.selectedPermissions.length} selected.
              </p>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {PERMISSIONS_LIST.map((perm) => (
                    <label
                      key={perm.id}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-sm',
                        grantForm.selectedPermissions.includes(perm.id)
                          ? 'bg-amber-50 dark:bg-amber-900/20'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={grantForm.selectedPermissions.includes(perm.id)}
                        onCheckedChange={() => toggleGrantPermission(perm.id)}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="grant-reason">Reason</Label>
              <Textarea
                id="grant-reason"
                placeholder="Provide a reason for this exceptional grant..."
                value={grantForm.reason}
                onChange={(e) => setGrantForm((p) => ({ ...p, reason: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetGrantForm(); setCreateGrantOpen(false) }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateGrant}
              disabled={saving || grantForm.selectedPermissions.length === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
              Create Grant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Grant Dialog */}
      <Dialog open={revokeGrantOpen} onOpenChange={setRevokeGrantOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Revoke Grant
            </DialogTitle>
            <DialogDescription>
              This will immediately revoke the grant for <span className="font-medium">{selectedGrant?.user?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted space-y-1">
              <p className="text-sm"><span className="text-muted-foreground">Permission:</span> <code className="text-xs bg-background px-1.5 py-0.5 rounded font-mono">{selectedGrant?.permission}</code></p>
              <p className="text-sm"><span className="text-muted-foreground">Type:</span> {selectedGrant?.grantType}</p>
              <p className="text-sm"><span className="text-muted-foreground">Granted on:</span> {formatDate(selectedGrant?.startDate)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revoke-reason">Reason for Revocation</Label>
              <Textarea
                id="revoke-reason"
                placeholder="Explain why this grant is being revoked..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeGrantOpen(false)}>Cancel</Button>
            <Button
              onClick={handleRevokeGrant}
              disabled={saving || !revokeReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}
              Revoke Grant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Override Dialog */}
      <AlertDialog open={emergencyOverrideOpen} onOpenChange={setEmergencyOverrideOpen}>
        <AlertDialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              Emergency Override
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This creates an <span className="font-bold text-red-600">EMERGENCY</span> grant that bypasses normal approval workflows.
              Use this only in critical situations. All emergency overrides are logged.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Emergency grants are logged with full audit trail and will be reviewed by system administrators.
              </p>
            </div>

            {/* User Select */}
            <div className="space-y-2">
              <Label htmlFor="emergency-user">Target User</Label>
              <Select
                value={emergencyForm.userId}
                onValueChange={(v) => setEmergencyForm((p) => ({ ...p, userId: v }))}
              >
                <SelectTrigger id="emergency-user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-red-100 text-red-700">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>Permissions to Grant</Label>
              <div className="border border-red-200 dark:border-red-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {PERMISSIONS_LIST.map((perm) => (
                    <label
                      key={perm.id}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-sm',
                        emergencyForm.selectedPermissions.includes(perm.id)
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={emergencyForm.selectedPermissions.includes(perm.id)}
                        onCheckedChange={() => toggleEmergencyPermission(perm.id)}
                        className="border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="emergency-reason">Emergency Reason</Label>
              <Textarea
                id="emergency-reason"
                placeholder="Describe the emergency situation requiring this override..."
                value={emergencyForm.reason}
                onChange={(e) => setEmergencyForm((p) => ({ ...p, reason: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleEmergencyOverride()
              }}
              disabled={saving || !emergencyForm.userId || emergencyForm.selectedPermissions.length === 0 || !emergencyForm.reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              Issue Emergency Override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Override Dialog */}
      <Dialog open={createOverrideOpen} onOpenChange={setCreateOverrideOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Create Permission Override
            </DialogTitle>
            <DialogDescription>
              Create a permission override for a specific user and resource.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="override-user">User</Label>
              <Select
                value={overrideForm.userId}
                onValueChange={(v) => setOverrideForm((p) => ({ ...p, userId: v }))}
              >
                <SelectTrigger id="override-user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="override-resource">Resource</Label>
                <Input
                  id="override-resource"
                  placeholder="e.g., project:123"
                  value={overrideForm.resource}
                  onChange={(e) => setOverrideForm((p) => ({ ...p, resource: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="override-action">Action</Label>
                <Input
                  id="override-action"
                  placeholder="e.g., edit, delete"
                  value={overrideForm.action}
                  onChange={(e) => setOverrideForm((p) => ({ ...p, action: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <Label htmlFor="override-allowed" className="cursor-pointer">Allow Access</Label>
              <Switch
                id="override-allowed"
                checked={overrideForm.isAllowed}
                onCheckedChange={(v) => setOverrideForm((p) => ({ ...p, isAllowed: v }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="override-duration">Duration (hours, 0 for permanent)</Label>
              <Input
                id="override-duration"
                type="number"
                min={0}
                value={overrideForm.duration}
                onChange={(e) => setOverrideForm((p) => ({ ...p, duration: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="override-reason">Reason (optional)</Label>
              <Textarea
                id="override-reason"
                placeholder="Why is this override needed?"
                value={overrideForm.reason}
                onChange={(e) => setOverrideForm((p) => ({ ...p, reason: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOverrideOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateOverride}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

