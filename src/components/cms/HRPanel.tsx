'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Clock, DollarSign, UserPlus, Search, Plus, Edit3,
  UserCheck, UserX, TrendingUp, Building2, CalendarDays,
  AlertCircle, CheckCircle2, XCircle, FileText, Briefcase,
  ArrowUpRight, ArrowDownRight, Loader2, Eye, X, Filter,
  ChevronLeft, ChevronRight, BarChart3,
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { getRoleLabel, getRoleBadgeClass } from '@/lib/permissions'
import type { User } from '@/types/cms'

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
interface AttendanceRecord {
  id: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  status: 'Present' | 'Absent' | 'Half-day' | 'Late'
  hoursWorked: number
}

interface PayrollRecord {
  id: string
  employeeName: string
  department?: string
  baseSalary: number
  allowances: number
  pf: number
  tds: number
  esi: number
  deductions: number
  netPay: number
  status: 'Paid' | 'Pending' | 'Processing'
  payDate?: string
}

interface JobPosting {
  id: string
  title: string
  department: string
  status: 'Open' | 'Closed' | 'On Hold'
  applicants: number
  postedDate: string
  type: string
}

interface Application {
  id: string
  candidateName: string
  position: string
  status: 'New' | 'Screening' | 'Interview' | 'Offer' | 'Rejected'
  appliedDate: string
  email: string
}

const TABS = [
  { id: 'employees', label: 'Employee Management', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
]

const DEPARTMENTS = [
  'Engineering', 'Construction', 'Finance', 'HR', 'Procurement',
  'Quality Assurance', 'Safety', 'Design', 'Administration', 'Site Operations',
]

const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  Present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Half-day': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Late: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const PAYROLL_STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Processing: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
}

