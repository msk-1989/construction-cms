'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GanttChart } from '@/components/cms/GanttChart'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Project, Milestone, Document, Material, DailyLog, RFI, Submittal, PunchItem, ChangeOrder, BoqCategory, BoqItem, Quotation, PurchaseOrder, PaymentVoucher, ReceiptVoucher, Contract, Subcontractor, SubcontractorProject, PhotoDocumentation, RetainageWaiver, GrvVoucher, Task } from '@/types/cms'
import { Plus, Pencil, Trash2, DollarSign, FileText, ClipboardList, Package, Truck, HandCoins, ArrowDownLeft, Users, Camera, Shield, ShoppingCart, BarChart3, ListTree, FileSpreadsheet, FileSignature, Star, Check, X, CalendarDays, MapPin, Eye, Send, Upload, ChevronDown, Loader2, GitCompareArrows, RefreshCw } from 'lucide-react'

function fmt$(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) }
function statusColor(s: string) {
  const m: Record<string, string> = { OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', IN_REVIEW: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', CLOSED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', ANSWERED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300', DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', UPCOMING: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', SUBMITTED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', ISSUED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300', VERIFIED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', QUALITY_CHECKED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', PLANNED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', ORDERED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', INSTALLED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300', PROPOSED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', IMPLEMENTED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300', RELEASED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300', LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300', MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', INSPECTION: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', ISSUE: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', SITE: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300', PARTIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', ADVANCE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', INTERIM: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', FINAL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', RETAINAGE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', LUMP_SUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', UNIT_PRICE: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', COST_PLUS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', TURNKEY: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300', DESIGN_BUILD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' }
  return m[s] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

function Section({ title, icon: Icon, children, action }: { title: string; icon: typeof DollarSign; children: React.ReactNode; action?: React.ReactNode }) {
  return <Card className="border-0 shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-amber-600" /><CardTitle className="text-sm font-semibold">{title}</CardTitle></div>{action}</CardHeader><CardContent className="px-4 pb-4">{children}</CardContent></Card>
}

// ── Generic CRUD Section ──
function CrudSection<T extends { id: string }>({ title, icon, projectId, endpoint, columns, renderForm, defaultValue, mapItem }: {
  title: string; icon: typeof DollarSign; projectId: string; endpoint: string;
  columns: { key: string; label: string; render?: (v: unknown, item: T) => React.ReactNode }[];
  renderForm: (form: Record<string, unknown>, setForm: (f: Record<string, unknown>) => void) => React.ReactNode;
  defaultValue: Record<string, unknown>;
  mapItem?: (item: T) => Record<string, unknown>;
}) {
  const [items, setItems] = useState<T[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultValue)
  const [editId, setEditId] = useState<string | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const didFetch = useRef(false)

  const load = useCallback(async () => {
    try { const r = await globalThis.fetch(`${endpoint}?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {}
  }, [endpoint, projectId])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])

  const save = async () => {
    try {
      if (editId) { await globalThis.fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...form }) }); toast.success('Updated') }
      else { await globalThis.fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, projectId }) }); toast.success('Created') }
      setOpen(false); setEditId(null); setForm(defaultValue); load()
    } catch { toast.error('Failed') }
  }

  const del = async () => {
    if (!delId) return
    try { await globalThis.fetch(`${endpoint}?id=${delId}`, { method: 'DELETE' }); toast.success('Deleted'); setDelId(null); load() } catch { toast.error('Failed') }
  }

  const edit = (item: T) => { setEditId(item.id); setForm(mapItem ? mapItem(item) : { ...item } as unknown as Record<string, unknown>); setOpen(true) }

  return (
    <Section title={title} icon={icon} action={<Button size="sm" onClick={() => { setEditId(null); setForm(defaultValue); setOpen(true) }}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>}>
      <div className="max-h-96 overflow-y-auto">
        <Table><TableHeader><TableRow>{columns.map(c => <TableHead key={c.key} className="text-xs">{c.label}</TableHead>)}<TableHead className="text-xs w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-8 text-sm">No items yet</TableCell></TableRow> : items.map(item => (
            <TableRow key={item.id}>{columns.map(c => <TableCell key={c.key} className="text-xs py-2">{c.render ? c.render((item as Record<string, unknown>)[c.key], item) : String((item as Record<string, unknown>)[c.key] ?? '')}</TableCell>)}
              <TableCell className="text-xs py-2"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => edit(item)}><Pencil className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDelId(item.id)}><Trash2 className="h-3 w-3" /></Button></div></TableCell>
            </TableRow>))}</TableBody></Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit' : 'Add'} {title}</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          {renderForm(form, setForm)}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editId ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!delId} onOpenChange={() => setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={del} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  )
}

// ── Main Component ──
export function ProjectManagementTabs({ project, projectId }: { project: Project; projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const didFetchTasks = useRef(false)

  useEffect(() => {
    if (didFetchTasks.current) return
    didFetchTasks.current = true
    const loadTasks = async () => { try { const r = await globalThis.fetch(`/api/tasks?projectId=${projectId}`); const d = await r.json(); if (d.success) setTasks(d.data) } catch {} }
    loadTasks()
  }, [projectId])

  const defaultFields = (extra: Record<string, unknown> = {}) => ({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', ...extra })
  const textField = (label: string, key: string, form: Record<string, unknown>, setForm: (f: Record<string, unknown>) => void, opts?: { type?: string; rows?: number }) => (
    <div key={key}><Label className="text-xs">{label}</Label>{opts?.rows ? <Textarea value={String(form[key] || '')} onChange={e => setForm({ ...form, [key]: e.target.value })} rows={opts.rows} className="mt-1" /> : <Input type={opts?.type || 'text'} value={String(form[key] || '')} onChange={e => setForm({ ...form, [key]: e.target.value })} className="mt-1" />}</div>
  )
  const selectField = (label: string, key: string, options: { value: string; label: string }[], form: Record<string, unknown>, setForm: (f: Record<string, unknown>) => void) => (
    <div key={key}><Label className="text-xs">{label}</Label><Select value={String(form[key] || '')} onValueChange={v => setForm({ ...form, [key]: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
  )

  return (
    <Tabs defaultValue="details" className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        <TabsList><TabsTrigger value="details" className="gap-1.5 text-xs"><ClipboardList className="h-3.5 w-3.5" />Details</TabsTrigger><TabsTrigger value="boq" className="gap-1.5 text-xs"><ListTree className="h-3.5 w-3.5" />BOQ</TabsTrigger><TabsTrigger value="quotations" className="gap-1.5 text-xs"><FileSpreadsheet className="h-3.5 w-3.5" />Quotations</TabsTrigger><TabsTrigger value="payments" className="gap-1.5 text-xs"><HandCoins className="h-3.5 w-3.5" />Payments</TabsTrigger><TabsTrigger value="receipts" className="gap-1.5 text-xs"><ArrowDownLeft className="h-3.5 w-3.5" />Receipts</TabsTrigger><TabsTrigger value="contracts" className="gap-1.5 text-xs"><FileSignature className="h-3.5 w-3.5" />Contracts</TabsTrigger><TabsTrigger value="subcontractors" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Subs</TabsTrigger><TabsTrigger value="photo-docs" className="gap-1.5 text-xs"><Camera className="h-3.5 w-3.5" />Photos</TabsTrigger><TabsTrigger value="retainage" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Retainage</TabsTrigger><TabsTrigger value="purchase-orders" className="gap-1.5 text-xs"><ShoppingCart className="h-3.5 w-3.5" />POs</TabsTrigger><TabsTrigger value="grv" className="gap-1.5 text-xs"><Truck className="h-3.5 w-3.5" />GRV</TabsTrigger><TabsTrigger value="gantt" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Gantt</TabsTrigger></TabsList>
      </div>

      {/* Details Tab */}
      <TabsContent value="details" className="space-y-4 mt-0">
        <CrudSection<Milestone> title="Milestones" icon={CalendarDays} projectId={projectId} endpoint="/api/milestones"
          columns={[{ key: 'title', label: 'Title' }, { key: 'date', label: 'Date' }, { key: 'status', label: 'Status', render: (v) => <Badge className={cn('text-[10px]', statusColor(String(v)))}>{String(v)}</Badge> }]}
          defaultValue={defaultFields({ date: '', status: 'UPCOMING' })}
          renderForm={(f, s) => <div className="space-y-3">{textField('Title', 'title', f, s)}{textField('Description', 'description', f, s, { rows: 2 })}{textField('Date', 'date', f, s, { type: 'date' })}{selectField('Status', 'status', [{ value: 'UPCOMING', label: 'Upcoming' }, { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'COMPLETED', label: 'Completed' }], f, s)}</div>} />
        <CrudSection<Document> title="Documents" icon={FileText} projectId={projectId} endpoint="/api/documents"
          columns={[{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'version', label: 'Ver' }, { key: 'fileType', label: 'Type' }]}
          defaultValue={defaultFields({ category: 'GENERAL', version: '1' })}
          renderForm={(f, s) => <div className="space-y-3">{textField('Title', 'title', f, s)}{selectField('Category', 'category', [{ value: 'GENERAL', label: 'General' }, { value: 'DRAWING', label: 'Drawing' }, { value: 'SPECIFICATION', label: 'Specification' }, { value: 'CONTRACT', label: 'Contract' }, { value: 'REPORT', label: 'Report' }], f, s)}{textField('Description', 'description', f, s, { rows: 2 })}</div>} />
        <CrudSection<Material> title="Materials" icon={Package} projectId={projectId} endpoint="/api/materials"
          columns={[{ key: 'name', label: 'Name' }, { key: 'quantity', label: 'Qty' }, { key: 'unit', label: 'Unit' }, { key: 'unitCost', label: 'Cost', render: (v) => fmt$(Number(v)) }, { key: 'status', label: 'Status', render: (v) => <Badge className={cn('text-[10px]', statusColor(String(v)))}>{String(v)}</Badge> }]}
          defaultValue={defaultFields({ quantity: '0', unit: 'EA', unitCost: '0', status: 'PLANNED' })}
          renderForm={(f, s) => <div className="grid grid-cols-2 gap-3">{textField('Name', 'name', f, s)}{textField('Quantity', 'quantity', f, s, { type: 'number' })}{textField('Unit', 'unit', f, s)}{textField('Unit Cost', 'unitCost', f, s, { type: 'number' })}{selectField('Status', 'status', [{ value: 'PLANNED', label: 'Planned' }, { value: 'ORDERED', label: 'Ordered' }, { value: 'DELIVERED', label: 'Delivered' }, { value: 'INSTALLED', label: 'Installed' }], f, s)}{textField('Supplier', 'supplier', f, s)}{textField('Notes', 'notes', f, s, { rows: 2 })}</div>} />
        <CrudSection<RFI> title="RFIs" icon={FileText} projectId={projectId} endpoint="/api/rfis"
          columns={[{ key: 'title', label: 'Title' }, { key: 'priority', label: 'Priority', render: (v) => <Badge className={cn('text-[10px]', statusColor(String(v)))}>{String(v)}</Badge> }, { key: 'status', label: 'Status', render: (v) => <Badge className={cn('text-[10px]', statusColor(String(v)))}>{String(v)}</Badge> }]}
          defaultValue={defaultFields({ priority: 'MEDIUM', status: 'OPEN' })}
          renderForm={(f, s) => <div className="space-y-3">{textField('Title', 'title', f, s)}{textField('Description', 'description', f, s, { rows: 3 })}{selectField('Priority', 'priority', [{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }], f, s)}</div>} />
        <CrudSection<Submittal> title="Submittals" icon={Send} projectId={projectId} endpoint="/api/submittals"
          columns={[{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status', render: (v) => <Badge className={cn('text-[10px]', statusColor(String(v)))}>{String(v)}</Badge> }]}
          defaultValue={defaultFields({ status: 'PENDING' })}
          renderForm={(f, s) => <div className="space-y-3">{textField('Title', 'title', f, s)}{textField('Description', 'description', f, s, { rows: 3 })}{selectField('Status', 'status', [{ value: 'PENDING', label: 'Pending' }, { value: 'IN_REVIEW', label: 'In Review' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }], f, s)}</div>} />
        <CrudSection<PunchItem> title="Punch Items" icon={ClipboardList} projectId={projectId} endpoint="/api/punch-items"
          columns={[{ key: 'title', label: 'Title' }, { key: 'location', label: 'Location' }, { key: 'priority', label: 'Priority', render: (v) => <Badge className={cn('text-[10px]', statusColor(String(v)))}>{String(v)}</Badge> }, { key: 'status', label: 'Status', render: (v) => <Badge className={cn('text-[10px]', statusColor(String(v)))}>{String(v)}</Badge> }]}
          defaultValue={defaultFields({ priority: 'MEDIUM', status: 'OPEN' })}
          renderForm={(f, s) => <div className="space-y-3">{textField('Title', 'title', f, s)}{textField('Description', 'description', f, s, { rows: 2 })}{textField('Location', 'location', f, s)}{selectField('Priority', 'priority', [{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }], f, s)}</div>} />
        <CrudSection<ChangeOrder> title="Change Orders" icon={GitCompareArrows} projectId={projectId} endpoint="/api/change-orders"
          columns={[{ key: 'title', label: 'Title' }, { key: 'costImpact', label: 'Cost', render: (v) => fmt$(Number(v)) }, { key: 'status', label: 'Status', render: (v) => <Badge className={cn('text-[10px]', statusColor(String(v)))}>{String(v)}</Badge> }]}
          defaultValue={defaultFields({ costImpact: '0', status: 'PROPOSED' })}
          renderForm={(f, s) => <div className="space-y-3">{textField('Title', 'title', f, s)}{textField('Description', 'description', f, s, { rows: 2 })}{textField('Cost Impact', 'costImpact', f, s, { type: 'number' })}{textField('Reason', 'reason', f, s, { rows: 2 })}</div>} />
        <CrudSection<DailyLog> title="Daily Logs" icon={CalendarDays} projectId={projectId} endpoint="/api/daily-logs"
          columns={[{ key: 'date', label: 'Date' }, { key: 'weather', label: 'Weather' }, { key: 'crewSize', label: 'Crew' }]}
          defaultValue={defaultFields({ date: new Date().toISOString().split('T')[0] })}
          renderForm={(f, s) => <div className="grid grid-cols-2 gap-3">{textField('Date', 'date', f, s, { type: 'date' })}{textField('Weather', 'weather', f, s)}{textField('Crew Size', 'crewSize', f, s, { type: 'number' })}{textField('Temperature', 'temperature', f, s)}{textField('Notes', 'notes', f, s, { rows: 2 })}{textField('Safety Notes', 'safetyNotes', f, s, { rows: 2 })}</div>} />
      </TabsContent>

      {/* BOQ Tab */}
      <TabsContent value="boq" className="mt-0"><BoqSection projectId={projectId} /></TabsContent>

      {/* Quotations Tab */}
      <TabsContent value="quotations" className="mt-0"><QuotationsSection projectId={projectId} /></TabsContent>

      {/* Payments Tab */}
      <TabsContent value="payments" className="mt-0"><PaymentsSection projectId={projectId} /></TabsContent>

      {/* Receipts Tab */}
      <TabsContent value="receipts" className="mt-0"><ReceiptsSection projectId={projectId} /></TabsContent>

      {/* Contracts Tab */}
      <TabsContent value="contracts" className="mt-0"><ContractsSection projectId={projectId} /></TabsContent>

      {/* Subcontractors Tab */}
      <TabsContent value="subcontractors" className="mt-0"><SubcontractorsSection projectId={projectId} /></TabsContent>

      {/* Photo Docs Tab */}
      <TabsContent value="photo-docs" className="mt-0"><PhotosSection projectId={projectId} /></TabsContent>

      {/* Retainage Tab */}
      <TabsContent value="retainage" className="mt-0"><RetainageSection projectId={projectId} /></TabsContent>

      {/* Purchase Orders Tab */}
      <TabsContent value="purchase-orders" className="mt-0"><POsSection projectId={projectId} /></TabsContent>

      {/* GRV Tab */}
      <TabsContent value="grv" className="mt-0"><GrvSection projectId={projectId} /></TabsContent>

      {/* Gantt Tab */}
      <TabsContent value="gantt" className="mt-0"><GanttChart tasks={tasks} /></TabsContent>
    </Tabs>
  )
}

// Import missing icon used in Details tab
import { FileQuestion } from 'lucide-react'

// ── BOQ Section ──
function BoqSection({ projectId }: { projectId: string }) {
  const [categories, setCategories] = useState<BoqCategory[]>([])
  const [catOpen, setCatOpen] = useState(false)
  const [itemOpen, setItemOpen] = useState(false)
  const [catForm, setCatForm] = useState({ name: '', description: '' })
  const [itemForm, setItemForm] = useState({ itemNo: '', description: '', unit: 'EA', quantity: '0', unitRate: '0', categoryId: '', status: 'PENDING' })
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const didFetch = useRef(false)

  const load = useCallback(async () => {
    try { const r = await globalThis.fetch(`/api/boq?projectId=${projectId}`); const d = await r.json(); if (d.success) setCategories(d.data) } catch {}
  }, [projectId])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])

  const totalBoq = categories.reduce((s, c) => s + (c.items || []).reduce((is, i) => is + i.amount, 0), 0)
  const totalActual = categories.reduce((s, c) => s + (c.items || []).reduce((is, i) => is + (i.actualAmount || 0), 0), 0)

  const saveCat = async () => {
    if (!catForm.name) return
    try {
      if (editCatId) { await globalThis.fetch('/api/boq', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editCatId, ...catForm }) }); toast.success('Updated') }
      else { await globalThis.fetch('/api/boq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...catForm, projectId }) }); toast.success('Created') }
      setCatOpen(false); setEditCatId(null); setCatForm({ name: '', description: '' }); load()
    } catch { toast.error('Failed') }
  }

  const saveItem = async () => {
    if (!itemForm.description || !itemForm.categoryId) return
    try {
      await globalThis.fetch('/api/boq/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...itemForm, quantity: Number(itemForm.quantity), unitRate: Number(itemForm.unitRate), amount: Number(itemForm.quantity) * Number(itemForm.unitRate), projectId }) })
      toast.success('Item added'); setItemOpen(false); setItemForm({ itemNo: '', description: '', unit: 'EA', quantity: '0', unitRate: '0', categoryId: '', status: 'PENDING' }); load()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm p-4"><p className="text-xs text-muted-foreground">BOQ Value</p><p className="text-lg font-bold text-amber-600">{fmt$(totalBoq)}</p></Card>
        <Card className="border-0 shadow-sm p-4"><p className="text-xs text-muted-foreground">Actual Value</p><p className="text-lg font-bold text-emerald-600">{fmt$(totalActual)}</p></Card>
        <Card className="border-0 shadow-sm p-4"><p className="text-xs text-muted-foreground">Variance</p><p className={cn('text-lg font-bold', totalBoq - totalActual >= 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt$(totalBoq - totalActual)}</p></Card>
        <Card className="border-0 shadow-sm p-4"><p className="text-xs text-muted-foreground">Progress</p><p className="text-lg font-bold">{totalBoq > 0 ? Math.round((totalActual / totalBoq) * 100) : 0}%</p><Progress value={totalBoq > 0 ? (totalActual / totalBoq) * 100 : 0} className="mt-1 h-2" /></Card>
      </div>
      <Section title="Bill of Quantities" icon={ListTree} action={<div className="flex gap-2"><Button size="sm" onClick={() => { setEditCatId(null); setCatForm({ name: '', description: '' }); setCatOpen(true) }}><Plus className="h-3.5 w-3.5 mr-1" />Category</Button></div>}>
        <Accordion type="multiple">{categories.map(cat => (
          <AccordionItem key={cat.id} value={cat.id}>
            <AccordionTrigger className="text-sm hover:no-underline"><div className="flex items-center gap-2"><span className="font-medium">{cat.name}</span><Badge variant="secondary" className="text-[10px]">{cat.items?.length || 0} items</Badge><Badge variant="secondary" className="text-[10px]">{fmt$(cat.items?.reduce((s, i) => s + i.amount, 0) || 0)}</Badge></div></AccordionTrigger>
            <AccordionContent>
              <Table><TableHeader><TableRow><TableHead className="text-xs">Item</TableHead><TableHead className="text-xs">Description</TableHead><TableHead className="text-xs">Unit</TableHead><TableHead className="text-xs text-right">Qty</TableHead><TableHead className="text-xs text-right">Rate</TableHead><TableHead className="text-xs text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>{(cat.items || []).map(item => <TableRow key={item.id}><TableCell className="text-xs">{item.itemNo}</TableCell><TableCell className="text-xs">{item.description}</TableCell><TableCell className="text-xs">{item.unit}</TableCell><TableCell className="text-xs text-right">{item.quantity}</TableCell><TableCell className="text-xs text-right">{fmt$(item.unitRate)}</TableCell><TableCell className="text-xs text-right font-medium">{fmt$(item.amount)}</TableCell></TableRow>)}</TableBody>
              </Table>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => { setItemForm(f => ({ ...f, categoryId: cat.id })); setItemOpen(true) }}><Plus className="h-3 w-3 mr-1" />Add Item</Button>
            </AccordionContent>
          </AccordionItem>
        ))}</Accordion>
      </Section>
      <Dialog open={catOpen} onOpenChange={setCatOpen}><DialogContent><DialogHeader><DialogTitle>{editCatId ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Name</Label><Input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div><div><Label>Description</Label><Textarea value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} rows={2} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setCatOpen(false)}>Cancel</Button><Button onClick={saveCat}>Save</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={itemOpen} onOpenChange={setItemOpen}><DialogContent><DialogHeader><DialogTitle>Add BOQ Item</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3"><div><Label>Item No</Label><Input value={itemForm.itemNo} onChange={e => setItemForm(f => ({ ...f, itemNo: e.target.value }))} className="mt-1" /></div><div><Label>Unit</Label><Input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} className="mt-1" /></div><div className="col-span-2"><Label>Description</Label><Input value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} className="mt-1" /></div><div><Label>Quantity</Label><Input type="number" value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))} className="mt-1" /></div><div><Label>Unit Rate</Label><Input type="number" value={itemForm.unitRate} onChange={e => setItemForm(f => ({ ...f, unitRate: e.target.value }))} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setItemOpen(false)}>Cancel</Button><Button onClick={saveItem}>Add</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

// ── Finance Sections (simplified) ──
function QuotationsSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Quotation[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ referenceNo: '', title: '', description: '', vendorId: '', validUntil: '', terms: '', items: '' })
  const didFetch = useRef(false)
  const load = useCallback(async () => { try { const r = await globalThis.fetch(`/api/quotations?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {} }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const save = async () => {
    try {
      const lineItems = form.items.split('\n').filter(Boolean).map((line, i) => { const parts = line.split(','); return { description: parts[0] || `Item ${i + 1}`, unit: parts[1] || 'EA', quantity: Number(parts[2]) || 1, unitRate: Number(parts[3]) || 0 } })
      await globalThis.fetch('/api/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, projectId, items: lineItems }) })
      toast.success('Quotation created'); setOpen(false); setForm({ referenceNo: '', title: '', description: '', vendorId: '', validUntil: '', terms: '', items: '' }); load()
    } catch { toast.error('Failed') }
  }
  const updateStatus = async (id: string, status: string) => { try { await globalThis.fetch('/api/quotations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); toast.success('Updated'); load() } catch { toast.error('Failed') } }
  const convertToPO = async (q: Quotation) => {
    try {
      const poItems = (q.items || []).map(i => ({ description: i.description, unit: i.unit, orderedQty: i.quantity, unitRate: i.unitRate }))
      await globalThis.fetch('/api/purchase-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: `PO from ${q.referenceNo}`, vendorId: q.vendorId, projectId, quotationId: q.id, items: poItems, terms: q.terms, createdById: '' }) })
      toast.success('Converted to PO'); updateStatus(q.id, 'APPROVED')
    } catch { toast.error('Failed') }
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: 'Total', value: items.length, color: 'text-foreground' }, { label: 'Pending', value: items.filter(i => i.status === 'DRAFT' || i.status === 'SUBMITTED').length, color: 'text-amber-600' }, { label: 'Approved', value: items.filter(i => i.status === 'APPROVED').length, color: 'text-emerald-600' }, { label: 'Total Value', value: fmt$(items.reduce((s, i) => s + i.total, 0)), color: 'text-amber-600' }].map((s, i) => <Card key={i} className="border-0 shadow-sm p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className={cn('text-lg font-bold', s.color)}>{s.value}</p></Card>)}
      </div>
      <Section title="Quotations" icon={FileSpreadsheet} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />New</Button>}>
        <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Ref</TableHead><TableHead className="text-xs">Title</TableHead><TableHead className="text-xs">Vendor</TableHead><TableHead className="text-xs text-right">Total</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Actions</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No quotations</TableCell></TableRow> : items.map(q => <TableRow key={q.id}><TableCell className="text-xs font-mono">{q.referenceNo}</TableCell><TableCell className="text-xs">{q.title}</TableCell><TableCell className="text-xs">{q.vendor?.company || '—'}</TableCell><TableCell className="text-xs text-right font-medium">{fmt$(q.total)}</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(q.status))}>{q.status}</Badge></TableCell><TableCell className="text-xs"><div className="flex gap-1">{q.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(q.id, 'SUBMITTED')}>Submit</Button>}{q.status === 'SUBMITTED' && <><Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600" onClick={() => updateStatus(q.id, 'APPROVED')}>Approve</Button><Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => updateStatus(q.id, 'REJECTED')}>Reject</Button></>}{q.status === 'APPROVED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => convertToPO(q)}>→ PO</Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>
      </Section>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>New Quotation</DialogTitle><DialogDescription>One item per line: description, unit, qty, rate</DialogDescription></DialogHeader><div className="space-y-3"><div className="grid grid-cols-2 gap-3"><div><Label>Reference No</Label><Input value={form.referenceNo} onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))} className="mt-1" /></div><div><Label>Valid Until</Label><Input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="mt-1" /></div></div><div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div><div><Label>Items (one per line: desc, unit, qty, rate)</Label><Textarea value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} rows={4} className="mt-1 font-mono text-xs" placeholder="Cement, Bags, 500, 10&#10;Steel, Tons, 10, 800" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Create</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function PaymentsSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<PaymentVoucher[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', paymentType: 'INTERIM', amount: '', payeeName: '', paymentMode: 'BANK_TRANSFER', bankReference: '', description: '' })
  const didFetch = useRef(false)
  const load = useCallback(async () => { try { const r = await globalThis.fetch(`/api/payments?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {} }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const save = async () => {
    try { await globalThis.fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: Number(form.amount), projectId, createdById: '' }) }); toast.success('Payment created'); setOpen(false); setForm({ title: '', paymentType: 'INTERIM', amount: '', payeeName: '', paymentMode: 'BANK_TRANSFER', bankReference: '', description: '' }); load() } catch { toast.error('Failed') }
  }
  const updateStatus = async (id: string, status: string) => { try { await globalThis.fetch('/api/payments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); toast.success('Updated'); load() } catch { toast.error('Failed') } }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: 'Total', value: fmt$(items.reduce((s, p) => s + p.amount, 0)), color: 'text-foreground' }, { label: 'Advance', value: fmt$(items.filter(p => p.paymentType === 'ADVANCE').reduce((s, p) => s + p.amount, 0)), color: 'text-amber-600' }, { label: 'Interim', value: fmt$(items.filter(p => p.paymentType === 'INTERIM').reduce((s, p) => s + p.amount, 0)), color: 'text-sky-600' }, { label: 'Retainage', value: fmt$(items.filter(p => p.paymentType === 'RETAINAGE').reduce((s, p) => s + p.amount, 0)), color: 'text-orange-600' }].map((s, i) => <Card key={i} className="border-0 shadow-sm p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className={cn('text-lg font-bold', s.color)}>{s.value}</p></Card>)}
      </div>
      <Section title="Payment Vouchers" icon={HandCoins} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />New Payment</Button>}>
        <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Voucher No</TableHead><TableHead className="text-xs">Title</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs text-right">Amount</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Actions</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No payments</TableCell></TableRow> : items.map(p => <TableRow key={p.id}><TableCell className="text-xs font-mono">{p.voucherNo}</TableCell><TableCell className="text-xs">{p.title}</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(p.paymentType))}>{p.paymentType}</Badge></TableCell><TableCell className="text-xs text-right font-medium">{fmt$(p.amount)}</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(p.status))}>{p.status}</Badge></TableCell><TableCell className="text-xs"><div className="flex gap-1">{p.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(p.id, 'APPROVED')}>Approve</Button>}{p.status === 'APPROVED' && <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600" onClick={() => updateStatus(p.id, 'PAID')}>Pay</Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>
      </Section>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>New Payment</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3"><div className="col-span-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div><div><Label>Type</Label><Select value={form.paymentType} onValueChange={v => setForm(f => ({ ...f, paymentType: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ADVANCE">Advance</SelectItem><SelectItem value="INTERIM">Interim</SelectItem><SelectItem value="FINAL">Final</SelectItem><SelectItem value="RETAINAGE">Retainage</SelectItem></SelectContent></Select></div><div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1" /></div><div><Label>Payee</Label><Input value={form.payeeName} onChange={e => setForm(f => ({ ...f, payeeName: e.target.value }))} className="mt-1" /></div><div><Label>Payment Mode</Label><Select value={form.paymentMode} onValueChange={v => setForm(f => ({ ...f, paymentMode: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem><SelectItem value="CASH">Cash</SelectItem><SelectItem value="CHEQUE">Cheque</SelectItem><SelectItem value="ONLINE">Online</SelectItem></SelectContent></Select></div><div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Create</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function ReceiptsSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ReceiptVoucher[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', receivedFrom: '', paymentMode: 'BANK_TRANSFER', bankReference: '', description: '' })
  const didFetch = useRef(false)
  const load = useCallback(async () => { try { const r = await globalThis.fetch(`/api/receipts?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {} }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const save = async () => {
    try { await globalThis.fetch('/api/receipts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: Number(form.amount), projectId, createdById: '' }) }); toast.success('Receipt created'); setOpen(false); setForm({ title: '', amount: '', receivedFrom: '', paymentMode: 'BANK_TRANSFER', bankReference: '', description: '' }); load() } catch { toast.error('Failed') }
  }
  return (
    <Section title="Receipt Vouchers" icon={ArrowDownLeft} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />New Receipt</Button>}>
      <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Voucher No</TableHead><TableHead className="text-xs">Title</TableHead><TableHead className="text-xs">From</TableHead><TableHead className="text-xs text-right">Amount</TableHead><TableHead className="text-xs">Mode</TableHead><TableHead className="text-xs">Date</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No receipts</TableCell></TableRow> : items.map(r => <TableRow key={r.id}><TableCell className="text-xs font-mono">{r.voucherNo}</TableCell><TableCell className="text-xs">{r.title}</TableCell><TableCell className="text-xs">{r.receivedFrom}</TableCell><TableCell className="text-xs text-right font-medium">{fmt$(r.amount)}</TableCell><TableCell className="text-xs">{r.paymentMode}</TableCell><TableCell className="text-xs">{r.receivedAt ? new Date(r.receivedAt).toLocaleDateString() : '—'}</TableCell></TableRow>)}</TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>New Receipt</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3"><div className="col-span-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div><div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1" /></div><div><Label>Received From</Label><Input value={form.receivedFrom} onChange={e => setForm(f => ({ ...f, receivedFrom: e.target.value }))} className="mt-1" /></div><div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Create</Button></DialogFooter></DialogContent></Dialog>
    </Section>
  )
}

function ContractsSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Contract[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', contractType: 'LUMP_SUM', value: '', retainagePercent: '10', startDate: '', endDate: '', description: '', terms: '', vendorId: '' })
  const didFetch = useRef(false)
  const load = useCallback(async () => { try { const r = await globalThis.fetch(`/api/contracts?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {} }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const save = async () => {
    try { await globalThis.fetch('/api/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, value: Number(form.value), retainagePercent: Number(form.retainagePercent), projectId, createdById: '' }) }); toast.success('Contract created'); setOpen(false); setForm({ title: '', contractType: 'LUMP_SUM', value: '', retainagePercent: '10', startDate: '', endDate: '', description: '', terms: '', vendorId: '' }); load() } catch { toast.error('Failed') }
  }
  const updateStatus = async (id: string, status: string) => { try { await globalThis.fetch('/api/contracts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); toast.success('Updated'); load() } catch { toast.error('Failed') } }
  return (
    <Section title="Contracts" icon={FileSignature} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />New Contract</Button>}>
      <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Contract No</TableHead><TableHead className="text-xs">Title</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs text-right">Value</TableHead><TableHead className="text-xs">Retainage</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Actions</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-sm">No contracts</TableCell></TableRow> : items.map(c => <TableRow key={c.id}><TableCell className="text-xs font-mono">{c.contractNo}</TableCell><TableCell className="text-xs">{c.title}</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(c.contractType))}>{c.contractType}</Badge></TableCell><TableCell className="text-xs text-right font-medium">{fmt$(c.value)}</TableCell><TableCell className="text-xs">{c.retainagePercent}%</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(c.status))}>{c.status}</Badge></TableCell><TableCell className="text-xs"><div className="flex gap-1">{c.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(c.id, 'ACTIVE')}>Activate</Button>}{c.status === 'ACTIVE' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(c.id, 'COMPLETED')}>Complete</Button>}{c.status === 'COMPLETED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(c.id, 'CLOSED')}>Close</Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>New Contract</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Type</Label><Select value={form.contractType} onValueChange={v => setForm(f => ({ ...f, contractType: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LUMP_SUM">Lump Sum</SelectItem><SelectItem value="UNIT_PRICE">Unit Price</SelectItem><SelectItem value="COST_PLUS">Cost Plus</SelectItem><SelectItem value="TURNKEY">Turnkey</SelectItem><SelectItem value="DESIGN_BUILD">Design-Build</SelectItem></SelectContent></Select></div><div><Label>Value ($)</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="mt-1" /></div><div><Label>Retainage %</Label><Input type="number" value={form.retainagePercent} onChange={e => setForm(f => ({ ...f, retainagePercent: e.target.value }))} className="mt-1" /></div><div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" /></div><div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" /></div></div><div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Create</Button></DialogFooter></DialogContent></Dialog>
    </Section>
  )
}

function SubcontractorsSection({ projectId }: { projectId: string }) {
  const [assignments, setAssignments] = useState<SubcontractorProject[]>([])
  const [subcons, setSubcons] = useState<Subcontractor[]>([])
  const [open, setOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [form, setForm] = useState({ subcontractorId: '', contractAmount: '', startDate: '', endDate: '', status: 'ACTIVE' })
  const [newForm, setNewForm] = useState({ name: '', company: '', email: '', phone: '', contractorType: 'CIVIL', registrationNo: '', gst: '', pan: '', specialty: '', rating: '0' })
  const didFetch = useRef(false)
  const load = useCallback(async () => {
    try { const [a, s] = await Promise.all([globalThis.fetch(`/api/subcontractors/projects?projectId=${projectId}`), globalThis.fetch(`/api/subcontractors?projectId=${projectId}`)]); const da = await a.json(); const ds = await s.json(); if (da.success) setAssignments(da.data); if (ds.success) setSubcons(ds.data) } catch {}
  }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const assign = async () => {
    if (!form.subcontractorId) return
    try { await globalThis.fetch('/api/subcontractors/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, contractAmount: Number(form.contractAmount) || 0, projectId }) }); toast.success('Assigned'); setOpen(false); setForm({ subcontractorId: '', contractAmount: '', startDate: '', endDate: '', status: 'ACTIVE' }); load() } catch { toast.error('Failed') }
  }
  const createNew = async () => {
    try { await globalThis.fetch('/api/subcontractors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newForm, rating: Number(newForm.rating) }) }); toast.success('Subcontractor created'); setNewOpen(false); setNewForm({ name: '', company: '', email: '', phone: '', contractorType: 'CIVIL', registrationNo: '', gst: '', pan: '', specialty: '', rating: '0' }); load() } catch { toast.error('Failed') }
  }
  const unassign = async (id: string) => { try { await globalThis.fetch(`/api/subcontractors/projects?id=${id}`, { method: 'DELETE' }); toast.success('Removed'); load() } catch { toast.error('Failed') } }
  return (
    <Section title="Subcontractors" icon={Users} action={<div className="flex gap-2"><Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />Assign</Button><Button size="sm" variant="outline" onClick={() => setNewOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />New Sub</Button></div>}>
      <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Company</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs text-right">Contract</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Actions</TableHead></TableRow></TableHeader><TableBody>{assignments.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No subcontractors assigned</TableCell></TableRow> : assignments.map(a => <TableRow key={a.id}><TableCell className="text-xs">{a.subcontractor?.name || '—'}</TableCell><TableCell className="text-xs">{a.subcontractor?.company || '—'}</TableCell><TableCell className="text-xs">{a.subcontractor?.contractorType || '—'}</TableCell><TableCell className="text-xs text-right font-medium">{a.contractAmount ? fmt$(a.contractAmount) : '—'}</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(a.status))}>{a.status}</Badge></TableCell><TableCell><Button size="sm" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => unassign(a.id)}><Trash2 className="h-3 w-3" /></Button></TableCell></TableRow>)}</TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Assign Subcontractor</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Subcontractor</Label><Select value={form.subcontractorId} onValueChange={v => setForm(f => ({ ...f, subcontractorId: v }))}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{subcons.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — {s.company}</SelectItem>)}</SelectContent></Select></div><div><Label>Contract Amount</Label><Input type="number" value={form.contractAmount} onChange={e => setForm(f => ({ ...f, contractAmount: e.target.value }))} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={assign}>Assign</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>New Subcontractor</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3"><div><Label>Name *</Label><Input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div><div><Label>Company *</Label><Input value={newForm.company} onChange={e => setNewForm(f => ({ ...f, company: e.target.value }))} className="mt-1" /></div><div><Label>Email *</Label><Input value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} className="mt-1" /></div><div><Label>Type</Label><Select value={newForm.contractorType} onValueChange={v => setNewForm(f => ({ ...f, contractorType: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{['CIVIL', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'FINISHING', 'STRUCTURAL', 'EARTHWORK', 'LANDSCAPING', 'OTHER'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div><div><Label>GST</Label><Input value={newForm.gst} onChange={e => setNewForm(f => ({ ...f, gst: e.target.value }))} className="mt-1" /></div><div><Label>PAN</Label><Input value={newForm.pan} onChange={e => setNewForm(f => ({ ...f, pan: e.target.value }))} className="mt-1" /></div><div><Label>Phone</Label><Input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" /></div><div><Label>Specialty</Label><Input value={newForm.specialty} onChange={e => setNewForm(f => ({ ...f, specialty: e.target.value }))} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button><Button onClick={createNew}>Create</Button></DialogFooter></DialogContent></Dialog>
    </Section>
  )
}

function PhotosSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<PhotoDocumentation[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'PROGRESS', location: '', description: '' })
  const didFetch = useRef(false)
  const load = useCallback(async () => { try { const r = await globalThis.fetch(`/api/photo-docs?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {} }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const save = async () => {
    if (!form.title) return
    try { await globalThis.fetch('/api/photo-docs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, filename: 'photo.jpg', url: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f59e0b" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="20">${form.title}</text></svg>`, projectId, uploadedById: '' }) }); toast.success('Photo uploaded'); setOpen(false); setForm({ title: '', category: 'PROGRESS', location: '', description: '' }); load() } catch { toast.error('Failed') }
  }
  return (
    <Section title="Photo Documentation" icon={Camera} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />Upload</Button>}>
      {items.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No photos yet</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">{items.map(p => <Card key={p.id} className="border-0 shadow-sm overflow-hidden"><div className="aspect-video bg-muted"><img src={p.url} alt={p.title} className="w-full h-full object-cover" /></div><div className="p-2"><p className="text-xs font-medium truncate">{p.title}</p><div className="flex items-center justify-between mt-1"><Badge className={cn('text-[9px]', statusColor(p.category))}>{p.category}</Badge>{p.location && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.location}</span>}</div></div></Card>)}</div>}
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Upload Photo</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PROGRESS">Progress</SelectItem><SelectItem value="INSPECTION">Inspection</SelectItem><SelectItem value="ISSUE">Issue</SelectItem><SelectItem value="SITE">Site</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem></SelectContent></Select></div><div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="mt-1" /></div></div><div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Upload</Button></DialogFooter></DialogContent></Dialog>
    </Section>
  )
}

function RetainageSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<RetainageWaiver[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', vendorName: '', waiverType: 'PARTIAL', amount: '', retainagePercent: '10', notes: '' })
  const didFetch = useRef(false)
  const load = useCallback(async () => { try { const r = await globalThis.fetch(`/api/retainage-waivers?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {} }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const save = async () => {
    try { await globalThis.fetch('/api/retainage-waivers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: Number(form.amount), retainagePercent: Number(form.retainagePercent), projectId }) }); toast.success('Waiver created'); setOpen(false); setForm({ title: '', vendorName: '', waiverType: 'PARTIAL', amount: '', retainagePercent: '10', notes: '' }); load() } catch { toast.error('Failed') }
  }
  const approve = async (id: string) => { try { await globalThis.fetch('/api/retainage-waivers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'APPROVED' }) }); toast.success('Approved'); load() } catch {} }
  return (
    <Section title="Retainage Waivers" icon={Shield} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />New Waiver</Button>}>
      <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Title</TableHead><TableHead className="text-xs">Vendor</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs text-right">Amount</TableHead><TableHead className="text-xs">Retainage</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Actions</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-sm">No waivers</TableCell></TableRow> : items.map(w => <TableRow key={w.id}><TableCell className="text-xs">{w.title}</TableCell><TableCell className="text-xs">{w.vendorName}</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(w.waiverType))}>{w.waiverType}</Badge></TableCell><TableCell className="text-xs text-right font-medium">{fmt$(w.amount)}</TableCell><TableCell className="text-xs">{w.retainagePercent}%</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(w.status))}>{w.status}</Badge></TableCell><TableCell>{w.status === 'PENDING' && <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600" onClick={() => approve(w.id)}>Approve</Button>}</TableCell></TableRow>)}</TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>New Retainage Waiver</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Vendor Name</Label><Input value={form.vendorName} onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))} className="mt-1" /></div><div><Label>Waiver Type</Label><Select value={form.waiverType} onValueChange={v => setForm(f => ({ ...f, waiverType: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PARTIAL">Partial</SelectItem><SelectItem value="FINAL">Final</SelectItem><SelectItem value="UNCONDITIONAL">Unconditional</SelectItem><SelectItem value="CONDITIONAL">Conditional</SelectItem></SelectContent></Select></div><div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1" /></div><div><Label>Retainage %</Label><Input type="number" value={form.retainagePercent} onChange={e => setForm(f => ({ ...f, retainagePercent: e.target.value }))} className="mt-1" /></div></div><div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="mt-1" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Create</Button></DialogFooter></DialogContent></Dialog>
    </Section>
  )
}

function POsSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<PurchaseOrder[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', vendorId: '', deliveryDate: '', terms: '', items: '' })
  const didFetch = useRef(false)
  const load = useCallback(async () => { try { const r = await globalThis.fetch(`/api/purchase-orders?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {} }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const save = async () => {
    try {
      const lineItems = form.items.split('\n').filter(Boolean).map((line, i) => { const p = line.split(','); return { description: p[0] || `Item ${i + 1}`, unit: p[1] || 'EA', orderedQty: Number(p[2]) || 1, unitRate: Number(p[3]) || 0 } })
      await globalThis.fetch('/api/purchase-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, projectId, items: lineItems, createdById: '' }) })
      toast.success('PO created'); setOpen(false); setForm({ title: '', vendorId: '', deliveryDate: '', terms: '', items: '' }); load()
    } catch { toast.error('Failed') }
  }
  const updateStatus = async (id: string, status: string) => { try { await globalThis.fetch('/api/purchase-orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); toast.success('Updated'); load() } catch {} }
  return (
    <Section title="Purchase Orders" icon={ShoppingCart} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />New PO</Button>}>
      <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">PO Number</TableHead><TableHead className="text-xs">Title</TableHead><TableHead className="text-xs">Vendor</TableHead><TableHead className="text-xs text-right">Total</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Actions</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No POs</TableCell></TableRow> : items.map(po => <TableRow key={po.id}><TableCell className="text-xs font-mono">{po.poNumber}</TableCell><TableCell className="text-xs">{po.title}</TableCell><TableCell className="text-xs">{po.vendor?.company || '—'}</TableCell><TableCell className="text-xs text-right font-medium">{fmt$(po.total)}</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(po.status))}>{po.status}</Badge></TableCell><TableCell className="text-xs"><div className="flex gap-1">{po.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(po.id, 'SUBMITTED')}>Submit</Button>}{po.status === 'SUBMITTED' && <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600" onClick={() => updateStatus(po.id, 'APPROVED')}>Approve</Button>}{po.status === 'APPROVED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(po.id, 'ISSUED')}>Issue</Button>}{po.status === 'ISSUED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(po.id, 'CLOSED')}>Close</Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>New Purchase Order</DialogTitle><DialogDescription>Items: one per line — description, unit, qty, rate</DialogDescription></DialogHeader><div className="space-y-3"><div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} className="mt-1" /></div><div><Label>Terms</Label><Input value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} className="mt-1" /></div></div><div><Label>Items (one per line: desc, unit, qty, rate)</Label><Textarea value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} rows={4} className="mt-1 font-mono text-xs" placeholder="Cement, Bags, 500, 10" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Create</Button></DialogFooter></DialogContent></Dialog>
    </Section>
  )
}

function GrvSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<GrvVoucher[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ poId: '', title: '', invoiceNo: '', notes: '', items: '' })
  const didFetch = useRef(false)
  const load = useCallback(async () => { try { const r = await globalThis.fetch(`/api/grv?projectId=${projectId}`); const d = await r.json(); if (d.success) setItems(d.data) } catch {} }, [projectId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!didFetch.current) { didFetch.current = true; load() } }, [load])
  const save = async () => {
    try {
      const grvItems = form.items.split('\n').filter(Boolean).map((line, i) => { const p = line.split(','); return { description: p[0] || `Item ${i + 1}`, unit: p[1] || 'EA', orderedQty: Number(p[2]) || 0, receivedQty: Number(p[3]) || 0, rejectedQty: 0, unitRate: Number(p[4]) || 0, qualityStatus: 'ACCEPTED' } })
      await globalThis.fetch('/api/grv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, projectId, items: grvItems }) })
      toast.success('GRV created'); setOpen(false); setForm({ poId: '', title: '', invoiceNo: '', notes: '', items: '' }); load()
    } catch { toast.error('Failed') }
  }
  const updateStatus = async (id: string, status: string) => { try { await globalThis.fetch('/api/grv', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); toast.success('Updated'); load() } catch {} }
  return (
    <Section title="Goods Received Vouchers" icon={Truck} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />New GRV</Button>}>
      <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">GRV No</TableHead><TableHead className="text-xs">Title</TableHead><TableHead className="text-xs">Invoice</TableHead><TableHead className="text-xs">PO</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Actions</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No GRVs</TableCell></TableRow> : items.map(g => <TableRow key={g.id}><TableCell className="text-xs font-mono">{g.grvNumber}</TableCell><TableCell className="text-xs">{g.title}</TableCell><TableCell className="text-xs">{g.invoiceNo || '—'}</TableCell><TableCell className="text-xs">{g.po?.poNumber || '—'}</TableCell><TableCell><Badge className={cn('text-[10px]', statusColor(g.status))}>{g.status}</Badge></TableCell><TableCell className="text-xs"><div className="flex gap-1">{g.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(g.id, 'QUALITY_CHECKED')}>Pass QC</Button>}{g.status === 'QUALITY_CHECKED' && <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600" onClick={() => updateStatus(g.id, 'VERIFIED')}>Verify</Button>}{g.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => updateStatus(g.id, 'REJECTED')}>Reject</Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>New GRV</DialogTitle><DialogDescription>Items: one per line — description, unit, ordered qty, received qty, rate</DialogDescription></DialogHeader><div className="space-y-3"><div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Invoice No</Label><Input value={form.invoiceNo} onChange={e => setForm(f => ({ ...f, invoiceNo: e.target.value }))} className="mt-1" /></div><div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1" /></div></div><div><Label>Items</Label><Textarea value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} rows={4} className="mt-1 font-mono text-xs" placeholder="Cement, Bags, 500, 480, 10" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Create</Button></DialogFooter></DialogContent></Dialog>
    </Section>
  )
}