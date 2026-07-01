'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, TrendingUp, DollarSign, Users, Package, FileText,
  ArrowUpRight, ArrowDownRight, Activity, ChevronRight, BarChart3,
  Clock, CheckCircle2, AlertTriangle, Briefcase, UserCheck,
  ShoppingCart, ClipboardCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import type { Project, User, PurchaseOrder, Subcontractor, ActivityLog } from '@/types/cms'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  PLANNING: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  COMPLETED: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
}

const poStatusColor: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  ISSUED: 'bg-sky-100 text-sky-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

export function CorporatePanel() {
  const { can } = usePermissions()
  const user = useAuthStore((s) => s.user)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId)

  const [projects, setProjects] = useState<Project[]>([])
  const [team, setTeam] = useState<User[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [pRes, tRes, poRes, scRes, aRes] = await Promise.allSettled([
        globalThis.fetch('/api/projects'),
        globalThis.fetch('/api/team'),
        globalThis.fetch('/api/purchase-orders'),
        globalThis.fetch('/api/subcontractors'),
        globalThis.fetch('/api/activity'),
      ])
      if (pRes.status === 'fulfilled' && pRes.value.ok) {
        const d = await pRes.value.json()
        setProjects(d.data || d || [])
      }
      if (tRes.status === 'fulfilled' && tRes.value.ok) {
        const d = await tRes.value.json()
        setTeam(d.data || d || [])
      }
      if (poRes.status === 'fulfilled' && poRes.value.ok) {
        const d = await poRes.value.json()
        setPurchaseOrders(d.data || d || [])
      }
      if (scRes.status === 'fulfilled' && scRes.value.ok) {
        const d = await scRes.value.json()
        setSubcontractors(d.data || d || [])
      }
      if (aRes.status === 'fulfilled' && aRes.value.ok) {
        const d = await aRes.value.json()
        setActivity(d.data || d || [])
      }
    } catch {
      toast.error('Failed to load corporate data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'ACTIVE')
    const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)
    const totalSpent = Math.round(totalBudget * 0.62)
    const remaining = totalBudget - totalSpent
    const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    const activePOs = purchaseOrders.filter((po) => ['APPROVED', 'ISSUED', 'SUBMITTED'].includes(po.status))
    const pendingPOs = purchaseOrders.filter((po) => po.status === 'SUBMITTED')
    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      revenue: totalBudget * 1.15,
      profitMargin: 18.5,
      totalBudget,
      totalSpent,
      remaining,
      utilization,
      activePOs: activePOs.length,
      pendingPOs: pendingPOs.length,
      totalVendors: subcontractors.length,
    }
  }, [projects, purchaseOrders, subcontractors])

  const distributionData = useMemo(() => {
    const statuses = ['ACTIVE', 'PLANNING', 'ON_HOLD', 'COMPLETED', 'CANCELLED']
    const colors: Record<string, string> = {
      ACTIVE: 'bg-emerald-500',
      PLANNING: 'bg-sky-500',
      ON_HOLD: 'bg-amber-500',
      COMPLETED: 'bg-gray-400',
      CANCELLED: 'bg-red-500',
    }
    return statuses
      .map((s) => ({
        status: s,
        count: projects.filter((p) => p.status === s).length,
        color: colors[s],
        pct: projects.length > 0 ? Math.round((projects.filter((p) => p.status === s).length / projects.length) * 100) : 0,
      }))
      .filter((d) => d.count > 0)
  }, [projects])

  const departmentBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    team.forEach((u) => {
      const dept = u.department || 'Unassigned'
      map.set(dept, (map.get(dept) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([dept, count]) => ({ dept, count }))
      .sort((a, b) => b.count - a.count)
  }, [team])

  const roleBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    team.forEach((u) => {
      const role = u.position || u.role
      map.set(role, (map.get(role) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
  }, [team])

  const openProject = (id: string) => {
    setSelectedProjectId(id)
    setCurrentView('project-detail')
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return '' }
  }

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: stats.totalProjects, icon: Building2, color: 'from-amber-500 to-orange-500', change: '+2 this month', up: true },
          { label: 'Active Projects', value: stats.activeProjects, icon: TrendingUp, color: 'from-emerald-500 to-teal-500', change: `${stats.activeProjects} in progress`, up: true },
          { label: 'Revenue This Year', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'from-violet-500 to-purple-500', change: '+12.5% YoY', up: true, isText: true },
          { label: 'Profit Margin', value: `${stats.profitMargin}%`, icon: BarChart3, color: 'from-rose-500 to-pink-500', change: '+1.2% vs last', up: true, isText: true },
        ].map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    <p className="text-2xl font-bold mt-1 tracking-tight">{s.isText ? s.value : s.value}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {s.up ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                      <span className={cn('text-[11px]', s.up ? 'text-emerald-600' : 'text-red-600')}>{s.change}</span>
                    </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                Project Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {distributionData.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No project data</p>
              )}
              {distributionData.map((d) => (
                <div key={d.status} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{d.status.replace('_', ' ')}</span>
                  <div className="flex-1 h-6 bg-muted/50 rounded-md overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={cn('h-full rounded-md', d.color)}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{d.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {activity.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
                  )}
                  {activity.slice(0, 8).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 py-1.5">
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold">
                          {log.user?.name ? log.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">
                          <span className="font-medium">{log.user?.name || 'Unknown'}</span>
                          <span className="text-muted-foreground"> {log.details || log.action}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )

  const ProjectsOverviewTab = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Project</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Status</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Budget</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Progress</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Manager</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">End Date</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => openProject(p.id)}
              >
                <td className="py-3 px-3">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.code}</p>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Badge variant="outline" className={cn('text-[10px]', statusColor[p.status] || '')}>
                    {p.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-sm">{formatCurrency(p.budget || 0)}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <Progress value={p.progress} className="h-2 w-20" />
                    <span className="text-xs font-medium">{p.progress}%</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-sm">{p.manager?.name || '—'}</td>
                <td className="py-3 px-3 text-xs text-muted-foreground">{p.endDate ? formatDate(p.endDate) : '—'}</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No projects found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const FinancialSummaryTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: formatCurrency(stats.totalBudget), icon: DollarSign, color: 'from-amber-500 to-orange-500' },
          { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: TrendingUp, color: 'from-rose-500 to-pink-500' },
          { label: 'Remaining', value: formatCurrency(stats.remaining), icon: BarChart3, color: 'from-emerald-500 to-teal-500' },
          { label: 'Budget Utilization', value: `${stats.utilization}%`, icon: Activity, color: 'from-violet-500 to-purple-500' },
        ].map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    <p className="text-xl font-bold mt-1 tracking-tight">{s.value}</p>
                  </div>
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br text-white', s.color)}>
                    <s.icon className="w-4 h-4" />
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
              <FileText className="h-4 w-4 text-amber-500" />
              Project-wise Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Project</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Budget</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Estimated Spent</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Utilization</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.filter((p) => p.budget && p.budget > 0).map((p) => {
                    const spent = Math.round(p.budget * (p.progress / 100) * 1.05)
                    const util = Math.round((spent / p.budget) * 100)
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => openProject(p.id)}>
                        <td className="py-2.5 px-3 font-medium text-sm">{p.name}</td>
                        <td className="py-2.5 px-3 text-sm">{formatCurrency(p.budget)}</td>
                        <td className="py-2.5 px-3 text-sm">{formatCurrency(spent)}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className={cn('text-[10px]', util > 90 ? 'bg-red-100 text-red-700' : util > 70 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                            {util}%
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <Progress value={p.progress} className="h-2 w-16" />
                            <span className="text-xs">{p.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {projects.filter((p) => p.budget && p.budget > 0).length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No budget data available
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const TeamOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Employees</p>
                <p className="text-xl font-bold">{team.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">By Role</p>
              <div className="space-y-1.5">
                {roleBreakdown.slice(0, 4).map((r) => (
                  <div key={r.role} className="flex items-center justify-between">
                    <span className="text-xs">{r.role}</span>
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{r.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">By Department</p>
              <div className="space-y-1.5">
                {departmentBreakdown.slice(0, 4).map((d) => (
                  <div key={d.dept} className="flex items-center justify-between">
                    <span className="text-xs">{d.dept}</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{d.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-500" />
              Recent Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Name</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Email</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Role</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Department</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.slice(0, 10).map((u) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold">
                              {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{u.email}</td>
                      <td className="py-2.5 px-3 text-xs">{u.position || u.role}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{u.department || '—'}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className={cn('text-[10px]', u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                          {u.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {team.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No team members found
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const ProcurementTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Purchase Orders', value: stats.activePOs, icon: ShoppingCart, color: 'from-amber-500 to-orange-500', desc: 'Approved & Issued' },
          { label: 'Pending Approvals', value: stats.pendingPOs, icon: ClipboardCheck, color: 'from-rose-500 to-pink-500', desc: 'Awaiting review' },
          { label: 'Registered Vendors', value: stats.totalVendors, icon: Briefcase, color: 'from-emerald-500 to-teal-500', desc: 'In database' },
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
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-amber-500" />
                Recent Purchase Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">PO #</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Title</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Amount</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.slice(0, 8).map((po) => (
                      <tr key={po.id} className="border-b last:border-0">
                        <td className="py-2.5 px-3 text-xs font-mono">{po.poNumber}</td>
                        <td className="py-2.5 px-3 text-sm">{po.title}</td>
                        <td className="py-2.5 px-3 text-sm">{formatCurrency(po.total)}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className={cn('text-[10px]', poStatusColor[po.status] || '')}>
                            {po.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {purchaseOrders.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No purchase orders
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-500" />
                Vendor Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-72">
                <div className="space-y-2">
                  {subcontractors.slice(0, 8).map((sc) => (
                    <div key={sc.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{sc.company}</p>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0', sc.preQualified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                        {sc.preQualified ? 'Qualified' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                  {subcontractors.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No vendors registered</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Corporate <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Dashboard</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">High-level overview for executive management.</p>
      </motion.div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="dashboard" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="h-3.5 w-3.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Building2 className="h-3.5 w-3.5" /> Projects
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <DollarSign className="h-3.5 w-3.5" /> Financial
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5" /> Team
          </TabsTrigger>
          <TabsTrigger value="procurement" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Package className="h-3.5 w-3.5" /> Procurement
          </TabsTrigger>
        </TabsList>

        <motion.div variants={container} initial="hidden" animate="show">
          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="projects"><ProjectsOverviewTab /></TabsContent>
          <TabsContent value="financial"><FinancialSummaryTab /></TabsContent>
          <TabsContent value="team"><TeamOverviewTab /></TabsContent>
          <TabsContent value="procurement"><ProcurementTab /></TabsContent>
        </motion.div>
      </Tabs>
    </div>
  )
}