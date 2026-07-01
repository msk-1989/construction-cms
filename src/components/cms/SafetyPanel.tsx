'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, AlertOctagon, AlertTriangle, GraduationCap, FileCheck, Plus, Search,
  CheckCircle2, XCircle, Clock, Calendar, User, FileText, Eye, TrendingUp,
  ChevronDown, BarChart3, Upload, Users, Award, Shield, ClipboardCheck,
  HardHat, Flame, Zap, TriangleAlert, Droplets, Construction, Wind, DoorOpen,
  Target, Activity, Wrench, Ban, Loader2,
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
import { Alert, AlertDescription } from '@/components/ui/alert'

// ========================
// Types
// ========================
interface SafetyInspection {
  id: string
  no: string
  type: 'Daily' | 'Weekly' | 'Monthly'
  date: string
  inspector: string
  area: string
  findings: number
  score: number
  status: 'Completed' | 'Pending' | 'Overdue'
}

interface Incident {
  id: string
  no: string
  type: 'Injury' | 'Near Miss' | 'Property' | 'Environmental'
  severity: 'Fatal' | 'Serious' | 'Minor' | 'First Aid'
  date: string
  location: string
  description: string
  status: 'Reported' | 'Investigation' | 'Closed'
}

interface NearMiss {
  id: string
  no: string
  date: string
  location: string
  description: string
  riskLevel: 'High' | 'Medium' | 'Low'
  reportedBy: string
  action: string
  status: 'Open' | 'Action Taken' | 'Closed'
}

interface ToolboxTalk {
  id: string
  no: string
  topic: string
  date: string
  by: string
  duration: string
  attendees: number
  status: 'Completed' | 'Scheduled'
}

interface SafetyMeeting {
  id: string
  no: string
  date: string
  type: 'Weekly' | 'Monthly'
  attendees: number
  decisions: string
  status: 'Completed' | 'Scheduled'
}

interface TrainingRecord {
  id: string
  employee: string
  training: string
  date: string
  trainer: string
  certificate: string
  validUntil: string
  status: 'Valid' | 'Expired'
}

interface PTW {
  id: string
  no: string
  type: 'Hot Work' | 'Height' | 'Excavation' | 'Electrical' | 'Confined Space'
  project: string
  requestedBy: string
  validFrom: string
  validTo: string
  status: 'Active' | 'Expired' | 'Cancelled'
}

interface RiskAssessment {
  id: string
  no: string
  activity: string
  riskLevel: 'High' | 'Medium' | 'Low'
  mitigation: string
  status: 'Active' | 'Under Review'
}

// ========================
// Sample Data
// ========================
const SAMPLE_INSPECTIONS: SafetyInspection[] = [
  { id: '1', no: 'SI-2024-001', type: 'Daily', date: '2024-12-01', inspector: 'Anita Sharma', area: 'Tower A - Ground Floor', findings: 2, score: 88, status: 'Completed' },
  { id: '2', no: 'SI-2024-002', type: 'Daily', date: '2024-12-03', inspector: 'Ravi Verma', area: 'Tower B - Level 3', findings: 5, score: 72, status: 'Completed' },
  { id: '3', no: 'SI-2024-003', type: 'Weekly', date: '2024-12-06', inspector: 'Anita Sharma', area: 'Podium - Basement', findings: 1, score: 94, status: 'Completed' },
  { id: '4', no: 'SI-2024-004', type: 'Daily', date: '2024-12-09', inspector: 'Ravi Verma', area: 'Tower A - Level 5', findings: 0, score: 100, status: 'Completed' },
  { id: '5', no: 'SI-2024-005', type: 'Monthly', date: '2024-12-12', inspector: 'Anita Sharma', area: 'Site Perimeter', findings: 3, score: 82, status: 'Completed' },
  { id: '6', no: 'SI-2024-006', type: 'Daily', date: '2024-12-15', inspector: 'Ravi Verma', area: 'Tower C - Foundation', findings: 0, score: 96, status: 'Pending' },
  { id: '7', no: 'SI-2024-007', type: 'Weekly', date: '2024-12-05', inspector: 'Anita Sharma', area: 'Tower B - Roof', findings: 7, score: 65, status: 'Overdue' },
  { id: '8', no: 'SI-2024-008', type: 'Daily', date: '2024-12-18', inspector: 'Ravi Verma', area: 'Staircase - Block C', findings: 4, score: 78, status: 'Completed' },
]

const INSPECTION_CHECKLIST = [
  { key: 'ppe', label: 'PPE Compliance', icon: HardHat },
  { key: 'scaffolding', label: 'Scaffolding Safety', icon: Wrench },
  { key: 'electrical', label: 'Electrical Safety', icon: Zap },
  { key: 'fire', label: 'Fire Safety Equipment', icon: Flame },
  { key: 'housekeeping', label: 'Housekeeping', icon: Users },
  { key: 'fall', label: 'Fall Protection', icon: TriangleAlert },
  { key: 'excavation', label: 'Excavation Safety', icon: AlertTriangle },
  { key: 'crane', label: 'Construction & Lifting', icon: Construction },
  { key: 'chemical', label: 'Chemical Handling', icon: Droplets },
  { key: 'emergency', label: 'Emergency Exits', icon: DoorOpen },
]

