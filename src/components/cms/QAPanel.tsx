'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck, TestTubes, AlertTriangle, ShieldCheck, Plus, Search, Filter,
  CheckCircle2, XCircle, AlertCircle, Calendar, User, FileText, Eye, TrendingUp,
  Clock, ChevronDown, BarChart3, Target, Award, ListChecks,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/store/useAppStore'

// ========================
// Types
// ========================
interface QualityCheck {
  id: string
  inspectionNo: string
  item: string
  type: 'Material' | 'Work'
  date: string
  inspector: string
  result: 'Pass' | 'Fail' | 'Conditional'
  remarks: string
}

interface CubeTest {
  id: string
  testId: string
  date: string
  grade: string
  sampleNo: string
  day7MPa: number
  day28MPa: number
  status: 'Passed' | 'Failed' | 'Pending'
}

interface SteelTest {
  id: string
  testId: string
  date: string
  type: 'Tensile' | 'Bend'
  diameter: number
  yieldMPa: number
  ultimateMPa: number
  elongation: number
  result: 'Passed' | 'Failed' | 'Pending'
}

interface SoilTest {
  id: string
  testId: string
  date: string
  type: 'SPT' | 'CBR'
  location: string
  depth: string
  value: number
  classification: string
}

interface NCR {
  id: string
  ncrNo: string
  title: string
  project: string
  location: string
  severity: 'Critical' | 'Major' | 'Minor'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  raisedBy: string
  date: string
}

interface CAPA {
  id: string
  ncrRef: string
  action: string
  responsible: string
  dueDate: string
  status: 'Pending' | 'In Progress' | 'Completed'
}

interface Audit {
  id: string
  auditNo: string
  type: 'Internal' | 'External'
  project: string
  area: string
  auditor: string
  date: string
  status: 'Scheduled' | 'In Progress' | 'Completed'
  score: number | null
  findings: number
}

// ========================
// Sample Data
// ========================
const SAMPLE_CHECKS: QualityCheck[] = [
  { id: '1', inspectionNo: 'QC-2024-001', item: 'Cement (OPC 53 Grade)', type: 'Material', date: '2024-12-01', inspector: 'Rajesh Kumar', result: 'Pass', remarks: 'All parameters within spec' },
  { id: '2', inspectionNo: 'QC-2024-002', item: 'Column Rebar - Block A', type: 'Work', date: '2024-12-03', inspector: 'Anita Sharma', result: 'Pass', remarks: 'Spacing and cover as per drawing' },
  { id: '3', inspectionNo: 'QC-2024-003', item: 'Concrete Mix - M25', type: 'Material', date: '2024-12-05', inspector: 'Rajesh Kumar', result: 'Conditional', remarks: 'Slump slightly high, monitor' },
  { id: '4', inspectionNo: 'QC-2024-004', item: 'Brick Masonry - Ground Floor', type: 'Work', date: '2024-12-07', inspector: 'Vikram Patel', result: 'Fail', remarks: 'Verticality deviation beyond tolerance' },
  { id: '5', inspectionNo: 'QC-2024-005', item: 'Steel Plates (10mm)', type: 'Material', date: '2024-12-09', inspector: 'Rajesh Kumar', result: 'Pass', remarks: 'Thickness and grade verified' },
  { id: '6', inspectionNo: 'QC-2024-006', item: 'Beam Formwork - Level 2', type: 'Work', date: '2024-12-11', inspector: 'Anita Sharma', result: 'Pass', remarks: 'Alignment and support adequate' },
  { id: '7', inspectionNo: 'QC-2024-007', item: 'Sand (River Sand)', type: 'Material', date: '2024-12-13', inspector: 'Rajesh Kumar', result: 'Fail', remarks: 'Silt content 8.5% exceeds 6% limit' },
  { id: '8', inspectionNo: 'QC-2024-008', item: 'Plastering - East Wing', type: 'Work', date: '2024-12-15', inspector: 'Vikram Patel', result: 'Pass', remarks: 'Surface finish and thickness OK' },
  { id: '9', inspectionNo: 'QC-2024-009', item: 'Aggregates (20mm)', type: 'Material', date: '2024-12-17', inspector: 'Rajesh Kumar', result: 'Pass', remarks: 'Gradation within limits' },
  { id: '10', inspectionNo: 'QC-2024-010', item: 'Staircase Reinforcement', type: 'Work', date: '2024-12-19', inspector: 'Anita Sharma', result: 'Conditional', remarks: 'Extra ties needed at mid-landing' },
]

