'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen, FileText, CreditCard, MessageSquare, Eye,
  Building2, TrendingUp, Clock, DollarSign, Download,
  CheckCircle2, AlertTriangle, ArrowRight, Shield,
  Ruler, Compass, ClipboardCheck, ClipboardList, Timer,
  FileQuestion, Search, Filter, X,
  CalendarDays, User, MapPin, HardHat, Target, Award,
  BarChart3, Users, Package, Activity,
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
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
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
  PENDING: 'bg-sky-100 text-sky-700',
}

const rfiStatusColor: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  IN_REVIEW: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  CLOSED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ANSWERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const drawingStatusColor: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  'Under Review': 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Issued: 'bg-sky-100 text-sky-700',
  Rejected: 'bg-red-100 text-red-600',
}

const priorityColor: Record<string, string> = {
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const woStatusColor: Record<string, string> = {
  Assigned: 'bg-sky-100 text-sky-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-gray-100 text-gray-500',
}

const tsStatusColor: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Submitted: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-600',
}

// ========================
// Sample Data
// ========================
const SAMPLE_DRAWINGS = [
  { id: 'd1', drawingNo: 'ARCH-001', title: 'Ground Floor Plan', category: 'Architectural', revision: 'Rev C', status: 'Approved', date: '2025-01-15', projectId: 'p1' },
  { id: 'd2', drawingNo: 'ARCH-002', title: 'First Floor Plan', category: 'Architectural', revision: 'Rev B', status: 'Under Review', date: '2025-01-20', projectId: 'p1' },
  { id: 'd3', drawingNo: 'STR-001', title: 'Foundation Detail', category: 'Structural', revision: 'Rev A', status: 'Issued', date: '2025-01-10', projectId: 'p1' },
  { id: 'd4', drawingNo: 'STR-002', title: 'Beam Reinforcement', category: 'Structural', revision: 'Rev D', status: 'Approved', date: '2025-01-22', projectId: 'p1' },
  { id: 'd5', drawingNo: 'ELE-001', title: 'Electrical Layout G/F', category: 'Electrical', revision: 'Rev A', status: 'Draft', date: '2025-01-25', projectId: 'p1' },
  { id: 'd6', drawingNo: 'ELE-002', title: 'Power Distribution', category: 'Electrical', revision: 'Rev B', status: 'Under Review', date: '2025-01-18', projectId: 'p2' },
  { id: 'd7', drawingNo: 'PLB-001', title: 'Plumbing Isometric', category: 'Plumbing', revision: 'Rev A', status: 'Approved', date: '2025-01-12', projectId: 'p2' },
  { id: 'd8', drawingNo: 'HVAC-001', title: 'HVAC Duct Layout', category: 'HVAC', revision: 'Rev C', status: 'Rejected', date: '2025-01-28', projectId: 'p1' },
  { id: 'd9', drawingNo: 'ARCH-003', title: 'Elevation - South', category: 'Architectural', revision: 'Rev B', status: 'Approved', date: '2025-01-08', projectId: 'p2' },
  { id: 'd10', drawingNo: 'STR-003', title: 'Column Schedule', category: 'Structural', revision: 'Rev A', status: 'Issued', date: '2025-01-30', projectId: 'p1' },
  { id: 'd11', drawingNo: 'ELE-003', title: 'Lighting Layout', category: 'Electrical', revision: 'Rev A', status: 'Draft', date: '2025-02-01', projectId: 'p2' },
  { id: 'd12', drawingNo: 'ARCH-004', title: 'Section A-A', category: 'Architectural', revision: 'Rev B', status: 'Under Review', date: '2025-02-03', projectId: 'p1' },
]

const SAMPLE_INSPECTIONS = [
  { id: 'i1', no: 'INS-2025-001', type: 'Daily', area: 'Block A - Ground Floor', date: '2025-02-01', score: 92, status: 'Completed', inspector: 'Raj Kumar' },
  { id: 'i2', no: 'INS-2025-002', type: 'Weekly', area: 'Block B - Structure', date: '2025-01-30', score: 78, status: 'Completed', inspector: 'Priya Sharma' },
  { id: 'i3', no: 'INS-2025-003', type: 'Daily', area: 'Block A - First Floor', date: '2025-02-02', score: 85, status: 'Completed', inspector: 'Amit Patel' },
  { id: 'i4', no: 'INS-2025-004', type: 'Monthly', area: 'Entire Site', date: '2025-02-05', score: 88, status: 'Scheduled', inspector: 'Raj Kumar' },
  { id: 'i5', no: 'INS-2025-005', type: 'Daily', area: 'Block A - Foundation', date: '2025-01-28', score: 65, status: 'Completed', inspector: 'Vikram Singh' },
  { id: 'i6', no: 'INS-2025-006', type: 'Weekly', area: 'Block B - Finishing', date: '2025-01-25', score: 94, status: 'Completed', inspector: 'Anita Desai' },
  { id: 'i7', no: 'INS-2025-007', type: 'Daily', area: 'Block C - Excavation', date: '2025-02-03', score: 72, status: 'Completed', inspector: 'Raj Kumar' },
  { id: 'i8', no: 'INS-2025-008', type: 'Weekly', area: 'Block A - MEP', date: '2025-01-20', score: 0, status: 'Overdue', inspector: 'Priya Sharma' },
  { id: 'i9', no: 'INS-2025-009', type: 'Daily', area: 'Block B - Slab', date: '2025-02-04', score: 90, status: 'Completed', inspector: 'Amit Patel' },
  { id: 'i10', no: 'INS-2025-010', type: 'Monthly', area: 'Safety Compliance', date: '2025-01-15', score: 96, status: 'Completed', inspector: 'Vikram Singh' },
]