const SAMPLE_INCIDENTS: Incident[] = [
  { id: '1', no: 'INC-2024-001', type: 'Injury', severity: 'Serious', date: '2024-12-02', location: 'Tower A - Level 3', description: 'Worker slipped from scaffolding, suffered fracture in right arm', status: 'Investigation' },
  { id: '2', no: 'INC-2024-002', type: 'Property', severity: 'Minor', date: '2024-12-06', location: 'Warehouse', description: 'Forklift damaged freshly delivered glass panels worth ₹2.4L', status: 'Closed' },
  { id: '3', no: 'INC-2024-003', type: 'Environmental', severity: 'Minor', date: '2024-12-10', location: 'Excavation Pit B', description: 'Cement slurry leaked into storm water drain', status: 'Closed' },
  { id: '4', no: 'INC-2024-004', type: 'Injury', severity: 'First Aid', date: '2024-12-14', location: 'Tower B - Level 1', description: 'Minor cut from steel reinforcement bar, treated on site', status: 'Closed' },
  { id: '5', no: 'INC-2024-005', type: 'Near Miss', severity: 'Serious', date: '2024-12-17', location: 'Tower A - Level 7', description: 'Concrete bucket nearly hit worker due to cable slip', status: 'Reported' },
  { id: '6', no: 'INC-2024-006', type: 'Injury', severity: 'Minor', date: '2024-12-19', location: 'Podium - Parking', description: 'Worker reported back strain from manual lifting', status: 'Investigation' },
]

const INCIDENT_TREND = [
  { month: 'Jul', count: 3 },
  { month: 'Aug', count: 5 },
  { month: 'Sep', count: 2 },
  { month: 'Oct', count: 4 },
  { month: 'Nov', count: 1 },
  { month: 'Dec', count: 6 },
]

const SAMPLE_NEAR_MISS: NearMiss[] = [
  { id: '1', no: 'NM-2024-001', date: '2024-12-01', location: 'Tower A - Level 2', description: 'Loose brick fell from scaffold edge, narrowly missed worker', riskLevel: 'High', reportedBy: 'Sunil Mehta', action: 'Secured all loose materials, added toe boards', status: 'Closed' },
  { id: '2', no: 'NM-2024-002', date: '2024-12-05', location: 'Excavation Zone B', description: 'Trench wall showed signs of collapse during rain', riskLevel: 'High', reportedBy: 'Ravi Verma', action: 'Shoring installed, work stopped until stable', status: 'Action Taken' },
  { id: '3', no: 'NM-2024-003', date: '2024-12-09', location: 'Tower B - Staircase', description: 'Missing handrail on temporary staircase', riskLevel: 'Medium', reportedBy: 'Anita Sharma', action: 'Handrail installed within 2 hours', status: 'Closed' },
  { id: '4', no: 'NM-2024-004', date: '2024-12-13', location: 'Electrical Room', description: 'Exposed live wire near water source', riskLevel: 'High', reportedBy: 'Deepak Joshi', action: 'Power isolated, wire insulated, electrician called', status: 'Closed' },
  { id: '5', no: 'NM-2024-005', date: '2024-12-17', location: 'Roof - Tower A', description: 'Worker without harness near roof edge', riskLevel: 'Medium', reportedBy: 'Ravi Verma', action: 'Worker reprimanded, additional harnesses provided', status: 'Action Taken' },
  { id: '6', no: 'NM-2024-006', date: '2024-12-20', location: 'Material Yard', description: 'Stacked pipes unstable, risk of toppling', riskLevel: 'Low', reportedBy: 'Sunil Mehta', action: 'Restacked with proper dunnage and chocks', status: 'Open' },
]

const SAMPLE_TOOLBOX_TALKS: ToolboxTalk[] = [
  { id: '1', no: 'TT-2024-001', topic: 'Scaffolding Safety & Tagging', date: '2024-12-02', by: 'Anita Sharma', duration: '20 min', attendees: 35, status: 'Completed' },
  { id: '2', no: 'TT-2024-002', topic: 'Electrical Safety Awareness', date: '2024-12-06', by: 'Ravi Verma', duration: '15 min', attendees: 28, status: 'Completed' },
  { id: '3', no: 'TT-2024-003', topic: 'Fall Prevention Systems', date: '2024-12-10', by: 'Anita Sharma', duration: '25 min', attendees: 42, status: 'Completed' },
  { id: '4', no: 'TT-2024-004', topic: 'Heat Stress Prevention', date: '2024-12-15', by: 'Ravi Verma', duration: '15 min', attendees: 30, status: 'Completed' },
  { id: '5', no: 'TT-2024-005', topic: 'Construction & Lifting Operations', date: '2024-12-22', by: 'Anita Sharma', duration: '20 min', attendees: 0, status: 'Scheduled' },
]

const SAMPLE_MEETINGS: SafetyMeeting[] = [
  { id: '1', no: 'SM-2024-001', date: '2024-12-02', type: 'Weekly', attendees: 12, decisions: 'Increased PPE spot checks, assigned new safety marshal for Tower B', status: 'Completed' },
  { id: '2', no: 'SM-2024-002', date: '2024-12-09', type: 'Weekly', attendees: 10, decisions: 'Ordered additional fire extinguishers for Level 5-8', status: 'Completed' },
  { id: '3', no: 'SM-2024-003', date: '2024-12-12', type: 'Monthly', attendees: 18, decisions: 'Monthly safety target set at 95%. New contractor orientation scheduled.', status: 'Completed' },
  { id: '4', no: 'SM-2024-004', date: '2024-12-23', type: 'Monthly', attendees: 0, decisions: 'Pending — Agenda: Year-end safety review', status: 'Scheduled' },
]

