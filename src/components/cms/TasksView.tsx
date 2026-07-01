'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, List, Columns3, MoreHorizontal, Pencil, Trash2, ListTodo,
  Loader2, CalendarDays, User, ArrowUpCircle, Filter
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { usePermissions } from '@/hooks/usePermissions'
import { toast } from 'sonner'
import type { Task, TaskStatus, TaskPriority, Project } from '@/types/cms'

const taskStatusColor: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  ON_HOLD: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
}

const priorityColor: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  LOW: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

type ViewMode = 'list' | 'kanban'
type TabFilter = 'all' | 'my' | 'byStatus'

const KANBAN_COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'PENDING', label: 'Pending', color: 'bg-gray-500' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-500' },
  { status: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500' },
  { status: 'ON_HOLD', label: 'On Hold', color: 'bg-orange-500' },
  { status: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
]

interface TaskFormData {
  title: string
  description: string
  status: string
  priority: string
  projectId: string
  assigneeId: string
  dueDate: string
  estimatedHours: string
  billable: boolean
  isMilestone: boolean
}

const emptyForm: TaskFormData = {
  title: '', description: '', status: 'PENDING', priority: 'MEDIUM',
  projectId: '', assigneeId: '', dueDate: '', estimatedHours: '',
  billable: false, isMilestone: false,
}

export function TasksView() {
  const user = useAuthStore((s) => s.user)
  const { can } = usePermissions()
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId)

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [tabFilter, setTabFilter] = useState<TabFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Bulk
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter)
      if (tabFilter === 'my' && user?.id) params.set('assigneeId', user.id)
      const res = await globalThis.fetch(`/api/tasks?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(Array.isArray(data) ? data : data.tasks || [])
      }
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [search, priorityFilter, tabFilter, user?.id])

  const fetchMeta = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        globalThis.fetch('/api/projects?limit=100'),
        globalThis.fetch('/api/users?limit=100'),
      ])
      if (pRes.ok) {
        const data = await pRes.json()
        setProjects(Array.isArray(data) ? data : data.projects || [])
      }
      if (tRes.ok) {
        const data = await tRes.json()
        const members = Array.isArray(data) ? data : data.users || []
        setTeamMembers(members.map((m: { id: string; name: string }) => ({ id: m.id, name: m.name })))
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchTasks(); fetchMeta() }, [fetchTasks, fetchMeta])

  const filtered = useMemo(() => {
    let result = tasks
    if (tabFilter === 'my' && user?.id) {
      result = result.filter((t) => t.assigneeId === user.id)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(q))
    }
    if (priorityFilter !== 'ALL') {
      result = result.filter((t) => t.priority === priorityFilter)
    }
    return result
  }, [tasks, tabFilter, search, priorityFilter, user?.id])

  const openCreate = () => {
    setEditingTask(null)
    setForm({ ...emptyForm, projectId: projects[0]?.id || '' })
    setDialogOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      estimatedHours: task.estimatedHours ? String(task.estimatedHours) : '',
      billable: task.billable,
      isMilestone: task.isMilestone,
    })
    setDialogOpen(true)
  }

  const openDelete = (task: Task) => {
    setDeletingTask(task)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Task title is required'); return }
    if (!form.projectId) { toast.error('Please select a project'); return }
    setSaving(true)
    try {
      const body = {
        ...form,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
        dueDate: form.dueDate || null,
        assigneeId: form.assigneeId || null,
      }
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PUT' : 'POST'
      const res = await globalThis.fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save task')
        return
      }
      toast.success(editingTask ? 'Task updated' : 'Task created')
      setDialogOpen(false)
      fetchTasks()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    setDeleting(true)
    try {
      const res = await globalThis.fetch(`/api/tasks/${deletingTask.id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to delete task'); return }
      toast.success('Task deleted')
      setDeleteDialogOpen(false)
      setDeletingTask(null)
      fetchTasks()
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(false)
    }
  }

  // Bulk operations
  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((t) => t.id)))
  }

  const handleBulkAction = async () => {
    if (selected.size === 0 || !bulkAction) return
    try {
      const ids = Array.from(selected)
      let body: Record<string, unknown> = { ids }

      if (bulkAction === 'delete') {
        const res = await globalThis.fetch('/api/tasks/bulk', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) { toast.error('Bulk delete failed'); return }
        toast.success(`${ids.length} task(s) deleted`)
      } else {
        // status, priority, assignee
        const [action, value] = bulkAction.split(':')
        if (!value) return
        body = { ids, [action]: value }
        const res = await globalThis.fetch('/api/tasks/bulk', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) { toast.error('Bulk update failed'); return }
        toast.success(`${ids.length} task(s) updated`)
      }
      setSelected(new Set())
      setBulkAction('')
      fetchTasks()
    } catch {
      toast.error('Network error')
    }
  }

  const getMemberName = (id: string | null) => {
    if (!id) return 'Unassigned'
    const m = teamMembers.find((m) => m.id === id)
    return m?.name || id.slice(0, 8)
  }

  const getProjectName = (id: string) => {
    const p = projects.find((p) => p.id === id)
    return p?.name || id.slice(0, 8)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch { return '' }
  }

  const openProjectDetail = (projectId: string) => {
    setSelectedProjectId(projectId)
    setCurrentView('project-detail')
  }

  const tabs: { value: TabFilter; label: string }[] = [
    { value: 'all', label: 'All Tasks' },
    { value: 'my', label: 'My Tasks' },
    { value: 'byStatus', label: 'By Status' },
  ]

  const renderTaskRow = (task: Task) => (
    <Card key={task.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 flex items-center gap-3">
        <Checkbox
          checked={selected.has(task.id)}
          onCheckedChange={() => toggleSelect(task.id)}
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium truncate">{task.title}</p>
            {task.isMilestone && (
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                Milestone
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <button
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              onClick={() => openProjectDetail(task.projectId)}
            >
              {getProjectName(task.projectId)}
            </button>
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{getMemberName(task.assigneeId)}</span>
            {task.dueDate && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(task.dueDate)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={cn('text-[10px] hidden sm:inline-flex', priorityColor[task.priority] || '')}>
            {task.priority}
          </Badge>
          <Badge variant="outline" className={cn('text-[10px]', taskStatusColor[task.status] || '')}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Progress value={task.progress} className="h-1.5 w-12 hidden md:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(task)}>
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              {can('delete:tasks') && (
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 dark:text-red-400" onClick={() => openDelete(task)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  const renderKanbanCard = (task: Task) => (
    <Card key={task.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => openEdit(task)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{task.title}</p>
          {task.isMilestone && (
            <ArrowUpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          )}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="outline" className={cn('text-[10px]', priorityColor[task.priority] || '')}>
            {task.priority}
          </Badge>
          {task.dueDate && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <CalendarDays className="h-3 w-3" />{formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                {getMemberName(task.assigneeId).split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-muted-foreground truncate max-w-20">{getMemberName(task.assigneeId)}</span>
          </div>
          <Progress value={task.progress} className="h-1 w-10" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-md transition-all', viewMode === 'list' ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('kanban')} className={cn('p-2 rounded-md transition-all', viewMode === 'kanban' ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
              <Columns3 className="h-4 w-4" />
            </button>
          </div>
          {can('create:tasks') && (
            <Button className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> New Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTabFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                tabFilter === tab.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border shadow-xl rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <span className="text-sm font-medium">{selected.size} selected</span>
            <div className="h-5 w-px bg-border" />
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Bulk action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status:PENDING">Set Pending</SelectItem>
                <SelectItem value="status:IN_PROGRESS">Set In Progress</SelectItem>
                <SelectItem value="status:COMPLETED">Set Completed</SelectItem>
                <SelectItem value="priority:HIGH">Set High Priority</SelectItem>
                <SelectItem value="priority:MEDIUM">Set Medium Priority</SelectItem>
                <SelectItem value="priority:LOW">Set Low Priority</SelectItem>
                <SelectItem value="delete">Delete Selected</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white" onClick={handleBulkAction} disabled={!bulkAction}>
              Apply
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setSelected(new Set()); setBulkAction('') }}>
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.status)
            return (
              <div key={col.status} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={cn('w-2.5 h-2.5 rounded-full', col.color)} />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{colTasks.length}</Badge>
                </div>
                <div className="space-y-2 flex-1 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                  {colTasks.length === 0 ? (
                    <div className="border border-dashed rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    </div>
                  ) : (
                    colTasks.map(renderKanbanCard)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {/* Select All Header */}
          <div className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground">
            <Checkbox
              checked={filtered.length > 0 && selected.size === filtered.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="font-medium">Select All</span>
            <span className="ml-auto">{selected.size > 0 ? `${selected.size} selected` : `${filtered.length} tasks`}</span>
          </div>
          {filtered.map(renderTaskRow)}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>{editingTask ? 'Update task details.' : 'Fill in the details to create a new task.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title *</Label>
              <Input id="task-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea id="task-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-project">Project *</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                  <SelectTrigger id="task-project"><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
                  <SelectTrigger id="task-assignee"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger id="task-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger id="task-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-due">Due Date</Label>
                <Input id="task-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-hours">Est. Hours</Label>
                <Input id="task-hours" type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTask?.title}&quot;?
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