const SAMPLE_CUBE_TESTS: CubeTest[] = [
  { id: '1', testId: 'CT-2024-001', date: '2024-12-01', grade: 'M25', sampleNo: 'S-001', day7MPa: 18.5, day28MPa: 28.2, status: 'Passed' },
  { id: '2', testId: 'CT-2024-002', date: '2024-12-05', grade: 'M25', sampleNo: 'S-002', day7MPa: 17.0, day28MPa: 26.8, status: 'Passed' },
  { id: '3', testId: 'CT-2024-003', date: '2024-12-08', grade: 'M30', sampleNo: 'S-003', day7MPa: 22.1, day28MPa: 33.5, status: 'Passed' },
  { id: '4', testId: 'CT-2024-004', date: '2024-12-12', grade: 'M20', sampleNo: 'S-004', day7MPa: 12.0, day28MPa: 19.5, status: 'Failed' },
  { id: '5', testId: 'CT-2024-005', date: '2024-12-16', grade: 'M25', sampleNo: 'S-005', day7MPa: 16.8, day28MPa: 0, status: 'Pending' },
  { id: '6', testId: 'CT-2024-006', date: '2024-12-19', grade: 'M30', sampleNo: 'S-006', day7MPa: 21.5, day28MPa: 31.0, status: 'Passed' },
]

const SAMPLE_STEEL_TESTS: SteelTest[] = [
  { id: '1', testId: 'ST-2024-001', date: '2024-12-02', type: 'Tensile', diameter: 12, yieldMPa: 425, ultimateMPa: 545, elongation: 22.5, result: 'Passed' },
  { id: '2', testId: 'ST-2024-002', date: '2024-12-06', type: 'Bend', diameter: 16, yieldMPa: 415, ultimateMPa: 540, elongation: 20.0, result: 'Passed' },
  { id: '3', testId: 'ST-2024-003', date: '2024-12-10', type: 'Tensile', diameter: 20, yieldMPa: 410, ultimateMPa: 520, elongation: 18.5, result: 'Passed' },
  { id: '4', testId: 'ST-2024-004', date: '2024-12-14', type: 'Bend', diameter: 8, yieldMPa: 395, ultimateMPa: 500, elongation: 15.0, result: 'Failed' },
  { id: '5', testId: 'ST-2024-005', date: '2024-12-18', type: 'Tensile', diameter: 25, yieldMPa: 430, ultimateMPa: 560, elongation: 24.0, result: 'Pending' },
]

const SAMPLE_SOIL_TESTS: SoilTest[] = [
  { id: '1', testId: 'SL-2024-001', date: '2024-12-01', type: 'SPT', location: 'Block A - Bore 1', depth: '3.0m', value: 28, classification: 'Medium Dense' },
  { id: '2', testId: 'SL-2024-002', date: '2024-12-08', type: 'CBR', location: 'Road Section A', depth: '0.5m', value: 8.5, classification: 'Sub-Grade' },
  { id: '3', testId: 'SL-2024-003', date: '2024-12-12', type: 'SPT', location: 'Block B - Bore 3', depth: '6.0m', value: 42, classification: 'Dense' },
  { id: '4', testId: 'SL-2024-004', date: '2024-12-17', type: 'CBR', location: 'Parking Area', depth: '0.3m', value: 12.2, classification: 'Sub-Base' },
]

const SAMPLE_NCRS: NCR[] = [
  { id: '1', ncrNo: 'NCR-2024-001', title: 'Concrete Cover Deficiency - Column C3', project: 'Tower A', location: 'Level 5', severity: 'Critical', status: 'In Progress', raisedBy: 'Anita Sharma', date: '2024-12-01' },
  { id: '2', ncrNo: 'NCR-2024-002', title: 'Wrong Grade Steel Used', project: 'Tower A', location: 'Level 3 - Beams', severity: 'Critical', status: 'Open', raisedBy: 'Rajesh Kumar', date: '2024-12-04' },
  { id: '3', ncrNo: 'NCR-2024-003', title: 'Plaster Thickness Variation', project: 'Tower B', location: 'East Wing GF', severity: 'Major', status: 'Resolved', raisedBy: 'Vikram Patel', date: '2024-12-07' },
  { id: '4', ncrNo: 'NCR-2024-004', title: 'Waterproofing Membrane Damage', project: 'Podium', location: 'Basement B2', severity: 'Major', status: 'In Progress', raisedBy: 'Anita Sharma', date: '2024-12-09' },
  { id: '5', ncrNo: 'NCR-2024-005', title: 'Tile Alignment Issue', project: 'Tower B', location: 'Level 2 - Lobby', severity: 'Minor', status: 'Closed', raisedBy: 'Vikram Patel', date: '2024-12-11' },
  { id: '6', ncrNo: 'NCR-2024-006', title: 'HVAC Duct Leakage', project: 'Tower A', location: 'Level 8', severity: 'Major', status: 'Open', raisedBy: 'Rajesh Kumar', date: '2024-12-14' },
  { id: '7', ncrNo: 'NCR-2024-007', title: 'Paint Bubbling on Facade', project: 'Tower A', location: 'South Elevation', severity: 'Minor', status: 'Resolved', raisedBy: 'Anita Sharma', date: '2024-12-16' },
  { id: '8', ncrNo: 'NCR-2024-008', title: 'Foundation Rebar Spacing Error', project: 'Tower C', location: 'Footing F12', severity: 'Critical', status: 'Open', raisedBy: 'Rajesh Kumar', date: '2024-12-19' },
]

