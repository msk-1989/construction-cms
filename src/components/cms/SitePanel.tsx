'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList, MessageSquare, AlertTriangle, Package, Shield, Camera,
  Plus, ChevronRight, CheckCircle2, Circle, Clock, Sun, Cloud, CloudRain,
  Thermometer, Users, FileText, Filter, Loader2, X,
  HardHat, Eye, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/store/useAuthStore'
import type { Project, Task, DailyLog, RFI, PunchItem, Material } from '@/types/cms'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

const rfiStatusColor: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  IN_REVIEW: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  CLOSED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ANSWERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const punchStatusColor: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const materialStatusColor: Record<string, string> = {
  PLANNED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  ORDERED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  INSTALLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
}

const taskStatusColor: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ON_HOLD: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export function SitePanel() {
  const { can } = usePermissions()
  const user = useAuthStore((s) => s.user)

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [rfis, setRfis] = useState<RFI[]>([])
  const [punchItems, setPunchItems] = useState<PunchItem[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [logDialogOpen, setLogDialogOpen] = useState(false)
  const [rfiDialogOpen, setRfiDialogOpen] = useState(false)
  const [punchFilter, setPunchFilter] = useState<string>('ALL')

  // Form states
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().split('T')[0], weather: 'CLEAR', temperature: '', crewSize: '', notes: '', safetyNotes: '' })
  const [rfiForm, setRfiForm] = useState({ title: '', description: '', priority: 'MEDIUM' })
  const [saving, setSaving] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await globalThis.fetch('/api/projects')
      if (res.ok) {
        const d = await res.json()
        const list = d.data || d || []
        setProjects(list)
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id)
        }
      }
    } catch { /* silent */ }
  }, [selectedProjectId])

  const fetchProjectData = useCallback(async () => {
    if (!selectedProjectId) return
    try {
      setLoading(true)
      const [tRes, dlRes, rRes, pRes, mRes] = await Promise.allSettled([
        globalThis.fetch(`/api/tasks?projectId=${selectedProjectId}`),
        globalThis.fetch(`/api/daily-logs?projectId=${selectedProjectId}`),
        globalThis.fetch(`/api/rfis?projectId=${selectedProjectId}`),
        globalThis.fetch(`/api/punch-items?projectId=${selectedProjectId}`),
        globalThis.fetch(`/api/materials?projectId=${selectedProjectId}`),
      ])
      if (tRes.status === 'fulfilled' && tRes.value.ok) { const d = await tRes.value.json(); setTasks(d.data || d || []) }
      if (dlRes.status === 'fulfilled' && dlRes.value.ok) { const d = await dlRes.value.json(); setDailyLogs(d.data || d || []) }
      if (rRes.status === 'fulfilled' && rRes.value.ok) { const d = await rRes.value.json(); setRfis(d.data || d || []) }
      if (pRes.status === 'fulfilled' && pRes.value.ok) { const d = await pRes.value.json(); setPunchItems(d.data || d || []) }
      if (mRes.status === 'fulfilled' && mRes.value.ok) { const d = await mRes.value.json(); setMaterials(d.data || d || []) }
    } catch {
      toast.error('Failed to load project data')
    } finally {
      setLoading(false)
    }
  }, [selectedProjectId])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  useEffect(() => {
    if (selectedProjectId) fetchProjectData()
  }, [selectedProjectId, fetchProjectData])

  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter((t) => {
      if (t.status === 'COMPLETED') return false
      if (!t.dueDate) return false
      return t.dueDate.startsWith(today)
    })
  }, [tasks])

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter((t) => t.completedAt && t.completedAt.startsWith(today)).length
  }, [tasks])

  const openPunchItems = useMemo(() => punchItems.filter((p) => p.status === 'OPEN'), [punchItems])
  const filteredPunchItems = useMemo(() => {
    if (punchFilter === 'ALL') return punchItems
    return punchItems.filter((p) => p.status === punchFilter)
  }, [punchItems, punchFilter])

  const materialSummary = useMemo(() => {
    const planned = materials.filter((m) => m.status === 'PLANNED').length
    const ordered = materials.filter((m) => m.status === 'ORDERED').length
    const delivered = materials.filter((m) => m.status === 'DELIVERED').length
    const installed = materials.filter((m) => m.status === 'INSTALLED').length
    return { planned, ordered, delivered, installed, total: materials.length }
  }, [materials])

  const createDailyLog = async () => {
    if (!selectedProjectId) return
    try {
      setSaving(true)
      const res = await globalThis.fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...logForm, crewSize: Number(logForm.crewSize) || 0, projectId: selectedProjectId }),
      })
      if (res.ok) {
        toast.success('Daily log created')
        setLogDialogOpen(false)
        setLogForm({ date: new Date().toISOString().split('T')[0], weather: 'CLEAR', temperature: '', crewSize: '', notes: '', safetyNotes: '' })
        fetchProjectData()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to create log')
      }
    } catch {
      toast.error('Failed to create log')
    } finally {
      setSaving(false)
    }
  }

  const createRFI = async () => {
    if (!selectedProjectId) return
    try {
      setSaving(true)
      const res = await globalThis.fetch('/api/rfis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rfiForm, projectId: selectedProjectId }),
      })
      if (res.ok) {
        toast.success('RFI created')
        setRfiDialogOpen(false)
        setRfiForm({ title: '', description: '', priority: 'MEDIUM' })
        fetchProjectData()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to create RFI')
      }
    } catch {
      toast.error('Failed to create RFI')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return '' }
  }

  const WeatherIcon = ({ weather }: { weather: string | null | undefined }) => {
    if (!weather || weather === 'CLEAR') return <Sun className="h-4 w-4 text-amber-500" />
    if (weather === 'CLOUDY') return <Cloud className="h-4 w-4 text-gray-400" />
    if (weather === 'RAIN') return <CloudRain className="h-4 w-4 text-sky-500" />
    return <Sun className="h-4 w-4 text-amber-500" />
  }

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Progress", value: `${completedToday}/${todayTasks.length + completedToday}`, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', desc: 'Tasks completed' },
          { label: 'Labour Present', value: dailyLogs.length > 0 ? `${dailyLogs[0]?.crewSize || 0}` : '—', icon: Users, color: 'from-amber-500 to-orange-500', desc: 'From latest log' },
          { label: 'Material Stock', value: `${materialSummary.delivered}/${materialSummary.total}`, icon: Package, color: 'from-sky-500 to-blue-500', desc: 'Delivered items' },
          { label: 'Safety Status', value: 'Good', icon: Shield, color: 'from-emerald-500 to-green-600', desc: 'No incidents today' },
        ].map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg', s.color)}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Today&apos;s Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[...todayTasks, ...tasks.filter((t) => t.status === 'IN_PROGRESS').slice(0, 5)].map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', taskStatusColor[t.status] || 'bg-gray-100')}>
                    {t.status === 'COMPLETED' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> :
                     t.status === 'IN_PROGRESS' ? <Zap className="h-4 w-4 text-amber-600" /> :
                     <Circle className="h-4 w-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.priority} · Due: {t.dueDate ? formatDate(t.dueDate) : '—'}</p>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px] shrink-0', taskStatusColor[t.status] || '')}>
                    {t.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No tasks found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Open Punch Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {openPunchItems.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.location || 'No location'} · {p.priority}</p>
                  </div>
                </div>
              ))}
              {openPunchItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No open punch items</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const SiteDiaryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">{dailyLogs.length} entries</h3>
        {can('create_daily_log' as any) && (
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs" onClick={() => setLogDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New Entry
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Date</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Weather</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Temp</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Crew</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Notes</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">By</th>
            </tr>
          </thead>
          <tbody>
            {dailyLogs.map((log) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 px-3 text-sm">{formatDate(log.date)}</td>
                <td className="py-2.5 px-3"><div className="flex items-center gap-1.5"><WeatherIcon weather={log.weather} /><span className="text-xs">{log.weather || '—'}</span></div></td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{log.temperature ? `${log.temperature}°C` : '—'}</td>
                <td className="py-2.5 px-3 text-sm">{log.crewSize || '—'}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-[200px] truncate">{log.notes || '—'}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{log.createdBy?.name || '—'}</td>
              </tr>
            ))}
            {dailyLogs.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No daily logs yet
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const RFITab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">{rfis.length} RFIs</h3>
        {can('create_rfi' as any) && (
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs" onClick={() => setRfiDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New RFI
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Title</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Priority</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Status</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Due Date</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Created</th>
            </tr>
          </thead>
          <tbody>
            {rfis.map((rfi) => (
              <tr key={rfi.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 px-3">
                  <p className="text-sm font-medium truncate max-w-[250px]">{rfi.title}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">{rfi.description}</p>
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant="outline" className={cn('text-[10px]', rfi.priority === 'HIGH' ? 'bg-red-100 text-red-700' : rfi.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500')}>
                    {rfi.priority}
                  </Badge>
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant="outline" className={cn('text-[10px]', rfiStatusColor[rfi.status] || '')}>
                    {rfi.status}
                  </Badge>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{rfi.dueDate ? formatDate(rfi.dueDate) : '—'}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(rfi.createdAt)}</td>
              </tr>
            ))}
            {rfis.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No RFIs yet
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const PunchItemsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
            <Button key={s} size="sm" variant={punchFilter === s ? 'default' : 'outline'} className="text-[10px] h-7 px-2"
              onClick={() => setPunchFilter(s)}>
              {s.replace('_', ' ')} {s === 'ALL' ? `(${punchItems.length})` : `(${punchItems.filter((p) => p.status === s).length})`}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Title</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Location</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Priority</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Status</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Due Date</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {filteredPunchItems.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 px-3">
                  <p className="text-sm font-medium">{p.title}</p>
                  {p.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</p>}
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{p.location || '—'}</td>
                <td className="py-2.5 px-3">
                  <Badge variant="outline" className={cn('text-[10px]', p.priority === 'HIGH' ? 'bg-red-100 text-red-700' : p.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500')}>
                    {p.priority}
                  </Badge>
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant="outline" className={cn('text-[10px]', punchStatusColor[p.status] || '')}>
                    {p.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{p.dueDate ? formatDate(p.dueDate) : '—'}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{p.assignedTo?.name || '—'}</td>
              </tr>
            ))}
            {filteredPunchItems.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No punch items match filter
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const SafetyQATab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Safety Score', value: '92%', icon: Shield, color: 'from-emerald-500 to-green-600' },
          { label: 'Open Incidents', value: '0', icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
          { label: 'Inspections Done', value: '24', icon: Eye, color: 'from-sky-500 to-blue-500' },
          { label: 'Quality Score', value: '88%', icon: CheckCircle2, color: 'from-violet-500 to-purple-500' },
        ].map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white', s.color)}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              Safety Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[
                { item: 'PPE Compliance Check', done: true },
                { item: 'Scaffolding Inspection', done: true },
                { item: 'Electrical Safety Check', done: true },
                { item: 'Fire Extinguisher Inspection', done: false },
                { item: 'First Aid Kit Stock', done: true },
                { item: 'Excavation Safety', done: false },
                { item: 'Crane/Lifting Equipment', done: true },
                { item: 'Hazardous Material Storage', done: true },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-1">
                  <CheckCircle2 className={cn('h-4 w-4 shrink-0', c.done ? 'text-emerald-500' : 'text-gray-300')} />
                  <span className={cn('text-sm', c.done ? 'text-foreground' : 'text-muted-foreground')}>{c.item}</span>
                  <Badge variant="outline" className={cn('text-[10px] ml-auto', c.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {c.done ? 'PASS' : 'PENDING'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-sky-500" />
              Inspection Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'Structural', passed: 8, failed: 1, total: 9 },
                { type: 'Electrical', passed: 6, failed: 2, total: 8 },
                { type: 'Plumbing', passed: 7, failed: 0, total: 7 },
              ].map((insp) => (
                <div key={insp.type} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs font-medium">{insp.type} Inspections</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-emerald-600">{insp.passed}</span>
                    <span className="text-xs text-muted-foreground">passed</span>
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className="text-lg font-bold text-red-600">{insp.failed}</span>
                    <span className="text-xs text-muted-foreground">failed</span>
                  </div>
                  <Progress value={(insp.passed / insp.total) * 100} className="h-1.5 mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const MaterialsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Planned', value: materialSummary.planned, color: 'text-sky-600' },
          { label: 'Ordered', value: materialSummary.ordered, color: 'text-amber-600' },
          { label: 'Delivered', value: materialSummary.delivered, color: 'text-emerald-600' },
          { label: 'Installed', value: materialSummary.installed, color: 'text-gray-600' },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Material</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Qty</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Unit</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Unit Cost</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Supplier</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 px-3 text-sm font-medium">{m.name}</td>
                <td className="py-2.5 px-3 text-sm">{m.quantity}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{m.unit}</td>
                <td className="py-2.5 px-3 text-sm">${m.unitCost.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{m.supplier || '—'}</td>
                <td className="py-2.5 px-3">
                  <Badge variant="outline" className={cn('text-[10px]', materialStatusColor[m.status] || '')}>
                    {m.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No materials found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading && !selectedProjectId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Site <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Operations</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Daily site management and field operations.</p>
      </motion.div>

      {/* Project Selector */}
      <motion.div variants={item} initial="hidden" animate="show">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <HardHat className="h-4 w-4 text-amber-500" />
            <Label className="text-sm font-medium">Select Project:</Label>
          </div>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Choose project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 sm:ml-auto">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setLogDialogOpen(true)}>
              <ClipboardList className="h-3.5 w-3.5" /> New Site Diary
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setRfiDialogOpen(true)}>
              <MessageSquare className="h-3.5 w-3.5" /> New RFI
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => toast.info('Incident reporting coming soon')}>
              <AlertTriangle className="h-3.5 w-3.5" /> Report Incident
            </Button>
          </div>
        </div>
      </motion.div>

      {loading && selectedProjectId ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : !selectedProjectId ? (
        <Card className="border-0 shadow-sm p-8 text-center">
          <HardHat className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Select a project to view site operations</p>
        </Card>
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="dashboard" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ClipboardList className="h-3.5 w-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="diary" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="h-3.5 w-3.5" /> Site Diary
            </TabsTrigger>
            <TabsTrigger value="rfi" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <MessageSquare className="h-3.5 w-3.5" /> RFIs
            </TabsTrigger>
            <TabsTrigger value="punch" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <AlertTriangle className="h-3.5 w-3.5" /> Punch Items
            </TabsTrigger>
            <TabsTrigger value="safety" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Shield className="h-3.5 w-3.5" /> Safety & QA
            </TabsTrigger>
            <TabsTrigger value="materials" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Package className="h-3.5 w-3.5" /> Materials
            </TabsTrigger>
          </TabsList>

          <motion.div variants={container} initial="hidden" animate="show">
            <TabsContent value="dashboard"><DashboardTab /></TabsContent>
            <TabsContent value="diary"><SiteDiaryTab /></TabsContent>
            <TabsContent value="rfi"><RFITab /></TabsContent>
            <TabsContent value="punch"><PunchItemsTab /></TabsContent>
            <TabsContent value="safety"><SafetyQATab /></TabsContent>
            <TabsContent value="materials"><MaterialsTab /></TabsContent>
          </motion.div>
        </Tabs>
      )}

      {/* Daily Log Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-amber-500" /> New Site Diary Entry
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-xs">Weather</Label>
                <Select value={logForm.weather} onValueChange={(v) => setLogForm({ ...logForm, weather: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLEAR">Clear</SelectItem>
                    <SelectItem value="CLOUDY">Cloudy</SelectItem>
                    <SelectItem value="RAIN">Rain</SelectItem>
                    <SelectItem value="WINDY">Windy</SelectItem>
                    <SelectItem value="HOT">Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Temperature (°C)</Label>
                <Input placeholder="e.g. 32" value={logForm.temperature} onChange={(e) => setLogForm({ ...logForm, temperature: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Crew Size</Label>
              <Input type="number" placeholder="Number of workers" value={logForm.crewSize} onChange={(e) => setLogForm({ ...logForm, crewSize: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Notes</Label>
              <Textarea placeholder="Daily work notes..." rows={3} value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Safety Notes</Label>
              <Textarea placeholder="Safety observations..." rows={2} value={logForm.safetyNotes} onChange={(e) => setLogForm({ ...logForm, safetyNotes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDialogOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" onClick={createDailyLog} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RFI Dialog */}
      <Dialog open={rfiDialogOpen} onOpenChange={setRfiDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-amber-500" /> New RFI
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label className="text-xs">Title</Label>
              <Input placeholder="RFI subject..." value={rfiForm.title} onChange={(e) => setRfiForm({ ...rfiForm, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Priority</Label>
              <Select value={rfiForm.priority} onValueChange={(v) => setRfiForm({ ...rfiForm, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Description</Label>
              <Textarea placeholder="Describe the question or issue..." rows={4} value={rfiForm.description} onChange={(e) => setRfiForm({ ...rfiForm, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRfiDialogOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" onClick={createRFI} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Submit RFI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}