const SAMPLE_TRAINING_RECORDS: TrainingRecord[] = [
  { id: '1', employee: 'Sunil Mehta', training: 'Scaffolding Erection', date: '2024-06-15', trainer: 'Safety Corp India', certificate: 'CERT-SCF-2024-001', validUntil: '2025-06-15', status: 'Valid' },
  { id: '2', employee: 'Deepak Joshi', training: 'Electrical Safety (LV)', date: '2024-03-10', trainer: 'ElectroSafe Academy', certificate: 'CERT-ELC-2024-042', validUntil: '2025-03-10', status: 'Valid' },
  { id: '3', employee: 'Manoj Singh', training: 'Fire Fighting', date: '2024-01-20', trainer: 'FirePro Training', certificate: 'CERT-FF-2024-018', validUntil: '2025-01-20', status: 'Valid' },
  { id: '4', employee: 'Ravi Verma', training: 'First Aid', date: '2023-11-05', trainer: 'Red Cross', certificate: 'CERT-FA-2023-105', validUntil: '2024-11-05', status: 'Expired' },
  { id: '5', employee: 'Anita Sharma', training: 'NEBOSH IGC', date: '2024-04-12', trainer: 'NEBOSH UK', certificate: 'CERT-NEB-2024-089', validUntil: '2027-04-12', status: 'Valid' },
  { id: '6', employee: 'Sunil Mehta', training: 'Working at Height', date: '2024-07-22', trainer: 'HeightSafe Solutions', certificate: 'CERT-WAH-2024-033', validUntil: '2025-07-22', status: 'Valid' },
  { id: '7', employee: 'Deepak Joshi', training: 'Construction Signalling', date: '2023-08-18', trainer: 'ConstructionMaster India', certificate: 'CERT-CS-2023-077', validUntil: '2024-08-18', status: 'Expired' },
  { id: '8', employee: 'Manoj Singh', training: 'Confined Space Entry', date: '2024-09-30', trainer: 'SafeEntry Training', certificate: 'CERT-CSE-2024-056', validUntil: '2025-09-30', status: 'Valid' },
]

const SAMPLE_PTWS: PTW[] = [
  { id: '1', no: 'PTW-2024-001', type: 'Hot Work', project: 'Tower A', requestedBy: 'Sunil Mehta', validFrom: '2024-12-15', validTo: '2024-12-20', status: 'Active' },
  { id: '2', no: 'PTW-2024-002', type: 'Height', project: 'Tower B', requestedBy: 'Deepak Joshi', validFrom: '2024-12-10', validTo: '2024-12-25', status: 'Active' },
  { id: '3', no: 'PTW-2024-003', type: 'Electrical', project: 'Tower A', requestedBy: 'Electrician Team', validFrom: '2024-12-01', validTo: '2024-12-10', status: 'Expired' },
  { id: '4', no: 'PTW-2024-004', type: 'Excavation', project: 'Tower C', requestedBy: 'Manoj Singh', validFrom: '2024-12-18', validTo: '2025-01-05', status: 'Active' },
  { id: '5', no: 'PTW-2024-005', type: 'Confined Space', project: 'Podium', requestedBy: 'MEC Team', validFrom: '2024-12-05', validTo: '2024-12-08', status: 'Cancelled' },
]

const SAMPLE_RISK_ASSESSMENTS: RiskAssessment[] = [
  { id: '1', no: 'RA-2024-001', activity: 'Tower Construction Operation', riskLevel: 'High', mitigation: 'Certified operator, daily checks, exclusion zone, wind speed monitoring', status: 'Active' },
  { id: '2', no: 'RA-2024-002', activity: 'Deep Excavation (>3m)', riskLevel: 'High', mitigation: 'Shoring, dewatering, daily inspections, edge protection', status: 'Active' },
  { id: '3', no: 'RA-2024-003', activity: 'Welding & Cutting', riskLevel: 'Medium', mitigation: 'Fire watch, extinguisher nearby, hot work permit, ventilation', status: 'Active' },
  { id: '4', no: 'RA-2024-004', activity: 'Scaffolding Erection', riskLevel: 'Medium', mitigation: 'Trained erectors, tagged system, weekly inspection, base plates', status: 'Under Review' },
]

const INSPECTORS = ['Anita Sharma', 'Ravi Verma', 'Sunil Mehta', 'Deepak Joshi']
const PROJECTS = ['Tower A', 'Tower B', 'Tower C', 'Podium']

// ========================
// Helpers
// ========================
function severityBadge(severity: string) {
  const map: Record<string, string> = {
    'Fatal': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Serious': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Minor': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'First Aid': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  }
  return <Badge className={cn('hover:bg-opacity-80', map[severity] || '')}>{severity}</Badge>
}

function riskBadge(level: string) {
  const map: Record<string, string> = {
    'High': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Medium': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Low': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  }
  return <Badge className={cn('hover:bg-opacity-80', map[level] || '')}>{level}</Badge>
}

