'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Warehouse, PackageCheck, ArrowDownToLine, FileBarChart, Plus, Search, Filter,
  Package, AlertTriangle, CheckCircle2, Clock, DollarSign, TrendingDown,
  TrendingUp, Eye, Edit3, MoreHorizontal, X, ArrowUpRight, ArrowDownRight,
  BarChart3, ShieldCheck, ShieldX, Inbox, ArrowRight, Users, Layers,
  Ban, CircleDot, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ========================
// Types
// ========================
interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  stockQty: number
  reorderLevel: number
  unitCost: number
  supplier?: string
  project?: string
}

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

interface MaterialRequest {
  id: string
  requestNo: string
  item: string
  quantity: number
  unit: string
  requestedBy: string
  project: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'Approved' | 'Fulfilled' | 'Rejected'
  date: string
}

interface GoodsReceipt {
  id: string
  grvNumber: string
  poReference: string
  supplier: string
  itemsCount: number
  totalValue: number
  status: 'Draft' | 'Quality Checked' | 'Verified' | 'Rejected'
  date: string
}

interface StockMovement {
  id: string
  item: string
  type: 'In' | 'Out'
  quantity: number
  unit: string
  date: string
  reference: string
  by: string
}

// ========================
// Sample Data
// ========================
const SAMPLE_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'TMT Steel Bars (12mm)', category: 'Steel', unit: 'MT', stockQty: 50, reorderLevel: 20, unitCost: 52000, supplier: 'Kumar Steel Traders', project: 'Skyline Tower' },
  { id: 'i2', name: 'TMT Steel Bars (16mm)', category: 'Steel', unit: 'MT', stockQty: 8, reorderLevel: 15, unitCost: 54500, supplier: 'Kumar Steel Traders', project: 'Skyline Tower' },
  { id: 'i3', name: 'OPC Cement (43 Grade)', category: 'Cement', unit: 'Bags', stockQty: 2000, reorderLevel: 500, unitCost: 380, supplier: 'Patel Cement Works', project: 'Green Valley Residency' },
  { id: 'i4', name: 'M-Sand', category: 'Aggregates', unit: 'Cubic M', stockQty: 30, reorderLevel: 50, unitCost: 1200, supplier: 'Singh Aggregates', project: 'Metro Bridge Project' },
  { id: 'i5', name: 'Electrical Cable (3-core 4mm)', category: 'Electrical', unit: 'Meters', stockQty: 5000, reorderLevel: 1000, unitCost: 85, supplier: 'Sharma Electricals', project: 'Skyline Tower' },
  { id: 'i6', name: 'PVC Pipes (110mm)', category: 'Plumbing', unit: 'Nos', stockQty: 300, reorderLevel: 100, unitCost: 450, supplier: 'Desai Plumbing Solutions', project: 'Green Valley Residency' },
  { id: 'i7', name: 'Plywood (18mm BWR)', category: 'Timber', unit: 'Sheets', stockQty: 12, reorderLevel: 30, unitCost: 1850, supplier: 'Nair Timber & Plywood', project: 'Skyline Tower' },
  { id: 'i8', name: 'Toughened Glass (10mm)', category: 'Glass', unit: 'Sqft', stockQty: 0, reorderLevel: 500, unitCost: 280, supplier: 'Iyer Glass & Aluminium', project: 'Skyline Tower' },
  { id: 'i9', name: 'Safety Helmets', category: 'Safety', unit: 'Nos', stockQty: 150, reorderLevel: 50, unitCost: 350, supplier: 'Gupta Safety Equipments', project: 'Metro Bridge Project' },
  { id: 'i10', name: 'Bricks (Red Clay)', category: 'Bricks', unit: 'Nos', stockQty: 50000, reorderLevel: 10000, unitCost: 8, supplier: 'Singh Aggregates', project: 'Green Valley Residency' },
  { id: 'i11', name: 'Angular Bar (50x50x6mm)', category: 'Steel', unit: 'MT', stockQty: 15, reorderLevel: 10, unitCost: 58000, supplier: 'Kumar Steel Traders', project: 'Metro Bridge Project' },
  { id: 'i12', name: 'Binding Wire', category: 'Steel', unit: 'KG', stockQty: 25, reorderLevel: 50, unitCost: 65, supplier: 'Kumar Steel Traders', project: 'Skyline Tower' },
]

