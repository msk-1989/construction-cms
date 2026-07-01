'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, FileText, CreditCard, PieChart, Search, Plus,
  CheckCircle2, XCircle, Clock, ArrowUpRight, ArrowDownRight,
  TrendingUp, AlertTriangle, Building2, BarChart3, Eye,
  Filter, Loader2, ArrowRight, Wallet, Receipt,
  Target, Percent, ArrowUp, ArrowDown, CircleDollarSign,
  Landmark,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Project, PaymentVoucher } from '@/types/cms'

// ========================
// Animation Variants
// ========================
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

// ========================
// Types
// ========================
interface InvoiceRecord {
  id: string
  invoiceNo: string
  project: string
  payee: string
  amount: number
  type: 'Advance' | 'Interim' | 'Final' | 'Retainage'
  status: 'Draft' | 'Approved' | 'Paid'
  date: string
  description?: string
}

interface PendingPayment {
  id: string
  voucherNo: string
  payee: string
  amount: number
  project: string
  type: 'Advance' | 'Interim' | 'Final' | 'Retainage'
  submittedDate: string
  description?: string
}

interface BudgetProject {
  id: string
  name: string
  totalBudget: number
  allocated: number
  spent: number
  remaining: number
  utilization: number
  status: string
}

interface BudgetCategory {
  id: string
  category: string
  allocated: number
  spent: number
  remaining: number
  utilization: number
}

interface PLItem {
  category: string
  revenue: number
  expenses: number
  net: number
}

interface CashFlowMonth {
  month: string
  inflow: number
  outflow: number
  net: number
}

interface ProjectProfit {
  project: string
  budget: number
  spent: number
  variance: number
  marginPct: number
  status: string
}

const TABS = [
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'payment-approval', label: 'Payment Approval', icon: CreditCard },
  { id: 'budget', label: 'Budget Management', icon: DollarSign },
  { id: 'financial-reports', label: 'Financial Reports', icon: PieChart },
]