const APPLICATION_STATUS_COLORS: Record<string, string> = {
  New: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Screening: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Interview: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const JOB_STATUS_COLORS: Record<string, string> = {
  Open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  'On Hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

// ========================
// Sample Data Generators
// ========================
function generateAttendanceRecords(employees: User[]): AttendanceRecord[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const records: AttendanceRecord[] = []
  const statuses: AttendanceRecord['status'][] = ['Present', 'Present', 'Present', 'Present', 'Absent', 'Half-day', 'Late']
  const empList = employees.length > 0 ? employees.slice(0, 12) : [
    { name: 'Raj Kumar' } as User, { name: 'Priya Sharma' } as User,
    { name: 'Amit Patel' } as User, { name: 'Vikram Singh' } as User,
    { name: 'Sneha Reddy' } as User, { name: 'Anita Desai' } as User,
    { name: 'Karan Mehta' } as User, { name: 'Divya Nair' } as User,
    { name: 'Rohit Joshi' } as User, { name: 'Pooja Gupta' } as User,
    { name: 'Manish Verma' } as User, { name: 'Shalini Iyer' } as User,
  ]
  // Generate exactly 20 sample daily attendance records for current month
  let count = 0
  for (let day = 1; day <= Math.min(now.getDate(), 28) && count < 20; day++) {
    const date = new Date(year, month, day)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    const dayEmps = empList.slice(0, Math.min(4, 20 - count))
    for (const emp of dayEmps) {
      if (count >= 20) break
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      let checkIn = '09:00'
      let checkOut = '18:00'
      let hours = 9
      if (status === 'Late') { checkIn = `${9 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`; hours = 7.5 + Math.random() }
      if (status === 'Half-day') { checkOut = '13:00'; hours = 4 }
      if (status === 'Absent') { checkIn = '-'; checkOut = '-'; hours = 0 }
      records.push({
        id: `att-${day}-${emp.name?.split(' ')[0] || 'emp'}`,
        employeeName: emp.name || 'Unknown',
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        checkIn, checkOut, status, hoursWorked: Math.round(hours * 10) / 10,
      })
      count++
    }
  }
  return records
}

const PAYROLL_DEPARTMENTS = ['Engineering', 'Construction', 'Finance', 'HR', 'Procurement', 'Design']

function generatePayrollRecords(employees: User[]): PayrollRecord[] {
  const empList = employees.length > 0 ? employees.slice(0, 12) : [
    { name: 'Raj Kumar', department: 'Engineering' } as User, { name: 'Priya Sharma', department: 'Construction' } as User,
    { name: 'Amit Patel', department: 'Finance' } as User, { name: 'Vikram Singh', department: 'Construction' } as User,
    { name: 'Sneha Reddy', department: 'HR' } as User, { name: 'Anita Desai', department: 'Design' } as User,
    { name: 'Karan Mehta', department: 'Procurement' } as User, { name: 'Divya Nair', department: 'Engineering' } as User,
    { name: 'Rohit Joshi', department: 'Construction' } as User, { name: 'Pooja Gupta', department: 'Finance' } as User,
    { name: 'Manish Verma', department: 'Engineering' } as User, { name: 'Shalini Iyer', department: 'HR' } as User,
  ]
  const statuses: PayrollRecord['status'][] = ['Paid', 'Paid', 'Paid', 'Pending', 'Processing']
  return empList.map((emp, i) => {
    const base = 40000 + Math.floor(Math.random() * 80000)
    const allowances = Math.floor(base * (0.1 + Math.random() * 0.2))
    const pf = Math.floor(base * 0.12)
    const esi = Math.floor(base * 0.0175)
    const tds = Math.floor((base + allowances) * (0.05 + Math.random() * 0.15))
    const deductions = pf + esi + tds
    return {
      id: `pay-${i + 1}`,
      employeeName: emp.name || 'Unknown',
      department: (emp as User & { department?: string }).department || PAYROLL_DEPARTMENTS[i % PAYROLL_DEPARTMENTS.length],
      baseSalary: base,
      allowances,
      pf, tds, esi,
      deductions,
      netPay: base + allowances - deductions,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payDate: `2025-01-${String(28 - i).padStart(2, '0')}`,
    }
  })
}

const JOB_POSTINGS: JobPosting[] = [
  { id: 'job-1', title: 'Senior Site Engineer', department: 'Construction', status: 'Open', applicants: 12, postedDate: '2025-01-05', type: 'Full-time' },
  { id: 'job-2', title: 'QA/QC Inspector', department: 'Quality Assurance', status: 'Open', applicants: 8, postedDate: '2025-01-08', type: 'Full-time' },
  { id: 'job-3', title: 'Safety Officer', department: 'Safety', status: 'On Hold', applicants: 5, postedDate: '2024-12-20', type: 'Full-time' },
  { id: 'job-4', title: 'Project Coordinator', department: 'Engineering', status: 'Open', applicants: 15, postedDate: '2025-01-12', type: 'Full-time' },
  { id: 'job-5', title: 'Procurement Specialist', department: 'Procurement', status: 'Closed', applicants: 22, postedDate: '2024-11-15', type: 'Full-time' },
  { id: 'job-6', title: 'BIM Modeler', department: 'Design', status: 'Open', applicants: 6, postedDate: '2025-01-15', type: 'Contract' },
]

const APPLICATIONS: Application[] = [
  { id: 'app-1', candidateName: 'Arvind Kumar', position: 'Senior Site Engineer', status: 'Interview', appliedDate: '2025-01-06', email: 'arvind@email.com' },
  { id: 'app-2', candidateName: 'Meera Patel', position: 'QA/QC Inspector', status: 'Screening', appliedDate: '2025-01-09', email: 'meera@email.com' },
  { id: 'app-3', candidateName: 'Sunil Reddy', position: 'Senior Site Engineer', status: 'New', appliedDate: '2025-01-18', email: 'sunil@email.com' },
  { id: 'app-4', candidateName: 'Kavitha Nair', position: 'Project Coordinator', status: 'Offer', appliedDate: '2024-12-28', email: 'kavitha@email.com' },
  { id: 'app-5', candidateName: 'Deepak Sharma', position: 'BIM Modeler', status: 'New', appliedDate: '2025-01-16', email: 'deepak@email.com' },
  { id: 'app-6', candidateName: 'Ritu Joshi', position: 'Senior Site Engineer', status: 'Rejected', appliedDate: '2025-01-07', email: 'ritu@email.com' },
  { id: 'app-7', candidateName: 'Nikhil Verma', position: 'QA/QC Inspector', status: 'Interview', appliedDate: '2025-01-10', email: 'nikhil@email.com' },
  { id: 'app-8', candidateName: 'Swathi Rao', position: 'Project Coordinator', status: 'Screening', appliedDate: '2025-01-14', email: 'swathi@email.com' },
  { id: 'app-9', candidateName: 'Pradeep Gupta', position: 'BIM Modeler', status: 'New', appliedDate: '2025-01-17', email: 'pradeep@email.com' },
  { id: 'app-10', candidateName: 'Anjali Deshmukh', position: 'Senior Site Engineer', status: 'Interview', appliedDate: '2025-01-08', email: 'anjali@email.com' },
]

// ========================
// Stat Card Component
// ========================
function StatCard({ icon: Icon, label, value, trend, trendUp }: {
  icon: React.ElementType; label: string; value: string | number
  trend?: string; trendUp?: boolean
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
            <p className="text-2xl font-bold tracking-tight">{value}</p>
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
export function HRPanel() {
  const [activeTab, setActiveTab] = useState('employees')

  // Employee Management State
  const [employees, setEmployees] = useState<User[]>([])
  const [empLoading, setEmpLoading] = useState(true)
  const [empSearch, setEmpSearch] = useState('')
  const [empRoleFilter, setEmpRoleFilter] = useState('all')
  const [empStatusFilter, setEmpStatusFilter] = useState('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [newEmp, setNewEmp] = useState({ name: '', email: '', role: 'MEMBER', department: '', position: '', phone: '' })

  // Attendance State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attSearch, setAttSearch] = useState('')
  const [attDateFilter, setAttDateFilter] = useState('today')
  const [attStatusFilter, setAttStatusFilter] = useState('all')

  // Payroll State
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [payrollLoading, setPayrollLoading] = useState(true)
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false)
  const [payrollMonth, setPayrollMonth] = useState('2025-01')

  // Recruitment State
  const [jobDialogOpen, setJobDialogOpen] = useState(false)
  const [newJob, setNewJob] = useState({ title: '', department: '', type: 'Full-time', description: '', requirements: '' })
  const [appStatusFilter, setAppStatusFilter] = useState('all')

  // Sample employees fallback
  const SAMPLE_EMPLOYEES: User[] = [
    { id: 's-1', name: 'Raj Kumar', email: 'raj@cms.com', role: 'ADMIN', status: 'ACTIVE', department: 'Engineering', position: 'Project Director', createdAt: new Date().toISOString() },
    { id: 's-2', name: 'Priya Sharma', email: 'priya@cms.com', role: 'PROJECT_MANAGER', status: 'ACTIVE', department: 'Construction', position: 'Senior PM', createdAt: new Date().toISOString() },
    { id: 's-3', name: 'Amit Patel', email: 'amit@cms.com', role: 'CFO', status: 'ACTIVE', department: 'Finance', position: 'Chief Financial Officer', createdAt: new Date().toISOString() },
    { id: 's-4', name: 'Vikram Singh', email: 'vikram@cms.com', role: 'SITE_MANAGER', status: 'ACTIVE', department: 'Construction', position: 'Site Manager', createdAt: new Date().toISOString() },
    { id: 's-5', name: 'Sneha Reddy', email: 'sneha@cms.com', role: 'HR_MANAGER', status: 'ACTIVE', department: 'HR', position: 'HR Lead', createdAt: new Date().toISOString() },
    { id: 's-6', name: 'Anita Desai', email: 'anita@cms.com', role: 'SAFETY_OFFICER', status: 'ACTIVE', department: 'Safety', position: 'Safety Officer', createdAt: new Date().toISOString() },
    { id: 's-7', name: 'Karan Mehta', email: 'karan@cms.com', role: 'PROCUREMENT_HEAD', status: 'ACTIVE', department: 'Procurement', position: 'Procurement Head', createdAt: new Date().toISOString() },
    { id: 's-8', name: 'Divya Nair', email: 'divya@cms.com', role: 'SITE_ENGINEER', status: 'ACTIVE', department: 'Engineering', position: 'Site Engineer', createdAt: new Date().toISOString() },
    { id: 's-9', name: 'Rohit Joshi', email: 'rohit@cms.com', role: 'QA_QC_ENGINEER', status: 'INACTIVE', department: 'Quality Assurance', position: 'QA Lead', createdAt: new Date().toISOString() },
    { id: 's-10', name: 'Pooja Gupta', email: 'pooja@cms.com', role: 'MEMBER', status: 'ACTIVE', department: 'Finance', position: 'Accounts Executive', createdAt: new Date().toISOString() },
    { id: 's-11', name: 'Manish Verma', email: 'manish@cms.com', role: 'STORE_KEEPER', status: 'ACTIVE', department: 'Administration', position: 'Store Keeper', createdAt: new Date().toISOString() },
    { id: 's-12', name: 'Shalini Iyer', email: 'shalini@cms.com', role: 'MEMBER', status: 'ACTIVE', department: 'HR', position: 'Recruiter', createdAt: new Date().toISOString() },
  ]

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setEmpLoading(true)
      const res = await globalThis.fetch('/api/team')
      if (res.ok) {
        const d = await res.json()
        const data = d.data || d || []
        setEmployees(data.length > 0 ? data : SAMPLE_EMPLOYEES)
      } else {
        setEmployees(SAMPLE_EMPLOYEES)
      }
    } catch {
      setEmployees(SAMPLE_EMPLOYEES)
    } finally {
      setEmpLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Generate attendance & payroll from employees
  useEffect(() => {
    if (employees.length > 0) {
      setAttendanceRecords(generateAttendanceRecords(employees))
      setPayrollRecords(generatePayrollRecords(employees))
      setPayrollLoading(false)
    }
  }, [employees])

  // ========================
  // Employee Management Computed
  // ========================
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch = !empSearch || e.name?.toLowerCase().includes(empSearch.toLowerCase()) || e.email?.toLowerCase().includes(empSearch.toLowerCase())
      const matchRole = empRoleFilter === 'all' || e.role === empRoleFilter
      const matchStatus = empStatusFilter === 'all' || e.status === empStatusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [employees, empSearch, empRoleFilter, empStatusFilter])

  const employeeStats = useMemo(() => {
    const total = employees.length
    const active = employees.filter((e) => e.status === 'ACTIVE').length
    const depts = new Set(employees.map((e) => e.department).filter(Boolean))
    const thisMonth = employees.filter((e) => {
      const d = new Date(e.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    return { total, active, departments: depts.size, newThisMonth: thisMonth }
  }, [employees])

  const uniqueRoles = useMemo(() => {
    return [...new Set(employees.map((e) => e.role).filter(Boolean))]
  }, [employees])

  const handleAddEmployee = async () => {
    if (!newEmp.name || !newEmp.email) {
      toast.error('Name and email are required')
      return
    }
    try {
      const res = await globalThis.fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEmp, password: 'password' }),
      })
      if (res.ok) {
        toast.success('Employee added successfully')
        setAddDialogOpen(false)
        setNewEmp({ name: '', email: '', role: 'MEMBER', department: '', position: '', phone: '' })
        fetchEmployees()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to add employee')
      }
    } catch {
      toast.error('Failed to add employee')
    }
  }

  const handleEditRole = async () => {
    if (!selectedEmployee) return
    try {
      const res = await globalThis.fetch(`/api/team`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedEmployee.id, role: newEmp.role }),
      })
      if (res.ok) {
        toast.success('Role updated successfully')
        setEditDialogOpen(false)
        fetchEmployees()
      } else {
        toast.error('Failed to update role')
      }
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleToggleStatus = (emp: User) => {
    const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    toast.success(`${emp.name} ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`)
  }

  // ========================
  // Attendance Computed
  // ========================
  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const todayAttendance = useMemo(() => {
    return attendanceRecords.filter((r) => r.date === todayStr)
  }, [attendanceRecords, todayStr])

  const filteredAttendance = useMemo(() => {
    let records = attendanceRecords
    if (attDateFilter === 'today') records = records.filter((r) => r.date === todayStr)
    if (attSearch) records = records.filter((r) => r.employeeName.toLowerCase().includes(attSearch.toLowerCase()))
    if (attStatusFilter !== 'all') records = records.filter((r) => r.status === attStatusFilter)
    return records
  }, [attendanceRecords, attDateFilter, attSearch, attStatusFilter, todayStr])

  const attendanceStats = useMemo(() => {
    const present = todayAttendance.filter((r) => r.status === 'Present' || r.status === 'Late').length
    const absent = todayAttendance.filter((r) => r.status === 'Absent').length
    const late = todayAttendance.filter((r) => r.status === 'Late').length
    const presentRecs = todayAttendance.filter((r) => r.status === 'Present')
    const avgHours = presentRecs.length > 0 ? (presentRecs.reduce((s, r) => s + r.hoursWorked, 0) / presentRecs.length).toFixed(1) : '0'
    return { present, absent, late, avgHours }
  }, [todayAttendance])

  const dailyAttendanceCounts = useMemo(() => {
    const counts: Record<string, { present: number; absent: number; total: number }> = {}
    attendanceRecords.forEach((r) => {
      if (!counts[r.date]) counts[r.date] = { present: 0, absent: 0, total: 0 }
      counts[r.date].total++
      if (r.status === 'Present' || r.status === 'Late' || r.status === 'Half-day') counts[r.date].present++
      if (r.status === 'Absent') counts[r.date].absent++
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
  }, [attendanceRecords])

  const maxAttendanceCount = useMemo(() => {
    return Math.max(...dailyAttendanceCounts.map(([, v]) => v.total), 1)
  }, [dailyAttendanceCounts])

  // ========================
  // Payroll Computed
  // ========================
  const filteredPayroll = useMemo(() => {
    return payrollRecords
  }, [payrollRecords])

  const payrollStats = useMemo(() => {
    const total = payrollRecords.reduce((s, r) => s + r.netPay, 0)
    const avg = payrollRecords.length > 0 ? Math.round(total / payrollRecords.length) : 0
    const pending = payrollRecords.filter((r) => r.status === 'Pending').reduce((s, r) => s + r.netPay, 0)
    const taxDeductions = payrollRecords.reduce((s, r) => s + r.deductions, 0)
    return { total, avg, pending, taxDeductions }
  }, [payrollRecords])

  const payrollCategoryBreakdown = useMemo(() => {
    const totalBase = payrollRecords.reduce((s, r) => s + r.baseSalary, 0)
    const totalAllow = payrollRecords.reduce((s, r) => s + r.allowances, 0)
    const totalDeduct = payrollRecords.reduce((s, r) => s + r.deductions, 0)
    const totalNet = payrollRecords.reduce((s, r) => s + r.netPay, 0)
    return [
      { label: 'Base Salary', amount: totalBase, color: 'bg-amber-500' },
      { label: 'Allowances', amount: totalAllow, color: 'bg-emerald-500' },
      { label: 'Deductions', amount: totalDeduct, color: 'bg-red-400' },
      { label: 'Net Pay', amount: totalNet, color: 'bg-orange-500' },
    ]
  }, [payrollRecords])

  // ========================
  // Recruitment Computed
// ========================
  const filteredApplications = useMemo(() => {
    return APPLICATIONS.filter((a) => appStatusFilter === 'all' || a.status === appStatusFilter)
  }, [appStatusFilter])

  const recruitmentStats = useMemo(() => {
    const openPos = JOB_POSTINGS.filter((j) => j.status === 'Open').length
    const totalApps = JOB_POSTINGS.reduce((s, j) => s + j.applicants, 0)
    const interviews = APPLICATIONS.filter((a) => a.status === 'Interview').length
    const offers = APPLICATIONS.filter((a) => a.status === 'Offer').length
    return { openPos, totalApps, interviews, offers }
  }, [])

  const handlePostJob = () => {
    if (!newJob.title || !newJob.department) {
      toast.error('Title and department are required')
      return
    }
    toast.success(`Job "${newJob.title}" posted successfully`)
    setJobDialogOpen(false)
    setNewJob({ title: '', department: '', type: 'Full-time', description: '', requirements: '' })
  }

  // ========================
  // Formatters
  // ========================
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // ========================
  // Render: Employee Management
  // ========================
  const renderEmployeeManagement = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={employeeStats.total} trend="+3 this month" trendUp />
        <StatCard icon={UserCheck} label="Active" value={employeeStats.active} />
        <StatCard icon={Building2} label="Departments" value={employeeStats.departments} />
        <StatCard icon={UserPlus} label="New This Month" value={employeeStats.newThisMonth} trend="+2 vs last month" trendUp />
      </div>

      {/* Search/Filter + Add */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name or email..." value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={empRoleFilter} onValueChange={setEmpRoleFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filter role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((r) => <SelectItem key={r} value={r}>{getRoleLabel(r)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={empStatusFilter} onValueChange={setEmpStatusFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20 shrink-0">
          <Plus className="h-4 w-4 mr-2" />Add Employee
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
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Role</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Department</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Position</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {empSearch ? 'No employees match your search' : 'No employees found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <TableRow key={emp.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                {getInitials(emp.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{emp.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{emp.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{emp.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className={cn('text-xs', getRoleBadgeClass(emp.role))}>
                            {getRoleLabel(emp.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{emp.department || '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{emp.position || '-'}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', emp.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
                          )}>
                            {emp.status === 'ACTIVE' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedEmployee(emp); setNewEmp({ ...newEmp, role: emp.role, name: emp.name || '', email: emp.email || '', department: emp.department || '', position: emp.position || '', phone: '' }); setEditDialogOpen(true) }}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className={cn('h-8 w-8', emp.status === 'ACTIVE' ? 'text-red-500 hover:text-red-700' : 'text-emerald-500 hover:text-emerald-700')} onClick={() => handleToggleStatus(emp)}>
                              {emp.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Fill in the details to add a new team member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Enter full name" value={newEmp.name} onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="Enter email address" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newEmp.role} onValueChange={(v) => setNewEmp({ ...newEmp, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Team Member</SelectItem>
                  <SelectItem value="MANAGER">Project Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
                  <SelectItem value="SITE_ENGINEER">Site Engineer</SelectItem>
                  <SelectItem value="SITE_MANAGER">Site Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={newEmp.department} onValueChange={(v) => setNewEmp({ ...newEmp, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input placeholder="Enter job title" value={newEmp.position} onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="Enter phone number" value={newEmp.phone} onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee Role</DialogTitle>
            <DialogDescription>Change role for {selectedEmployee?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newEmp.role} onValueChange={(v) => setNewEmp({ ...newEmp, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Team Member</SelectItem>
                  <SelectItem value="MANAGER">Project Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
                  <SelectItem value="SITE_ENGINEER">Site Engineer</SelectItem>
                  <SelectItem value="SITE_MANAGER">Site Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditRole} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )

  // ========================
  // Render: Attendance
  // ========================
  const renderAttendance = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Present Today" value={attendanceStats.present} trend="+2 vs yesterday" trendUp />
        <StatCard icon={XCircle} label="Absent Today" value={attendanceStats.absent} />
        <StatCard icon={Clock} label="Late Today" value={attendanceStats.late} />
        <StatCard icon={BarChart3} label="Avg Hours" value={`${attendanceStats.avgHours}h`} />
      </div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search employee..." value={attSearch} onChange={(e) => setAttSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={attDateFilter} onValueChange={setAttDateFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="all">All Records</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
            {filteredAttendance.length} records
          </Badge>
        </div>
      </motion.div>

      {/* Daily Attendance Table */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              {attDateFilter === 'today' ? "Today's Attendance" : 'All Attendance Records'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Check-in</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Check-out</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Hours</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.slice(0, 20).map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                {getInitials(rec.employeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{rec.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{rec.date}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{rec.checkIn}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{rec.checkOut}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{rec.hoursWorked > 0 ? `${rec.hoursWorked}h` : '-'}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', ATTENDANCE_STATUS_COLORS[rec.status])}>
                            {rec.status === 'Present' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {rec.status === 'Absent' && <XCircle className="h-3 w-3 mr-1" />}
                            {rec.status === 'Late' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {rec.status}
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

      {/* Monthly Report - Bar Chart */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Monthly Attendance Report (Last 14 Working Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyAttendanceCounts.map(([date, counts]) => {
                const presentPct = (counts.present / maxAttendanceCount) * 100
                const absentPct = (counts.absent / maxAttendanceCount) * 100
                const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 text-right">{dayLabel}</span>
                    <div className="flex-1 flex h-6 rounded-md overflow-hidden bg-muted/30">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${presentPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="bg-emerald-500 h-full"
                        title={`Present: ${counts.present}`}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${absentPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                        className="bg-red-400 h-full"
                        title={`Absent: ${counts.absent}`}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground w-20 shrink-0">
                      <span className="text-emerald-600 font-medium">{counts.present}</span>
                      <span>/</span>
                      <span className="text-red-500 font-medium">{counts.absent}</span>
                      <span>/</span>
                      <span className="font-medium">{counts.total}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-muted-foreground">Present</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-400" /><span className="text-xs text-muted-foreground">Absent</span></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )

  // ========================
  // Render: Payroll
  // ========================
  const renderPayroll = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Payroll" value={formatCurrency(payrollStats.total)} />
        <StatCard icon={TrendingUp} label="Average Salary" value={formatCurrency(payrollStats.avg)} />
        <StatCard icon={Clock} label="Pending Payments" value={formatCurrency(payrollStats.pending)} />
        <StatCard icon={FileText} label="Tax Deductions" value={formatCurrency(payrollStats.taxDeductions)} />
      </div>

      {/* Actions */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Month:</Label>
          <Input type="month" value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)} className="w-44" />
        </div>
        <Button onClick={() => setPayrollDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20">
          <FileText className="h-4 w-4 mr-2" />Generate Payroll
        </Button>
      </motion.div>

      {/* Payroll Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Base Salary</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Allowances</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Deductions</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Pay</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredPayroll.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payroll records</TableCell>
                    </TableRow>
                  ) : (
                    filteredPayroll.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                {getInitials(rec.employeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{rec.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{formatCurrency(rec.baseSalary)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-emerald-600">+{formatCurrency(rec.allowances)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-red-500">-{formatCurrency(rec.deductions)}</TableCell>
                        <TableCell className="text-sm font-semibold">{formatCurrency(rec.netPay)}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', PAYROLL_STATUS_COLORS[rec.status])}>
                            {rec.status === 'Paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {rec.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                            {rec.status === 'Processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {rec.status}
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

      {/* Payroll Category Breakdown */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-amber-500" />
              Monthly Payroll Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payrollCategoryBreakdown.map((cat) => {
                const maxAmount = Math.max(...payrollCategoryBreakdown.map((c) => c.amount), 1)
                return (
                  <div key={cat.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{cat.label}</span>
                      <span className="font-semibold">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.amount / maxAmount) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', cat.color)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generate Payroll Dialog */}
      <Dialog open={payrollDialogOpen} onOpenChange={setPayrollDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
            <DialogDescription>Generate payroll for the selected month for all active employees.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Payroll Month</Label>
              <Input type="month" value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)} />
            </div>
            <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
              <p className="text-sm font-medium">Summary</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Active Employees:</span>
                <span className="font-medium">{employeeStats.active}</span>
                <span className="text-muted-foreground">Est. Total:</span>
                <span className="font-medium">{formatCurrency(payrollStats.total)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayrollDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success('Payroll generated successfully'); setPayrollDialogOpen(false) }} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )

  // ========================
  // Render: Recruitment
  // ========================
  const renderRecruitment = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Open Positions" value={recruitmentStats.openPos} />
        <StatCard icon={Users} label="Total Applications" value={recruitmentStats.totalApps} />
        <StatCard icon={Eye} label="Interviews Scheduled" value={recruitmentStats.interviews} />
        <StatCard icon={CheckCircle2} label="Offers Extended" value={recruitmentStats.offers} />
      </div>

      {/* Job Postings */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-amber-500" />
            Job Postings
          </h3>
          <Button onClick={() => setJobDialogOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20">
            <Plus className="h-4 w-4 mr-2" />Post Job
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOB_POSTINGS.map((job) => (
            <motion.div key={job.id} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">{job.title}</h4>
                      <p className="text-xs text-muted-foreground">{job.department} &middot; {job.type}</p>
                    </div>
                    <Badge className={cn('text-xs', JOB_STATUS_COLORS[job.status])}>{job.status}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{job.applicants} applicants</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{job.postedDate}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Applications */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-amber-500" />
            Applications
          </h3>
          <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Screening">Screening</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidate</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Position</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Applied Date</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No applications found</TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                {getInitials(app.candidateName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{app.candidateName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{app.position}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{app.email}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{app.appliedDate}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', APPLICATION_STATUS_COLORS[app.status])}>{app.status}</Badge>
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

      {/* Post Job Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
            <DialogDescription>Create a new job posting to attract candidates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input placeholder="Enter job title" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={newJob.department} onValueChange={(v) => setNewJob({ ...newJob, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={newJob.type} onValueChange={(v) => setNewJob({ ...newJob, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Job description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePostJob} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Post Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )

  // ========================
  // Main Render
  // ========================
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HR Management</h1>
          <p className="text-sm text-muted-foreground">Manage employees, attendance, payroll, and recruitment</p>
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

        <TabsContent value="employees">{renderEmployeeManagement()}</TabsContent>
        <TabsContent value="attendance">{renderAttendance()}</TabsContent>
        <TabsContent value="payroll">{renderPayroll()}</TabsContent>
        <TabsContent value="recruitment">{renderRecruitment()}</TabsContent>
      </Tabs>
    </div>
  )
}

function PieChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  )
}