const SAMPLE_REQUESTS: MaterialRequest[] = [
  { id: 'mr1', requestNo: 'MR-2024-001', item: 'TMT Steel Bars (12mm)', quantity: 20, unit: 'MT', requestedBy: 'Amit Sharma', project: 'Skyline Tower', priority: 'High', status: 'Pending', date: '2024-02-10' },
  { id: 'mr2', requestNo: 'MR-2024-002', item: 'OPC Cement (43 Grade)', quantity: 500, unit: 'Bags', requestedBy: 'Vikram Singh', project: 'Green Valley Residency', priority: 'High', status: 'Approved', date: '2024-02-09' },
  { id: 'mr3', requestNo: 'MR-2024-003', item: 'PVC Pipes (110mm)', quantity: 100, unit: 'Nos', requestedBy: 'Priya Desai', project: 'Green Valley Residency', priority: 'Medium', status: 'Fulfilled', date: '2024-02-08' },
  { id: 'mr4', requestNo: 'MR-2024-004', item: 'Electrical Cable (3-core 4mm)', quantity: 2000, unit: 'Meters', requestedBy: 'Amit Sharma', project: 'Skyline Tower', priority: 'Medium', status: 'Pending', date: '2024-02-11' },
  { id: 'mr5', requestNo: 'MR-2024-005', item: 'Plywood (18mm BWR)', quantity: 50, unit: 'Sheets', requestedBy: 'Neha Joshi', project: 'Skyline Tower', priority: 'High', status: 'Approved', date: '2024-02-07' },
  { id: 'mr6', requestNo: 'MR-2024-006', item: 'Safety Helmets', quantity: 80, unit: 'Nos', requestedBy: 'Deepak Gupta', project: 'Metro Bridge Project', priority: 'Low', status: 'Fulfilled', date: '2024-02-05' },
  { id: 'mr7', requestNo: 'MR-2024-007', item: 'M-Sand', quantity: 100, unit: 'Cubic M', requestedBy: 'Arjun Reddy', project: 'Metro Bridge Project', priority: 'High', status: 'Pending', date: '2024-02-12' },
  { id: 'mr8', requestNo: 'MR-2024-008', item: 'Binding Wire', quantity: 100, unit: 'KG', requestedBy: 'Amit Sharma', project: 'Skyline Tower', priority: 'Medium', status: 'Rejected', date: '2024-02-06' },
  { id: 'mr9', requestNo: 'MR-2024-009', item: 'Toughened Glass (10mm)', quantity: 1000, unit: 'Sqft', requestedBy: 'Meera Iyer', project: 'Skyline Tower', priority: 'High', status: 'Pending', date: '2024-02-13' },
  { id: 'mr10', requestNo: 'MR-2024-010', item: 'Bricks (Red Clay)', quantity: 20000, unit: 'Nos', requestedBy: 'Vikram Singh', project: 'Green Valley Residency', priority: 'Medium', status: 'Approved', date: '2024-02-04' },
  { id: 'mr11', requestNo: 'MR-2024-011', item: 'Angular Bar (50x50x6mm)', quantity: 10, unit: 'MT', requestedBy: 'Arjun Reddy', project: 'Metro Bridge Project', priority: 'Medium', status: 'Fulfilled', date: '2024-02-03' },
  { id: 'mr12', requestNo: 'MR-2024-012', item: 'TMT Steel Bars (16mm)', quantity: 15, unit: 'MT', requestedBy: 'Amit Sharma', project: 'Skyline Tower', priority: 'High', status: 'Pending', date: '2024-02-14' },
]

const SAMPLE_GRV: GoodsReceipt[] = [
  { id: 'grv1', grvNumber: 'GRV-2024-001', poReference: 'PO-2024-001', supplier: 'Kumar Steel Traders', itemsCount: 12, totalValue: 485000, status: 'Verified', date: '2024-02-10' },
  { id: 'grv2', grvNumber: 'GRV-2024-002', poReference: 'PO-2024-002', supplier: 'Patel Cement Works', itemsCount: 8, totalValue: 320000, status: 'Quality Checked', date: '2024-02-11' },
  { id: 'grv3', grvNumber: 'GRV-2024-003', poReference: 'PO-2024-005', supplier: 'Nair Timber & Plywood', itemsCount: 10, totalValue: 156000, status: 'Verified', date: '2024-02-08' },
  { id: 'grv4', grvNumber: 'GRV-2024-004', poReference: 'PO-2024-007', supplier: 'Gupta Safety Equipments', itemsCount: 25, totalValue: 67000, status: 'Draft', date: '2024-02-12' },
  { id: 'grv5', grvNumber: 'GRV-2024-005', poReference: 'PO-2024-006', supplier: 'Iyer Glass & Aluminium', itemsCount: 20, totalValue: 890000, status: 'Draft', date: '2024-02-13' },
  { id: 'grv6', grvNumber: 'GRV-2024-006', poReference: 'PO-2024-008', supplier: 'Desai Plumbing Solutions', itemsCount: 18, totalValue: 210000, status: 'Rejected', date: '2024-02-09' },
  { id: 'grv7', grvNumber: 'GRV-2024-007', poReference: 'PO-2024-003', supplier: 'Sharma Electricals', itemsCount: 15, totalValue: 195000, status: 'Quality Checked', date: '2024-02-14' },
]

