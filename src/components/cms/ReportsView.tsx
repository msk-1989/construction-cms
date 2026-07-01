'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign,
  Target, Activity, Loader2, FileBarChart,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, LineChart, Line, Legend,
} from 'recharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Project, Task, User, BudgetCategory, Expense, DashboardStats } from '@/types/cms'

const AMBER_COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d', '#f97316']
const STATUS_COLORS: Record<string, string> = {
  PLANNING: '#fbbf24',
  ACTIVE: '#f59e0b',
  ON_HOLD: '#9ca3af',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
}
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
}

export function ReportsView() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [budgetCategories, setBudgetCategories] = useState<(BudgetCategory & { expenses?: Expense[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState('')

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, projRes, taskRes] = await Promise.all([
        globalThis.fetch('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'all' }) }),
        globalThis.fetch('/api/projects'),
        globalThis.fetch('/api/tasks'),
      ])
      const [statsJson, projJson, taskJson] = await Promise.all([statsRes.json(), projRes.json(), taskRes.json()])
      if (statsJson.success) setStats(statsJson.data)
      if (projJson.success) setProjects(projJson.data)
      if (taskJson.success) setTasks(taskJson.data)
    } catch {
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const fetchBudgetData = useCallback(async (projectId: string) => {
    if (!projectId) { setBudgetCategories([]); return }
    try {
      const res = await globalThis.fetch(`/api/budget-categories?projectId=${projectId}`)
      const json = await res.json()
      if (json.success) setBudgetCategories(json.data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchBudgetData(selectedProject) }, [selectedProject, fetchBudgetData])

  // ===== Overview charts data =====
  const statusPieData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Planning', value: stats.planningProjects, color: STATUS_COLORS.PLANNING },
      { name: 'Active', value: stats.activeProjects, color: STATUS_COLORS.ACTIVE },
      { name: 'On Hold', value: stats.onHoldProjects, color: STATUS_COLORS.ON_HOLD },
      { name: 'Completed', value: stats.completedProjects, color: STATUS_COLORS.COMPLETED },
      { name: 'Cancelled', value: stats.cancelledProjects, color: STATUS_COLORS.CANCELLED },
    ].filter((d) => d.value > 0)
  }, [stats])

  const priorityBarData = useMemo(() => {
    if (!tasks.length) return []
    const counts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 }
    tasks.forEach((t) => { if (counts[t.priority as string] !== undefined) counts[t.priority as string]++ })
    return Object.entries(counts).map(([k, v]) => ({ name: k.charAt(0) + k.slice(1).toLowerCase(), value: v, color: PRIORITY_COLORS[k] }))
  }, [tasks])

  // ===== Budget chart data =====
  const budgetChartData = useMemo(() => {
    return budgetCategories.map((cat) => ({
      name: cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name,
      fullName: cat.name,
      allocated: cat.allocated,
      spent: cat.expenses?.reduce((s, e) => s + e.amount, 0) ?? 0,
    }))
  }, [budgetCategories])

  // ===== Performance chart data =====
  const perfData = useMemo(() => {
    const memberTaskMap = new Map<string, { completed: number; total: number; name: string }>()
    tasks.forEach((t) => {
      if (!t.assigneeId) return
      const existing = memberTaskMap.get(t.assigneeId) || { completed: 0, total: 0, name: t.assignee?.name || 'Unknown' }
      existing.total++
      if (t.status === 'COMPLETED') existing.completed++
      memberTaskMap.set(t.assigneeId, existing)
    })
    return Array.from(memberTaskMap.values())
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10)
      .map((m) => ({ ...m, name: m.name.split(' ')[0] }))
  }, [tasks])

  const tooltipStyle = {
    contentStyle: { backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    labelStyle: { fontWeight: 600, color: 'hsl(var(--foreground))' },
  }

  const StatCard = ({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) => (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Analytics and insights across all projects</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 flex-wrap">
          <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="budget" className="gap-2"><DollarSign className="h-4 w-4" /> Budget</TabsTrigger>
          <TabsTrigger value="performance" className="gap-2"><TrendingUp className="h-4 w-4" /> Performance</TabsTrigger>
          <TabsTrigger value="burndown" className="gap-2"><Target className="h-4 w-4" /> Burndown</TabsTrigger>
          <TabsTrigger value="evm" className="gap-2"><Activity className="h-4 w-4" /> EVM</TabsTrigger>
        </TabsList>

        {/* =================== OVERVIEW TAB =================== */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FileBarChart} label="Total Projects" value={stats?.totalProjects ?? 0} />
            <StatCard icon={BarChart3} label="Total Tasks" value={stats?.totalTasks ?? 0} sub={`${stats?.completedTasks ?? 0} completed`} />
            <StatCard icon={DollarSign} label="Budget Used" value={`${stats?.budgetUtilization ?? 0}%`} sub={`$${((stats?.totalSpent ?? 0) / 1000).toFixed(1)}k spent`} />
            <StatCard icon={TrendingUp} label="Team Members" value={stats?.totalMembers ?? 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Pie Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Project Status Distribution</CardTitle></CardHeader>
              <CardContent className="h-72">
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>
                        {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No project data</div>
                )}
              </CardContent>
            </Card>

            {/* Task Priority Bar Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Tasks by Priority</CardTitle></CardHeader>
              <CardContent className="h-72">
                {priorityBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                        {priorityBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No task data</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* =================== BUDGET TAB =================== */}
        <TabsContent value="budget" className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Project:</span>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select a project" /></SelectTrigger>
              <SelectContent>
                {projects.filter((p) => p.budget && p.budget > 0).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} (${((p.budget ?? 0) / 1000).toFixed(0)}k)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedProject ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-12 flex flex-col items-center text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Select a project with a budget to view financial reports</p>
            </CardContent></Card>
          ) : (
            <>
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Budget Categories: Allocated vs Spent</CardTitle></CardHeader>
                <CardContent className="h-80">
                  {budgetChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetChartData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={75} />
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'allocated' ? 'Allocated' : 'Spent']}
                          labelFormatter={(label) => budgetChartData.find((d) => d.name === label)?.fullName || label}
                        />
                        <Legend />
                        <Bar dataKey="allocated" name="Allocated" fill="#fbbf24" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="spent" name="Spent" fill="#f97316" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No budget categories defined</div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Table */}
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Recent Expenses</CardTitle></CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {budgetCategories.flatMap((cat) => (cat.expenses || [])).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map((exp) => (
                          <TableRow key={exp.id}>
                            <TableCell className="text-sm">{exp.description}</TableCell>
                            <TableCell className="text-sm font-medium text-amber-600">${exp.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                        {budgetCategories.flatMap((c) => c.expenses || []).length === 0 && (
                          <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No expenses recorded</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* =================== PERFORMANCE TAB =================== */}
        <TabsContent value="performance" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Tasks Completed per Member</CardTitle></CardHeader>
            <CardContent className="h-80">
              {perfData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perfData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    <Bar dataKey="completed" name="Completed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total Assigned" fill="#fde68a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No performance data available</div>
              )}
            </CardContent>
          </Card>

          {/* Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-foreground mt-1">{tasks.length}</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">{tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === 'COMPLETED').length / tasks.length) * 100) : 0}%</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Overdue Tasks</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats?.overdueTasks ?? 0}</p>
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* =================== BURNDOWN TAB =================== */}
        <TabsContent value="burndown" className="mt-6 space-y-6">
          <BurndownChart projects={projects} />
        </TabsContent>

        {/* =================== EVM TAB =================== */}
        <TabsContent value="evm" className="mt-6 space-y-6">
          <EVMChart projects={projects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* =================== Burndown Chart =================== */
function BurndownChart({ projects }: { projects: Project[] }) {
  const [projectId, setProjectId] = useState('')
  const [data, setData] = useState<{ weeks: { week: string; ideal: number; actual: number }[]; completionRate: number; totalTasks: number; completedTasks: number; remainingTasks: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBurndown = useCallback(async (pid: string) => {
    if (!pid) { setData(null); return }
    setLoading(true)
    try {
      const res = await globalThis.fetch(`/api/reports/burndown?projectId=${pid}`)
      const json = await res.json()
      if (json.success) setData(json.data)
      else toast.error(json.error || 'Failed to load burndown')
    } catch { toast.error('Failed to load burndown data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchBurndown(projectId) }, [projectId, fetchBurndown])

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Project:</span>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select project" /></SelectTrigger>
          <SelectContent>
            {projects.filter((p) => (p._count?.tasks ?? 0) > 0).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!projectId ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-12 flex flex-col items-center text-center">
          <Target className="h-12 w-12 text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Select a project to view its burndown chart</p>
        </CardContent></Card>
      ) : loading ? (
        <Skeleton className="h-80 w-full" />
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Completion Rate</p><p className="text-2xl font-bold text-foreground mt-1">{data.completionRate}%</p></CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-emerald-600 mt-1">{data.completedTasks}</p></CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Remaining</p><p className="text-2xl font-bold text-amber-600 mt-1">{data.remainingTasks}</p></CardContent></Card>
          </div>
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Burndown Chart</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeks} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="ideal" name="Ideal" stroke="#fbbf24" fill="#fbbf2430" strokeWidth={2} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#f97316" fill="#f9731630" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : null}
    </>
  )
}

/* =================== EVM Chart =================== */
function EVMChart({ projects }: { projects: Project[] }) {
  const [projectId, setProjectId] = useState('')
  const [data, setData] = useState<{
    bac: number; pv: number; ev: number; ac: number; cv: number; sv: number;
    cpi: number; spi: number; eac: number; etc: number; healthStatus: string;
    budgetConsumedPercent: number; workCompletePercent: number;
    taskStats: { total: number; completed: number; inProgress: number; pending: number }
    expenseStats: { totalSpent: number; remainingBudget: number }
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchEVM = useCallback(async (pid: string) => {
    if (!pid) { setData(null); return }
    setLoading(true)
    try {
      const res = await globalThis.fetch(`/api/reports/evm?projectId=${pid}`)
      const json = await res.json()
      if (json.success) setData(json.data)
      else toast.error(json.error || 'Failed to load EVM')
    } catch { toast.error('Failed to load EVM data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchEVM(projectId) }, [projectId, fetchEVM])

  const healthColor = data?.healthStatus === 'HEALTHY' ? 'text-emerald-600' : data?.healthStatus === 'AT_RISK' ? 'text-amber-600' : 'text-red-600'
  const healthBg = data?.healthStatus === 'HEALTHY' ? 'bg-emerald-100 dark:bg-emerald-900/30' : data?.healthStatus === 'AT_RISK' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'

  const sCurveData = data ? [
    { name: 'Start', PV: 0, EV: 0, AC: 0 },
    { name: '25%', PV: data.bac * 0.25, EV: data.ev * 0.8, AC: data.ac * 0.6 },
    { name: '50%', PV: data.bac * 0.5, EV: data.ev, AC: data.ac },
    { name: '75%', PV: data.bac * 0.75, EV: data.ev * 1.1, AC: data.ac * 1.2 },
    { name: '100%', PV: data.bac, EV: data.bac * (data.taskStats.total > 0 ? data.taskStats.completed / data.taskStats.total : 0), AC: data.ac * 1.3 },
  ] : []

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Project:</span>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select project" /></SelectTrigger>
          <SelectContent>
            {projects.filter((p) => p.budget && p.budget > 0).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} (${((p.budget ?? 0) / 1000).toFixed(0)}k)</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!projectId ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-12 flex flex-col items-center text-center">
          <Activity className="h-12 w-12 text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Select a project to view EVM metrics</p>
        </CardContent></Card>
      ) : loading ? (
        <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-80" /></div>
      ) : data ? (
        <>
          {/* Health Status */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-sm"><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Project Health</p>
                  <p className={cn('text-lg font-bold mt-1', healthColor)}>{data.healthStatus.replace('_', ' ')}</p>
                </div>
                <div className={cn('px-3 py-1.5 rounded-full text-xs font-semibold', healthBg, healthColor)}>
                  {data.healthStatus === 'HEALTHY' ? 'On Track' : data.healthStatus === 'AT_RISK' ? 'Needs Attention' : 'Critical'}
                </div>
              </div>
            </CardContent></Card>
          </motion.div>

          {/* EVM Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'CPI', value: data.cpi.toFixed(2), sub: 'Cost Performance', color: data.cpi >= 1 ? 'text-emerald-600' : 'text-red-600' },
              { label: 'SPI', value: data.spi.toFixed(2), sub: 'Schedule Performance', color: data.spi >= 1 ? 'text-emerald-600' : 'text-red-600' },
              { label: 'CV', value: `$${Math.round(data.cv).toLocaleString()}`, sub: 'Cost Variance', color: data.cv >= 0 ? 'text-emerald-600' : 'text-red-600' },
              { label: 'SV', value: `$${Math.round(data.sv).toLocaleString()}`, sub: 'Schedule Variance', color: data.sv >= 0 ? 'text-emerald-600' : 'text-red-600' },
              { label: 'EAC', value: `$${data.eac.toLocaleString()}`, sub: 'Est. at Completion', color: data.eac <= data.bac ? 'text-emerald-600' : 'text-amber-600' },
            ].map((m) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-sm"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className={cn('text-xl font-bold mt-1', m.color)}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
                </CardContent></Card>
              </motion.div>
            ))}
          </div>

          {/* Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm"><CardContent className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Budget Consumed</span><span className="font-medium">{data.budgetConsumedPercent}%</span></div>
                <Progress value={data.budgetConsumedPercent} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Work Complete</span><span className="font-medium">{data.workCompletePercent}%</span></div>
                <Progress value={data.workCompletePercent} className="h-2" />
              </div>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">BAC</span><span className="font-medium">${data.bac.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">PV</span><span className="font-medium">${Math.round(data.pv).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">EV</span><span className="font-medium">${Math.round(data.ev).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">AC</span><span className="font-medium">${Math.round(data.ac).toLocaleString()}</span></div>
            </CardContent></Card>
          </div>

          {/* S-Curve */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">S-Curve (PV / EV / AC)</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sCurveData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} formatter={(v: number) => `$${Math.round(v).toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="PV" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24' }} />
                  <Line type="monotone" dataKey="EV" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                  <Line type="monotone" dataKey="AC" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : null}
    </>
  )
}