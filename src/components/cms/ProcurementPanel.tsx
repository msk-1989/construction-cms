'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Truck, Package, FileText, ArrowUpDown, Plus, Search, Filter,
  Star, Phone, Mail, Building2, X, TrendingUp, Users, CheckCircle2, Clock,
  DollarSign, AlertTriangle, Eye, Edit3, MoreHorizontal, Loader2, ChevronDown,
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
interface Vendor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  type: string
  speciality: string
  rating: number
  gst?: string
  pan?: string
  status?: string
}

interface PurchaseOrder {
  id: string
  poNumber: string
  vendor: string
  project: string
  amount: number
  status: 'Draft' | 'Submitted' | 'Approved' | 'Issued' | 'Closed'
  deliveryDate: string
  items?: number
}

interface Material {
  id: string
  name: string
  unit: string
  quantity: number
  unitCost: number
  status: 'Planned' | 'Ordered' | 'Delivered' | 'Installed'
  supplier: string
  project: string
  category?: string
  reorderLevel?: number
}

interface Quotation {
  id: string
  referenceNo: string
  vendor: string
  title: string
  subtotal: number
  tax: number
  total: number
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
  validUntil: string
}

interface ComparisonItem {
  id: string
  materialName: string
  vendors: {
    vendor: string
    unitRate: number
    quantity: number
    amount: number
    deliveryTime: string
    rating: number
  }[]
}

// ========================
// Sample Data
// ========================
const SAMPLE_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Rajesh Kumar', company: 'Kumar Steel Traders', email: 'rajesh@kumarsteel.com', phone: '+91 98765 43210', type: 'Material Supplier', speciality: 'Structural Steel', rating: 4.5, gst: '27AAACK1234A1Z5', pan: 'AAACK1234A', status: 'Active' },
  { id: 'v2', name: 'Suresh Patel', company: 'Patel Cement Works', email: 'suresh@patelcement.com', phone: '+91 87654 32109', type: 'Material Supplier', speciality: 'Cement & Concrete', rating: 4.2, gst: '24AABCP5678B2Z3', pan: 'AABCP5678B', status: 'Active' },
  { id: 'v3', name: 'Amit Sharma', company: 'Sharma Electricals', email: 'amit@sharmaelec.com', phone: '+91 76543 21098', type: 'Subcontractor', speciality: 'Electrical Work', rating: 4.8, gst: '06AABCS9012C3Z1', pan: 'AABCS9012C', status: 'Active' },
  { id: 'v4', name: 'Priya Desai', company: 'Desai Plumbing Solutions', email: 'priya@desaiplumb.com', phone: '+91 65432 10987', type: 'Subcontractor', speciality: 'Plumbing & Sanitary', rating: 3.9, gst: '27AABCD3456D4Z2', pan: 'AABCD3456D', status: 'Active' },
  { id: 'v5', name: 'Vikram Singh', company: 'Singh Aggregates', email: 'vikram@singhagg.com', phone: '+91 54321 09876', type: 'Material Supplier', speciality: 'Aggregates & Sand', rating: 4.0, gst: '09AABCS7890E5Z8', pan: 'AABCS7890E', status: 'Active' },
  { id: 'v6', name: 'Neha Joshi', company: 'Joshi Interior Works', email: 'neha@joshiinterior.com', phone: '+91 43210 98765', type: 'Subcontractor', speciality: 'Interior Finishing', rating: 4.7, gst: '27AABCJ1234F6Z9', pan: 'AABCJ1234F', status: 'Active' },
  { id: 'v7', name: 'Arjun Reddy', company: 'Reddy Earthworks', email: 'arjun@reddyearth.com', phone: '+91 32109 87654', type: 'Subcontractor', speciality: 'Excavation & Earthwork', rating: 3.5, gst: '36AABCR5678G7Z6', pan: 'AABCR5678G', status: 'Inactive' },
  { id: 'v8', name: 'Kavita Nair', company: 'Nair Timber & Plywood', email: 'kavita@nairtimber.com', phone: '+91 21098 76543', type: 'Material Supplier', speciality: 'Timber & Plywood', rating: 4.3, gst: '32AABCN9012H8Z4', pan: 'AABCN9012H', status: 'Active' },
  { id: 'v9', name: 'Deepak Gupta', company: 'Gupta Safety Equipments', email: 'deepak@guptasafety.com', phone: '+91 10987 65432', type: 'Material Supplier', speciality: 'Safety Equipment', rating: 4.1, gst: '10AABCG3456I9Z3', pan: 'AABCG3456I', status: 'Active' },
  { id: 'v10', name: 'Meera Iyer', company: 'Iyer Glass & Aluminium', email: 'meera@iyerglass.com', phone: '+91 99887 76655', type: 'Material Supplier', speciality: 'Glass & Aluminium', rating: 4.6, gst: '29AABCI7890J0Z7', pan: 'AABCI7890J', status: 'Active' },
]