const SAMPLE_DESIGN_REVIEWS = [
  { id: 'dr1', no: 'DR-2025-001', drawingRef: 'ARCH-001 Rev C', reviewer: 'Ar. Mehta', status: 'Approved', date: '2025-01-15', comments: 3, turnaround: '2 days' },
  { id: 'dr2', no: 'DR-2025-002', drawingRef: 'STR-002 Rev D', reviewer: 'Er. Gupta', status: 'Approved', date: '2025-01-22', comments: 5, turnaround: '3 days' },
  { id: 'dr3', no: 'DR-2025-003', drawingRef: 'ELE-001 Rev A', reviewer: 'Er. Joshi', status: 'Pending', date: '2025-01-28', comments: 0, turnaround: '—' },
  { id: 'dr4', no: 'DR-2025-004', drawingRef: 'HVAC-001 Rev C', reviewer: 'Er. Reddy', status: 'Rejected', date: '2025-01-30', comments: 8, turnaround: '4 days' },
  { id: 'dr5', no: 'DR-2025-005', drawingRef: 'ARCH-002 Rev B', reviewer: 'Ar. Mehta', status: 'In Progress', date: '2025-02-01', comments: 2, turnaround: '—' },
  { id: 'dr6', no: 'DR-2025-006', drawingRef: 'STR-003 Rev A', reviewer: 'Er. Gupta', status: 'Approved', date: '2025-02-02', comments: 1, turnaround: '1 day' },
  { id: 'dr7', no: 'DR-2025-007', drawingRef: 'PLB-001 Rev A', reviewer: 'Er. Iyer', status: 'Pending', date: '2025-02-03', comments: 0, turnaround: '—' },
  { id: 'dr8', no: 'DR-2025-008', drawingRef: 'ARCH-003 Rev B', reviewer: 'Ar. Mehta', status: 'Approved', date: '2025-01-10', comments: 2, turnaround: '2 days' },
]

const SAMPLE_WORK_ORDERS = [
  { id: 'wo1', no: 'WO-2025-001', description: 'Excavation for Block C foundation', assignedTo: 'Sharma Constructions', priority: 'High', status: 'In Progress', dueDate: '2025-02-15', location: 'Block C' },
  { id: 'wo2', no: 'WO-2025-002', description: 'Steel reinforcement for Column Grid A-B', assignedTo: 'Patel Steel Works', priority: 'High', status: 'Assigned', dueDate: '2025-02-10', location: 'Block A - G/F' },
  { id: 'wo3', no: 'WO-2025-003', description: 'Concrete pouring for 1st Floor Slab', assignedTo: 'ReadyMix Corp', priority: 'Medium', status: 'Assigned', dueDate: '2025-02-20', location: 'Block A - 1/F' },
  { id: 'wo4', no: 'WO-2025-004', description: 'Electrical conduit installation Phase 1', assignedTo: 'Spark Electricals', priority: 'Medium', status: 'In Progress', dueDate: '2025-02-18', location: 'Block A - G/F' },
  { id: 'wo5', no: 'WO-2025-005', description: 'Plumbing rough-in for Ground Floor', assignedTo: 'Flow Plumbing', priority: 'Low', status: 'Completed', dueDate: '2025-01-30', location: 'Block A - G/F' },
  { id: 'wo6', no: 'WO-2025-006', description: 'HVAC duct installation Block B', assignedTo: 'CoolAir Services', priority: 'Medium', status: 'Cancelled', dueDate: '2025-02-25', location: 'Block B' },
  { id: 'wo7', no: 'WO-2025-007', description: 'Brickwork for Ground Floor Walls', assignedTo: 'Mason Bros', priority: 'High', status: 'In Progress', dueDate: '2025-02-12', location: 'Block A - G/F' },
  { id: 'wo8', no: 'WO-2025-008', description: 'Plastering for Block B Ground Floor', assignedTo: 'FinishFirst Co', priority: 'Low', status: 'Assigned', dueDate: '2025-03-01', location: 'Block B - G/F' },
  { id: 'wo9', no: 'WO-2025-009', description: 'Tile work for Common Areas', assignedTo: 'TileCraft', priority: 'Medium', status: 'Assigned', dueDate: '2025-03-10', location: 'Block A - Common' },
  { id: 'wo10', no: 'WO-2025-010', description: 'Painting - Interior Block A', assignedTo: 'ColorPro', priority: 'Low', status: 'Completed', dueDate: '2025-02-05', location: 'Block A' },
]