const INVOICE_STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  Approved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const INVOICE_TYPE_COLORS: Record<string, string> = {
  Advance: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Interim: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Final: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Retainage: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

// ========================
// Sample Data
// ========================
const SAMPLE_INVOICES: InvoiceRecord[] = [
  { id: 'inv-1', invoiceNo: 'INV-2025-001', project: 'Mumbai Tower Complex', payee: 'Steel Corp India', amount: 4500000, type: 'Advance', status: 'Approved', date: '2025-01-15', description: 'Structural steel supply' },
  { id: 'inv-2', invoiceNo: 'INV-2025-002', project: 'Pune Residential', payee: 'CementWorks Ltd', amount: 2800000, type: 'Interim', status: 'Paid', date: '2025-01-10', description: 'Cement delivery - Phase 2' },
  { id: 'inv-3', invoiceNo: 'INV-2025-003', project: 'Delhi Highway Bridge', payee: 'RoadMasters Inc', amount: 7200000, type: 'Interim', status: 'Approved', date: '2025-01-18', description: 'Bridge deck work - Month 3' },
  { id: 'inv-4', invoiceNo: 'INV-2025-004', project: 'Bangalore Tech Park', payee: 'Electra Solutions', amount: 1950000, type: 'Advance', status: 'Draft', date: '2025-01-20', description: 'Electrical installation advance' },
  { id: 'inv-5', invoiceNo: 'INV-2025-005', project: 'Mumbai Tower Complex', payee: 'ConcretePlus', amount: 3400000, type: 'Final', status: 'Paid', date: '2025-01-05', description: 'Final concrete works settlement' },
  { id: 'inv-6', invoiceNo: 'INV-2025-006', project: 'Chennai Port Extension', payee: 'Marine Engineers', amount: 8900000, type: 'Interim', status: 'Draft', date: '2025-01-22', description: 'Marine piling work' },
  { id: 'inv-7', invoiceNo: 'INV-2025-007', project: 'Pune Residential', payee: 'TileWorld', amount: 680000, type: 'Final', status: 'Paid', date: '2024-12-28', description: 'Final tiling payment' },
  { id: 'inv-8', invoiceNo: 'INV-2025-008', project: 'Delhi Highway Bridge', payee: 'AsphaltPro', amount: 5100000, type: 'Retainage', status: 'Approved', date: '2025-01-25', description: '5% retainage release' },
  { id: 'inv-9', invoiceNo: 'INV-2025-009', project: 'Bangalore Tech Park', payee: 'GlassWorks India', amount: 2200000, type: 'Interim', status: 'Draft', date: '2025-01-26', description: 'Glass facade installation' },
  { id: 'inv-10', invoiceNo: 'INV-2025-010', project: 'Hyderabad Metro', payee: 'TunnelTech', amount: 12500000, type: 'Advance', status: 'Approved', date: '2025-01-12', description: 'Tunnel boring equipment advance' },
]

const SAMPLE_PENDING_PAYMENTS: PendingPayment[] = [
  { id: 'pp-1', voucherNo: 'PV-00031', payee: 'Steel Corp India', amount: 4500000, project: 'Mumbai Tower Complex', type: 'Advance', submittedDate: '2025-01-15', description: 'Structural steel supply' },
  { id: 'pp-2', voucherNo: 'PV-00032', payee: 'RoadMasters Inc', amount: 7200000, project: 'Delhi Highway Bridge', type: 'Interim', submittedDate: '2025-01-18', description: 'Bridge deck work' },
  { id: 'pp-3', voucherNo: 'PV-00033', payee: 'Marine Engineers', amount: 8900000, project: 'Chennai Port Extension', type: 'Interim', submittedDate: '2025-01-22', description: 'Marine piling work' },
  { id: 'pp-4', voucherNo: 'PV-00034', payee: 'TunnelTech', amount: 12500000, project: 'Hyderabad Metro', type: 'Advance', submittedDate: '2025-01-12', description: 'Tunnel boring equipment' },
  { id: 'pp-5', voucherNo: 'PV-00035', payee: 'AsphaltPro', amount: 5100000, project: 'Delhi Highway Bridge', type: 'Retainage', submittedDate: '2025-01-25', description: 'Retainage release' },
  { id: 'pp-6', voucherNo: 'PV-00036', payee: 'Pipelines India', amount: 3300000, project: 'Chennai Port Extension', type: 'Interim', submittedDate: '2025-01-26', description: 'Pipeline installation' },
  { id: 'pp-7', voucherNo: 'PV-00037', payee: 'SafetyEquip Co', amount: 450000, project: 'Bangalore Tech Park', type: 'Advance', submittedDate: '2025-01-27', description: 'Safety equipment advance' },
  { id: 'pp-8', voucherNo: 'PV-00038', payee: 'CraneServices Ltd', amount: 2800000, project: 'Mumbai Tower Complex', type: 'Interim', submittedDate: '2025-01-28', description: 'Tower crane rental - Month 4' },
]

const SAMPLE_BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'bc-1', category: 'Materials', allocated: 85000000, spent: 62000000, remaining: 23000000, utilization: 73 },
  { id: 'bc-2', category: 'Labor', allocated: 52000000, spent: 41000000, remaining: 11000000, utilization: 79 },
  { id: 'bc-3', category: 'Equipment', allocated: 28000000, spent: 19500000, remaining: 8500000, utilization: 70 },
  { id: 'bc-4', category: 'Subcontracts', allocated: 40000000, spent: 38000000, remaining: 2000000, utilization: 95 },
  { id: 'bc-5', category: 'Overhead', allocated: 12000000, spent: 7500000, remaining: 4500000, utilization: 63 },
  { id: 'bc-6', category: 'Contingency', allocated: 8000000, spent: 1200000, remaining: 6800000, utilization: 15 },
]

const PL_DATA: PLItem[] = [
  { category: 'Construction Revenue', revenue: 285000000, expenses: 0, net: 285000000 },
  { category: 'Materials Cost', revenue: 0, expenses: 62000000, net: -62000000 },
  { category: 'Labor Cost', revenue: 0, expenses: 41000000, net: -41000000 },
  { category: 'Equipment Cost', revenue: 0, expenses: 19500000, net: -19500000 },
  { category: 'Subcontractor Cost', revenue: 0, expenses: 38000000, net: -38000000 },
  { category: 'Overhead & Admin', revenue: 0, expenses: 7500000, net: -7500000 },
  { category: 'Other Income', revenue: 3200000, expenses: 0, net: 3200000 },
]

