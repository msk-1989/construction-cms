'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, LayoutGrid, List, MoreHorizontal, Pencil, Trash2, Eye, FolderKanban,
  Users as UsersIcon, DollarSign, CalendarDays, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/store/useAppStore'
import { usePermissions } from '@/hooks/usePermissions'
import { toast } from 'sonner'
import type { Project, ProjectStatus } from '@/types/cms'

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  PLANNING: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  COMPLETED: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
type ViewMode = 'grid' | 'list'

interface ProjectFormData {
  name: string
  description: string
  status: string
  startDate: string
  endDate: string
  budget: string
  projectType: string
  contractType: string
  siteAddress: string
  siteContact: string
  siteEmail: string
  sitePhone: string
  totalWorkforce: string
  dailyLaborCount: string
}

const emptyForm: ProjectFormData = {
  name: '', description: '', status: 'PLANNING', startDate: '', endDate: '',
  budget: '', projectType: 'COMMERCIAL', contractType: 'LUMP_SUM',
  siteAddress: '', siteContact: '', siteEmail: '', sitePhone: '',
  totalWorkforce: '', dailyLaborCount: '',
}

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [form, setForm] = useState<ProjectFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId)
  const { can } = usePermissions()

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const res = await globalThis.fetch(`/api/projects?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const d = data.data || data
        setProjects(Array.isArray(d) ? d : d.projects || [])
      }
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const openCreate = () => {
    setEditingProject(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditingProject(project)
    setForm({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      budget: project.budget ? String(project.budget) : '',
      projectType: project.projectType || 'COMMERCIAL',
      contractType: project.contractType || 'LUMP_SUM',
      siteAddress: project.siteAddress || '',
      siteContact: project.siteContact || '',
      siteEmail: project.siteEmail || '',
      sitePhone: project.sitePhone || '',
      totalWorkforce: project.totalWorkforce ? String(project.totalWorkforce) : '',
      dailyLaborCount: project.dailyLaborCount ? String(project.dailyLaborCount) : '',
    })
    setDialogOpen(true)
  }

  const openDelete = (project: Project) => {
    setDeletingProject(project)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Project name is required'); return }
    setSaving(true)
    try {
      const body = {
        ...form,
        budget: form.budget ? Number(form.budget) : null,
        totalWorkforce: form.totalWorkforce ? Number(form.totalWorkforce) : null,
        dailyLaborCount: form.dailyLaborCount ? Number(form.dailyLaborCount) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      }
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PUT' : 'POST'
      const res = await globalThis.fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save project')
        return
      }
      toast.success(editingProject ? 'Project updated' : 'Project created')
      setDialogOpen(false)
      fetchProjects()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingProject) return
    setDeleting(true)
    try {
      const res = await globalThis.fetch(`/api/projects/${deletingProject.id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to delete project'); return }
      toast.success('Project deleted')
      setDeleteDialogOpen(false)
      setDeletingProject(null)
      fetchProjects()
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(false)
    }
  }

  const openProject = (id: string) => {
    setSelectedProjectId(id)
    setCurrentView('project-detail')
  }

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.code.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const formatBudget = (budget: number | null) => {
    if (!budget) return 'No budget set'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(budget)
  }

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {can('create:projects') && (
          <Button className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                statusFilter === tab.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-md transition-all', viewMode === 'grid' ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-md transition-all', viewMode === 'list' ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        )
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No projects found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" initial="hidden" animate="show" variants={{
          hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}>
          {filtered.map((project) => (
            <motion.div key={project.id} variants={{
              hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => openProject(project.id)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); openProject(project.id) }}>
                      <h3 className="font-semibold text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{project.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{project.code}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); openProject(project.id) }}>
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        {can('edit:projects') && (
                          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); openEdit(project) }}>
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        {can('delete:projects') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400" onClick={(e) => { e.stopPropagation(); openDelete(project) }}>
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                  )}

                  <Badge variant="outline" className={cn('text-[10px] mb-3', statusColor[project.status] || '')}>
                    {project.status.replace('_', ' ')}
                  </Badge>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatBudget(project.budget)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UsersIcon className="h-3.5 w-3.5" />
                      {project.memberCount || project._count?.members || 0}
                    </div>
                    {project.endDate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <Card key={project.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => openProject(project.id)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
                  <FolderKanban className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{project.name}</h3>
                    <Badge variant="outline" className={cn('text-[10px] shrink-0', statusColor[project.status] || '')}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{project.code}</span>
                    <span>{project.progress}% complete</span>
                    <span className="hidden sm:inline">{formatBudget(project.budget)}</span>
                  </div>
                </div>
                <Progress value={project.progress} className="h-1.5 w-20 hidden sm:block" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); openProject(project.id) }}>
                      <Eye className="h-4 w-4" /> View
                    </DropdownMenuItem>
                    {can('edit:projects') && (
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); openEdit(project) }}>
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}
                    {can('delete:projects') && (
                      <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); openDelete(project) }}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            <DialogDescription>{editingProject ? 'Update project details below.' : 'Fill in the details to create a new project.'}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proj-name">Project Name *</Label>
                  <Input id="proj-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Skyline Tower" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-status">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger id="proj-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNING">Planning</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-desc">Description</Label>
                <Textarea id="proj-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief project description..." rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proj-start">Start Date</Label>
                  <Input id="proj-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-end">End Date</Label>
                  <Input id="proj-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-budget">Budget ($)</Label>
                  <Input id="proj-budget" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-type">Project Type</Label>
                  <Select value={form.projectType} onValueChange={(v) => setForm({ ...form, projectType: v })}>
                    <SelectTrigger id="proj-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                      <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                      <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                      <SelectItem value="INSTITUTIONAL">Institutional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proj-contract">Contract Type</Label>
                  <Select value={form.contractType} onValueChange={(v) => setForm({ ...form, contractType: v })}>
                    <SelectTrigger id="proj-contract"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LUMP_SUM">Lump Sum</SelectItem>
                      <SelectItem value="UNIT_PRICE">Unit Price</SelectItem>
                      <SelectItem value="COST_PLUS">Cost Plus</SelectItem>
                      <SelectItem value="TURNKEY">Turnkey</SelectItem>
                      <SelectItem value="DESIGN_BUILD">Design Build</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-workforce">Total Workforce</Label>
                  <Input id="proj-workforce" type="number" value={form.totalWorkforce} onChange={(e) => setForm({ ...form, totalWorkforce: e.target.value })} placeholder="0" />
                </div>
              </div>
              <Separator />
              <p className="text-sm font-medium text-muted-foreground">Site Information</p>
              <div className="space-y-2">
                <Label htmlFor="proj-address">Site Address</Label>
                <Input id="proj-address" value={form.siteAddress} onChange={(e) => setForm({ ...form, siteAddress: e.target.value })} placeholder="Full site address" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proj-contact">Site Contact</Label>
                  <Input id="proj-contact" value={form.siteContact} onChange={(e) => setForm({ ...form, siteContact: e.target.value })} placeholder="Contact name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-semail">Site Email</Label>
                  <Input id="proj-semail" type="email" value={form.siteEmail} onChange={(e) => setForm({ ...form, siteEmail: e.target.value })} placeholder="email@site.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-sphone">Site Phone</Label>
                  <Input id="proj-sphone" value={form.sitePhone} onChange={(e) => setForm({ ...form, sitePhone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProject ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingProject?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