const SAMPLE_TIMESHEETS = [
  { id: 'ts1', week: 'W05 2025', project: 'Skyline Tower', hoursWorked: 48, overtime: 8, status: 'Approved', submissionDate: '2025-02-03' },
  { id: 'ts2', week: 'W04 2025', project: 'Skyline Tower', hoursWorked: 44, overtime: 4, status: 'Approved', submissionDate: '2025-01-27' },
  { id: 'ts3', week: 'W06 2025', project: 'Green Valley Residency', hoursWorked: 52, overtime: 12, status: 'Submitted', submissionDate: '2025-02-10' },
  { id: 'ts4', week: 'W05 2025', project: 'Green Valley Residency', hoursWorked: 40, overtime: 0, status: 'Approved', submissionDate: '2025-02-03' },
  { id: 'ts5', week: 'W06 2025', project: 'Skyline Tower', hoursWorked: 46, overtime: 6, status: 'Draft', submissionDate: '' },
  { id: 'ts6', week: 'W03 2025', project: 'Metro Station Phase 2', hoursWorked: 50, overtime: 10, status: 'Approved', submissionDate: '2025-01-20' },
  { id: 'ts7', week: 'W04 2025', project: 'Metro Station Phase 2', hoursWorked: 38, overtime: 0, status: 'Rejected', submissionDate: '2025-01-27' },
  { id: 'ts8', week: 'W05 2025', project: 'Metro Station Phase 2', hoursWorked: 44, overtime: 4, status: 'Submitted', submissionDate: '2025-02-03' },
  { id: 'ts9', week: 'W02 2025', project: 'Skyline Tower', hoursWorked: 42, overtime: 2, status: 'Approved', submissionDate: '2025-01-13' },
  { id: 'ts10', week: 'W06 2025', project: 'Metro Station Phase 2', hoursWorked: 48, overtime: 8, status: 'Draft', submissionDate: '' },
]

const SAMPLE_RFIS_EXTERNAL = [
  { id: 'rfi1', rfiNo: 'RFI-2025-001', subject: 'Foundation Depth Clarification', project: 'Skyline Tower', status: 'ANSWERED', date: '2025-01-15', priority: 'High', response: 'Foundation depth shall be 2.5m as per geotechnical report ref GTR-001.' },
  { id: 'rfi2', rfiNo: 'RFI-2025-002', subject: 'Steel Grade for Beams', project: 'Skyline Tower', status: 'OPEN', date: '2025-01-22', priority: 'High', response: '' },
  { id: 'rfi3', rfiNo: 'RFI-2025-003', subject: 'HVAC Duct Routing Conflict', project: 'Green Valley', status: 'IN_REVIEW', date: '2025-01-28', priority: 'Medium', response: '' },
  { id: 'rfi4', rfiNo: 'RFI-2025-004', subject: 'Window Size Modification', project: 'Skyline Tower', status: 'ANSWERED', date: '2025-01-10', priority: 'Low', response: 'Window sizes as per revised drawing ARCH-005 Rev B are approved.' },
  { id: 'rfi5', rfiNo: 'RFI-2025-005', subject: 'Plumbing Layout - Toilet Block', project: 'Green Valley', status: 'OPEN', date: '2025-02-01', priority: 'Medium', response: '' },
  { id: 'rfi6', rfiNo: 'RFI-2025-006', subject: 'Elevator Shaft Dimensions', project: 'Metro Station Phase 2', status: 'CLOSED', date: '2025-01-05', priority: 'High', response: 'Elevator shaft dimensions confirmed as 3.2m x 2.8m.' },
  { id: 'rfi7', rfiNo: 'RFI-2025-007', subject: 'Fire Escape Route Approval', project: 'Skyline Tower', status: 'IN_REVIEW', date: '2025-02-03', priority: 'High', response: '' },
  { id: 'rfi8', rfiNo: 'RFI-2025-008', subject: 'Parking Slope Gradient', project: 'Green Valley', status: 'ANSWERED', date: '2024-12-28', priority: 'Low', response: 'Maximum slope gradient shall be 15% as per NBC norms.' },
]