const CASH_FLOW_DATA: CashFlowMonth[] = [
  { month: 'Aug', inflow: 32000000, outflow: 28000000, net: 4000000 },
  { month: 'Sep', inflow: 38000000, outflow: 31000000, net: 7000000 },
  { month: 'Oct', inflow: 42000000, outflow: 35000000, net: 7000000 },
  { month: 'Nov', inflow: 36000000, outflow: 39000000, net: -3000000 },
  { month: 'Dec', inflow: 45000000, outflow: 34000000, net: 11000000 },
  { month: 'Jan', inflow: 48000000, outflow: 37000000, net: 11000000 },
]

const PROJECT_PROFITS: ProjectProfit[] = [
  { project: 'Mumbai Tower Complex', budget: 85000000, spent: 62000000, variance: 23000000, marginPct: 27, status: 'ACTIVE' },
  { project: 'Pune Residential', budget: 32000000, spent: 28500000, variance: 3500000, marginPct: 11, status: 'ACTIVE' },
  { project: 'Delhi Highway Bridge', budget: 120000000, spent: 98000000, variance: 22000000, marginPct: 18, status: 'ACTIVE' },
  { project: 'Bangalore Tech Park', budget: 55000000, spent: 52000000, variance: 3000000, marginPct: 5, status: 'ACTIVE' },
  { project: 'Chennai Port Extension', budget: 95000000, spent: 78000000, variance: 17000000, marginPct: 18, status: 'ACTIVE' },
  { project: 'Hyderabad Metro', budget: 200000000, spent: 142000000, variance: 58000000, marginPct: 29, status: 'ACTIVE' },
]

