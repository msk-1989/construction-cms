'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen, FileText, CreditCard, MessageSquare, Eye,
  Building2, TrendingUp, Clock, DollarSign, Download,
  CheckCircle2, AlertTriangle, ArrowRight, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import type { Project, Document, PaymentVoucher, RFI, ActivityLog } from '@/types/cms'

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

const paymentStatusColor: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  APPROVED: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
}

const rfiStatusColor: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  IN_REVIEW: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  CLOSED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ANSWERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export function ExternalPanel() {
  const user = useAuthStore((s) => s.user)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId)

  const [projects, setProjects] = useState<Project[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [payments, setPayments] = useState<PaymentVoucher[]>([])
  const [rfis, setRfis] = useState<RFI[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [selectedProjectId, setSelectedProjectIdLocal] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true)
      const [pRes, aRes] = await Promise.allSettled([
        globalThis.fetch('/api/projects'),
        globalThis.fetch('/api/activity'),
      ])
      if (pRes.status === 'fulfilled' && pRes.value.ok) {
        const d = await pRes.value.json()
        const list = d.data || d || []
        setProjects(list)
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectIdLocal(list[0].id)
        }
      }
      if (aRes.status === 'fulfilled' && aRes.value.ok) {
        const d = await aRes.value.json()
        setActivity(d.data || d || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [selectedProjectId])

  const fetchProjectData = useCallback(async () => {
    if (!selectedProjectId) return
    try {
      const [docRes, payRes, rfiRes] = await Promise.allSettled([
        globalThis.fetch(`/api/documents?projectId=${selectedProjectId}`),
        globalThis.fetch(`/api/payments?projectId=${selectedProjectId}`),
        globalThis.fetch(`/api/rfis?projectId=${selectedProjectId}`),
      ])
      if (docRes.status === 'fulfilled' && docRes.value.ok) { const d = await docRes.value.json(); setDocuments(d.data || d || []) }
      if (payRes.status === 'fulfilled' && payRes.value.ok) { const d = await payRes.value.json(); setPayments(d.data || d || []) }
      if (rfiRes.status === 'fulfilled' && rfiRes.value.ok) { const d = await rfiRes.value.json(); setRfis(d.data || d || []) }
    } catch {
      // silent
    }
  }, [selectedProjectId])

  useEffect(() => { fetchInitial() }, [fetchInitial])
  useEffect(() => { if (selectedProjectId) fetchProjectData() }, [selectedProjectId, fetchProjectData])

  const dashboardStats = useMemo(() => {
    const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0
    const pendingPayments = payments.filter((p) => p.status !== 'PAID').length
    const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
    const totalPending = payments.filter((p) => p.status !== 'PAID').reduce((s, p) => s + p.amount, 0)
    return { projectCount: projects.length, avgProgress, pendingPayments, totalPaid, totalPending, openRfis: rfis.filter((r) => r.status === 'OPEN').length }
  }, [projects, payments, rfis])

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
          { label: 'My Projects', value: dashboardStats.projectCount, icon: FolderOpen, color: 'from-amber-500 to-orange-500' },
          { label: 'Overall Progress', value: `${dashboardStats.avgProgress}%`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
          { label: 'Pending Approvals', value: dashboardStats.pendingPayments + dashboardStats.openRfis, icon: Clock, color: 'from-rose-500 to-pink-500' },
          { label: 'Payments Received', value: formatCurrency(dashboardStats.totalPaid), icon: DollarSign, color: 'from-violet-500 to-purple-500', isText: true },
        ].map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    <p className="text-2xl font-bold mt-1 tracking-tight">{s.value}</p>
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

      {dashboardStats.totalPending > 0 && (
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Pending Payment: {formatCurrency(dashboardStats.totalPending)}</p>
                <p className="text-xs text-muted-foreground">{dashboardStats.pendingPayments} payment(s) awaiting processing</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-amber-500" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openProject(p.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress value={p.progress} className="h-1.5 w-20" />
                        <span className="text-xs text-muted-foreground">{p.progress}%</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('text-[10px] shrink-0', statusColor[p.status] || '')}>
                      {p.status.replace('_', ' ')}
                    </Badge>
                  </button>
                ))}
                {projects.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No projects assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
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
                  {activity.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )

  const ProjectsTab = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Project</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Code</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Status</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Budget</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Progress</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs">Start Date</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-xs"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-3 font-medium text-sm">{p.name}</td>
                <td className="py-3 px-3 text-xs text-muted-foreground font-mono">{p.code}</td>
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
                <td className="py-3 px-3 text-xs text-muted-foreground">{p.startDate ? formatDate(p.startDate) : '—'}</td>
                <td className="py-3 px-3">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-amber-600 hover:text-amber-700" onClick={() => openProject(p.id)}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No projects available
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const DocumentsTab = () => (
    <div className="space-y-4">
      {selectedProjectId && (
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Project:</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectIdLocal}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Title</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">File</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Category</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Version</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Uploaded</th>
              <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm font-medium">{doc.title}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{doc.filename}</td>
                <td className="py-2.5 px-3">
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {doc.category}
                  </Badge>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">v{doc.version}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(doc.createdAt)}</td>
                <td className="py-2.5 px-3">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No documents available for this project
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const PaymentsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: formatCurrency(dashboardStats.totalPaid), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Pending', value: formatCurrency(dashboardStats.totalPending), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Total Payments', value: formatCurrency(dashboardStats.totalPaid + dashboardStats.totalPending), icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <s.icon className={cn('w-5 h-5', s.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
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
              <CreditCard className="h-4 w-4 text-amber-500" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Voucher #</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Title</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Type</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Amount</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Payee</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Status</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => (
                    <tr key={pay.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2.5 px-3 text-xs font-mono">{pay.voucherNo}</td>
                      <td className="py-2.5 px-3 text-sm">{pay.title}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{pay.paymentType}</td>
                      <td className="py-2.5 px-3 text-sm font-medium">{formatCurrency(pay.amount)}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{pay.payeeName}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className={cn('text-[10px]', paymentStatusColor[pay.status] || '')}>
                          {pay.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(pay.createdAt)}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No payment records found
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

  const CommunicationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-amber-500" />
                RFIs on My Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-80">
                <div className="space-y-2">
                  {rfis.map((rfi) => (
                    <div key={rfi.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{rfi.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{rfi.description}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[10px] shrink-0', rfiStatusColor[rfi.status] || '')}>
                          {rfi.status}
                        </Badge>
                      </div>
                      {rfi.response && (
                        <div className="mt-2 p-2 rounded bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">Response:</p>
                          <p className="text-xs">{rfi.response}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1.5">{formatDate(rfi.createdAt)}</p>
                    </div>
                  ))}
                  {rfis.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No RFIs found
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-orange-500" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-80">
                <div className="space-y-2">
                  {activity.slice(0, 12).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 py-2">
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
                  {activity.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No recent updates</p>
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
          <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Portal</span> Overview
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome, {user?.name || 'Guest'}. View your project information and documents.
        </p>
      </motion.div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="dashboard" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FolderOpen className="h-3.5 w-3.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Building2 className="h-3.5 w-3.5" /> My Projects
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="h-3.5 w-3.5" /> Documents
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CreditCard className="h-3.5 w-3.5" /> Payments
          </TabsTrigger>
          <TabsTrigger value="communication" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MessageSquare className="h-3.5 w-3.5" /> Communication
          </TabsTrigger>
        </TabsList>

        <motion.div variants={container} initial="hidden" animate="show">
          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="projects"><ProjectsTab /></TabsContent>
          <TabsContent value="documents"><DocumentsTab /></TabsContent>
          <TabsContent value="payments"><PaymentsTab /></TabsContent>
          <TabsContent value="communication"><CommunicationTab /></TabsContent>
        </motion.div>
      </Tabs>

      {/* Footer note */}
      <motion.div variants={item} initial="hidden" animate="show">
        <div className="flex items-center justify-center gap-2 py-4">
          <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">External users have view-only access</p>
        </div>
      </motion.div>
    </div>
  )
}