const SAMPLE_POS: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-2024-001', vendor: 'Kumar Steel Traders', project: 'Skyline Tower', amount: 485000, status: 'Approved', deliveryDate: '2024-02-15', items: 12 },
  { id: 'po2', poNumber: 'PO-2024-002', vendor: 'Patel Cement Works', project: 'Green Valley Residency', amount: 320000, status: 'Issued', deliveryDate: '2024-02-10', items: 8 },
  { id: 'po3', poNumber: 'PO-2024-003', vendor: 'Sharma Electricals', project: 'Skyline Tower', amount: 195000, status: 'Submitted', deliveryDate: '2024-02-20', items: 15 },
  { id: 'po4', poNumber: 'PO-2024-004', vendor: 'Singh Aggregates', project: 'Metro Bridge Project', amount: 275000, status: 'Draft', deliveryDate: '2024-02-25', items: 6 },
  { id: 'po5', poNumber: 'PO-2024-005', vendor: 'Nair Timber & Plywood', project: 'Green Valley Residency', amount: 156000, status: 'Closed', deliveryDate: '2024-01-28', items: 10 },
  { id: 'po6', poNumber: 'PO-2024-006', vendor: 'Iyer Glass & Aluminium', project: 'Skyline Tower', amount: 890000, status: 'Approved', deliveryDate: '2024-03-01', items: 20 },
  { id: 'po7', poNumber: 'PO-2024-007', vendor: 'Gupta Safety Equipments', project: 'Metro Bridge Project', amount: 67000, status: 'Submitted', deliveryDate: '2024-02-18', items: 25 },
  { id: 'po8', poNumber: 'PO-2024-008', vendor: 'Desai Plumbing Solutions', project: 'Green Valley Residency', amount: 210000, status: 'Issued', deliveryDate: '2024-02-12', items: 18 },
]

const SAMPLE_MATERIALS: Material[] = [
  { id: 'm1', name: 'TMT Steel Bars (12mm)', unit: 'MT', quantity: 50, unitCost: 52000, status: 'Delivered', supplier: 'Kumar Steel Traders', project: 'Skyline Tower', category: 'Steel', reorderLevel: 20 },
  { id: 'm2', name: 'OPC Cement (43 Grade)', unit: 'Bags', quantity: 2000, unitCost: 380, status: 'Ordered', supplier: 'Patel Cement Works', project: 'Green Valley Residency', category: 'Cement', reorderLevel: 500 },
  { id: 'm3', name: 'M-Sand', unit: 'Cubic M', quantity: 150, unitCost: 1200, status: 'Planned', supplier: 'Singh Aggregates', project: 'Metro Bridge Project', category: 'Aggregates', reorderLevel: 50 },
  { id: 'm4', name: 'Electrical Cable (3-core 4mm)', unit: 'Meters', quantity: 5000, unitCost: 85, status: 'Delivered', supplier: 'Sharma Electricals', project: 'Skyline Tower', category: 'Electrical', reorderLevel: 1000 },
  { id: 'm5', name: 'PVC Pipes (110mm)', unit: 'Nos', quantity: 300, unitCost: 450, status: 'Installed', supplier: 'Desai Plumbing Solutions', project: 'Green Valley Residency', category: 'Plumbing', reorderLevel: 100 },
  { id: 'm6', name: 'Plywood (18mm BWR)', unit: 'Sheets', quantity: 80, unitCost: 1850, status: 'Ordered', supplier: 'Nair Timber & Plywood', project: 'Skyline Tower', category: 'Timber', reorderLevel: 30 },
  { id: 'm7', name: 'Toughened Glass (10mm)', unit: 'Sqft', quantity: 2000, unitCost: 280, status: 'Planned', supplier: 'Iyer Glass & Aluminium', project: 'Skyline Tower', category: 'Glass', reorderLevel: 500 },
  { id: 'm8', name: 'Safety Helmets', unit: 'Nos', quantity: 150, unitCost: 350, status: 'Delivered', supplier: 'Gupta Safety Equipments', project: 'Metro Bridge Project', category: 'Safety', reorderLevel: 50 },
  { id: 'm9', name: 'Bricks (Red Clay)', unit: 'Nos', quantity: 50000, unitCost: 8, status: 'Delivered', supplier: 'Singh Aggregates', project: 'Green Valley Residency', category: 'Bricks', reorderLevel: 10000 },
  { id: 'm10', name: 'Angular Bar (50x50x6mm)', unit: 'MT', quantity: 15, unitCost: 58000, status: 'Ordered', supplier: 'Kumar Steel Traders', project: 'Metro Bridge Project', category: 'Steel', reorderLevel: 10 },
]

