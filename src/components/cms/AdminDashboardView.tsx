'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, FileText, BarChart3, Activity, Plus, Trash2,
  Edit3, UserCheck, UserX, Loader2, Search, X, Eye, Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { usePermissions } from '@/hooks/usePermissions'
import { getRoleBadgeClass, getRoleLabel } from '@/lib/permissions'
import type { User, ActivityLog, Project } from '@/types/cms'

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

export function AdminDashboardView() {
  const { can, isAdmin } = usePermissions()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [auditLoading, setAuditLoading] = useState(true)

  // Dialogs
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [saving, setSaving] = useState(false)

  // Form
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [editRole, setEditRole] = useState('MEMBER')

  // Filters
  const [userSearch, setUserSearch] = useState('')
  const [auditProjectFilter, setAuditProjectFilter] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      const res = await globalThis.fetch('/api/team')
      const json = await res.json()
      if (json.success) setUsers(json.data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      const params = auditProjectFilter ? `?projectId=${auditProjectFilter}` : ''
      const res = await globalThis.fetch(`/api/activity${params}`)
      const json = await res.json()
      if (json.success) setAuditLogs(json.data)
    } catch { toast.error('Failed to load audit logs') }
    finally { setAuditLoading(false) }
  }, [auditProjectFilter])

  const fetchProjects = useCallback(async () => {
    try {
      const res = await globalThis.fetch('/api/projects')
      const json = await res.json()
      if (json.success) setProjects(json.data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchAuditLogs()
    fetchProjects()
  }, [fetchUsers, fetchAuditLogs, fetchProjects])

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users
    const q = userSearch.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    )
  }, [users, userSearch])

  const filteredLogs = useMemo(() => {
    if (!auditProjectFilter) return auditLogs
    return auditLogs.filter((l) => l.projectId === auditProjectFilter)
  }, [auditLogs, auditProjectFilter])

  // ===== Actions =====
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
    } catch { toast.error('Failed to create user') }
    finally { setSaving(false) }
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
    } catch { toast.error('Failed to update user status') }
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
    } catch { toast.error('Failed to update role') }
    finally { setSaving(false) }
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
    } catch { toast.error('Failed to delete user') }
    finally { setSaving(false) }
  }

  // ===== Permission Guard =====
  if (!can('view:admin')) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1">You do not have permission to view the admin dashboard.</p>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color?: string }) => (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', color || 'bg-amber-100 dark:bg-amber-900/30')}>
            <Icon className={cn('h-5 w-5', color ? 'text-foreground' : 'text-amber-600 dark:text-amber-400')} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">System administration and user management</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateUserOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Create User
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="gap-2"><Activity className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2"><FileText className="h-4 w-4" /> Audit Log</TabsTrigger>
        </TabsList>

        {/* =================== OVERVIEW TAB =================== */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={users.length} />
              <StatCard icon={FileText} label="Total Projects" value={projects.length} />
              <StatCard icon={BarChart3} label="Total Tasks" value={users.reduce((s, u) => s + (u._count?.assignedTasks ?? 0), 0)} />
              <StatCard icon={Activity} label="Audit Entries" value={auditLogs.length} />
            </div>
          )}

          {/* Quick User Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Users by Role</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)
                ) : (
                  <>
                    {(['ADMIN', 'MANAGER', 'MEMBER'] as const).map((role) => {
                      const count = users.filter((u) => u.role === role).length
                      const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0
                      return (
                        <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Badge className={cn('text-[10px]', getRoleBadgeClass(role))}>{getRoleLabel(role)}</Badge>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="h-full rounded-full bg-amber-500"
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">User Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12" />)
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{users.filter((u) => u.status === 'ACTIVE').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <UserX className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">Inactive</span>
                      </div>
                      <span className="text-sm font-bold text-gray-400">{users.filter((u) => u.status === 'INACTIVE').length}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* =================== USERS TAB =================== */}
        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
              {userSearch && (
                <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell text-center">Projects</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          {userSearch ? 'No users match your search' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence>
                        {filteredUsers.map((user) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b transition-colors hover:bg-muted/50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-semibold">
                                    {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                                  {user.position && <p className="text-xs text-muted-foreground">{user.position}</p>}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge className={cn('text-[10px]', getRoleBadgeClass(user.role))}>{getRoleLabel(user.role)}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge className={cn(
                                'text-[10px]',
                                user.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                              )}>
                                {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-center text-sm">{user._count?.projectMemberships ?? 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => { setSelectedUser(user); setEditRole(user.role as string); setEditRoleOpen(true) }}
                                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                  title="Edit role"
                                >
                                  <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                  title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                >
                                  {user.status === 'ACTIVE' ? (
                                    <UserX className="h-3.5 w-3.5 text-red-400" />
                                  ) : (
                                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                  )}
                                </button>
                                <button
                                  onClick={() => { setSelectedUser(user); setDeleteUserOpen(true) }}
                                  className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                </button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =================== AUDIT TAB =================== */}
        <TabsContent value="audit" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={auditProjectFilter} onValueChange={(v) => setAuditProjectFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="All projects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
              <Eye className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Project</TableHead>
                      <TableHead className="hidden sm:table-cell">Details</TableHead>
                      <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          {auditProjectFilter ? 'No audit entries for this project' : 'No audit entries found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id} className="border-b transition-colors hover:bg-muted/50">
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-mono">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.user?.name || 'System'}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {log.project ? (
                              <span className="flex items-center gap-1">
                                <span className="text-amber-600 font-medium">{log.project.code}</span>
                                <span>{log.project.name}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                            {log.details || '—'}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* =================== CREATE USER DIALOG =================== */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name</Label><Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="user@company.com" /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Minimum 6 characters" /></div>
            <div className="space-y-2"><Label>Role</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Team Member</SelectItem>
                  <SelectItem value="MANAGER">Project Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== EDIT ROLE DIALOG =================== */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-semibold">
                  {selectedUser?.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{selectedUser?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>
            <div className="space-y-2"><Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Team Member</SelectItem>
                  <SelectItem value="MANAGER">Project Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleOpen(false)}>Cancel</Button>
            <Button onClick={handleEditRole} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== DELETE USER DIALOG =================== */}
      <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete <strong>{selectedUser?.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}