function inspectionStatusBadge(status: string) {
  const map: Record<string, string> = {
    'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Overdue': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return <Badge className={cn('hover:bg-opacity-80', map[status] || '')}>{status}</Badge>
}

function ptwStatusBadge(status: string) {
  const map: Record<string, string> = {
    'Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Expired': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Cancelled': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return <Badge className={cn('hover:bg-opacity-80', map[status] || '')}>{status}</Badge>
}

function incidentStatusBadge(status: string) {
  const map: Record<string, string> = {
    'Reported': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Investigation': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Closed': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return <Badge className={cn('hover:bg-opacity-80', map[status] || '')}>{status}</Badge>
}

const TABS = [
  { id: 'inspections', label: 'Safety Inspections', icon: ShieldAlert },
  { id: 'incidents', label: 'Incident Reporting', icon: AlertOctagon },
  { id: 'near-miss', label: 'Near Miss', icon: AlertTriangle },
  { id: 'training', label: 'Safety Training', icon: GraduationCap },
  { id: 'documents', label: 'Safety Documents', icon: FileCheck },
]

// ========================
// Shared Sub-components (must be outside render)
// ========================
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CircularScore({ score, size = 120, label }: { score: number; size?: number; label: string }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 90 ? '#16a34a' : score >= 75 ? '#d97706' : '#dc2626'
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}%</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  )
}

// ========================
// Component
// ========================
export function SafetyPanel() {
  const [activeTab, setActiveTab] = useState('inspections')
  const [search, setSearch] = useState('')
  const [inspections, setInspections] = useState<SafetyInspection[]>(SAMPLE_INSPECTIONS)
  const [nearMissReports, setNearMissReports] = useState<NearMiss[]>(SAMPLE_NEAR_MISS)

  // Dialog states
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false)
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false)
  const [nearMissDialogOpen, setNearMissDialogOpen] = useState(false)
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)

  // Inspection dialog form
  const [inspType, setInspType] = useState('')
  const [inspArea, setInspArea] = useState('')
  const [inspDate, setInspDate] = useState('')
  const [inspInspector, setInspInspector] = useState('')
  const [checklistState, setChecklistState] = useState<Record<string, 'pass' | 'fail' | 'na'>>({})

  // Incident dialog form
  const [incType, setIncType] = useState('')
  const [incSeverity, setIncSeverity] = useState('')
  const [incDate, setIncDate] = useState('')
  const [incLocation, setIncLocation] = useState('')
  const [incDesc, setIncDesc] = useState('')
  const [incInjured, setIncInjured] = useState('')
  const [incWitness, setIncWitness] = useState('')

  // Near miss dialog
  const [nmLocation, setNmLocation] = useState('')
  const [nmDesc, setNmDesc] = useState('')
  const [nmRisk, setNmRisk] = useState('')
  const [nmAction, setNmAction] = useState('')

  // Session dialog
  const [sessionTopic, setSessionTopic] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionBy, setSessionBy] = useState('')
  const [sessionDuration, setSessionDuration] = useState('')

  // ========================
  // Computed: Inspections
  // ========================
  const filteredInspections = useMemo(() => {
    if (!search) return inspections
    const s = search.toLowerCase()
    return inspections.filter((i) => i.area.toLowerCase().includes(s) || i.no.toLowerCase().includes(s) || i.inspector.toLowerCase().includes(s))
  }, [inspections, search])

  const inspectionStats = useMemo(() => {
    const total = inspections.length
    const completed = inspections.filter((i) => i.status === 'Completed').length
    const pending = inspections.filter((i) => i.status === 'Pending').length
    const overdue = inspections.filter((i) => i.status === 'Overdue').length
    const completedItems = inspections.filter((i) => i.status === 'Completed')
    const avgScore = completedItems.length > 0 ? Math.round(completedItems.reduce((s, i) => s + i.score, 0) / completedItems.length) : 0
    return { total, completed, pending, overdue, avgScore }
  }, [inspections])

  // ========================
  // Computed: Incidents
  // ========================
  const incidentStats = useMemo(() => {
    const total = SAMPLE_INCIDENTS.length
    const open = SAMPLE_INCIDENTS.filter((i) => i.status === 'Reported').length
    const investigation = SAMPLE_INCIDENTS.filter((i) => i.status === 'Investigation').length
    const thisMonth = SAMPLE_INCIDENTS.filter((i) => i.date.startsWith('2024-12')).length
    const daysSince = 3
    return { total, open, investigation, daysSince, thisMonth }
  }, [])

  const maxTrendCount = useMemo(() => Math.max(...INCIDENT_TREND.map((t) => t.count)), [])

  // ========================
  // Computed: Near Miss
  // ========================
  const nearMissStats = useMemo(() => {
    const total = nearMissReports.length
    const highRisk = nearMissReports.filter((n) => n.riskLevel === 'High').length
    const actionTaken = nearMissReports.filter((n) => n.status === 'Action Taken' || n.status === 'Closed').length
    const thisMonth = nearMissReports.filter((n) => n.date.startsWith('2024-12')).length
    return { total, highRisk, actionTaken, thisMonth }
  }, [nearMissReports])

  // ========================
  // Computed: Training
  // ========================
  const trainingStats = useMemo(() => {
    const totalSessions = SAMPLE_TOOLBOX_TALKS.length + SAMPLE_MEETINGS.length
    const thisMonth = [...SAMPLE_TOOLBOX_TALKS, ...SAMPLE_MEETINGS].filter((s) => s.date.startsWith('2024-12')).length
    const completedTalks = SAMPLE_TOOLBOX_TALKS.filter((t) => t.status === 'Completed')
    const avgAttendance = completedTalks.length > 0 ? Math.round(completedTalks.reduce((s, t) => s + t.attendees, 0) / completedTalks.length) : 0
    const totalEmployees = SAMPLE_TRAINING_RECORDS.length
    const validCerts = SAMPLE_TRAINING_RECORDS.filter((t) => t.status === 'Valid').length
    const compliance = totalEmployees > 0 ? Math.round((validCerts / totalEmployees) * 100) : 0
    return { totalSessions, thisMonth, avgAttendance, compliance }
  }, [])

  // ========================
  // Computed: Documents
  // ========================
  const docStats = useMemo(() => {
    const totalDocs = 1 + SAMPLE_PTWS.length + SAMPLE_RISK_ASSESSMENTS.length
    const activePTWs = SAMPLE_PTWS.filter((p) => p.status === 'Active').length
    const riskAssessments = SAMPLE_RISK_ASSESSMENTS.length
    const expired = SAMPLE_PTWS.filter((p) => p.status === 'Expired').length + 1 // safety policy
    return { totalDocs, activePTWs, riskAssessments, expired }
  }, [])

  // ========================
  // Handlers
  // ========================
  const handleConductInspection = useCallback(() => {
    if (!inspType || !inspArea || !inspDate || !inspInspector) {
      toast.error('Please fill all required fields')
      return
    }
    const entries = Object.values(checklistState)
    const failCount = entries.filter((v) => v === 'fail').length
    const naCount = entries.filter((v) => v === 'na').length
    const passCount = entries.filter((v) => v === 'pass').length
    const totalApplicable = entries.length - naCount
    const score = totalApplicable > 0 ? Math.round((passCount / totalApplicable) * 100) : 100
    const newInsp: SafetyInspection = {
      id: String(Date.now()),
      no: `SI-2024-${String(inspections.length + 1).padStart(3, '0')}`,
      type: inspType as 'Daily' | 'Weekly' | 'Monthly',
      date: inspDate,
      inspector: inspInspector,
      area: inspArea,
      findings: failCount,
      score,
      status: 'Completed',
    }
    setInspections((prev) => [newInsp, ...prev])
    setInspectionDialogOpen(false)
    setInspType('')
    setInspArea('')
    setInspDate('')
    setInspInspector('')
    setChecklistState({})
    toast.success(`Inspection completed — Score: ${score}/100`)
  }, [inspType, inspArea, inspDate, inspInspector, checklistState, inspections.length])

  const handleReportIncident = useCallback(() => {
    if (!incType || !incSeverity || !incLocation || !incDesc) {
      toast.error('Please fill all required fields')
      return
    }
    setIncidentDialogOpen(false)
    setIncType('')
    setIncSeverity('')
    setIncDate('')
    setIncLocation('')
    setIncDesc('')
    setIncInjured('')
    setIncWitness('')
    toast.success('Incident reported successfully')
  }, [incType, incSeverity, incLocation, incDesc])

  const handleReportNearMiss = useCallback(() => {
    if (!nmLocation || !nmDesc || !nmRisk) {
      toast.error('Please fill all required fields')
      return
    }
    const newNM: NearMiss = {
      id: String(Date.now()),
      no: `NM-2024-${String(nearMissReports.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      location: nmLocation,
      description: nmDesc,
      riskLevel: nmRisk as 'High' | 'Medium' | 'Low',
      reportedBy: 'Current User',
      action: nmAction || 'Pending',
      status: 'Open',
    }
    setNearMissReports((prev) => [newNM, ...prev])
    setNearMissDialogOpen(false)
    setNmLocation('')
    setNmDesc('')
    setNmRisk('')
    setNmAction('')
    toast.success('Near miss reported successfully')
  }, [nmLocation, nmDesc, nmRisk, nmAction, nearMissReports.length])

  const handleCreateSession = useCallback(() => {
    if (!sessionTopic || !sessionDate || !sessionBy) {
      toast.error('Please fill all required fields')
      return
    }
    setSessionDialogOpen(false)
    setSessionTopic('')
    setSessionDate('')
    setSessionBy('')
    setSessionDuration('')
    toast.success('Training session created successfully')
  }, [sessionTopic, sessionDate, sessionBy])

  const setChecklistItem = useCallback((key: string, value: 'pass' | 'fail' | 'na') => {
    setChecklistState((prev) => ({ ...prev, [key]: value }))
  }, [])

  // ========================
  // Render
  // ========================
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Safety Management</h1>
          <p className="text-sm text-muted-foreground">Manage inspections, incidents, training, and safety compliance</p>
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

        {/* ==================== TAB 1: Safety Inspections ==================== */}
        <TabsContent value="inspections" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={ShieldAlert} label="Total Inspections" value={inspectionStats.total} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={CheckCircle2} label="Completed" value={inspectionStats.completed} color="bg-gradient-to-br from-emerald-500 to-green-600" />
            <StatCard icon={Clock} label="Pending" value={inspectionStats.pending} color="bg-gradient-to-br from-amber-400 to-yellow-500" />
            <StatCard icon={XCircle} label="Overdue" value={inspectionStats.overdue} color="bg-gradient-to-br from-red-500 to-red-600" />
            <StatCard icon={Target} label="Avg Score" value={`${inspectionStats.avgScore}/100`} color="bg-gradient-to-br from-orange-500 to-red-500" />
          </div>

          {/* Compliance Score Card */}
          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <CircularScore score={inspectionStats.avgScore} size={140} label="Compliance Score" />
              <div className="flex-1 space-y-3 w-full">
                <h3 className="font-semibold text-sm">Score Breakdown</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm">Excellent (90-100)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm">Good (75-89)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Below Standard (&lt;75)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="text-sm">Pending</span>
                  </div>
                </div>
                {inspectionStats.overdue > 0 && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/10">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
                      {inspectionStats.overdue} inspection(s) are overdue and require immediate attention.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search inspections..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={() => setInspectionDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Conduct Inspection
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
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Findings</TableHead>
                      <TableHead>Score /100</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredInspections.map((insp, idx) => (
                        <motion.tr
                          key={insp.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={cn('border-b transition-colors hover:bg-muted/50', insp.status === 'Overdue' && 'bg-red-50/50 dark:bg-red-900/5')}
                        >
                          <TableCell className={cn('font-medium', insp.status === 'Overdue' ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400')}>{insp.no}</TableCell>
                          <TableCell><Badge variant="outline">{insp.type}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{insp.date}</TableCell>
                          <TableCell>{insp.inspector}</TableCell>
                          <TableCell className="max-w-40 truncate">{insp.area}</TableCell>
                          <TableCell>
                            {insp.findings > 0 ? (
                              <Badge variant={insp.findings > 4 ? 'destructive' : 'secondary'}>{insp.findings}</Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">0</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={cn('font-bold', insp.score >= 90 ? 'text-emerald-600' : insp.score >= 75 ? 'text-amber-600' : 'text-red-600')}>
                              {insp.status === 'Pending' ? '—' : `${insp.score}`}
                            </span>
                          </TableCell>
                          <TableCell>{inspectionStatusBadge(insp.status)}</TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 2: Incident Reporting ==================== */}
        <TabsContent value="incidents" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={AlertOctagon} label="Total Incidents" value={incidentStats.total} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={AlertCircle} label="Open" value={incidentStats.open} color="bg-gradient-to-br from-red-500 to-red-600" />
            <StatCard icon={Search} label="Under Investigation" value={incidentStats.investigation} color="bg-gradient-to-br from-blue-500 to-blue-600" />
            <StatCard icon={Clock} label="Days Since Last" value={incidentStats.daysSince} color="bg-gradient-to-br from-emerald-500 to-green-600" />
            <StatCard icon={Calendar} label="This Month" value={incidentStats.thisMonth} color="bg-gradient-to-br from-orange-500 to-red-500" />
          </div>

          {/* Incident Trend Bar Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                Incident Trend (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-32">
                {INCIDENT_TREND.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{item.count}</span>
                    <motion.div
                      className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-orange-400 min-h-[4px]"
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.count / maxTrendCount) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ maxHeight: '100%' }}
                    />
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setIncidentDialogOpen(true)} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Report Incident
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
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="hidden lg:table-cell">Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {SAMPLE_INCIDENTS.map((inc, idx) => (
                        <motion.tr key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="border-b transition-colors hover:bg-muted/50">
                          <TableCell className="font-medium text-red-600 dark:text-red-400">{inc.no}</TableCell>
                          <TableCell><Badge variant="outline">{inc.type}</Badge></TableCell>
                          <TableCell>{severityBadge(inc.severity)}</TableCell>
                          <TableCell className="text-muted-foreground">{inc.date}</TableCell>
                          <TableCell>{inc.location}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-64 truncate">{inc.description}</TableCell>
                          <TableCell>{incidentStatusBadge(inc.status)}</TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 3: Near Miss ==================== */}
        <TabsContent value="near-miss" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={AlertTriangle} label="Total Reports" value={nearMissStats.total} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={XCircle} label="High Risk" value={nearMissStats.highRisk} color="bg-gradient-to-br from-red-500 to-red-600" />
            <StatCard icon={CheckCircle2} label="Action Taken" value={nearMissStats.actionTaken} color="bg-gradient-to-br from-emerald-500 to-green-600" />
            <StatCard icon={Calendar} label="This Month" value={nearMissStats.thisMonth} color="bg-gradient-to-br from-orange-500 to-red-500" />
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setNearMissDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Report Near Miss
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
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="hidden lg:table-cell">Description</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead className="hidden md:table-cell">Reported By</TableHead>
                      <TableHead className="hidden lg:table-cell">Action Taken</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {nearMissReports.map((nm, idx) => (
                        <motion.tr key={nm.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="border-b transition-colors hover:bg-muted/50">
                          <TableCell className="font-medium text-amber-700 dark:text-amber-400">{nm.no}</TableCell>
                          <TableCell className="text-muted-foreground">{nm.date}</TableCell>
                          <TableCell>{nm.location}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-64 truncate">{nm.description}</TableCell>
                          <TableCell>{riskBadge(nm.riskLevel)}</TableCell>
                          <TableCell className="hidden md:table-cell">{nm.reportedBy}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-48 truncate">{nm.action}</TableCell>
                          <TableCell>{incidentStatusBadge(nm.status)}</TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 4: Safety Training ==================== */}
        <TabsContent value="training" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={GraduationCap} label="Total Sessions" value={trainingStats.totalSessions} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={Calendar} label="This Month" value={trainingStats.thisMonth} color="bg-gradient-to-br from-orange-500 to-red-500" />
            <StatCard icon={Users} label="Avg Attendance" value={trainingStats.avgAttendance} color="bg-gradient-to-br from-blue-500 to-blue-600" />
            <StatCard icon={Award} label="Compliance" value={`${trainingStats.compliance}%`} color="bg-gradient-to-br from-emerald-500 to-green-600" />
          </div>

          {/* Training Compliance Card */}
          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <CircularScore score={trainingStats.compliance} size={130} label="Workers Certified" />
              <div className="flex-1 space-y-2 w-full">
                <h3 className="font-semibold text-sm">Certification Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valid Certificates</span>
                    <span className="font-medium text-emerald-600">{SAMPLE_TRAINING_RECORDS.filter((t) => t.status === 'Valid').length} / {SAMPLE_TRAINING_RECORDS.length}</span>
                  </div>
                  <Progress value={trainingStats.compliance} className="h-2.5" />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{SAMPLE_TRAINING_RECORDS.filter((t) => t.status === 'Valid').length} valid</span>
                    <span>{SAMPLE_TRAINING_RECORDS.filter((t) => t.status === 'Expired').length} expired</span>
                    <span>{SAMPLE_TRAINING_RECORDS.filter((t) => t.validUntil && new Date(t.validUntil) < new Date(new Date().getTime() + 30 * 86400000) && t.status === 'Valid').length} expiring soon</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setSessionDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Create Session
            </Button>
          </div>

          {/* Toolbox Talks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-amber-600" />
                </div>
                Toolbox Talks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Conducted By</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_TOOLBOX_TALKS.map((tt, idx) => (
                      <motion.tr key={tt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-700 dark:text-amber-400">{tt.no}</TableCell>
                        <TableCell>{tt.topic}</TableCell>
                        <TableCell className="text-muted-foreground">{tt.date}</TableCell>
                        <TableCell>{tt.by}</TableCell>
                        <TableCell>{tt.duration}</TableCell>
                        <TableCell>{tt.attendees || '—'}</TableCell>
                        <TableCell>
                          <Badge className={tt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>
                            {tt.status}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Safety Meetings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                Safety Meetings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead className="hidden lg:table-cell">Decisions</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_MEETINGS.map((m, idx) => (
                      <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-700 dark:text-amber-400">{m.no}</TableCell>
                        <TableCell className="text-muted-foreground">{m.date}</TableCell>
                        <TableCell><Badge variant="outline">{m.type}</Badge></TableCell>
                        <TableCell>{m.attendees || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-64 truncate">{m.decisions}</TableCell>
                        <TableCell>
                          <Badge className={m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>
                            {m.status}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Training Records */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Award className="h-4 w-4 text-yellow-600" />
                </div>
                Training Records
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Training</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="hidden md:table-cell">Trainer</TableHead>
                      <TableHead className="hidden lg:table-cell">Certificate</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_TRAINING_RECORDS.map((tr, idx) => (
                      <motion.tr key={tr.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium">{tr.employee}</TableCell>
                        <TableCell>{tr.training}</TableCell>
                        <TableCell className="text-muted-foreground">{tr.date}</TableCell>
                        <TableCell className="hidden md:table-cell">{tr.trainer}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">{tr.certificate}</TableCell>
                        <TableCell className="text-muted-foreground">{tr.validUntil}</TableCell>
                        <TableCell>
                          <Badge className={tr.status === 'Valid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                            {tr.status}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 5: Safety Documents ==================== */}
        <TabsContent value="documents" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={FileCheck} label="Total Documents" value={docStats.totalDocs} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={Shield} label="Active PTWs" value={docStats.activePTWs} color="bg-gradient-to-br from-emerald-500 to-green-600" />
            <StatCard icon={AlertTriangle} label="Risk Assessments" value={docStats.riskAssessments} color="bg-gradient-to-br from-orange-500 to-red-500" />
            <StatCard icon={XCircle} label="Expired" value={docStats.expired} color="bg-gradient-to-br from-red-500 to-red-600" />
          </div>

          <div className="flex justify-end">
            <Button onClick={() => toast.info('Document upload feature — file selection dialog would open here')} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
              <Upload className="h-4 w-4 mr-2" />Upload Document
            </Button>
          </div>

          {/* Safety Policy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                Safety Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Construction Site Safety Policy v3.2</p>
                  <p className="text-xs text-muted-foreground">Effective Date: 2024-01-01 &bull; Last Reviewed: 2024-10-15</p>
                  <p className="text-xs text-muted-foreground">Approved by: Project Director &bull; Compliant with OSHA / BOCW</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                  <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                    <Eye className="h-4 w-4 mr-1" />View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permit to Work Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <ClipboardCheck className="h-4 w-4 text-orange-600" />
                </div>
                Permit to Work (PTW)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead className="hidden md:table-cell">Valid From</TableHead>
                      <TableHead className="hidden md:table-cell">Valid To</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_PTWS.map((ptw, idx) => (
                      <motion.tr key={ptw.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-700 dark:text-amber-400">{ptw.no}</TableCell>
                        <TableCell><Badge variant="outline">{ptw.type}</Badge></TableCell>
                        <TableCell>{ptw.project}</TableCell>
                        <TableCell>{ptw.requestedBy}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{ptw.validFrom}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{ptw.validTo}</TableCell>
                        <TableCell>{ptwStatusBadge(ptw.status)}</TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead className="hidden lg:table-cell">Mitigation Measures</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_RISK_ASSESSMENTS.map((ra, idx) => (
                      <motion.tr key={ra.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-700 dark:text-amber-400">{ra.no}</TableCell>
                        <TableCell>{ra.activity}</TableCell>
                        <TableCell>{riskBadge(ra.riskLevel)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-64 truncate">{ra.mitigation}</TableCell>
                        <TableCell>
                          <Badge className={ra.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>
                            {ra.status}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== DIALOGS ==================== */}

      {/* Conduct Inspection Dialog */}
      <Dialog open={inspectionDialogOpen} onOpenChange={setInspectionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Conduct Safety Inspection
            </DialogTitle>
            <DialogDescription>Complete the checklist to conduct a new safety inspection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={inspType} onValueChange={setInspType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input type="date" value={inspDate} onChange={(e) => setInspDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Area *</Label>
              <Input placeholder="e.g., Tower A - Level 3" value={inspArea} onChange={(e) => setInspArea(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Inspector *</Label>
              <Select value={inspInspector} onValueChange={setInspInspector}>
                <SelectTrigger><SelectValue placeholder="Select inspector" /></SelectTrigger>
                <SelectContent>
                  {INSPECTORS.map((ins) => <SelectItem key={ins} value={ins}>{ins}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Inspection Checklist</Label>
              <div className="space-y-2 border rounded-lg p-3">
                {INSPECTION_CHECKLIST.map((item) => {
                  const val = checklistState[item.key] || ''
                  return (
                    <div key={item.key} className="flex items-center gap-2 flex-wrap">
                      <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 min-w-0">{item.label}</span>
                      <div className="flex gap-1">
                        {(['pass', 'fail', 'na'] as const).map((opt) => (
                          <Button
                            key={opt}
                            size="sm"
                            variant={val === opt ? 'default' : 'outline'}
                            className={cn(
                              'h-7 px-2 text-xs',
                              val === opt && opt === 'pass' && 'bg-emerald-600 hover:bg-emerald-700',
                              val === opt && opt === 'fail' && 'bg-red-600 hover:bg-red-700',
                              val === opt && opt === 'na' && 'bg-gray-500 hover:bg-gray-600',
                            )}
                            onClick={() => setChecklistItem(item.key, opt)}
                          >
                            {opt.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInspectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConductInspection} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">Complete Inspection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Incident Dialog */}
      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-red-500" />
              Report Incident
            </DialogTitle>
            <DialogDescription>Document a safety incident with full details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={incType} onValueChange={setIncType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Injury">Injury</SelectItem>
                    <SelectItem value="Near Miss">Near Miss</SelectItem>
                    <SelectItem value="Property">Property Damage</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Severity *</Label>
                <Select value={incSeverity} onValueChange={setIncSeverity}>
                  <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fatal">Fatal</SelectItem>
                    <SelectItem value="Serious">Serious</SelectItem>
                    <SelectItem value="Minor">Minor</SelectItem>
                    <SelectItem value="First Aid">First Aid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={incDate} onChange={(e) => setIncDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Input placeholder="e.g., Tower A - Level 3" value={incLocation} onChange={(e) => setIncLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea placeholder="Describe the incident in detail..." value={incDesc} onChange={(e) => setIncDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Injured Person</Label>
                <Input placeholder="Name of injured" value={incInjured} onChange={(e) => setIncInjured(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Witness</Label>
                <Input placeholder="Witness name" value={incWitness} onChange={(e) => setIncWitness(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReportIncident} className="bg-gradient-to-r from-red-500 to-red-600 text-white">Report Incident</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Near Miss Dialog */}
      <Dialog open={nearMissDialogOpen} onOpenChange={setNearMissDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Report Near Miss
            </DialogTitle>
            <DialogDescription>Report a near miss event to prevent future incidents.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Input placeholder="Where did the near miss occur?" value={nmLocation} onChange={(e) => setNmLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea placeholder="Describe what happened..." value={nmDesc} onChange={(e) => setNmDesc(e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Risk Level *</Label>
              <Select value={nmRisk} onValueChange={setNmRisk}>
                <SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Immediate Action Taken</Label>
              <Textarea placeholder="What action was taken?" value={nmAction} onChange={(e) => setNmAction(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNearMissDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReportNearMiss} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-amber-500" />
              Create Training Session
            </DialogTitle>
            <DialogDescription>Schedule a new toolbox talk or training session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Topic *</Label>
              <Input placeholder="e.g., Scaffolding Safety" value={sessionTopic} onChange={(e) => setSessionTopic(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Conducted By *</Label>
              <Select value={sessionBy} onValueChange={setSessionBy}>
                <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                <SelectContent>
                  {INSPECTORS.map((ins) => <SelectItem key={ins} value={ins}>{ins}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Input placeholder="e.g., 20 min" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSession} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">Create Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}