const SAMPLE_MOVEMENTS: StockMovement[] = [
  { id: 'sm1', item: 'TMT Steel Bars (12mm)', type: 'In', quantity: 20, unit: 'MT', date: '2024-02-14', reference: 'GRV-2024-001', by: 'Store Keeper' },
  { id: 'sm2', item: 'OPC Cement (43 Grade)', type: 'Out', quantity: 200, unit: 'Bags', date: '2024-02-14', reference: 'MR-2024-002', by: 'Vikram Singh' },
  { id: 'sm3', item: 'PVC Pipes (110mm)', type: 'In', quantity: 100, unit: 'Nos', date: '2024-02-13', reference: 'GRV-2024-002', by: 'Store Keeper' },
  { id: 'sm4', item: 'Electrical Cable (3-core 4mm)', type: 'Out', quantity: 500, unit: 'Meters', date: '2024-02-13', reference: 'MR-2024-004', by: 'Amit Sharma' },
  { id: 'sm5', item: 'Safety Helmets', type: 'In', quantity: 80, unit: 'Nos', date: '2024-02-12', reference: 'GRV-2024-004', by: 'Store Keeper' },
  { id: 'sm6', item: 'M-Sand', type: 'Out', quantity: 50, unit: 'Cubic M', date: '2024-02-12', reference: 'MR-2024-007', by: 'Arjun Reddy' },
  { id: 'sm7', item: 'Plywood (18mm BWR)', type: 'In', quantity: 50, unit: 'Sheets', date: '2024-02-11', reference: 'GRV-2024-003', by: 'Store Keeper' },
  { id: 'sm8', item: 'Bricks (Red Clay)', type: 'Out', quantity: 5000, unit: 'Nos', date: '2024-02-11', reference: 'MR-2024-010', by: 'Vikram Singh' },
  { id: 'sm9', item: 'Angular Bar (50x50x6mm)', type: 'In', quantity: 10, unit: 'MT', date: '2024-02-10', reference: 'PO-2024-008', by: 'Store Keeper' },
  { id: 'sm10', item: 'TMT Steel Bars (12mm)', type: 'Out', quantity: 5, unit: 'MT', date: '2024-02-10', reference: 'MR-2024-001', by: 'Amit Sharma' },
]

// Weekly consumption data (for bar chart)
const WEEKLY_CONSUMPTION = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 62 },
  { day: 'Wed', value: 38 },
  { day: 'Thu', value: 55 },
  { day: 'Fri', value: 70 },
  { day: 'Sat', value: 28 },
  { day: 'Sun', value: 12 },
]

// ========================
// Helpers
// ========================
function getStockStatus(item: InventoryItem): StockStatus {
  if (item.stockQty === 0) return 'Out of Stock'
  if (item.stockQty <= item.reorderLevel) return 'Low Stock'
  return 'In Stock'
}

function stockStatusBadge(status: StockStatus) {
  const map: Record<StockStatus, string> = {
    'In Stock': 'border-green-300 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Low Stock': 'border-amber-300 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Out of Stock': 'border-red-300 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  return map[status]
}

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    High: 'border-red-300 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    Medium: 'border-amber-300 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Low: 'border-green-300 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  }
  return map[priority] || ''
}