const SAMPLE_QUOTATIONS: Quotation[] = [
  { id: 'q1', referenceNo: 'QT-2024-001', vendor: 'Kumar Steel Traders', title: 'Steel Supply - Phase 2', subtotal: 460000, tax: 82800, total: 542800, status: 'Approved', validUntil: '2024-02-28' },
  { id: 'q2', referenceNo: 'QT-2024-002', vendor: 'Patel Cement Works', title: 'Bulk Cement Supply Q1', subtotal: 295000, tax: 53100, total: 348100, status: 'Submitted', validUntil: '2024-02-20' },
  { id: 'q3', referenceNo: 'QT-2024-003', vendor: 'Sharma Electricals', title: 'Electrical Fittings & Cables', subtotal: 178000, tax: 32040, total: 210040, status: 'Draft', validUntil: '2024-03-15' },
  { id: 'q4', referenceNo: 'QT-2024-004', vendor: 'Nair Timber & Plywood', title: 'Plywood & Timber Order', subtotal: 142000, tax: 25560, total: 167560, status: 'Rejected', validUntil: '2024-02-10' },
  { id: 'q5', referenceNo: 'QT-2024-005', vendor: 'Iyer Glass & Aluminium', title: 'Façade Glass Supply', subtotal: 820000, tax: 147600, total: 967600, status: 'Submitted', validUntil: '2024-03-05' },
  { id: 'q6', referenceNo: 'QT-2024-006', vendor: 'Gupta Safety Equipments', title: 'Safety Gear Bulk Order', subtotal: 58000, tax: 10440, total: 68440, status: 'Approved', validUntil: '2024-02-25' },
  { id: 'q7', referenceNo: 'QT-2024-007', vendor: 'Singh Aggregates', title: 'Aggregates Supply - March', subtotal: 260000, tax: 46800, total: 306800, status: 'Draft', validUntil: '2024-03-10' },
]

const SAMPLE_COMPARISONS: ComparisonItem[] = [
  {
    id: 'c1',
    materialName: 'TMT Steel Bars (12mm)',
    vendors: [
      { vendor: 'Kumar Steel Traders', unitRate: 52000, quantity: 50, amount: 2600000, deliveryTime: '7 days', rating: 4.5 },
      { vendor: 'Singh Steel Corp', unitRate: 50800, quantity: 50, amount: 2540000, deliveryTime: '10 days', rating: 4.0 },
      { vendor: 'Patel Iron Works', unitRate: 53500, quantity: 50, amount: 2675000, deliveryTime: '5 days', rating: 3.8 },
    ],
  },
  {
    id: 'c2',
    materialName: 'OPC Cement (43 Grade)',
    vendors: [
      { vendor: 'Patel Cement Works', unitRate: 380, quantity: 2000, amount: 760000, deliveryTime: '3 days', rating: 4.2 },
      { vendor: 'UltraTech Direct', unitRate: 395, quantity: 2000, amount: 790000, deliveryTime: '2 days', rating: 4.7 },
      { vendor: 'ACC Supplies', unitRate: 372, quantity: 2000, amount: 744000, deliveryTime: '5 days', rating: 4.3 },
      { vendor: 'Dalmia Cement', unitRate: 388, quantity: 2000, amount: 776000, deliveryTime: '4 days', rating: 4.1 },
    ],
  },
  {
    id: 'c3',
    materialName: 'Toughened Glass (10mm)',
    vendors: [
      { vendor: 'Iyer Glass & Aluminium', unitRate: 280, quantity: 2000, amount: 560000, deliveryTime: '14 days', rating: 4.6 },
      { vendor: 'Saint Gobain Direct', unitRate: 295, quantity: 2000, amount: 590000, deliveryTime: '10 days', rating: 4.8 },
      { vendor: 'AIS Glass Solutions', unitRate: 270, quantity: 2000, amount: 540000, deliveryTime: '18 days', rating: 4.0 },
    ],
  },
]

// ========================
// Status Badge Helpers
// ========================
function poStatusBadge(status: string) {
  const map: Record<string, string> = {
    Draft: 'border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    Submitted: 'border-blue-300 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Approved: 'border-amber-300 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Issued: 'border-green-300 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Closed: 'border-muted-foreground/30 bg-muted text-muted-foreground',
  }
  return map[status] || 'border-muted-foreground/30 bg-muted text-muted-foreground'
}