// ========================
// Stat Card Component
// ========================
function StatCard({ icon: Icon, label, value, trend, trendUp, prefix, suffix }: {
  icon: React.ElementType; label: string; value: string | number
  trend?: string; trendUp?: boolean; prefix?: string; suffix?: string
}) {
  return (
    <motion.div variants={item}>
      <Card className="p-4 sm:p-6">
        <CardContent className="p-0 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className="text-2xl font-bold tracking-tight">
              {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
            </p>
            {trend && (
              <div className={cn('flex items-center gap-1 text-xs', trendUp ? 'text-emerald-600' : 'text-red-500')}>
                {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{trend}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========================
// Main Component
// ========================
export function FinancePanel() {
  const [activeTab, setActiveTab] = useState('invoices')

  // Invoices State
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(SAMPLE_INVOICES)
  const [invLoading, setInvLoading] = useState(true)
  const [invSearch, setInvSearch] = useState('')
  const [invStatusFilter, setInvStatusFilter] = useState('all')
  const [invTypeFilter, setInvTypeFilter] = useState('all')
  const [createInvDialog, setCreateInvDialog] = useState(false)
  const [newInvoice, setNewInvoice] = useState({ project: '', payee: '', amount: '', type: 'Interim', description: '' })

  // Payment Approval State
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>(SAMPLE_PENDING_PAYMENTS)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [approving, setApproving] = useState(false)

  // Budget State
  const [projects, setProjects] = useState<Project[]>([])
  const [budgetLoading, setBudgetLoading] = useState(true)
  const [budgetProjects, setBudgetProjects] = useState<BudgetProject[]>([])

  // Reports State
  const [reportsTab] = useState('summary')

  // Fetch invoices from /api/payments with fallback
  const fetchInvoices = useCallback(async () => {
    try {
      setInvLoading(true)
      const res = await globalThis.fetch('/api/payments')
      if (res.ok) {
        const d = await res.json()
        const data = d.data || d || []
        if (Array.isArray(data) && data.length > 0) {
          const mapped: InvoiceRecord[] = data.slice(0, 10).map((p: Record<string, unknown>, i: number) => ({
            id: p.id || `inv-${i + 1}`,
            invoiceNo: p.voucherNo || `INV-2025-${String(i + 1).padStart(3, '0')}`,
            project: p.projectName || p.project || 'Unknown Project',
            payee: p.payeeName || p.payee || 'Unknown',
            amount: typeof p.amount === 'number' ? p.amount : 0,
            type: ['Advance', 'Interim', 'Final', 'Retainage'].includes(p.type as string) ? p.type as InvoiceRecord['type'] : 'Interim',
            status: p.status === 'APPROVED' ? 'Approved' : p.status === 'PAID' ? 'Paid' : 'Draft',
            date: p.createdAt ? new Date(p.createdAt as string).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: p.description || '',
          }))
          setInvoices(mapped)
        }
      }
    } catch {
      // Keep SAMPLE_INVOICES as fallback
    } finally {
      setInvLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Fetch projects for budget tab
  const fetchProjects = useCallback(async () => {
    try {
      setBudgetLoading(true)
      const res = await globalThis.fetch('/api/projects')
      if (res.ok) {
        const d = await res.json()
        const projData: Project[] = d.data || d || []
        setProjects(projData)
        // Build budget data from projects
        if (projData.length > 0) {
          const bp: BudgetProject[] = projData.slice(0, 6).map((p, i) => {
            const budget = p.budget || (50000000 + i * 20000000)
            const spent = Math.round(budget * (0.4 + Math.random() * 0.55))
            const allocated = Math.round(budget * (0.85 + Math.random() * 0.15))
            return {
              id: p.id, name: p.name, totalBudget: budget, allocated,
              spent, remaining: budget - spent, utilization: Math.round((spent / budget) * 100), status: p.status,
            }
          })
          setBudgetProjects(bp)
        } else {
          // Use sample budget data
          setBudgetProjects([
            { id: 'bp-1', name: 'Mumbai Tower Complex', totalBudget: 85000000, allocated: 78000000, spent: 62000000, remaining: 23000000, utilization: 73, status: 'ACTIVE' },
            { id: 'bp-2', name: 'Pune Residential', totalBudget: 32000000, allocated: 30000000, spent: 28500000, remaining: 3500000, utilization: 89, status: 'ACTIVE' },
            { id: 'bp-3', name: 'Delhi Highway Bridge', totalBudget: 120000000, allocated: 110000000, spent: 98000000, remaining: 22000000, utilization: 82, status: 'ACTIVE' },
            { id: 'bp-4', name: 'Bangalore Tech Park', totalBudget: 55000000, allocated: 52000000, spent: 52000000, remaining: 3000000, utilization: 95, status: 'ACTIVE' },
            { id: 'bp-5', name: 'Chennai Port Extension', totalBudget: 95000000, allocated: 88000000, spent: 78000000, remaining: 17000000, utilization: 82, status: 'ACTIVE' },
            { id: 'bp-6', name: 'Hyderabad Metro', totalBudget: 200000000, allocated: 185000000, spent: 142000000, remaining: 58000000, utilization: 71, status: 'ACTIVE' },
          ])
        }
      }
    } catch {
      // Fallback to sample data
      setBudgetProjects([
        { id: 'bp-1', name: 'Mumbai Tower Complex', totalBudget: 85000000, allocated: 78000000, spent: 62000000, remaining: 23000000, utilization: 73, status: 'ACTIVE' },
        { id: 'bp-2', name: 'Pune Residential', totalBudget: 32000000, allocated: 30000000, spent: 28500000, remaining: 3500000, utilization: 89, status: 'ACTIVE' },
        { id: 'bp-3', name: 'Delhi Highway Bridge', totalBudget: 120000000, allocated: 110000000, spent: 98000000, remaining: 22000000, utilization: 82, status: 'ACTIVE' },
        { id: 'bp-4', name: 'Bangalore Tech Park', totalBudget: 55000000, allocated: 52000000, spent: 52000000, remaining: 3000000, utilization: 95, status: 'ACTIVE' },
        { id: 'bp-5', name: 'Chennai Port Extension', totalBudget: 95000000, allocated: 88000000, spent: 78000000, remaining: 17000000, utilization: 82, status: 'ACTIVE' },
        { id: 'bp-6', name: 'Hyderabad Metro', totalBudget: 200000000, allocated: 185000000, spent: 142000000, remaining: 58000000, utilization: 71, status: 'ACTIVE' },
      ])
    } finally {
      setBudgetLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // ========================
  // Invoices Computed
  // ========================
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = !invSearch || inv.invoiceNo.toLowerCase().includes(invSearch.toLowerCase()) || inv.payee.toLowerCase().includes(invSearch.toLowerCase()) || inv.project.toLowerCase().includes(invSearch.toLowerCase())
      const matchStatus = invStatusFilter === 'all' || inv.status === invStatusFilter
      const matchType = invTypeFilter === 'all' || inv.type === invTypeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [invoices, invSearch, invStatusFilter, invTypeFilter])

  const invoiceStats = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.amount, 0)
    const pending = invoices.filter((i) => i.status === 'Draft').reduce((s, i) => s + i.amount, 0)
    const approved = invoices.filter((i) => i.status === 'Approved').reduce((s, i) => s + i.amount, 0)
    const paid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)
    return { total, pending, approved, paid }
  }, [invoices])

  const handleCreateInvoice = () => {
    if (!newInvoice.project || !newInvoice.payee || !newInvoice.amount) {
      toast.error('Project, payee, and amount are required')
      return
    }
    const newInv: InvoiceRecord = {
      id: `inv-${invoices.length + 1}`,
      invoiceNo: `INV-2025-${String(invoices.length + 1).padStart(3, '0')}`,
      project: newInvoice.project,
      payee: newInvoice.payee,
      amount: parseFloat(newInvoice.amount),
      type: newInvoice.type as InvoiceRecord['type'],
      status: 'Draft',
      date: new Date().toISOString().split('T')[0],
      description: newInvoice.description,
    }
    setInvoices([newInv, ...invoices])
    toast.success('Invoice created successfully')
    setCreateInvDialog(false)
    setNewInvoice({ project: '', payee: '', amount: '', type: 'Interim', description: '' })
  }

  // ========================
  // Payment Approval Computed
  // ========================
  const paymentStats = useMemo(() => {
    const pending = pendingPayments.length
    const totalAmount = pendingPayments.reduce((s, p) => s + p.amount, 0)
    return { pending, totalAmount }
  }, [pendingPayments])

  const handleApprove = async () => {
    if (!selectedPayment) return
    setApproving(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))
    setPendingPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id))
    // Also update invoice if exists
    setInvoices((prev) => prev.map((inv) => inv.description?.includes(selectedPayment.payee) && inv.status === 'Draft' ? { ...inv, status: 'Approved' } : inv))
    toast.success(`Payment ${selectedPayment.voucherNo} approved for ₹${selectedPayment.amount.toLocaleString('en-IN')}`)
    setApproveDialogOpen(false)
    setSelectedPayment(null)
    setApproving(false)
  }

  const handleReject = async () => {
    if (!selectedPayment) return
    setApproving(true)
    await new Promise((r) => setTimeout(r, 500))
    setPendingPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id))
    toast.warning(`Payment ${selectedPayment.voucherNo} rejected`)
    setRejectDialogOpen(false)
    setSelectedPayment(null)
    setApproving(false)
  }

  // ========================
  // Budget Computed
  // ========================
  const budgetStats = useMemo(() => {
    const totalBudget = budgetProjects.reduce((s, b) => s + b.totalBudget, 0)
    const allocated = budgetProjects.reduce((s, b) => s + b.allocated, 0)
    const spent = budgetProjects.reduce((s, b) => s + b.spent, 0)
    const remaining = totalBudget - spent
    const utilization = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0
    return { totalBudget, allocated, spent, remaining, utilization }
  }, [budgetProjects])

  // ========================
  // Reports Computed
  // ========================
  const reportStats = useMemo(() => {
    const totalRevenue = PL_DATA.reduce((s, p) => s + p.revenue, 0)
    const totalExpenses = PL_DATA.reduce((s, p) => s + p.expenses, 0)
    const netProfit = totalRevenue - totalExpenses
    const marginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0
    return { totalRevenue, totalExpenses, netProfit, marginPct }
  }, [])

  const maxCashFlow = useMemo(() => {
    return Math.max(...CASH_FLOW_DATA.flatMap((c) => [c.inflow, c.outflow]), 1)
  }, [])

  const totalPLRevenue = useMemo(() => PL_DATA.reduce((s, p) => s + p.revenue, 0), [])
  const totalPLExpenses = useMemo(() => PL_DATA.reduce((s, p) => s + p.expenses, 0), [])

  // ========================
  // Helpers
  // ========================
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  const getBudgetColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getBudgetBarColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getBudgetTextColor = (pct: number) => {
    if (pct >= 90) return 'text-red-600 dark:text-red-400'
    if (pct >= 70) return 'text-amber-600 dark:text-amber-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  // ========================
  // Render: Invoices
  // ========================
  const renderInvoices = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Receipt} label="Total Invoiced" value={formatCurrency(invoiceStats.total)} trend="+12% vs last month" trendUp />
        <StatCard icon={Clock} label="Pending Approval" value={formatCurrency(invoiceStats.pending)} />
        <StatCard icon={CheckCircle2} label="Approved" value={formatCurrency(invoiceStats.approved)} />
        <StatCard icon={Wallet} label="Paid" value={formatCurrency(invoiceStats.paid)} trend="+8% this month" trendUp />
      </div>

      {/* Search/Filter + Create */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoice, payee, project..." value={invSearch} onChange={(e) => setInvSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={invStatusFilter} onValueChange={setInvStatusFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={invTypeFilter} onValueChange={setInvTypeFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Advance">Advance</SelectItem>
              <SelectItem value="Interim">Interim</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
              <SelectItem value="Retainage">Retainage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateInvDialog(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20 shrink-0">
          <Plus className="h-4 w-4 mr-2" />Create Invoice
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice No</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Project</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payee</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices match your filters</TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <TableRow key={inv.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono font-medium">{inv.invoiceNo}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{inv.project}</TableCell>
                        <TableCell className="text-sm font-medium">{inv.payee}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={cn('text-xs', INVOICE_TYPE_COLORS[inv.type])}>{inv.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatFullCurrency(inv.amount)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{inv.date}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', INVOICE_STATUS_COLORS[inv.status])}>
                            {inv.status === 'Paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {inv.status === 'Approved' && <Clock className="h-3 w-3 mr-1" />}
                            {inv.status === 'Draft' && <FileText className="h-3 w-3 mr-1" />}
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Invoice Dialog */}
      <Dialog open={createInvDialog} onOpenChange={setCreateInvDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Fill in the details to create a new invoice.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input placeholder="e.g., Mumbai Tower Complex" value={newInvoice.project} onChange={(e) => setNewInvoice({ ...newInvoice, project: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Payee Name</Label>
                <Input placeholder="e.g., Steel Corp India" value={newInvoice.payee} onChange={(e) => setNewInvoice({ ...newInvoice, payee: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="e.g., 5000000" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Invoice Type</Label>
                <Select value={newInvoice.type} onValueChange={(v) => setNewInvoice({ ...newInvoice, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Advance">Advance</SelectItem>
                    <SelectItem value="Interim">Interim</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Retainage">Retainage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Invoice description..." rows={3} value={newInvoice.description} onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateInvDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )

  // ========================
  // Render: Payment Approval
  // ========================
  const renderPaymentApproval = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Pending Approval" value={paymentStats.pending} />
        <StatCard icon={CheckCircle2} label="Approved Today" value={3} trend="+2 vs yesterday" trendUp />
        <StatCard icon={Wallet} label="Total Disbursed" value={formatCurrency(245000000)} />
        <StatCard icon={TrendingUp} label="This Month" value={formatCurrency(38200000)} trend="+15% vs last month" trendUp />
      </div>

      {/* Table */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" />
              Payments Pending Approval
              <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{paymentStats.pending}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Voucher No</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payee</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Project</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Submitted</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p>All payments have been processed!</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingPayments.map((payment) => (
                      <TableRow key={payment.id} className="group">
                        <TableCell>
                          <span className="text-sm font-mono font-medium">{payment.voucherNo}</span>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{payment.payee}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatFullCurrency(payment.amount)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[180px] truncate">{payment.project}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={cn('text-xs', INVOICE_TYPE_COLORS[payment.type])}>{payment.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{payment.submittedDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white h-8"
                              onClick={() => { setSelectedPayment(payment); setApproveDialogOpen(true) }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8"
                              onClick={() => { setSelectedPayment(payment); setRejectDialogOpen(true) }}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              Approve Payment
            </DialogTitle>
            <DialogDescription>Are you sure you want to approve this payment?</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Voucher:</span>
                <span className="font-mono font-medium">{selectedPayment.voucherNo}</span>
                <span className="text-muted-foreground">Payee:</span>
                <span className="font-medium">{selectedPayment.payee}</span>
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-emerald-600">{formatFullCurrency(selectedPayment.amount)}</span>
                <span className="text-muted-foreground">Project:</span>
                <span className="text-sm">{selectedPayment.project}</span>
                <span className="text-muted-foreground">Type:</span>
                <Badge className={cn('text-xs w-fit', INVOICE_TYPE_COLORS[selectedPayment.type])}>{selectedPayment.type}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={approving}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {approving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              Reject Payment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject payment <span className="font-mono font-medium">{selectedPayment?.voucherNo}</span> for <span className="font-medium">{selectedPayment?.payee}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={approving}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {approving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )

  // ========================
  // Render: Budget Management
  // ========================
  const renderBudgetManagement = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Landmark} label="Total Budget" value={formatCurrency(budgetStats.totalBudget)} />
        <StatCard icon={Target} label="Allocated" value={formatCurrency(budgetStats.allocated)} />
        <StatCard icon={TrendingUp} label="Spent" value={formatCurrency(budgetStats.spent)} />
        <StatCard icon={Wallet} label="Remaining" value={formatCurrency(budgetStats.remaining)} />
        <StatCard icon={Percent} label="Utilization" value={`${budgetStats.utilization}%`} trend={budgetStats.utilization > 85 ? 'Watch threshold' : 'On track'} trendUp={budgetStats.utilization <= 85} />
      </div>

      {/* Budget per Project - Progress Bars */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-500" />
              Budget Utilization by Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {budgetProjects.map((bp) => (
                  <div key={bp.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">{bp.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(bp.spent)} / {formatCurrency(bp.totalBudget)}
                        </span>
                        <Badge className={cn('text-xs font-medium', bp.utilization >= 90
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : bp.utilization >= 70
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        )}>
                          {bp.utilization}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(bp.utilization, 100)}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', getBudgetBarColor(bp.utilization))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 pt-3 border-t">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-muted-foreground">&lt; 70%</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500" /><span className="text-xs text-muted-foreground">70-90%</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-muted-foreground">&gt; 90%</span></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Categories Breakdown */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Budget Categories Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right hidden sm:table-cell">Allocated</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right hidden md:table-cell">Spent</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right hidden lg:table-cell">Remaining</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Utilization</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-32 hidden md:table-cell">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_BUDGET_CATEGORIES.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="text-sm font-medium">{cat.category}</TableCell>
                      <TableCell className="text-right text-sm hidden sm:table-cell">{formatFullCurrency(cat.allocated)}</TableCell>
                      <TableCell className="text-right text-sm hidden md:table-cell">{formatFullCurrency(cat.spent)}</TableCell>
                      <TableCell className={cn('text-right text-sm hidden lg:table-cell', getBudgetTextColor(cat.utilization))}>{formatFullCurrency(cat.remaining)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={cn('text-xs font-medium', cat.utilization >= 90
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : cat.utilization >= 70
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        )}>
                          {cat.utilization}%
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.utilization}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', getBudgetBarColor(cat.utilization))}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )

  // ========================
  // Render: Financial Reports
  // ========================
  const renderFinancialReports = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Revenue" value={formatCurrency(reportStats.totalRevenue)} trend="+18% vs last quarter" trendUp />
        <StatCard icon={ArrowDown} label="Expenses" value={formatCurrency(reportStats.totalExpenses)} />
        <StatCard icon={CircleDollarSign} label="Net Profit" value={formatCurrency(reportStats.netProfit)} trend="+22% vs last quarter" trendUp />
        <StatCard icon={Percent} label="Profit Margin" value={`${reportStats.marginPct}%`} trend="+3.2% improvement" trendUp />
      </div>

      {/* P&L Summary */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-amber-500" />
              Profit & Loss Summary (Current Quarter)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Revenue</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Expenses</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PL_DATA.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell className="text-sm font-medium">{row.category}</TableCell>
                    <TableCell className={cn('text-right text-sm', row.revenue > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
                      {row.revenue > 0 ? formatFullCurrency(row.revenue) : '-'}
                    </TableCell>
                    <TableCell className={cn('text-right text-sm', row.expenses > 0 ? 'text-red-500' : 'text-muted-foreground')}>
                      {row.expenses > 0 ? formatFullCurrency(row.expenses) : '-'}
                    </TableCell>
                    <TableCell className={cn('text-right text-sm font-semibold', row.net >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {row.net >= 0 ? '+' : ''}{formatFullCurrency(row.net)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-bold">
                  <TableCell className="text-sm">Total</TableCell>
                  <TableCell className="text-right text-sm text-emerald-600">{formatFullCurrency(totalPLRevenue)}</TableCell>
                  <TableCell className="text-right text-sm text-red-500">{formatFullCurrency(totalPLExpenses)}</TableCell>
                  <TableCell className={cn('text-right text-sm', reportStats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                    {reportStats.netProfit >= 0 ? '+' : ''}{formatFullCurrency(reportStats.netProfit)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cash Flow Bar Chart */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Cash Flow Overview (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CASH_FLOW_DATA.map((cf) => {
                const inflowPct = (cf.inflow / maxCashFlow) * 100
                const outflowPct = (cf.outflow / maxCashFlow) * 100
                return (
                  <div key={cf.month} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{cf.month}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-600">In: {formatCurrency(cf.inflow)}</span>
                        <span className="text-red-500">Out: {formatCurrency(cf.outflow)}</span>
                        <span className={cn('font-medium', cf.net >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                          Net: {cf.net >= 0 ? '+' : ''}{formatCurrency(cf.net)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 h-5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${inflowPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="bg-emerald-500 h-full rounded-sm"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${outflowPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                        className="bg-red-400 h-full rounded-sm"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-muted-foreground">Inflow</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-400" /><span className="text-xs text-muted-foreground">Outflow</span></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Profitability */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              Project Profitability
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right hidden sm:table-cell">Budget</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right hidden md:table-cell">Spent</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Variance</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right hidden lg:table-cell">Margin %</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-28 hidden md:table-cell">Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PROJECT_PROFITS.map((pp) => (
                    <TableRow key={pp.project}>
                      <TableCell className="text-sm font-medium">{pp.project}</TableCell>
                      <TableCell className="text-right text-sm hidden sm:table-cell">{formatFullCurrency(pp.budget)}</TableCell>
                      <TableCell className="text-right text-sm hidden md:table-cell">{formatFullCurrency(pp.spent)}</TableCell>
                      <TableCell className={cn('text-right text-sm font-semibold', pp.variance >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {pp.variance >= 0 ? '+' : ''}{formatFullCurrency(pp.variance)}
                      </TableCell>
                      <TableCell className={cn('text-right text-sm font-semibold', pp.marginPct >= 20 ? 'text-emerald-600' : pp.marginPct >= 10 ? 'text-amber-600' : 'text-red-500')}>
                        {pp.marginPct}%
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pp.marginPct * 3, 100)}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={cn('h-full rounded-full',
                              pp.marginPct >= 20 ? 'bg-emerald-500' : pp.marginPct >= 10 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )

  // ========================
  // Main Render
  // ========================
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-sm text-muted-foreground">Manage invoices, payments, budgets, and financial reports</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap gap-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm gap-1.5 px-3 py-1.5"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="invoices">{renderInvoices()}</TabsContent>
        <TabsContent value="payment-approval">{renderPaymentApproval()}</TabsContent>
        <TabsContent value="budget">{renderBudgetManagement()}</TabsContent>
        <TabsContent value="financial-reports">{renderFinancialReports()}</TabsContent>
      </Tabs>
    </div>
  )
}