const SAMPLE_CAPA: CAPA[] = [
  { id: '1', ncrRef: 'NCR-2024-001', action: 'Remove and re-lay cover blocks with spacers', responsible: 'Sunil Mehta', dueDate: '2024-12-15', status: 'In Progress' },
  { id: '2', ncrRef: 'NCR-2024-002', action: 'Replace with correct Fe500D grade steel', responsible: 'Deepak Joshi', dueDate: '2024-12-20', status: 'Pending' },
  { id: '3', ncrRef: 'NCR-2024-003', action: 'Re-plaster with measured thickness guides', responsible: 'Manoj Singh', dueDate: '2024-12-14', status: 'Completed' },
  { id: '4', ncrRef: 'NCR-2024-004', action: 'Replace damaged membrane section, re-test', responsible: 'Sunil Mehta', dueDate: '2024-12-22', status: 'In Progress' },
  { id: '5', ncrRef: 'NCR-2024-005', action: 'Re-lay tiles with laser alignment', responsible: 'Manoj Singh', dueDate: '2024-12-13', status: 'Completed' },
  { id: '6', ncrRef: 'NCR-2024-006', action: 'Seal all leak points, pressure test', responsible: 'HVAC Subcon', dueDate: '2024-12-25', status: 'Pending' },
]

const SAMPLE_AUDITS: Audit[] = [
  { id: '1', auditNo: 'QA-2024-001', type: 'Internal', project: 'Tower A', area: 'Structural Works', auditor: 'External QA Team', date: '2024-12-05', status: 'Completed', score: 87, findings: 4 },
  { id: '2', auditNo: 'QA-2024-002', type: 'External', project: 'Tower B', area: 'Finishing Works', auditor: 'Client QA Rep', date: '2024-12-10', status: 'Completed', score: 92, findings: 2 },
  { id: '3', auditNo: 'QA-2024-003', type: 'Internal', project: 'Podium', area: 'MEP Works', auditor: 'Rajesh Kumar', date: '2024-12-15', status: 'Completed', score: 78, findings: 6 },
  { id: '4', auditNo: 'QA-2024-004', type: 'External', project: 'Tower A', area: 'Safety & QA Compliance', auditor: 'Third Party Auditor', date: '2024-12-22', status: 'Scheduled', score: null, findings: 0 },
  { id: '5', auditNo: 'QA-2024-005', type: 'Internal', project: 'Tower C', area: 'Foundation Works', auditor: 'Anita Sharma', date: '2024-12-28', status: 'Scheduled', score: null, findings: 0 },
]

const CHECKLIST_ITEMS = [
  'Material specifications verified', 'Dimensions within tolerance',
  'Surface finish acceptable', 'Structural integrity confirmed',
  'Documentation complete', 'Lab test results available',
  'Approval from consultant received', 'Non-conformity check passed',
]

const INSPECTORS = ['Rajesh Kumar', 'Anita Sharma', 'Vikram Patel', 'External QA Team']
const PROJECTS = ['Tower A', 'Tower B', 'Tower C', 'Podium', 'Landscaping']

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
// Helper: Stat Card (defined OUTSIDE component)
// ========================
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div variants={item} initial="hidden" animate="show">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========================
// Helper: Badge functions
// ========================
function resultBadge(result: string) {
  switch (result) {
    case 'Pass': return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">{result}</Badge>
    case 'Fail': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100">{result}</Badge>
    case 'Conditional': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">{result}</Badge>
    default: return <Badge variant="secondary">{result}</Badge>
  }
}

function severityBadge(severity: string) {
  switch (severity) {
    case 'Critical': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100">{severity}</Badge>
    case 'Major': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">{severity}</Badge>
    case 'Minor': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100">{severity}</Badge>
    default: return <Badge variant="secondary">{severity}</Badge>
  }
}