function requestStatusBadge(status: string) {
  const map: Record<string, string> = {
    Pending: 'border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    Approved: 'border-blue-300 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Fulfilled: 'border-green-300 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Rejected: 'border-red-300 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  return map[status] || ''
}

function grvStatusBadge(status: string) {
  const map: Record<string, string> = {
    Draft: 'border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    'Quality Checked': 'border-blue-300 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Verified: 'border-green-300 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Rejected: 'border-red-300 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  return map[status] || ''
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// ========================
// Stat Card
// ========================
function StatCard({ icon: Icon, label, value, trend, trendUp, subtitle }: { icon: React.ElementType; label: string; value: string | number; trend?: string; trendUp?: boolean; subtitle?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <div className="flex items-center gap-1">
                  {trendUp ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                  <span className={cn('text-xs font-medium', trendUp ? 'text-green-500' : 'text-red-500')}>{trend}</span>
                </div>
              )}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========================
// Animation Variants
// ========================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
)

// ========================
// Add Stock Dialog
// ========================
function AddStockDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ item: '', quantity: '', unitCost: '', reference: '', notes: '' })
  const handleSave = () => {
    if (!form.item || !form.quantity) { toast.error('Item and quantity are required'); return }
    toast.success(`Stock added: ${form.quantity} units of ${form.item}`)
    setForm({ item: '', quantity: '', unitCost: '', reference: '', notes: '' })
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add Stock</DialogTitle><DialogDescription>Record incoming stock</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2"><Label>Item Name *</Label><Input placeholder="Material name" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Quantity *</Label><Input type="number" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="space-y-2"><Label>Unit Cost (₹)</Label><Input type="number" placeholder="0" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Reference (PO/GRV No)</Label><Input placeholder="e.g. PO-2024-001" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
          <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Add Stock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// Issue Material Dialog
// ========================
function IssueMaterialDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ item: '', quantity: '', requestedBy: '', project: '', reference: '' })
  const handleSave = () => {
    if (!form.item || !form.quantity) { toast.error('Item and quantity are required'); return }
    toast.success(`Material issued: ${form.quantity} units of ${form.item}`)
    setForm({ item: '', quantity: '', requestedBy: '', project: '', reference: '' })
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Issue Material</DialogTitle><DialogDescription>Record material issuance from store</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2"><Label>Item Name *</Label><Input placeholder="Material name" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Quantity *</Label><Input type="number" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={form.project} onValueChange={(v) => setForm({ ...form, project: v })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Skyline Tower">Skyline Tower</SelectItem>
                  <SelectItem value="Green Valley Residency">Green Valley Residency</SelectItem>
                  <SelectItem value="Metro Bridge Project">Metro Bridge Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Requested By</Label><Input placeholder="Name" value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} /></div>
            <div className="space-y-2"><Label>Reference (MR No)</Label><Input placeholder="e.g. MR-2024-001" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Issue Material</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// Create Material Request Dialog
