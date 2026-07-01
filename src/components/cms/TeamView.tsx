'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Plus, Edit3, Trash2, Mail, Phone, Hash,
  Briefcase, Building2, UserCheck, UserX, BarChart3, Network,
  Loader2, X, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
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
import { getRoleBadgeClass, getRoleLabel } from '@/lib/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import type { User } from '@/types/cms'

interface TeamMember extends User {
  _count?: {
    projectMemberships?: number
    assignedTasks?: number
    createdProjects?: number
  }
}

export function TeamView() {
  const { can } = usePermissions()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<TeamMember | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'MEMBER', position: '', department: '', employeeId: '' })

  const fetchTeam = useCallback(async () => {
    try {
      const res = await globalThis.fetch('/api/team')
      const json = await res.json()
      if (json.success) setMembers(json.data)
      else toast.error(json.error || 'Failed to load team')
    } catch {
      toast.error('Failed to load team')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  const filtered = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.position?.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    )
  }, [members, search])

  const resetForm = () => setForm({ name: '', email: '', phone: '', role: 'MEMBER', position: '', department: '', employeeId: '' })

  const openEdit = (m: TeamMember) => {
    setSelected(m)
    setForm({ name: m.name, email: m.email, phone: m.phone || '', role: m.role as string, position: m.position || '', department: m.department || '', employeeId: m.employeeId || '' })
    setEditOpen(true)
  }

  const openDelete = (m: TeamMember) => { setSelected(m); setDeleteOpen(true) }

  const handleAdd = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return }
    setSaving(true)
    try {
      const res = await globalThis.fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, password: 'Password123!' }),
      })
      const json = await res.json()
      if (json.success) { toast.success('Member added'); setAddOpen(false); resetForm(); fetchTeam() }
      else toast.error(json.error || 'Failed to add member')
    } catch { toast.error('Failed to add member') }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await globalThis.fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, ...form }),
      })
      const json = await res.json()
      if (json.success) { toast.success('Member updated'); setEditOpen(false); fetchTeam() }
      else toast.error(json.error || 'Failed to update')
    } catch { toast.error('Failed to update member') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await globalThis.fetch(`/api/team?id=${selected.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) { toast.success('Member removed'); setDeleteOpen(false); fetchTeam() }
      else toast.error(json.error || 'Failed to remove')
    } catch { toast.error('Failed to remove member') }
    finally { setSaving(false) }
  }

  // Org chart data
  const orgData = useMemo(() => {
    const admins = members.filter((m) => m.role === 'ADMIN')
    const managers = members.filter((m) => m.role === 'MANAGER')
    const teamMembers = members.filter((m) => m.role === 'MEMBER')
    return { admins, managers, teamMembers }
  }, [members])

  // Workload chart data
  const workloadData = useMemo(() => {
    return members
      .filter((m) => (m._count?.assignedTasks ?? 0) > 0)
      .map((m) => ({
        name: m.name.split(' ')[0],
        tasks: m._count?.assignedTasks ?? 0,
        role: m.role,
      }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 12)
  }, [members])

  const avgCompletion = useMemo(() => {
    if (members.length === 0) return 0
    const total = members.reduce((acc, m) => acc + (m._count?.assignedTasks ?? 0), 0)
    return Math.round((total / members.length) * 10) / 10
  }, [members])

  const totalTasks = useMemo(() => {
    return members.reduce((acc, m) => acc + (m._count?.assignedTasks ?? 0), 0)
  }, [members])

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE') return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">Active</Badge>
    return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800">Inactive</Badge>
  }

  const chartColors = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#f97316', '#ea580c', '#c2410c']

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your team members and view workload</p>
        </div>
        {can('manage:team') && (
          <Button onClick={() => { resetForm(); setAddOpen(true) }} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Member
          </Button>
        )}
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="members" className="gap-2"><Users className="h-4 w-4" /> Members</TabsTrigger>
          <TabsTrigger value="orgchart" className="gap-2"><Network className="h-4 w-4" /> Org Chart</TabsTrigger>
          <TabsTrigger value="workload" className="gap-2"><BarChart3 className="h-4 w-4" /> Workload</TabsTrigger>
        </TabsList>

        {/* =================== MEMBERS TAB =================== */}
        <TabsContent value="members" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm"><CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div>
                  <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" />
                </CardContent></Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{search ? 'No members match your search' : 'No team members yet'}</p>
              {!search && can('manage:team') && (
                <Button variant="outline" className="mt-3" onClick={() => { resetForm(); setAddOpen(true) }}><Plus className="h-4 w-4 mr-2" /> Add first member</Button>
              )}
            </CardContent></Card>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AnimatePresence>
                {filtered.map((member) => (
                  <motion.div key={member.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-semibold">
                                {member.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm text-foreground leading-tight">{member.name}</p>
                              <Badge className={cn('text-[10px] mt-1', getRoleBadgeClass(member.role))}>{getRoleLabel(member.role)}</Badge>
                            </div>
                          </div>
                          {can('manage:team') && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEdit(member)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                              <button onClick={() => openDelete(member)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {member.position && <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" />{member.position}</div>}
                          {member.department && <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{member.department}</div>}
                          <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{member.email}</div>
                          {member.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{member.phone}</div>}
                          {member.employeeId && <div className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" />{member.employeeId}</div>}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          {statusBadge(member.status)}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{member._count?.projectMemberships ?? 0}</span>
                            <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" />{member._count?.assignedTasks ?? 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* =================== ORG CHART TAB =================== */}
        <TabsContent value="orgchart" className="mt-6">
          {loading ? (
            <div className="space-y-6"><Skeleton className="h-32 w-full max-w-md mx-auto" /><Skeleton className="h-24 w-full" /></div>
          ) : members.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-12 flex flex-col items-center text-center">
              <Network className="h-12 w-12 text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No team members to display</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-6 overflow-x-auto pb-4">
              {/* Admin Level */}
              {orgData.admins.length > 0 && (
                <div className="flex flex-col items-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Administration</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {orgData.admins.map((m) => (
                      <OrgNode key={m.id} member={m} />
                    ))}
                  </div>
                  {orgData.managers.length > 0 && (
                    <div className="w-px h-8 bg-amber-300 dark:bg-amber-700 my-2" />
                  )}
                </div>
              )}
              {/* Manager Level */}
              {orgData.managers.length > 0 && (
                <div className="flex flex-col items-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Management</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {orgData.managers.map((m) => (
                      <OrgNode key={m.id} member={m} />
                    ))}
                  </div>
                  {orgData.teamMembers.length > 0 && (
                    <div className="w-px h-8 bg-amber-300 dark:bg-amber-700 my-2" />
                  )}
                </div>
              )}
              {/* Member Level */}
              {orgData.teamMembers.length > 0 && (
                <div className="flex flex-col items-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Team Members</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {orgData.teamMembers.map((m) => (
                      <OrgNode key={m.id} member={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* =================== WORKLOAD TAB =================== */}
        <TabsContent value="workload" className="mt-6 space-y-6">
          {loading ? (
            <div className="space-y-4"><Skeleton className="h-40 w-full" /><div className="grid grid-cols-2 gap-4"><Skeleton className="h-20" /><Skeleton className="h-20" /></div></div>
          ) : members.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-12 flex flex-col items-center text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No workload data available</p>
            </CardContent></Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Tasks per Member</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{avgCompletion}</p>
                </CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Assigned Tasks</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalTasks}</p>
                </CardContent></Card>
              </div>
              <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base">Task Distribution</CardTitle></CardHeader>
                <CardContent className="h-72">
                  {workloadData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workloadData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}
                        />
                        <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                          {workloadData.map((_, index) => (
                            <Cell key={index} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No task data available</div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* =================== ADD MEMBER DIALOG =================== */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label htmlFor="add-name">Name</Label><Input id="add-name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="add-email">Email</Label><Input id="add-email" type="email" placeholder="email@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="add-role">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Team Member</SelectItem>
                  <SelectItem value="MANAGER">Project Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="add-position">Position</Label><Input id="add-position" placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="add-dept">Department</Label><Input id="add-dept" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="add-phone">Phone</Label><Input id="add-phone" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="add-eid">Employee ID</Label><Input id="add-eid" placeholder="EMP-001" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== EDIT MEMBER DIALOG =================== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Team Member</SelectItem>
                  <SelectItem value="MANAGER">Project Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Position</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
              <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Employee ID</Label><Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== DELETE CONFIRMATION =================== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Remove Member</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <strong>{selected?.name}</strong> from the team? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* =================== Org Chart Node Component =================== */
function OrgNode({ member }: { member: TeamMember }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Card className={cn(
        'border-0 shadow-sm min-w-[160px] max-w-[200px] transition-shadow hover:shadow-md',
        member.role === 'ADMIN' && 'ring-2 ring-red-200 dark:ring-red-800',
        member.role === 'MANAGER' && 'ring-2 ring-amber-200 dark:ring-amber-800',
      )}>
        <CardContent className="p-3 text-center">
          <Avatar className="h-10 w-10 mx-auto mb-2">
            <AvatarFallback className={cn(
              'text-sm font-semibold',
              member.role === 'ADMIN' && 'bg-red-100 text-red-700',
              member.role === 'MANAGER' && 'bg-amber-100 text-amber-700',
              member.role === 'MEMBER' && 'bg-emerald-100 text-emerald-700',
            )}>
              {member.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold text-sm text-foreground truncate">{member.name}</p>
          <Badge className={cn('text-[10px] mt-1', getRoleBadgeClass(member.role))}>{getRoleLabel(member.role)}</Badge>
          {member.position && <p className="text-[11px] text-muted-foreground mt-1 truncate">{member.position}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}