// ========================
// StatCard Component (defined outside render)
// ========================
function StatCard({ label, value, icon: Icon, color, isText }: { label: string; value: string | number; icon: React.ElementType; color: string; isText?: boolean }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={cn('text-2xl font-bold mt-1 tracking-tight', isText && 'text-lg')}>{value}</p>
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg', color)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ExternalPanel() {
  const user = useAuthStore((s) => s.user)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId)
  const activePanelTab = useAppStore((s) => s.activePanelTab)
  const setPanelTab = useAppStore((s) => s.setPanelTab)

  const EXT_TABS = ['dashboard', 'projects', 'documents', 'payments', 'rfi', 'drawings', 'inspection', 'design-review', 'work-orders', 'timesheets', 'communication']
  const [activeTab, setActiveTab] = useState('dashboard')
  useEffect(() => {
    if (activePanelTab && EXT_TABS.includes(activePanelTab)) {
      const id = requestAnimationFrame(() => { setActiveTab(activePanelTab); setPanelTab(null) }); return () => cancelAnimationFrame(id)
    }
  }, [activePanelTab, setPanelTab])
  const currentTab = activePanelTab && EXT_TABS.includes(activePanelTab) ? activePanelTab : activeTab
  const handleTabChange = (tab: string) => { setActiveTab(tab); if (activePanelTab) setPanelTab(null) }

  const [projects, setProjects] = useState<Project[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [payments, setPayments] = useState<PaymentVoucher[]>([])
  const [rfis, setRfis] = useState<RFI[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [selectedProjectId, setSelectedProjectIdLocal] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [rfiFilter, setRfiFilter] = useState('all')
  const [rfiSearch, setRfiSearch] = useState('')
  const [drawingFilter, setDrawingFilter] = useState('all')
  const [inspFilter, setInspFilter] = useState('all')
  const [drFilter, setDrFilter] = useState('all')
  const [woFilter, setWoFilter] = useState('all')
  const [tsFilter, setTsFilter] = useState('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Record<string, unknown> | null>(null)

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

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return '' }
  }

  const dashboardStats = useMemo(() => {
    const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0
    const pendingPayments = payments.filter((p) => p.status !== 'PAID').length
    const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
    const totalPending = payments.filter((p) => p.status !== 'PAID').reduce((s, p) => s + p.amount, 0)
    return { projectCount: projects.length, avgProgress, pendingPayments, totalPaid, totalPending, openRfis: rfis.filter((r) => r.status === 'OPEN').length }
  }, [projects, payments, rfis])

  const drawingStats = useMemo(() => ({
    total: SAMPLE_DRAWINGS.length,
    approved: SAMPLE_DRAWINGS.filter(d => d.status === 'Approved').length,
    underReview: SAMPLE_DRAWINGS.filter(d => d.status === 'Under Review').length,
    thisMonth: SAMPLE_DRAWINGS.filter(d => d.date.startsWith('2025-02')).length,
  }), [])

  const inspStats = useMemo(() => {
    const completed = SAMPLE_INSPECTIONS.filter(i => i.status === 'Completed')
    const avgScore = completed.length > 0 ? Math.round(completed.reduce((s, i) => s + i.score, 0) / completed.length) : 0
    return {
      total: SAMPLE_INSPECTIONS.length,
      avgScore,
      complianceRate: completed.length > 0 ? Math.round(completed.filter(i => i.score >= 80).length / completed.length * 100) : 0,
      overdue: SAMPLE_INSPECTIONS.filter(i => i.status === 'Overdue').length,
    }
  }, [])

  const drStats = useMemo(() => ({
    pending: SAMPLE_DESIGN_REVIEWS.filter(d => d.status === 'Pending' || d.status === 'In Progress').length,
    approved: SAMPLE_DESIGN_REVIEWS.filter(d => d.status === 'Approved').length,
    rejected: SAMPLE_DESIGN_REVIEWS.filter(d => d.status === 'Rejected').length,
    avgTurnaround: '2.4 days',
  }), [])

  const woStats = useMemo(() => ({
    active: SAMPLE_WORK_ORDERS.filter(w => w.status === 'Assigned' || w.status === 'In Progress').length,
    completed: SAMPLE_WORK_ORDERS.filter(w => w.status === 'Completed').length,
    overdue: SAMPLE_WORK_ORDERS.filter(w => new Date(w.dueDate) < new Date() && w.status !== 'Completed' && w.status !== 'Cancelled').length,
    highPriority: SAMPLE_WORK_ORDERS.filter(w => w.priority === 'High' && w.status !== 'Completed').length,
  }), [])

  const tsStats = useMemo(() => ({
    totalHours: SAMPLE_TIMESHEETS.reduce((s, t) => s + t.hoursWorked, 0),
    overtime: SAMPLE_TIMESHEETS.reduce((s, t) => s + t.overtime, 0),
    approved: SAMPLE_TIMESHEETS.filter(t => t.status === 'Approved').length,
    pending: SAMPLE_TIMESHEETS.filter(t => t.status === 'Submitted' || t.status === 'Draft').length,
  }), [])

  const rfiStats = useMemo(() => ({
    open: SAMPLE_RFIS_EXTERNAL.filter(r => r.status === 'OPEN').length,
    answered: SAMPLE_RFIS_EXTERNAL.filter(r => r.status === 'ANSWERED').length,
    inReview: SAMPLE_RFIS_EXTERNAL.filter(r => r.status === 'IN_REVIEW').length,
    total: SAMPLE_RFIS_EXTERNAL.length,
  }), [])

  const filteredRfis = useMemo(() => {
    let list = [...SAMPLE_RFIS_EXTERNAL]
    if (rfiFilter !== 'all') list = list.filter(r => r.status === rfiFilter)
    if (rfiSearch) list = list.filter(r => r.subject.toLowerCase().includes(rfiSearch.toLowerCase()) || r.rfiNo.toLowerCase().includes(rfiSearch.toLowerCase()))
    return list
  }, [rfiFilter, rfiSearch])

  const filteredDrawings = useMemo(() => {
    let list = [...SAMPLE_DRAWINGS]
    if (drawingFilter !== 'all') list = list.filter(d => d.status === drawingFilter)
    return list
  }, [drawingFilter])

  const filteredInspections = useMemo(() => {
    let list = [...SAMPLE_INSPECTIONS]
    if (inspFilter !== 'all') list = list.filter(i => i.status === inspFilter)
    return list
  }, [inspFilter])

  const filteredDRs = useMemo(() => {
    let list = [...SAMPLE_DESIGN_REVIEWS]
    if (drFilter !== 'all') list = list.filter(d => d.status === drFilter)
    return list
  }, [drFilter])

  const filteredWOs = useMemo(() => {
    let list = [...SAMPLE_WORK_ORDERS]
    if (woFilter !== 'all') list = list.filter(w => w.status === woFilter)
    return list
  }, [woFilter])

  const filteredTSs = useMemo(() => {
    let list = [...SAMPLE_TIMESHEETS]
    if (tsFilter !== 'all') list = list.filter(t => t.status === tsFilter)
    return list
  }, [tsFilter])

  const openProject = (id: string) => {
    setSelectedProjectId(id)
    setCurrentView('project-detail')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  // ========================
  // Tab Components
  // ========================
  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}><StatCard label="My Projects" value={dashboardStats.projectCount} icon={FolderOpen} color="from-amber-500 to-orange-500" /></motion.div>
        <motion.div variants={item}><StatCard label="Overall Progress" value={`${dashboardStats.avgProgress}%`} icon={TrendingUp} color="from-emerald-500 to-teal-500" /></motion.div>
        <motion.div variants={item}><StatCard label="Pending Items" value={dashboardStats.pendingPayments + dashboardStats.openRfis} icon={Clock} color="from-rose-500 to-pink-500" /></motion.div>
        <motion.div variants={item}><StatCard label="Payments Received" value={formatCurrency(dashboardStats.totalPaid)} icon={DollarSign} color="from-violet-500 to-purple-500" isText /></motion.div>
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
                {projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No projects assigned</p>}
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
                  {activity.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>}
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
                <td className="py-3 px-3"><Badge variant="outline" className={cn('text-[10px]', statusColor[p.status] || '')}>{p.status.replace('_', ' ')}</Badge></td>
                <td className="py-3 px-3 text-sm">{formatCurrency(p.budget || 0)}</td>
                <td className="py-3 px-3"><div className="flex items-center gap-2"><Progress value={p.progress} className="h-2 w-20" /><span className="text-xs font-medium">{p.progress}%</span></div></td>
                <td className="py-3 px-3 text-xs text-muted-foreground">{p.startDate ? formatDate(p.startDate) : '—'}</td>
                <td className="py-3 px-3"><Button variant="ghost" size="sm" className="text-xs gap-1 text-amber-600 hover:text-amber-700" onClick={() => openProject(p.id)}><Eye className="h-3.5 w-3.5" /> View</Button></td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm"><FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />No projects available</td></tr>
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
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
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
                <td className="py-2.5 px-3"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-amber-500 shrink-0" /><span className="text-sm font-medium">{doc.title}</span></div></td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{doc.filename}</td>
                <td className="py-2.5 px-3"><Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{doc.category}</Badge></td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">v{doc.version}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(doc.createdAt)}</td>
                <td className="py-2.5 px-3"><Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download"><Download className="h-3.5 w-3.5" /></Button></td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm"><FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />No documents available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const PaymentsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={item}><StatCard label="Total Paid" value={formatCurrency(dashboardStats.totalPaid)} icon={CheckCircle2} color="from-emerald-500 to-teal-500" isText /></motion.div>
        <motion.div variants={item}><StatCard label="Pending" value={formatCurrency(dashboardStats.totalPending)} icon={Clock} color="from-amber-500 to-orange-500" isText /></motion.div>
        <motion.div variants={item}><StatCard label="Total Payments" value={formatCurrency(dashboardStats.totalPaid + dashboardStats.totalPending)} icon={CreditCard} color="from-violet-500 to-purple-500" isText /></motion.div>
      </div>
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-500" />Payment History</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Voucher #</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Title</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Type</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Amount</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Payee</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Status</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground text-xs">Date</th>
                </tr></thead>
                <tbody>
                  {payments.map((pay) => (
                    <tr key={pay.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2.5 px-3 text-xs font-mono">{pay.voucherNo}</td>
                      <td className="py-2.5 px-3 text-sm">{pay.title}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{pay.paymentType}</td>
                      <td className="py-2.5 px-3 text-sm font-medium">{formatCurrency(pay.amount)}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{pay.payeeName}</td>
                      <td className="py-2.5 px-3"><Badge variant="outline" className={cn('text-[10px]', paymentStatusColor[pay.status] || '')}>{pay.status}</Badge></td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(pay.createdAt)}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm"><CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />No payment records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const RFITab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total RFIs" value={rfiStats.total} icon={FileQuestion} color="from-amber-500 to-orange-500" />
        <StatCard label="Open" value={rfiStats.open} icon={AlertTriangle} color="from-rose-500 to-pink-500" />
        <StatCard label="In Review" value={rfiStats.inReview} icon={Clock} color="from-sky-500 to-cyan-500" />
        <StatCard label="Answered" value={rfiStats.answered} icon={CheckCircle2} color="from-emerald-500 to-teal-500" />
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><FileQuestion className="h-4 w-4 text-amber-500" />Requests for Information</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search RFIs..." value={rfiSearch} onChange={(e) => setRfiSearch(e.target.value)} className="h-8 w-48 text-xs" />
              <Select value={rfiFilter} onValueChange={setRfiFilter}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="ANSWERED">Answered</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">RFI No</TableHead>
                <TableHead className="text-xs">Subject</TableHead>
                <TableHead className="text-xs">Project</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredRfis.map((rfi) => (
                  <motion.tr key={rfi.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => { setDetailItem(rfi as unknown as Record<string, unknown>); setDetailOpen(true) }}>
                    <TableCell className="py-2.5 px-3 text-xs font-mono">{rfi.rfiNo}</TableCell>
                    <TableCell className="py-2.5 px-3 text-sm font-medium">{rfi.subject}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{rfi.project}</TableCell>
                    <TableCell className="py-2.5 px-3"><Badge className={cn('text-[10px]', priorityColor[rfi.priority] || '')}>{rfi.priority}</Badge></TableCell>
                    <TableCell className="py-2.5 px-3"><Badge variant="outline" className={cn('text-[10px]', rfiStatusColor[rfi.status] || '')}>{rfi.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(rfi.date)}</TableCell>
                    <TableCell className="py-2.5 px-3"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          {filteredRfis.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No RFIs found</p>}
        </CardContent>
      </Card>
    </div>
  )

  const DrawingsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Drawings" value={drawingStats.total} icon={Ruler} color="from-amber-500 to-orange-500" />
        <StatCard label="Approved" value={drawingStats.approved} icon={CheckCircle2} color="from-emerald-500 to-teal-500" />
        <StatCard label="Under Review" value={drawingStats.underReview} icon={Clock} color="from-sky-500 to-cyan-500" />
        <StatCard label="This Month" value={drawingStats.thisMonth} icon={CalendarDays} color="from-violet-500 to-purple-500" />
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Ruler className="h-4 w-4 text-amber-500" />Drawing Register</CardTitle>
            <Select value={drawingFilter} onValueChange={setDrawingFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Drawing No</TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Revision</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredDrawings.map((d) => (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b last:border-0 hover:bg-muted/30">
                    <TableCell className="py-2.5 px-3 text-xs font-mono font-medium">{d.drawingNo}</TableCell>
                    <TableCell className="py-2.5 px-3 text-sm">{d.title}</TableCell>
                    <TableCell className="py-2.5 px-3"><Badge variant="outline" className="text-[10px] bg-muted/50">{d.category}</Badge></TableCell>
                    <TableCell className="py-2.5 px-3 text-xs font-mono">{d.revision}</TableCell>
                    <TableCell className="py-2.5 px-3"><Badge className={cn('text-[10px]', drawingStatusColor[d.status] || '')}>{d.status}</Badge></TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(d.date)}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const InspectionTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Inspections" value={inspStats.total} icon={ClipboardCheck} color="from-amber-500 to-orange-500" />
        <StatCard label="Avg Score" value={`${inspStats.avgScore}%`} icon={Target} color="from-emerald-500 to-teal-500" />
        <StatCard label="Compliance" value={`${inspStats.complianceRate}%`} icon={Award} color="from-sky-500 to-cyan-500" />
        <StatCard label="Overdue" value={inspStats.overdue} icon={AlertTriangle} color="from-rose-500 to-pink-500" />
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-amber-500" />Inspection Reports</CardTitle>
            <Select value={inspFilter} onValueChange={setInspFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Inspection #</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Area</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Inspector</TableHead>
                <TableHead className="text-xs">Score</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredInspections.map((insp) => (
                  <motion.tr key={insp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b last:border-0 hover:bg-muted/30">
                    <TableCell className="py-2.5 px-3 text-xs font-mono">{insp.no}</TableCell>
                    <TableCell className="py-2.5 px-3"><Badge variant="outline" className="text-[10px] bg-muted/50">{insp.type}</Badge></TableCell>
                    <TableCell className="py-2.5 px-3 text-sm">{insp.area}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(insp.date)}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs">{insp.inspector}</TableCell>
                    <TableCell className="py-2.5 px-3">
                      {insp.status === 'Scheduled' ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <span className={cn('text-sm font-bold', getScoreColor(insp.score))}>{insp.score}%</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-3">
                      <Badge className={cn('text-[10px]', insp.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : insp.status === 'Scheduled' ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700')}>{insp.status}</Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const DesignReviewTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Pending Reviews" value={drStats.pending} icon={Clock} color="from-amber-500 to-orange-500" />
        <StatCard label="Approved" value={drStats.approved} icon={CheckCircle2} color="from-emerald-500 to-teal-500" />
        <StatCard label="Rejected" value={drStats.rejected} icon={X} color="from-rose-500 to-pink-500" />
        <StatCard label="Avg Turnaround" value={drStats.avgTurnaround} icon={TrendingUp} color="from-sky-500 to-cyan-500" />
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Compass className="h-4 w-4 text-amber-500" />Design Review Log</CardTitle>
            <Select value={drFilter} onValueChange={setDrFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Review #</TableHead>
                <TableHead className="text-xs">Drawing Ref</TableHead>
                <TableHead className="text-xs">Reviewer</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Comments</TableHead>
                <TableHead className="text-xs">Turnaround</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredDRs.map((dr) => (
                  <motion.tr key={dr.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b last:border-0 hover:bg-muted/30">
                    <TableCell className="py-2.5 px-3 text-xs font-mono">{dr.no}</TableCell>
                    <TableCell className="py-2.5 px-3 text-sm font-medium">{dr.drawingRef}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs">{dr.reviewer}</TableCell>
                    <TableCell className="py-2.5 px-3">
                      <Badge className={cn('text-[10px]',
                        dr.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                        dr.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        dr.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      )}>{dr.status}</Badge>
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(dr.date)}</TableCell>
                    <TableCell className="py-2.5 px-3"><Badge variant="outline" className="text-[10px]">{dr.comments} comment{dr.comments !== 1 ? 's' : ''}</Badge></TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{dr.turnaround}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const WorkOrdersTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Active Orders" value={woStats.active} icon={ClipboardList} color="from-amber-500 to-orange-500" />
        <StatCard label="Completed" value={woStats.completed} icon={CheckCircle2} color="from-emerald-500 to-teal-500" />
        <StatCard label="Overdue" value={woStats.overdue} icon={AlertTriangle} color="from-rose-500 to-pink-500" />
        <StatCard label="High Priority" value={woStats.highPriority} icon={Activity} color="from-orange-500 to-red-500" />
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><ClipboardList className="h-4 w-4 text-amber-500" />Work Orders</CardTitle>
            <Select value={woFilter} onValueChange={setWoFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">WO #</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Assigned To</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredWOs.map((wo) => (
                  <motion.tr key={wo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b last:border-0 hover:bg-muted/30">
                    <TableCell className="py-2.5 px-3 text-xs font-mono">{wo.no}</TableCell>
                    <TableCell className="py-2.5 px-3 text-sm max-w-[200px] truncate">{wo.description}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs">{wo.assignedTo}</TableCell>
                    <TableCell className="py-2.5 px-3"><Badge className={cn('text-[10px]', priorityColor[wo.priority] || '')}>{wo.priority}</Badge></TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{wo.location}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(wo.dueDate)}</TableCell>
                    <TableCell className="py-2.5 px-3"><Badge className={cn('text-[10px]', woStatusColor[wo.status] || '')}>{wo.status}</Badge></TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const TimesheetsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Hours" value={`${tsStats.totalHours}h`} icon={Clock} color="from-amber-500 to-orange-500" />
        <StatCard label="Overtime" value={`${tsStats.overtime}h`} icon={Timer} color="from-rose-500 to-pink-500" />
        <StatCard label="Approved" value={tsStats.approved} icon={CheckCircle2} color="from-emerald-500 to-teal-500" />
        <StatCard label="Pending" value={tsStats.pending} icon={Clock} color="from-sky-500 to-cyan-500" />
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Timer className="h-4 w-4 text-amber-500" />Timesheets</CardTitle>
            <Select value={tsFilter} onValueChange={setTsFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Week</TableHead>
                <TableHead className="text-xs">Project</TableHead>
                <TableHead className="text-xs">Hours Worked</TableHead>
                <TableHead className="text-xs">Overtime</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredTSs.map((ts) => (
                  <motion.tr key={ts.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b last:border-0 hover:bg-muted/30">
                    <TableCell className="py-2.5 px-3 text-xs font-mono">{ts.week}</TableCell>
                    <TableCell className="py-2.5 px-3 text-sm">{ts.project}</TableCell>
                    <TableCell className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(ts.hoursWorked / 60 * 100, 100)} className="h-1.5 w-16" />
                        <span className="text-xs font-medium">{ts.hoursWorked}h</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 px-3">
                      <span className={cn('text-xs font-medium', ts.overtime > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                        {ts.overtime > 0 ? `+${ts.overtime}h` : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3"><Badge className={cn('text-[10px]', tsStatusColor[ts.status] || '')}>{ts.status}</Badge></TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{ts.submissionDate ? formatDate(ts.submissionDate) : '—'}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const CommunicationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-amber-500" />RFIs on My Projects</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-80">
                <div className="space-y-2">
                  {rfis.length > 0 ? rfis.slice(0, 8).map((rfi) => (
                    <div key={rfi.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{rfi.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{rfi.description}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[10px] shrink-0', rfiStatusColor[rfi.status] || '')}>{rfi.status}</Badge>
                      </div>
                      {rfi.response && (
                        <div className="mt-2 p-2 rounded bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">Response:</p>
                          <p className="text-xs">{rfi.response}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1.5">{formatDate(rfi.createdAt)}</p>
                    </div>
                  )) : SAMPLE_RFIS_EXTERNAL.slice(0, 6).map((rfi) => (
                    <div key={rfi.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{rfi.subject}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{rfi.rfiNo} • {rfi.project}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[10px] shrink-0', rfiStatusColor[rfi.status] || '')}>{rfi.status.replace('_', ' ')}</Badge>
                      </div>
                      {rfi.response && (
                        <div className="mt-2 p-2 rounded bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">Response:</p>
                          <p className="text-xs">{rfi.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {rfis.length === 0 && SAMPLE_RFIS_EXTERNAL.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6"><MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />No RFIs found</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Eye className="h-4 w-4 text-orange-500" />Recent Updates</CardTitle>
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
                  {activity.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No recent updates</p>}
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

  const TAB_CONFIG = [
    { id: 'dashboard', label: 'Dashboard', icon: FolderOpen },
    { id: 'projects', label: 'My Projects', icon: Building2 },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'rfi', label: 'RFI', icon: FileQuestion },
    { id: 'drawings', label: 'Drawings', icon: Ruler },
    { id: 'inspection', label: 'Inspection', icon: ClipboardCheck },
    { id: 'design-review', label: 'Design Review', icon: Compass },
    { id: 'work-orders', label: 'Work Orders', icon: ClipboardList },
    { id: 'timesheets', label: 'Timesheets', icon: Timer },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
  ]

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

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap gap-1">
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <motion.div variants={container} initial="hidden" animate="show">
          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="projects"><ProjectsTab /></TabsContent>
          <TabsContent value="documents"><DocumentsTab /></TabsContent>
          <TabsContent value="payments"><PaymentsTab /></TabsContent>
          <TabsContent value="rfi"><RFITab /></TabsContent>
          <TabsContent value="drawings"><DrawingsTab /></TabsContent>
          <TabsContent value="inspection"><InspectionTab /></TabsContent>
          <TabsContent value="design-review"><DesignReviewTab /></TabsContent>
          <TabsContent value="work-orders"><WorkOrdersTab /></TabsContent>
          <TabsContent value="timesheets"><TimesheetsTab /></TabsContent>
          <TabsContent value="communication"><CommunicationTab /></TabsContent>
        </motion.div>
      </Tabs>

      {/* RFI Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">RFI Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {(detailItem as Record<string, string>)?.rfiNo} — {(detailItem as Record<string, string>)?.project}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
              <p className="text-sm font-medium mt-0.5">{(detailItem as Record<string, string>)?.subject}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
                <Badge className={cn('mt-0.5', priorityColor[(detailItem as Record<string, string>)?.priority || ''] || '')}>
                  {(detailItem as Record<string, string>)?.priority}
                </Badge>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <Badge variant="outline" className={cn('mt-0.5', rfiStatusColor[(detailItem as Record<string, string>)?.status || ''] || '')}>
                  {(detailItem as Record<string, string>)?.status?.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                <p className="text-xs mt-0.5">{formatDate((detailItem as Record<string, string>)?.date || '')}</p>
              </div>
            </div>
            {(detailItem as Record<string, string>)?.response && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <Label className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Response</Label>
                <p className="text-sm mt-1">{(detailItem as Record<string, string>)?.response}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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