// ========================
function CreateRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ item: '', quantity: '', unit: '', project: '', priority: 'Medium', reason: '' })
  const handleSave = () => {
    if (!form.item || !form.quantity) { toast.error('Item and quantity are required'); return }
    toast.success(`Material request created for ${form.item}`)
    setForm({ item: '', quantity: '', unit: '', project: '', priority: 'Medium', reason: '' })
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Create Material Request</DialogTitle><DialogDescription>Submit a new material request</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2"><Label>Item Name *</Label><Input placeholder="Material name" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Quantity *</Label><Input type="number" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="space-y-2"><Label>Unit</Label><Input placeholder="e.g. MT, Nos" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={form.project} onValueChange={(v) => setForm({ ...form, project: v })}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Skyline Tower">Skyline Tower</SelectItem>
                <SelectItem value="Green Valley Residency">Green Valley Residency</SelectItem>
                <SelectItem value="Metro Bridge Project">Metro Bridge Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Reason / Justification</Label><Textarea placeholder="Why is this material needed?" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// Receive Goods Dialog
// ========================
function ReceiveGoodsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ poReference: '', supplier: '', itemsCount: '', totalValue: '', notes: '' })
  const handleSave = () => {
    if (!form.poReference || !form.supplier) { toast.error('PO Reference and Supplier are required'); return }
    toast.success(`Goods receipt created for ${form.supplier}`)
    setForm({ poReference: '', supplier: '', itemsCount: '', totalValue: '', notes: '' })
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Receive Goods (GRV)</DialogTitle><DialogDescription>Create a new Goods Receipt Voucher</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>PO Reference *</Label><Input placeholder="e.g. PO-2024-001" value={form.poReference} onChange={(e) => setForm({ ...form, poReference: e.target.value })} /></div>
            <div className="space-y-2"><Label>Supplier *</Label><Input placeholder="Supplier name" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Items Count</Label><Input type="number" placeholder="0" value={form.itemsCount} onChange={(e) => setForm({ ...form, itemsCount: e.target.value })} /></div>
            <div className="space-y-2"><Label>Total Value (₹)</Label><Input type="number" placeholder="0" value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Challan details, condition, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Create GRV</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// Main Component
// ========================
const TABS = [
  { id: 'inventory', label: 'Inventory Management', icon: Warehouse },
  { id: 'material-request', label: 'Material Request', icon: PackageCheck },
  { id: 'goods-receipt', label: 'Goods Receipt', icon: ArrowDownToLine },
  { id: 'stock-reports', label: 'Stock Reports', icon: FileBarChart },
]

export function StorePanel() {
  const [activeTab, setActiveTab] = useState('inventory')

  // ========================
  // Inventory State
  // ========================
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [invLoading, setInvLoading] = useState(true)
  const [invSearch, setInvSearch] = useState('')
  const [invStatusFilter, setInvStatusFilter] = useState('all')
  const [invCategoryFilter, setInvCategoryFilter] = useState('all')
  const [addStockOpen, setAddStockOpen] = useState(false)
  const [issueStockOpen, setIssueStockOpen] = useState(false)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('/api/materials')
        if (res.ok) {
          const data = await res.json()
          const mapped = (Array.isArray(data) ? data : data.data || data.materials || []).map((m: Record<string, unknown>) => ({
            id: m.id || String(Math.random()),
            name: m.name || m.materialName || 'Unknown',
            category: m.category || 'General',
            unit: m.unit || m.unitOfMeasure || 'Nos',
            stockQty: Number(m.quantity || m.stockQty || 0),
            reorderLevel: Number(m.reorderLevel || 0),
            unitCost: Number(m.unitCost || m.unitPrice || 0),
            supplier: m.supplier || m.supplierName || '',
            project: m.project || m.projectName || '',
          }))
          setInventory(mapped.length > 0 ? mapped : SAMPLE_INVENTORY)
        } else {
          setInventory(SAMPLE_INVENTORY)
        }
      } catch {
        setInventory(SAMPLE_INVENTORY)
      } finally {
        setInvLoading(false)
      }
    }
    fetchInventory()
  }, [])

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const status = getStockStatus(item)
      const matchSearch = !invSearch || item.name.toLowerCase().includes(invSearch.toLowerCase())
      const matchStatus = invStatusFilter === 'all' || status === invStatusFilter
      const matchCategory = invCategoryFilter === 'all' || item.category === invCategoryFilter
      return matchSearch && matchStatus && matchCategory
    })
  }, [inventory, invSearch, invStatusFilter, invCategoryFilter])

  const categories = useMemo(() => {
    return [...new Set(inventory.map((i) => i.category))].sort()
  }, [inventory])

  const invStats = useMemo(() => {
    const inStock = inventory.filter((i) => getStockStatus(i) === 'In Stock').length
    const lowStock = inventory.filter((i) => getStockStatus(i) === 'Low Stock').length
    const totalValue = inventory.reduce((s, i) => s + i.stockQty * i.unitCost, 0)
    return { total: inventory.length, inStock, lowStock, totalValue }
  }, [inventory])

  const categorySummary = useMemo(() => {
    const catMap = new Map<string, { items: number; totalValue: number; totalCost: number }>()
    inventory.forEach((item) => {
      const existing = catMap.get(item.category) || { items: 0, totalValue: 0, totalCost: 0 }
      existing.items += 1
      existing.totalValue += item.stockQty * item.unitCost
      existing.totalCost += item.unitCost
      catMap.set(item.category, existing)
    })
    return Array.from(catMap.entries()).map(([category, data]) => ({
      category,
      items: data.items,
      totalValue: data.totalValue,
      avgUnitCost: data.items > 0 ? Math.round(data.totalCost / data.items) : 0,
    }))
  }, [inventory])

  // ========================
  // Material Requests State
  // ========================
  const [requests] = useState<MaterialRequest[]>(SAMPLE_REQUESTS)
  const [reqSearch, setReqSearch] = useState('')
  const [reqStatusFilter, setReqStatusFilter] = useState('all')
  const [reqPriorityFilter, setReqPriorityFilter] = useState('all')
  const [createReqOpen, setCreateReqOpen] = useState(false)

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch = !reqSearch || r.item.toLowerCase().includes(reqSearch.toLowerCase()) || r.requestNo.toLowerCase().includes(reqSearch.toLowerCase())
      const matchStatus = reqStatusFilter === 'all' || r.status === reqStatusFilter
      const matchPriority = reqPriorityFilter === 'all' || r.priority === reqPriorityFilter
      return matchSearch && matchStatus && matchPriority
    })
  }, [requests, reqSearch, reqStatusFilter, reqPriorityFilter])

  const reqStats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'Pending').length
    const approved = requests.filter((r) => r.status === 'Approved').length
    const fulfilled = requests.filter((r) => r.status === 'Fulfilled').length
    return { total: requests.length, pending, approved, fulfilled }
  }, [requests])

  const handleApproveReject = useCallback((id: string, action: 'approve' | 'reject') => {
    toast.success(action === 'approve' ? 'Request approved' : 'Request rejected')
  }, [])

  // ========================
  // Goods Receipt State
  // ========================
  const [grv, setGrv] = useState<GoodsReceipt[]>([])
  const [grvLoading, setGrvLoading] = useState(true)
  const [grvStatusFilter, setGrvStatusFilter] = useState('all')
  const [grvSearch, setGrvSearch] = useState('')
  const [receiveGoodsOpen, setReceiveGoodsOpen] = useState(false)

  useEffect(() => {
    const fetchGRV = async () => {
      try {
        const res = await fetch('/api/grv')
        if (res.ok) {
          const data = await res.json()
          const mapped = (Array.isArray(data) ? data : data.data || data.grvVouchers || []).map((g: Record<string, unknown>) => ({
            id: g.id || String(Math.random()),
            grvNumber: g.grvNumber || g.grv_no || 'GRV-000',
            poReference: g.poReference || g.po_reference || 'N/A',
            supplier: g.supplier || g.supplierName || 'N/A',
            itemsCount: Number(g.itemsCount || g.items_count || 0),
            totalValue: Number(g.totalValue || g.total_value || 0),
            status: g.status || 'Draft',
            date: g.date || g.created_at || '',
          }))
          setGrv(mapped.length > 0 ? mapped : SAMPLE_GRV)
        } else {
          setGrv(SAMPLE_GRV)
        }
      } catch {
        setGrv(SAMPLE_GRV)
      } finally {
        setGrvLoading(false)
      }
    }
    fetchGRV()
  }, [])

  const filteredGRV = useMemo(() => {
    return grv.filter((g) => {
      const matchStatus = grvStatusFilter === 'all' || g.status === grvStatusFilter
      const matchSearch = !grvSearch || g.grvNumber.toLowerCase().includes(grvSearch.toLowerCase()) || g.supplier.toLowerCase().includes(grvSearch.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [grv, grvStatusFilter, grvSearch])

  const grvStats = useMemo(() => {
    const pendingQC = grv.filter((g) => g.status === 'Draft').length
    const verified = grv.filter((g) => g.status === 'Verified').length
    const rejected = grv.filter((g) => g.status === 'Rejected').length
    return { total: grv.length, pendingQC, verified, rejected }
  }, [grv])

  // ========================
  // Stock Reports computed data
  // ========================
  const reportStats = useMemo(() => {
    const totalStockValue = inventory.reduce((s, i) => s + i.stockQty * i.unitCost, 0)
    const consumedThisMonth = SAMPLE_MOVEMENTS.filter((m) => m.type === 'Out').reduce((s, m) => s + m.quantity, 0)
    const receivedThisMonth = SAMPLE_MOVEMENTS.filter((m) => m.type === 'In').reduce((s, m) => s + m.quantity, 0)
    const wastagePercent = 2.4
    return { totalStockValue, consumedThisMonth, receivedThisMonth, wastagePercent }
  }, [inventory])

  const reorderAlerts = useMemo(() => {
    return inventory.filter((i) => i.stockQty <= i.reorderLevel).sort((a, b) => (a.stockQty / a.reorderLevel) - (b.stockQty / b.reorderLevel))
  }, [inventory])

  const maxConsumption = useMemo(() => Math.max(...WEEKLY_CONSUMPTION.map((d) => d.value)), [])

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <Warehouse className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Management</h1>
          <p className="text-sm text-muted-foreground">Manage inventory, material requests, and goods receipt</p>
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

        {/* ============ INVENTORY TAB ============ */}
        <TabsContent value="inventory" className="space-y-6 mt-6">
          {invLoading ? <LoadingSkeleton /> : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Layers} label="Total Items" value={invStats.total} />
                <StatCard icon={CheckCircle2} label="In Stock" value={invStats.inStock} subtitle={`${Math.round((invStats.inStock / Math.max(invStats.total, 1)) * 100)}% of items`} />
                <StatCard icon={AlertTriangle} label="Low Stock" value={invStats.lowStock} trend={invStats.lowStock > 0 ? `${invStats.lowStock} items` : undefined} trendUp={false} />
                <StatCard icon={DollarSign} label="Total Value" value={formatCurrency(invStats.totalValue)} />
              </div>

              {/* Category Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categorySummary.map((cat) => (
                  <motion.div key={cat.category} variants={itemVariants} initial="hidden" animate="visible">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{cat.category}</p>
                        <div className="flex items-end justify-between mt-2">
                          <div>
                            <p className="text-lg font-bold">{cat.items}</p>
                            <p className="text-xs text-muted-foreground">items</p>
                          </div>
                          <p className="text-sm font-semibold text-amber-600">{formatCurrency(cat.totalValue)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Search/Filter + Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search items..." value={invSearch} onChange={(e) => setInvSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={invStatusFilter} onValueChange={setInvStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Stock Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={invCategoryFilter} onValueChange={setInvCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={() => setAddStockOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-1" /> Add Stock
                  </Button>
                  <Button onClick={() => setIssueStockOpen(true)} variant="outline" className="whitespace-nowrap">
                    <ArrowUpRight className="h-4 w-4 mr-1" /> Issue
                  </Button>
                </div>
              </div>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">Item Name</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Category</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Unit</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Stock Qty</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden lg:table-cell">Reorder Level</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Unit Cost</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Stock Value</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredInventory.map((item, i) => {
                            const status = getStockStatus(item)
                            const stockPct = item.reorderLevel > 0 ? Math.min((item.stockQty / (item.reorderLevel * 2)) * 100, 100) : 100
                            return (
                              <motion.tr key={item.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" transition={{ delay: i * 0.03 }} className="border-b hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium text-sm">{item.name}</TableCell>
                                <TableCell className="hidden md:table-cell"><Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">{item.category}</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">{item.unit}</TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <span className="text-sm font-medium">{item.stockQty.toLocaleString()}</span>
                                    <Progress value={stockPct} className="h-1.5 w-16" />
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{item.reorderLevel.toLocaleString()}</TableCell>
                                <TableCell className="text-sm">{formatCurrency(item.unitCost)}</TableCell>
                                <TableCell className="hidden sm:table-cell text-sm font-medium">{formatCurrency(item.stockQty * item.unitCost)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs font-medium border', stockStatusBadge(status))}>
                                    {status === 'Low Stock' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                    {status === 'Out of Stock' && <X className="h-3 w-3 mr-1" />}
                                    {status === 'In Stock' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                    {status}
                                  </Badge>
                                </TableCell>
                              </motion.tr>
                            )
                          })}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          <AddStockDialog open={addStockOpen} onOpenChange={setAddStockOpen} />
          <IssueMaterialDialog open={issueStockOpen} onOpenChange={setIssueStockOpen} />
        </TabsContent>

        {/* ============ MATERIAL REQUESTS TAB ============ */}
        <TabsContent value="material-request" className="space-y-6 mt-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={PackageCheck} label="Total Requests" value={reqStats.total} />
              <StatCard icon={Clock} label="Pending" value={reqStats.pending} trend="Needs attention" trendUp={false} />
              <StatCard icon={CheckCircle2} label="Approved" value={reqStats.approved} />
              <StatCard icon={Inbox} label="Fulfilled" value={reqStats.fulfilled} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by item or request number..." value={reqSearch} onChange={(e) => setReqSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={reqStatusFilter} onValueChange={setReqStatusFilter}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reqPriorityFilter} onValueChange={setReqPriorityFilter}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setCreateReqOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white whitespace-nowrap">
                <Plus className="h-4 w-4 mr-1" /> Create Request
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="max-h-[480px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs uppercase tracking-wider">Request No</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Qty</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Requested By</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider hidden lg:table-cell">Project</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Priority</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredRequests.map((r, i) => (
                          <motion.tr key={r.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" transition={{ delay: i * 0.03 }} className="border-b hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium text-sm">{r.requestNo}</TableCell>
                            <TableCell className="text-sm">{r.item}</TableCell>
                            <TableCell className="text-sm font-medium">{r.quantity.toLocaleString()} {r.unit}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.requestedBy}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{r.project}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs font-medium border', priorityBadge(r.priority))}>
                                {r.priority === 'High' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {r.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs font-medium border', requestStatusBadge(r.status))}>{r.status}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.date}</TableCell>
                            <TableCell className="text-right">
                              {r.status === 'Pending' ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={() => handleApproveReject(r.id, 'approve')}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleApproveReject(r.id, 'reject')}>
                                    <Ban className="h-3.5 w-3.5 mr-1" /> Reject
                                  </Button>
                                </div>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                                    {r.status === 'Approved' && <DropdownMenuItem onClick={() => toast.success('Request marked as fulfilled')}>Mark Fulfilled</DropdownMenuItem>}
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
          </motion.div>
          <CreateRequestDialog open={createReqOpen} onOpenChange={setCreateReqOpen} />
        </TabsContent>

        {/* ============ GOODS RECEIPT TAB ============ */}
        <TabsContent value="goods-receipt" className="space-y-6 mt-6">
          {grvLoading ? <LoadingSkeleton /> : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Inbox} label="Total Receipts" value={grvStats.total} />
                <StatCard icon={Clock} label="Pending QC" value={grvStats.pendingQC} trend="Action needed" trendUp={false} />
                <StatCard icon={ShieldCheck} label="Verified" value={grvStats.verified} />
                <StatCard icon={ShieldX} label="Rejected" value={grvStats.rejected} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by GRV number or supplier..." value={grvSearch} onChange={(e) => setGrvSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={grvStatusFilter} onValueChange={setGrvStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Quality Checked">Quality Checked</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setReceiveGoodsOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-1" /> Receive Goods
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">GRV Number</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">PO Reference</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Supplier</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Items</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Total Value</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredGRV.map((g, i) => (
                            <motion.tr key={g.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" transition={{ delay: i * 0.03 }} className="border-b hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium text-sm">{g.grvNumber}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{g.poReference}</TableCell>
                              <TableCell className="text-sm">{g.supplier}</TableCell>
                              <TableCell className="hidden sm:table-cell text-sm">{g.itemsCount}</TableCell>
                              <TableCell className="text-sm font-medium">{formatCurrency(g.totalValue)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs font-medium border', grvStatusBadge(g.status))}>{g.status}</Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{g.date}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                                    {g.status === 'Draft' && (
                                      <DropdownMenuItem onClick={() => toast.success('Quality check initiated')}><ShieldCheck className="h-4 w-4 mr-2" />Quality Check</DropdownMenuItem>
                                    )}
                                    {g.status === 'Quality Checked' && (
                                      <DropdownMenuItem onClick={() => toast.success('GRV verified')}><CheckCircle2 className="h-4 w-4 mr-2" />Verify</DropdownMenuItem>
                                    )}
                                    {g.status === 'Draft' && (
                                      <DropdownMenuItem className="text-red-600" onClick={() => toast.error('GRV rejected')}><ShieldX className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          <ReceiveGoodsDialog open={receiveGoodsOpen} onOpenChange={setReceiveGoodsOpen} />
        </TabsContent>

        {/* ============ STOCK REPORTS TAB ============ */}
        <TabsContent value="stock-reports" className="space-y-6 mt-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={DollarSign} label="Total Stock Value" value={formatCurrency(reportStats.totalStockValue)} />
              <StatCard icon={ArrowDownRight} label="Consumed This Month" value={`${reportStats.consumedThisMonth.toLocaleString()} units`} trend={`${Math.round((reportStats.consumedThisMonth / Math.max(reportStats.consumedThisMonth + reportStats.receivedThisMonth, 1)) * 100)}% of movement`} trendUp={false} />
              <StatCard icon={ArrowDownToLine} label="Received This Month" value={`${reportStats.receivedThisMonth.toLocaleString()} units`} trend={"+15% vs last month"} trendUp />
              <StatCard icon={TrendingDown} label="Wastage %" value={`${reportStats.wastagePercent}%`} trend={reportStats.wastagePercent > 2 ? 'Above target' : 'On target'} trendUp={reportStats.wastagePercent <= 2} />
            </div>

            {/* Consumption Trend Bar Chart (div-based) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  Weekly Consumption Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {WEEKLY_CONSUMPTION.map((d, i) => (
                    <motion.div
                      key={d.day}
                      className="flex-1 flex flex-col items-center gap-2"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      style={{ transformOrigin: 'bottom' }}
                    >
                      <span className="text-xs font-medium text-muted-foreground">{d.value}</span>
                      <div className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-orange-400 shadow-sm shadow-amber-500/30 transition-all hover:from-amber-600 hover:to-orange-500 min-h-[8px]"
                        style={{ height: `${(d.value / maxConsumption) * 140}px` }}
                      />
                      <span className="text-xs font-medium text-muted-foreground">{d.day}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category-wise Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-500" />
                    Category-wise Stock Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">Category</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-center">Items</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-right">Total Value</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-right hidden sm:table-cell">Avg Unit Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categorySummary.map((cat, i) => (
                          <motion.tr key={cat.category} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }} className="border-b hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                                {cat.category}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-sm">{cat.items}</TableCell>
                            <TableCell className="text-right text-sm font-medium">{formatCurrency(cat.totalValue)}</TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">{formatCurrency(cat.avgUnitCost)}</TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Reorder Alerts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Reorder Alerts
                    <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5 text-xs">{reorderAlerts.length} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-center">Current</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-center">Reorder Lvl</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-right">Deficit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reorderAlerts.map((item, i) => {
                          const deficit = item.reorderLevel - item.stockQty
                          return (
                            <motion.tr key={item.id} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }} className={cn('border-b hover:bg-muted/50 transition-colors', item.stockQty === 0 && 'bg-red-50 dark:bg-red-950/20')}>
                              <TableCell className="text-sm font-medium">{item.name}</TableCell>
                              <TableCell className="text-center text-sm font-medium">{item.stockQty.toLocaleString()} {item.unit}</TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">{item.reorderLevel.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-sm font-medium text-red-600 dark:text-red-400">
                                {deficit > 0 ? `-${deficit.toLocaleString()}` : 'At level'}
                              </TableCell>
                            </motion.tr>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stock Movement Log */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-amber-500" />
                  Recent Stock Movement Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-center">Type</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-center">Quantity</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Reference</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider hidden lg:table-cell">By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {SAMPLE_MOVEMENTS.map((m, i) => (
                          <motion.tr key={m.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" transition={{ delay: i * 0.03 }} className="border-b hover:bg-muted/50 transition-colors">
                            <TableCell className="text-sm text-muted-foreground">{m.date}</TableCell>
                            <TableCell className="text-sm font-medium">{m.item}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={cn(
                                'rounded-full px-2 py-0.5 text-xs font-medium border',
                                m.type === 'In'
                                  ? 'border-green-300 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'border-red-300 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              )}>
                                {m.type === 'In' ? <ArrowDownToLine className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1" />}
                                Stock {m.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-sm font-medium">{m.quantity.toLocaleString()} {m.unit}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{m.reference}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{m.by}</TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}