function ncrStatusBadge(status: string) {
  const map: Record<string, string> = {
    'Open': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Resolved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Closed': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return <Badge className={cn('hover:bg-opacity-80', map[status] || '')}>{status}</Badge>
}

function auditStatusBadge(status: string) {
  switch (status) {
    case 'Completed': return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">{status}</Badge>
    case 'In Progress': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">{status}</Badge>
    case 'Scheduled': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100">{status}</Badge>
    default: return <Badge variant="secondary">{status}</Badge>
  }
}

function capaStatusBadge(status: string) {
  switch (status) {
    case 'Completed': return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">{status}</Badge>
    case 'In Progress': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">{status}</Badge>
    case 'Pending': return <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100">{status}</Badge>
    default: return <Badge variant="secondary">{status}</Badge>
  }
}

const TABS = [
  { id: 'quality-checks', label: 'Quality Checks', icon: ClipboardCheck },
  { id: 'test-records', label: 'Test Records', icon: TestTubes },
  { id: 'ncr', label: 'NCR Management', icon: AlertTriangle },
  { id: 'audits', label: 'Quality Audits', icon: ShieldCheck },
]

// ========================
// Main Component
// ========================
export function QAPanel() {
  const [activeTab, setActiveTab] = useState('quality-checks')
  const activePanelTab = useAppStore((s) => s.activePanelTab)
  const setPanelTab = useAppStore((s) => s.setPanelTab)
  useEffect(() => {
    if (activePanelTab && TABS.some(t => t.id === activePanelTab)) {
      const id = requestAnimationFrame(() => { setActiveTab(activePanelTab); setPanelTab(null) }); return () => cancelAnimationFrame(id)
    }
  }, [activePanelTab, setPanelTab])
  const currentTab = activePanelTab && TABS.some(t => t.id === activePanelTab) ? activePanelTab : activeTab
  const handleTabChange = (tab: string) => { setActiveTab(tab); if (activePanelTab) setPanelTab(null) }
  const [search, setSearch] = useState('')
  const [filterResult, setFilterResult] = useState<string>('all')
  const [ncrSearch, setNcrSearch] = useState('')
  const [ncrFilterSev, setNcrFilterSev] = useState<string>('all')
  const [ncrFilterStatus, setNcrFilterStatus] = useState<string>('all')
  const [schedDialogOpen, setSchedDialogOpen] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [ncrDialogOpen, setNcrDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [checks, setChecks] = useState<QualityCheck[]>(SAMPLE_CHECKS)
  const [ncrs, setNcrs] = useState<NCR[]>(SAMPLE_NCRS)
  const [audits, setAudits] = useState<Audit[]>(SAMPLE_AUDITS)

  // Schedule inspection form
  const [schedType, setSchedType] = useState('')
  const [schedItem, setSchedItem] = useState('')
  const [schedDate, setSchedDate] = useState('')
  const [schedInspector, setSchedInspector] = useState('')
  const [checklist, setChecklist] = useState<Record<string, 'pass' | 'fail' | 'na'>>({})

  // Test record form
  const [testType, setTestType] = useState('')

  // NCR form
  const [ncrTitle, setNcrTitle] = useState('')
  const [ncrProject, setNcrProject] = useState('')
  const [ncrLocation, setNcrLocation] = useState('')
  const [ncrSeverity, setNcrSeverity] = useState('')
  const [ncrDesc, setNcrDesc] = useState('')

  // Audit form
  const [auditType, setAuditType] = useState('')
  const [auditProject, setAuditProject] = useState('')
  const [auditArea, setAuditArea] = useState('')
  const [auditAuditor, setAuditAuditor] = useState('')
  const [auditDate, setAuditDate] = useState('')

  // ========================
  // Computed: Quality Checks
  // ========================
  const filteredChecks = useMemo(() => {
    return checks.filter((c) => {
      const matchSearch = !search || c.item.toLowerCase().includes(search.toLowerCase()) || c.inspectionNo.toLowerCase().includes(search.toLowerCase())
      const matchResult = filterResult === 'all' || c.result === filterResult
      return matchSearch && matchResult
    })
  }, [checks, search, filterResult])

  const checkStats = useMemo(() => {
    const total = checks.length
    const passed = checks.filter((c) => c.result === 'Pass').length
    const failed = checks.filter((c) => c.result === 'Fail').length
    const pending = checks.filter((c) => c.result === 'Conditional').length
    const rate = total > 0 ? Math.round((passed / total) * 100) : 0
    return { total, passed, failed, pending, rate }
  }, [checks])

  // ========================
  // Computed: Test Records
  // ========================
  const testStats = useMemo(() => {
    const allStatuses = [
      ...SAMPLE_CUBE_TESTS.map((t) => t.status),
      ...SAMPLE_STEEL_TESTS.map((t) => t.result),
    ]
    const total = SAMPLE_CUBE_TESTS.length + SAMPLE_STEEL_TESTS.length + SAMPLE_SOIL_TESTS.length
    const passed = allStatuses.filter((s) => s === 'Passed').length
    const failed = allStatuses.filter((s) => s === 'Failed').length
    const pending = allStatuses.filter((s) => s === 'Pending').length
    const thisMonth = total
    return { total, passed, failed, pending, thisMonth }
  }, [])

  // ========================
  // Computed: NCR
  // ========================
  const filteredNCRs = useMemo(() => {
    return ncrs.filter((n) => {
      const matchSearch = !ncrSearch || n.title.toLowerCase().includes(ncrSearch.toLowerCase()) || n.ncrNo.toLowerCase().includes(ncrSearch.toLowerCase())
      const matchSev = ncrFilterSev === 'all' || n.severity === ncrFilterSev
      const matchStatus = ncrFilterStatus === 'all' || n.status === ncrFilterStatus
      return matchSearch && matchSev && matchStatus
    })
  }, [ncrs, ncrSearch, ncrFilterSev, ncrFilterStatus])

  const ncrStats = useMemo(() => {
    const total = ncrs.length
    const open = ncrs.filter((n) => n.status === 'Open').length
    const critical = ncrs.filter((n) => n.severity === 'Critical').length
    const resolved = ncrs.filter((n) => n.status === 'Resolved' || n.status === 'Closed').length
    const avgDays = 12.5
    return { total, open, critical, resolved, avgDays }
  }, [ncrs])

  const linkedCAPA = useMemo(() => {
    return SAMPLE_CAPA.filter((capa) => ncrs.some((ncr) => ncr.ncrNo === capa.ncrRef))
  }, [ncrs])

  // ========================
  // Computed: Audits
  // ========================
  const auditStats = useMemo(() => {
    const total = audits.length
    const completed = audits.filter((a) => a.status === 'Completed').length
    const scheduled = audits.filter((a) => a.status === 'Scheduled').length
    const scored = audits.filter((a) => a.score !== null)
    const avgScore = scored.length > 0 ? Math.round(scored.reduce((s, a) => s + (a.score || 0), 0) / scored.length) : 0
    const totalFindings = audits.reduce((s, a) => s + a.findings, 0)
    return { total, completed, scheduled, avgScore, totalFindings }
  }, [audits])

  // ========================
  // Handlers
  // ========================
  const handleScheduleInspection = useCallback(() => {
    if (!schedType || !schedItem || !schedDate || !schedInspector) {
      toast.error('Please fill all required fields')
      return
    }
    const passCount = Object.values(checklist).filter((v) => v === 'pass').length
    const failCount = Object.values(checklist).filter((v) => v === 'fail').length
    let result: 'Pass' | 'Fail' | 'Conditional' = 'Conditional'
    if (failCount === 0 && passCount > 0) result = 'Pass'
    if (failCount > 0) result = 'Fail'

    const newCheck: QualityCheck = {
      id: String(Date.now()),
      inspectionNo: `QC-2024-${String(checks.length + 1).padStart(3, '0')}`,
      item: schedItem,
      type: schedType as 'Material' | 'Work',
      date: schedDate,
      inspector: schedInspector,
      result,
      remarks: passCount > 0 ? `${passCount}/${CHECKLIST_ITEMS.length} items passed` : 'Scheduled - pending inspection',
    }
    setChecks((prev) => [newCheck, ...prev])
    setSchedDialogOpen(false)
    setSchedType('')
    setSchedItem('')
    setSchedDate('')
    setSchedInspector('')
    setChecklist({})
    toast.success('Inspection scheduled successfully')
  }, [schedType, schedItem, schedDate, schedInspector, checklist, checks.length])

  const handleCreateNCR = useCallback(() => {
    if (!ncrTitle || !ncrProject || !ncrSeverity) {
      toast.error('Please fill all required fields')
      return
    }
    const newNCR: NCR = {
      id: String(Date.now()),
      ncrNo: `NCR-2024-${String(ncrs.length + 1).padStart(3, '0')}`,
      title: ncrTitle,
      project: ncrProject,
      location: ncrLocation || 'Not specified',
      severity: ncrSeverity as 'Critical' | 'Major' | 'Minor',
      status: 'Open',
      raisedBy: 'Current User',
      date: new Date().toISOString().split('T')[0],
    }
    setNcrs((prev) => [newNCR, ...prev])
    setNcrDialogOpen(false)
    setNcrTitle('')
    setNcrProject('')
    setNcrLocation('')
    setNcrSeverity('')
    setNcrDesc('')
    toast.success('NCR created successfully')
  }, [ncrTitle, ncrProject, ncrSeverity, ncrLocation, ncrs.length])

  const handleScheduleAudit = useCallback(() => {
    if (!auditType || !auditProject || !auditDate) {
      toast.error('Please fill all required fields')
      return
    }
    const newAudit: Audit = {
      id: String(Date.now()),
      auditNo: `QA-2024-${String(audits.length + 1).padStart(3, '0')}`,
      type: auditType as 'Internal' | 'External',
      project: auditProject,
      area: auditArea || 'General',
      auditor: auditAuditor || 'TBD',
      date: auditDate,
      status: 'Scheduled',
      score: null,
      findings: 0,
    }
    setAudits((prev) => [newAudit, ...prev])
    setAuditDialogOpen(false)
    setAuditType('')
    setAuditProject('')
    setAuditArea('')
    setAuditAuditor('')
    setAuditDate('')
    toast.success('Audit scheduled successfully')
  }, [auditType, auditProject, auditDate, auditArea, auditAuditor, audits.length])

  const toggleChecklist = useCallback((idx: number, val: 'pass' | 'fail' | 'na') => {
    setChecklist((prev) => ({ ...prev, [idx]: val }))
  }, [])

  // ========================
  // Render
  // ========================
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div variants={item} initial="hidden" animate="show" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <ClipboardCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quality Assurance</h1>
          <p className="text-sm text-muted-foreground">Manage quality checks, test records, NCR, and audits</p>
        </div>
      </motion.div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
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

        {/* ==================== TAB 1: Quality Checks ==================== */}
        <TabsContent value="quality-checks" className="space-y-4 mt-4">
          {/* Stats */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={ClipboardCheck} label="Total Inspections" value={checkStats.total} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={CheckCircle2} label="Passed" value={checkStats.passed} color="bg-gradient-to-br from-emerald-500 to-green-600" />
            <StatCard icon={XCircle} label="Failed" value={checkStats.failed} color="bg-gradient-to-br from-red-500 to-red-600" />
            <StatCard icon={AlertCircle} label="Pending" value={checkStats.pending} color="bg-gradient-to-br from-amber-400 to-yellow-500" />
            <StatCard icon={Target} label="Pass Rate" value={`${checkStats.rate}%`} color="bg-gradient-to-br from-orange-500 to-red-500" />
          </motion.div>

          {/* Pass Rate Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Pass Rate</span>
                <span className="text-sm font-bold text-amber-600">{checkStats.rate}%</span>
              </div>
              <Progress value={checkStats.rate} className="h-3" />
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search inspections..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
                <SelectItem value="Conditional">Conditional</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setSchedDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Schedule Inspection
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="hidden lg:table-cell">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredChecks.map((check, idx) => (
                        <motion.tr
                          key={check.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium text-amber-700 dark:text-amber-400">{check.inspectionNo}</TableCell>
                          <TableCell className="max-w-48 truncate">{check.item}</TableCell>
                          <TableCell><Badge variant="outline">{check.type}</Badge></TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">{check.date}</TableCell>
                          <TableCell className="whitespace-nowrap">{check.inspector}</TableCell>
                          <TableCell>{resultBadge(check.result)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-48 truncate">{check.remarks}</TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 2: Test Records ==================== */}
        <TabsContent value="test-records" className="space-y-4 mt-4">
          {/* Stats */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={TestTubes} label="Total Tests" value={testStats.total} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={CheckCircle2} label="Passed" value={testStats.passed} color="bg-gradient-to-br from-emerald-500 to-green-600" />
            <StatCard icon={XCircle} label="Failed" value={testStats.failed} color="bg-gradient-to-br from-red-500 to-red-600" />
            <StatCard icon={Clock} label="Pending" value={testStats.pending} color="bg-gradient-to-br from-amber-400 to-yellow-500" />
            <StatCard icon={Calendar} label="This Month" value={testStats.thisMonth} color="bg-gradient-to-br from-orange-500 to-red-500" />
          </motion.div>

          <div className="flex justify-end">
            <Button onClick={() => setTestDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Record Test
            </Button>
          </div>

          {/* Cube Tests Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TestTubes className="h-4 w-4 text-amber-600" />
                </div>
                Cube Compression Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>7-day (MPa)</TableHead>
                      <TableHead>28-day (MPa)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_CUBE_TESTS.map((test) => (
                      <TableRow key={test.id} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-700 dark:text-amber-400">{test.testId}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{test.date}</TableCell>
                        <TableCell><Badge variant="outline">{test.grade}</Badge></TableCell>
                        <TableCell>{test.day7MPa}</TableCell>
                        <TableCell className="font-semibold">{test.day28MPa > 0 ? test.day28MPa : '—'}</TableCell>
                        <TableCell>{resultBadge(test.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Steel Tests Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                Steel Tensile & Bend Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Ø (mm)</TableHead>
                      <TableHead>Yield (MPa)</TableHead>
                      <TableHead>Ultimate (MPa)</TableHead>
                      <TableHead>Elong %</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_STEEL_TESTS.map((test) => (
                      <TableRow key={test.id} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-700 dark:text-amber-400">{test.testId}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{test.date}</TableCell>
                        <TableCell><Badge variant="outline">{test.type}</Badge></TableCell>
                        <TableCell>{test.diameter}</TableCell>
                        <TableCell>{test.yieldMPa}</TableCell>
                        <TableCell className="font-semibold">{test.ultimateMPa}</TableCell>
                        <TableCell>{test.elongation}%</TableCell>
                        <TableCell>{resultBadge(test.result)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Soil Tests Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                Soil Investigation Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Depth</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Classification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_SOIL_TESTS.map((test) => (
                      <TableRow key={test.id} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-700 dark:text-amber-400">{test.testId}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{test.date}</TableCell>
                        <TableCell><Badge variant="outline">{test.type}</Badge></TableCell>
                        <TableCell className="max-w-36 truncate">{test.location}</TableCell>
                        <TableCell>{test.depth}</TableCell>
                        <TableCell className="font-semibold">{test.type === 'SPT' ? `N=${test.value}` : `${test.value}%`}</TableCell>
                        <TableCell>{test.classification}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 3: NCR Management ==================== */}
        <TabsContent value="ncr" className="space-y-4 mt-4">
          {/* Stats */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={AlertTriangle} label="Total NCRs" value={ncrStats.total} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={XCircle} label="Open" value={ncrStats.open} color="bg-gradient-to-br from-red-500 to-red-600" />
            <StatCard icon={AlertCircle} label="Critical" value={ncrStats.critical} color="bg-gradient-to-br from-red-500 to-orange-500" />
            <StatCard icon={CheckCircle2} label="Resolved/Closed" value={ncrStats.resolved} color="bg-gradient-to-br from-emerald-500 to-green-600" />
            <StatCard icon={Clock} label="Avg Closure (days)" value={ncrStats.avgDays} color="bg-gradient-to-br from-orange-500 to-red-500" />
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search NCRs..." value={ncrSearch} onChange={(e) => setNcrSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={ncrFilterSev} onValueChange={setNcrFilterSev}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Major">Major</SelectItem>
                <SelectItem value="Minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ncrFilterStatus} onValueChange={setNcrFilterStatus}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setNcrDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Create NCR
            </Button>
          </div>

          {/* NCR Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Raised By</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredNCRs.map((ncr, idx) => (
                        <motion.tr
                          key={ncr.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium text-amber-700 dark:text-amber-400">{ncr.ncrNo}</TableCell>
                          <TableCell className="max-w-48 truncate font-medium">{ncr.title}</TableCell>
                          <TableCell className="whitespace-nowrap">{ncr.project}</TableCell>
                          <TableCell className="hidden sm:table-cell">{ncr.location}</TableCell>
                          <TableCell>{severityBadge(ncr.severity)}</TableCell>
                          <TableCell>{ncrStatusBadge(ncr.status)}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{ncr.raisedBy}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">{ncr.date}</TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-4" />

          {/* CAPA Table */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-amber-600" />
              Corrective & Preventive Actions (CAPA)
            </h3>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NCR Ref</TableHead>
                        <TableHead>Corrective Action</TableHead>
                        <TableHead>Responsible</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkedCAPA.map((capa) => (
                        <TableRow key={capa.id} className="border-b transition-colors hover:bg-muted/50">
                          <TableCell className="font-medium text-amber-700 dark:text-amber-400">{capa.ncrRef}</TableCell>
                          <TableCell className="max-w-64 truncate">{capa.action}</TableCell>
                          <TableCell className="whitespace-nowrap">{capa.responsible}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{capa.dueDate}</TableCell>
                          <TableCell>{capaStatusBadge(capa.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== TAB 4: Quality Audits ==================== */}
        <TabsContent value="audits" className="space-y-4 mt-4">
          {/* Stats */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={ShieldCheck} label="Total Audits" value={auditStats.total} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={CheckCircle2} label="Completed" value={auditStats.completed} color="bg-gradient-to-br from-emerald-500 to-green-600" />
            <StatCard icon={Calendar} label="Scheduled" value={auditStats.scheduled} color="bg-gradient-to-br from-blue-500 to-blue-600" />
            <StatCard icon={Award} label="Avg Score" value={`${auditStats.avgScore}%`} color="bg-gradient-to-br from-orange-500 to-red-500" />
            <StatCard icon={AlertTriangle} label="Total Findings" value={auditStats.totalFindings} color="bg-gradient-to-br from-red-500 to-red-600" />
          </motion.div>

          {/* Avg Score Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Average Audit Score</span>
                <span className="text-sm font-bold text-amber-600">{auditStats.avgScore}%</span>
              </div>
              <Progress value={auditStats.avgScore} className="h-3" />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setAuditDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Schedule Audit
            </Button>
          </div>

          {/* Audit Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Auditor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {audits.map((audit, idx) => (
                        <motion.tr
                          key={audit.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium text-amber-700 dark:text-amber-400">{audit.auditNo}</TableCell>
                          <TableCell><Badge variant="outline">{audit.type}</Badge></TableCell>
                          <TableCell className="whitespace-nowrap">{audit.project}</TableCell>
                          <TableCell className="max-w-36 truncate">{audit.area}</TableCell>
                          <TableCell className="max-w-36 truncate">{audit.auditor}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{audit.date}</TableCell>
                          <TableCell>{auditStatusBadge(audit.status)}</TableCell>
                          <TableCell className="font-semibold">
                            {audit.score !== null ? (
                              <span className={cn(audit.score >= 85 ? 'text-emerald-600' : audit.score >= 70 ? 'text-amber-600' : 'text-red-600')}>
                                {audit.score}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== DIALOG: Schedule Inspection ==================== */}
      <Dialog open={schedDialogOpen} onOpenChange={setSchedDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
              Schedule Inspection
            </DialogTitle>
            <DialogDescription>Fill in the inspection details and complete the checklist.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={schedType} onValueChange={setSchedType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Inspector *</Label>
                <Select value={schedInspector} onValueChange={setSchedInspector}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {INSPECTORS.map((ins) => (
                      <SelectItem key={ins} value={ins}>{ins}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Item / Work Area *</Label>
              <Input placeholder="e.g., Column Rebar - Block B" value={schedItem} onChange={(e) => setSchedItem(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
            </div>

            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-3">Inspection Checklist</h4>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((clItem, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                    <span className="text-sm">{clItem}</span>
                    <div className="flex items-center gap-2">
                      {(['pass', 'fail', 'na'] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => toggleChecklist(idx, val)}
                          className={cn(
                            'px-2.5 py-1 text-xs rounded-md font-medium transition-colors border',
                            checklist[idx] === val
                              ? val === 'pass' ? 'bg-emerald-500 text-white border-emerald-500'
                                : val === 'fail' ? 'bg-red-500 text-white border-red-500'
                                  : 'bg-gray-400 text-white border-gray-400'
                              : 'bg-background border-muted-foreground/20 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {val === 'na' ? 'N/A' : val === 'pass' ? 'Pass' : 'Fail'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleInspection} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Record Test ==================== */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTubes className="h-5 w-5 text-amber-600" />
              Record Test
            </DialogTitle>
            <DialogDescription>Select the test type to record a new test result.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger><SelectValue placeholder="Select test type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cube">Cube Compression Test</SelectItem>
                  <SelectItem value="steel">Steel Tensile/Bend Test</SelectItem>
                  <SelectItem value="soil">Soil Investigation Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {testType && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {testType === 'cube' && 'Enter cube sample details including grade, 7-day and 28-day strengths.'}
                  {testType === 'steel' && 'Enter steel test details including diameter, yield, ultimate, and elongation.'}
                  {testType === 'soil' && 'Enter soil test details including SPT/CBR values and location.'}
                </p>
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white" onClick={() => { toast.success(`${testType} test recorded (demo)`) ; setTestDialogOpen(false) ; setTestType('') }}>
                  Save Test Record
                </Button>
              </motion.div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTestDialogOpen(false) ; setTestType('') }}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Create NCR ==================== */}
      <Dialog open={ncrDialogOpen} onOpenChange={setNcrDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Create NCR
            </DialogTitle>
            <DialogDescription>Report a non-conformance with severity classification.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>NCR Title *</Label>
              <Input placeholder="e.g., Concrete Cover Deficiency" value={ncrTitle} onChange={(e) => setNcrTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={ncrProject} onValueChange={setNcrProject}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {PROJECTS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select value={ncrSeverity} onValueChange={setNcrSeverity}>
                  <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Major">Major</SelectItem>
                    <SelectItem value="Minor">Minor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g., Level 5 - Column C3" value={ncrLocation} onChange={(e) => setNcrLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the non-conformance in detail..." value={ncrDesc} onChange={(e) => setNcrDesc(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNcrDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNCR} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
              Create NCR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Schedule Audit ==================== */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              Schedule Audit
            </DialogTitle>
            <DialogDescription>Schedule a new internal or external quality audit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Audit Type *</Label>
                <Select value={auditType} onValueChange={setAuditType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={auditProject} onValueChange={setAuditProject}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {PROJECTS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Area</Label>
              <Input placeholder="e.g., Structural Works" value={auditArea} onChange={(e) => setAuditArea(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Auditor</Label>
              <Select value={auditAuditor} onValueChange={setAuditAuditor}>
                <SelectTrigger><SelectValue placeholder="Select auditor" /></SelectTrigger>
                <SelectContent>
                  {INSPECTORS.map((ins) => (
                    <SelectItem key={ins} value={ins}>{ins}</SelectItem>
                  ))}
                  <SelectItem value="Third Party Auditor">Third Party Auditor</SelectItem>
                  <SelectItem value="Client QA Rep">Client QA Rep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleAudit} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              Schedule Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}