function materialStatusBadge(status: string) {
  const map: Record<string, string> = {
    Planned: 'border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    Ordered: 'border-blue-300 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Delivered: 'border-green-300 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Installed: 'border-purple-300 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  }
  return map[status] || 'border-muted-foreground/30 bg-muted text-muted-foreground'
}

function quotStatusBadge(status: string) {
  const map: Record<string, string> = {
    Draft: 'border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    Submitted: 'border-blue-300 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Approved: 'border-green-300 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Rejected: 'border-red-300 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  return map[status] || 'border-muted-foreground/30 bg-muted text-muted-foreground'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i <= rating
                ? 'fill-amber-200 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
          )}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// ========================
// Stat Card Component
// ========================
function StatCard({ icon: Icon, label, value, trend, trendUp }: { icon: React.ElementType; label: string; value: string | number; trend?: string; trendUp?: boolean }) {
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
                  <TrendingUp className={cn('h-3 w-3', trendUp ? 'text-green-500' : 'text-red-500')} />
                  <span className={cn('text-xs font-medium', trendUp ? 'text-green-500' : 'text-red-500')}>{trend}</span>
                </div>
              )}
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

// ========================
// Add Vendor Dialog
// ========================
function AddVendorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', type: '', speciality: '', gst: '', pan: '' })

  const handleSave = () => {
    if (!form.name || !form.company) { toast.error('Name and Company are required'); return }
    toast.success(`Vendor "${form.name}" added successfully`)
    setForm({ name: '', company: '', email: '', phone: '', type: '', speciality: '', gst: '', pan: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Vendor</DialogTitle><DialogDescription>Enter vendor details below</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="e.g. Rajesh Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Company *</Label><Input placeholder="e.g. Kumar Steel Traders" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="vendor@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Material Supplier">Material Supplier</SelectItem>
                  <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                  <SelectItem value="Service Provider">Service Provider</SelectItem>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Speciality</Label><Input placeholder="e.g. Structural Steel" value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>GST Number</Label><Input placeholder="e.g. 27AAACK1234A1Z5" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} /></div>
            <div className="space-y-2"><Label>PAN Number</Label><Input placeholder="e.g. AAACK1234A" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Add Vendor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// Create PO Dialog
// ========================
function CreatePODialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ vendor: '', project: '', amount: '', deliveryDate: '', notes: '' })
  const handleSave = () => {
    if (!form.vendor || !form.project) { toast.error('Vendor and Project are required'); return }
    toast.success(`Purchase Order created successfully`)
    setForm({ vendor: '', project: '', amount: '', deliveryDate: '', notes: '' })
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle><DialogDescription>Fill in the purchase order details</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Vendor *</Label>
            <Input placeholder="Select or type vendor name" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={form.project} onValueChange={(v) => setForm({ ...form, project: v })}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Skyline Tower">Skyline Tower</SelectItem>
                <SelectItem value="Green Valley Residency">Green Valley Residency</SelectItem>
                <SelectItem value="Metro Bridge Project">Metro Bridge Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Estimated Amount</Label><Input type="number" placeholder="₹0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="space-y-2"><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Create PO</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// Add Material Dialog
// ========================
function AddMaterialDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ name: '', unit: '', quantity: '', unitCost: '', supplier: '', project: '', category: '' })
  const handleSave = () => {
    if (!form.name || !form.unit) { toast.error('Material name and unit are required'); return }
    toast.success(`Material "${form.name}" added successfully`)
    setForm({ name: '', unit: '', quantity: '', unitCost: '', supplier: '', project: '', category: '' })
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Material</DialogTitle><DialogDescription>Enter material details</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2"><Label>Material Name *</Label><Input placeholder="e.g. TMT Steel Bars (12mm)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Unit *</Label><Input placeholder="e.g. MT, Nos" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="space-y-2"><Label>Unit Cost (₹)</Label><Input type="number" placeholder="0" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Supplier</Label><Input placeholder="Supplier name" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
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
          <div className="space-y-2"><Label>Category</Label><Input placeholder="e.g. Steel, Cement, Electrical" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">Add Material</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// Main Component
// ========================
const TABS = [
  { id: 'vendors', label: 'Vendor Management', icon: Truck },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { id: 'materials', label: 'Material Management', icon: Package },
  { id: 'quotations', label: 'Quotations', icon: FileText },
  { id: 'comparisons', label: 'Comparisons', icon: ArrowUpDown },
]

export function ProcurementPanel() {
  const [activeTab, setActiveTab] = useState('vendors')

  // ========================
  // Vendors State
  // ========================
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorsLoading, setVendorsLoading] = useState(true)
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorTypeFilter, setVendorTypeFilter] = useState('all')
  const [addVendorOpen, setAddVendorOpen] = useState(false)

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch('/api/subcontractors')
        if (res.ok) {
          const data = await res.json()
          const mapped = (Array.isArray(data) ? data : data.data || data.subcontractors || []).map((v: Record<string, unknown>) => ({
            id: v.id || String(Math.random()),
            name: v.name || v.contactName || 'Unknown',
            company: v.company || v.companyName || 'N/A',
            email: v.email || '',
            phone: v.phone || v.mobile || '',
            type: v.type || v.category || 'Material Supplier',
            speciality: v.speciality || v.specialization || v.trade || 'General',
            rating: v.rating || 4.0,
            gst: v.gst || v.gstNumber || '',
            pan: v.pan || v.panNumber || '',
            status: v.status || 'Active',
          }))
          setVendors(mapped.length > 0 ? mapped : SAMPLE_VENDORS)
        } else {
          setVendors(SAMPLE_VENDORS)
        }
      } catch {
        setVendors(SAMPLE_VENDORS)
      } finally {
        setVendorsLoading(false)
      }
    }
    fetchVendors()
  }, [])

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch = !vendorSearch || v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.company.toLowerCase().includes(vendorSearch.toLowerCase())
      const matchType = vendorTypeFilter === 'all' || v.type === vendorTypeFilter
      return matchSearch && matchType
    })
  }, [vendors, vendorSearch, vendorTypeFilter])

  const vendorStats = useMemo(() => {
    const active = vendors.filter((v) => v.status === 'Active').length
    const avgRating = vendors.length > 0 ? (vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1) : '0.0'
    const newThisMonth = 3
    return { total: vendors.length, active, avgRating, newThisMonth }
  }, [vendors])

  // ========================
  // Purchase Orders State
  // ========================
  const [pos, setPos] = useState<PurchaseOrder[]>([])
  const [posLoading, setPosLoading] = useState(true)
  const [poStatusFilter, setPoStatusFilter] = useState('all')
  const [poSearch, setPoSearch] = useState('')
  const [createPOOpen, setCreatePOOpen] = useState(false)

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const res = await fetch('/api/purchase-orders')
        if (res.ok) {
          const data = await res.json()
          const mapped = (Array.isArray(data) ? data : data.data || data.purchaseOrders || []).map((p: Record<string, unknown>) => ({
            id: p.id || String(Math.random()),
            poNumber: p.poNumber || p.po_no || 'PO-000',
            vendor: p.vendor || p.vendorName || 'N/A',
            project: p.project || p.projectName || 'N/A',
            amount: Number(p.amount || p.totalAmount || 0),
            status: p.status || 'Draft',
            deliveryDate: p.deliveryDate || p.delivery_date || '',
            items: p.items || p.itemCount || 0,
          }))
          setPos(mapped.length > 0 ? mapped : SAMPLE_POS)
        } else {
          setPos(SAMPLE_POS)
        }
      } catch {
        setPos(SAMPLE_POS)
      } finally {
        setPosLoading(false)
      }
    }
    fetchPOs()
  }, [])

  const filteredPOs = useMemo(() => {
    return pos.filter((p) => {
      const matchStatus = poStatusFilter === 'all' || p.status === poStatusFilter
      const matchSearch = !poSearch || p.poNumber.toLowerCase().includes(poSearch.toLowerCase()) || p.vendor.toLowerCase().includes(poSearch.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [pos, poStatusFilter, poSearch])

  const poStats = useMemo(() => {
    const pending = pos.filter((p) => p.status === 'Submitted').length
    const approved = pos.filter((p) => p.status === 'Approved').length
    const totalValue = pos.reduce((s, p) => s + p.amount, 0)
    return { total: pos.length, pending, approved, totalValue }
  }, [pos])

  // ========================
  // Materials State
  // ========================
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(true)
  const [matStatusFilter, setMatStatusFilter] = useState('all')
  const [matProjectFilter, setMatProjectFilter] = useState('all')
  const [matSearch, setMatSearch] = useState('')
  const [addMaterialOpen, setAddMaterialOpen] = useState(false)

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch('/api/materials')
        if (res.ok) {
          const data = await res.json()
          const mapped = (Array.isArray(data) ? data : data.data || data.materials || []).map((m: Record<string, unknown>) => ({
            id: m.id || String(Math.random()),
            name: m.name || m.materialName || 'Unknown',
            unit: m.unit || m.unitOfMeasure || 'Nos',
            quantity: Number(m.quantity || m.stockQty || 0),
            unitCost: Number(m.unitCost || m.unitPrice || 0),
            status: m.status || 'Planned',
            supplier: m.supplier || m.supplierName || 'N/A',
            project: m.project || m.projectName || 'N/A',
            category: m.category || 'General',
            reorderLevel: Number(m.reorderLevel || 0),
          }))
          setMaterials(mapped.length > 0 ? mapped : SAMPLE_MATERIALS)
        } else {
          setMaterials(SAMPLE_MATERIALS)
        }
      } catch {
        setMaterials(SAMPLE_MATERIALS)
      } finally {
        setMaterialsLoading(false)
      }
    }
    fetchMaterials()
  }, [])

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchStatus = matStatusFilter === 'all' || m.status === matStatusFilter
      const matchProject = matProjectFilter === 'all' || m.project === matProjectFilter
      const matchSearch = !matSearch || m.name.toLowerCase().includes(matSearch.toLowerCase())
      return matchStatus && matchProject && matchSearch
    })
  }, [materials, matStatusFilter, matProjectFilter, matSearch])

  const lowStockItems = useMemo(() => {
    return materials.filter((m) => m.reorderLevel && m.quantity <= m.reorderLevel)
  }, [materials])

  const materialStats = useMemo(() => {
    const ordered = materials.filter((m) => m.status === 'Ordered').length
    const delivered = materials.filter((m) => m.status === 'Delivered' || m.status === 'Installed').length
    const totalValue = materials.reduce((s, m) => s + m.quantity * m.unitCost, 0)
    return { total: materials.length, ordered, delivered, totalValue }
  }, [materials])

  // ========================
  // Quotations State
  // ========================
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [quotLoading, setQuotLoading] = useState(true)
  const [quotStatusFilter, setQuotStatusFilter] = useState('all')
  const [quotSearch, setQuotSearch] = useState('')

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await fetch('/api/quotations')
        if (res.ok) {
          const data = await res.json()
          const mapped = (Array.isArray(data) ? data : data.data || data.quotations || []).map((q: Record<string, unknown>) => ({
            id: q.id || String(Math.random()),
            referenceNo: q.referenceNo || q.reference_no || 'QT-000',
            vendor: q.vendor || q.vendorName || 'N/A',
            title: q.title || q.description || 'Untitled',
            subtotal: Number(q.subtotal || q.subTotal || 0),
            tax: Number(q.tax || q.taxAmount || 0),
            total: Number(q.total || q.totalAmount || q.grandTotal || 0),
            status: q.status || 'Draft',
            validUntil: q.validUntil || q.valid_until || '',
          }))
          setQuotations(mapped.length > 0 ? mapped : SAMPLE_QUOTATIONS)
        } else {
          setQuotations(SAMPLE_QUOTATIONS)
        }
      } catch {
        setQuotations(SAMPLE_QUOTATIONS)
      } finally {
        setQuotLoading(false)
      }
    }
    fetchQuotations()
  }, [])

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchStatus = quotStatusFilter === 'all' || q.status === quotStatusFilter
      const matchSearch = !quotSearch || q.referenceNo.toLowerCase().includes(quotSearch.toLowerCase()) || q.vendor.toLowerCase().includes(quotSearch.toLowerCase()) || q.title.toLowerCase().includes(quotSearch.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [quotations, quotStatusFilter, quotSearch])

  const quotStats = useMemo(() => {
    const pending = quotations.filter((q) => q.status === 'Submitted').length
    const approved = quotations.filter((q) => q.status === 'Approved').length
    const totalValue = quotations.reduce((s, q) => s + q.total, 0)
    return { total: quotations.length, pending, approved, totalValue }
  }, [quotations])

  // ========================
  // Comparisons State
  // ========================
  const [selectedComparison, setSelectedComparison] = useState(SAMPLE_COMPARISONS[0]?.id || '')

  const selectedCompData = useMemo(() => {
    return SAMPLE_COMPARISONS.find((c) => c.id === selectedComparison) || SAMPLE_COMPARISONS[0]
  }, [selectedComparison])

  const minPrice = useMemo(() => {
    if (!selectedCompData) return 0
    return Math.min(...selectedCompData.vendors.map((v) => v.amount))
  }, [selectedCompData])

  // ========================
  // Render Helpers
  // ========================
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
  // Render Tabs Content
  // ========================
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <ShoppingCart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Procurement</h1>
          <p className="text-sm text-muted-foreground">Manage vendors, purchase orders, and materials</p>
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

        {/* ============ VENDORS TAB ============ */}
        <TabsContent value="vendors" className="space-y-6 mt-6">
          {vendorsLoading ? <LoadingSkeleton /> : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Vendors" value={vendorStats.total} trend="+2 this month" trendUp />
                <StatCard icon={CheckCircle2} label="Active" value={vendorStats.active} />
                <StatCard icon={Star} label="Avg Rating" value={vendorStats.avgRating} />
                <StatCard icon={Clock} label="New This Month" value={vendorStats.newThisMonth} trend="+3" trendUp />
              </div>

              {/* Search/Filter + Add */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search vendors by name or company..." value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={vendorTypeFilter} onValueChange={setVendorTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Material Supplier">Material Supplier</SelectItem>
                    <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="Service Provider">Service Provider</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setAddVendorOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-1" /> Add Vendor
                </Button>
              </div>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Company</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Type</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden lg:table-cell">Speciality</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Rating</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Phone</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredVendors.map((v, i) => (
                            <motion.tr key={v.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" transition={{ delay: i * 0.03 }} className="border-b hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium text-sm">{v.name}</TableCell>
                              <TableCell className="text-sm flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{v.company}</TableCell>
                              <TableCell className="hidden md:table-cell"><Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs font-medium">{v.type}</Badge></TableCell>
                              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{v.speciality}</TableCell>
                              <TableCell><StarRating rating={v.rating} /></TableCell>
                              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{v.phone}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                                    <DropdownMenuItem><Edit3 className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                    <DropdownMenuItem><Mail className="h-4 w-4 mr-2" />Send Email</DropdownMenuItem>
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
          <AddVendorDialog open={addVendorOpen} onOpenChange={setAddVendorOpen} />
        </TabsContent>

        {/* ============ PURCHASE ORDERS TAB ============ */}
        <TabsContent value="purchase-orders" className="space-y-6 mt-6">
          {posLoading ? <LoadingSkeleton /> : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Total POs" value={poStats.total} trend="+3 this week" trendUp />
                <StatCard icon={Clock} label="Pending Approval" value={poStats.pending} />
                <StatCard icon={CheckCircle2} label="Approved" value={poStats.approved} trend="+2" trendUp />
                <StatCard icon={DollarSign} label="Total Value" value={formatCurrency(poStats.totalValue)} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by PO number or vendor..." value={poSearch} onChange={(e) => setPoSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={poStatusFilter} onValueChange={setPoStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Issued">Issued</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setCreatePOOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-1" /> Create PO
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">PO Number</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Vendor</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Project</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Amount</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Delivery</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredPOs.map((p, i) => (
                            <motion.tr key={p.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" transition={{ delay: i * 0.03 }} className="border-b hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium text-sm">{p.poNumber}</TableCell>
                              <TableCell className="text-sm">{p.vendor}</TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{p.project}</TableCell>
                              <TableCell className="font-medium text-sm">{formatCurrency(p.amount)}</TableCell>
                              <TableCell><Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs font-medium border', poStatusBadge(p.status))}>{p.status}</Badge></TableCell>
                              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{p.deliveryDate}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                                    <DropdownMenuItem><Edit3 className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                    {p.status === 'Draft' && <DropdownMenuItem onClick={() => toast.info('PO submitted')}>Submit</DropdownMenuItem>}
                                    {p.status === 'Submitted' && <DropdownMenuItem onClick={() => toast.success('PO approved')}>Approve</DropdownMenuItem>}
                                    {p.status === 'Approved' && <DropdownMenuItem onClick={() => toast.success('PO issued')}>Issue</DropdownMenuItem>}
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
          <CreatePODialog open={createPOOpen} onOpenChange={setCreatePOOpen} />
        </TabsContent>

        {/* ============ MATERIALS TAB ============ */}
        <TabsContent value="materials" className="space-y-6 mt-6">
          {materialsLoading ? <LoadingSkeleton /> : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              {/* Low Stock Alerts */}
              {lowStockItems.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Low Stock Alert — {lowStockItems.length} item(s) at or below reorder level</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {lowStockItems.map((m) => (
                          <Badge key={m.id} variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400">
                            {m.name}: {m.quantity} {m.unit} (Reorder: {m.reorderLevel})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Package} label="Total Items" value={materialStats.total} />
                <StatCard icon={Clock} label="Ordered" value={materialStats.ordered} />
                <StatCard icon={CheckCircle2} label="Delivered" value={materialStats.delivered} />
                <StatCard icon={DollarSign} label="Total Value" value={formatCurrency(materialStats.totalValue)} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search materials..." value={matSearch} onChange={(e) => setMatSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={matStatusFilter} onValueChange={setMatStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="Ordered">Ordered</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Installed">Installed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={matProjectFilter} onValueChange={setMatProjectFilter}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Project" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="Skyline Tower">Skyline Tower</SelectItem>
                    <SelectItem value="Green Valley Residency">Green Valley Residency</SelectItem>
                    <SelectItem value="Metro Bridge Project">Metro Bridge Project</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setAddMaterialOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-1" /> Add Material
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">Material Name</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Unit</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Qty</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Unit Cost</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Total</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden lg:table-cell">Supplier</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Project</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredMaterials.map((m, i) => (
                            <motion.tr key={m.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" transition={{ delay: i * 0.03 }} className="border-b hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium text-sm">{m.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{m.unit}</TableCell>
                              <TableCell className="text-sm font-medium">{m.quantity.toLocaleString()}</TableCell>
                              <TableCell className="text-sm">{formatCurrency(m.unitCost)}</TableCell>
                              <TableCell className="hidden sm:table-cell text-sm font-medium">{formatCurrency(m.quantity * m.unitCost)}</TableCell>
                              <TableCell><Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs font-medium border', materialStatusBadge(m.status))}>{m.status}</Badge></TableCell>
                              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{m.supplier}</TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{m.project}</TableCell>
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
          <AddMaterialDialog open={addMaterialOpen} onOpenChange={setAddMaterialOpen} />
        </TabsContent>

        {/* ============ QUOTATIONS TAB ============ */}
        <TabsContent value="quotations" className="space-y-6 mt-6">
          {quotLoading ? <LoadingSkeleton /> : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Total Quotations" value={quotStats.total} />
                <StatCard icon={Clock} label="Pending" value={quotStats.pending} />
                <StatCard icon={CheckCircle2} label="Approved" value={quotStats.approved} />
                <StatCard icon={DollarSign} label="Total Value" value={formatCurrency(quotStats.totalValue)} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by reference, vendor, or title..." value={quotSearch} onChange={(e) => setQuotSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={quotStatusFilter} onValueChange={setQuotStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">Reference</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Vendor</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Title</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Subtotal</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Tax</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider font-bold">Total</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden lg:table-cell">Valid Until</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredQuotations.map((q, i) => (
                            <motion.tr key={q.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" transition={{ delay: i * 0.03 }} className="border-b hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium text-sm">{q.referenceNo}</TableCell>
                              <TableCell className="text-sm">{q.vendor}</TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{q.title}</TableCell>
                              <TableCell className="text-sm">{formatCurrency(q.subtotal)}</TableCell>
                              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatCurrency(q.tax)}</TableCell>
                              <TableCell className="font-semibold text-sm">{formatCurrency(q.total)}</TableCell>
                              <TableCell><Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs font-medium border', quotStatusBadge(q.status))}>{q.status}</Badge></TableCell>
                              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{q.validUntil}</TableCell>
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
        </TabsContent>

        {/* ============ COMPARISONS TAB ============ */}
        <TabsContent value="comparisons" className="space-y-6 mt-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Label className="text-sm font-medium whitespace-nowrap">Compare Item:</Label>
              <Select value={selectedComparison} onValueChange={setSelectedComparison}>
                <SelectTrigger className="w-full sm:w-72"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SAMPLE_COMPARISONS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.materialName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{selectedCompData.materialName} — Vendor Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wider">Vendor</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Unit Rate</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Quantity</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider font-bold">Total Amount</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Delivery Time</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider">Rating</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-center">Best</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {selectedCompData.vendors.map((v, i) => {
                            const isBest = v.amount === minPrice
                            return (
                              <motion.tr
                                key={`${selectedCompData.id}-${i}`}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                transition={{ delay: i * 0.05 }}
                                className={cn('border-b hover:bg-muted/50 transition-colors', isBest && 'bg-green-50 dark:bg-green-950/20')}
                              >
                                <TableCell className="font-medium text-sm">{v.vendor}</TableCell>
                                <TableCell className="text-sm">{formatCurrency(v.unitRate)}</TableCell>
                                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{v.quantity.toLocaleString()}</TableCell>
                                <TableCell className={cn('text-sm font-semibold', isBest ? 'text-green-600 dark:text-green-400' : '')}>{formatCurrency(v.amount)}</TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{v.deliveryTime}</TableCell>
                                <TableCell><StarRating rating={v.rating} /></TableCell>
                                <TableCell className="text-center">
                                  {isBest && (
                                    <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 rounded-full px-2 py-0.5 text-xs font-medium hover:bg-green-100">
                                      <CheckCircle2 className="h-3 w-3 mr-1" /> Best Price
                                    </Badge>
                                  )}
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
            )}

            {/* Savings summary */}
            {selectedCompData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Potential Savings
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {formatCurrency(Math.max(...selectedCompData.vendors.map((v) => v.amount)) - minPrice)} by choosing the lowest quote
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}