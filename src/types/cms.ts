// ========================
// View Types
// ========================

export type ViewType =
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'team'
  | 'reports'
  | 'project-detail'
  | 'settings'
  | 'notifications'
  | 'admin'
  | 'chat'

// ========================
// Core Types
// ========================

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type NotificationType = string

export type ExpenseType = string
export type PaymentType = 'ADVANCE' | 'INTERIM' | 'FINAL' | 'RETAINAGE'
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
export type PaymentVoucherStatus = 'DRAFT' | 'APPROVED' | 'PAID'
export type ContractType = 'LUMP_SUM' | 'UNIT_PRICE' | 'COST_PLUS' | 'TURNKEY' | 'DESIGN_BUILD'
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CLOSED'
export type RFIStatus = 'OPEN' | 'IN_REVIEW' | 'CLOSED' | 'ANSWERED'
export type SubmittalStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_REVIEW'
export type ChangeOrderStatus = 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED'
export type MaterialStatus = 'PLANNED' | 'ORDERED' | 'DELIVERED' | 'INSTALLED'
export type PhotoCategory = 'PROGRESS' | 'INSPECTION' | 'ISSUE' | 'SITE' | 'COMPLETED'
export type WaiverType = 'PARTIAL' | 'FINAL' | 'UNCONDITIONAL' | 'CONDITIONAL'
export type RetainageStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RELEASED'
export type QualityStatus = 'ACCEPTED' | 'PARTIAL' | 'REJECTED'
export type ChatMessageType = 'TEXT' | 'SYSTEM'
export type BoqItemStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// ========================
// Core Models
// ========================

export interface User {
  id: string
  email: string
  password?: string
  name: string
  role: UserRole | string
  avatar?: string | null
  phone?: string | null
  company?: string | null
  employeeId?: string | null
  position?: string | null
  department?: string | null
  status: UserStatus | string
  createdAt: string
  updatedAt: string
  // Computed/count fields
  _count?: {
    projectMemberships?: number
    assignedTasks?: number
    createdProjects?: number
    comments?: number
    notifications?: number
  }
}

export interface Project {
  id: string
  name: string
  code: string
  description?: string | null
  status: ProjectStatus | string
  progress: number
  startDate?: string | null
  endDate?: string | null
  budget?: number | null
  createdAt: string
  updatedAt: string
  createdById: string
  projectType?: string | null
  contractType?: string | null
  siteAddress?: string | null
  siteContact?: string | null
  siteEmail?: string | null
  sitePhone?: string | null
  totalWorkforce?: number | null
  dailyLaborCount?: number | null
  managerId?: string | null
  engineerId?: string | null
  safetyOfficerId?: string | null
  boqStatus: string
  boqVersion: number
  // Relations
  createdBy?: User
  manager?: User | null
  engineer?: User | null
  safetyOfficer?: User | null
  members?: ProjectMember[]
  tasks?: Task[]
  comments?: Comment[]
  labels?: Label[]
  attachments?: Attachment[]
  budgetCategories?: BudgetCategory[]
  expenses?: Expense[]
  subcontractorProjects?: SubcontractorProject[]
  boqCategories?: BoqCategory[]
  quotations?: Quotation[]
  purchaseOrders?: PurchaseOrder[]
  grvVouchers?: GrvVoucher[]
  paymentVouchers?: PaymentVoucher[]
  receiptVouchers?: ReceiptVoucher[]
  contracts?: Contract[]
  milestones?: Milestone[]
  documents?: Document[]
  rfis?: RFI[]
  submittals?: Submittal[]
  dailyLogs?: DailyLog[]
  punchItems?: PunchItem[]
  changeOrders?: ChangeOrder[]
  materials?: Material[]
  photoDocs?: PhotoDocumentation[]
  retainageWaivers?: RetainageWaiver[]
  taskTemplates?: TaskTemplate[]
  recurringTasks?: RecurringTask[]
  chatMessages?: ChatMessage[]
  activityLogs?: ActivityLog[]
  _count?: {
    tasks?: number
    members?: number
    comments?: number
    documents?: number
    changeOrders?: number
    punchItems?: number
    rfis?: number
  }
  memberCount?: number
  taskCount?: number
}

export interface ProjectMember {
  id: string
  userId: string
  projectId: string
  role: string
  position?: string | null
  joinedAt: string
  user?: User
  project?: Project
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus | string
  priority: TaskPriority | string
  progress: number
  dueDate?: string | null
  completedAt?: string | null
  estimatedHours?: number | null
  billable: boolean
  isMilestone: boolean
  createdAt: string
  updatedAt: string
  projectId: string
  assigneeId?: string | null
  createdById: string
  // Relations
  project?: Project
  assignee?: User | null
  createdBy?: User
  subtasks?: Subtask[]
  comments?: Comment[]
  labels?: TaskLabel[]
  timeEntries?: TimeEntry[]
  attachments?: Attachment[]
  dependencies?: TaskDependency[]
  dependedOnBy?: TaskDependency[]
  punchItems?: PunchItem[]
  photoDocs?: PhotoDocumentation[]
  _count?: {
    subtasks?: number
    comments?: number
    attachments?: number
  }
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  taskId: string
  createdAt: string
  task?: Task
}

export interface Comment {
  id: string
  content: string
  mentions?: string | null
  parentId?: string | null
  taskId?: string | null
  projectId?: string | null
  userId: string
  userName: string
  createdAt: string
  updatedAt: string
  user?: User
  project?: Project
  task?: Task
  parent?: Comment
  replies?: Comment[]
}

export interface Label {
  id: string
  name: string
  color: string
  projectId?: string | null
  createdAt: string
  project?: Project
  tasks?: TaskLabel[]
}

export interface TaskLabel {
  id: string
  taskId: string
  labelId: string
  task?: Task
  label?: Label
}

export interface TimeEntry {
  id: string
  description?: string | null
  duration: number
  date: string
  taskId: string
  userId: string
  createdAt: string
  task?: Task
  user?: User
}

export interface Attachment {
  id: string
  filename: string
  fileType: string
  fileSize: number
  url: string
  taskId?: string | null
  projectId?: string | null
  uploadedById: string
  createdAt: string
  task?: Task
  project?: Project
  uploadedBy?: User
}

export interface TaskDependency {
  id: string
  taskId: string
  dependsOnId: string
  type: string
  createdAt: string
  task?: Task
  dependsOn?: Task
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  userId: string
  relatedId?: string | null
  relatedType?: string | null
  createdAt: string
  user?: User
}

// ========================
// Budget & Finance Types
// ========================

export interface BudgetCategory {
  id: string
  name: string
  allocated: number
  projectId: string
  createdAt: string
  updatedAt: string
  project?: Project
  expenses?: Expense[]
  _sum?: { amount?: number }
}

export interface Expense {
  id: string
  description: string
  amount: number
  date: string
  type: ExpenseType
  projectId: string
  budgetCategoryId?: string | null
  approvedById?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
  project?: Project
  budgetCategory?: BudgetCategory
  approvedBy?: User | null
}

export interface Subcontractor {
  id: string
  name: string
  company: string
  email: string
  phone?: string | null
  contractorType?: string | null
  registrationNo?: string | null
  gst?: string | null
  pan?: string | null
  license?: string | null
  licenseExpiry?: string | null
  insuranceExpiry?: string | null
  specialty?: string | null
  rating: number
  preQualified: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
  projectLinks?: SubcontractorProject[]
  quotations?: Quotation[]
  purchaseOrders?: PurchaseOrder[]
  contracts?: Contract[]
}

export interface SubcontractorProject {
  id: string
  subcontractorId: string
  projectId: string
  contractAmount?: number | null
  startDate?: string | null
  endDate?: string | null
  status: string
  createdAt: string
  subcontractor?: Subcontractor
  project?: Project
}

export interface BoqCategory {
  id: string
  name: string
  description?: string | null
  sortOrder: number
  version: number
  projectId: string
  createdAt: string
  updatedAt: string
  project?: Project
  items?: BoqItem[]
}

export interface BoqItem {
  id: string
  itemNo: string
  description: string
  unit: string
  quantity: number
  unitRate: number
  amount: number
  actualQty?: number | null
  actualRate?: number | null
  actualAmount?: number | null
  status: BoqItemStatus | string
  categoryId: string
  projectId: string
  createdAt: string
  updatedAt: string
  category?: BoqCategory
  project?: Project
}

export interface Quotation {
  id: string
  referenceNo: string
  vendorId?: string | null
  title: string
  description?: string | null
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  subtotal: number
  tax: number
  total: number
  validUntil?: string | null
  terms?: string | null
  projectId: string
  createdById: string
  approvedById?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
  vendor?: Subcontractor | null
  project?: Project
  createdBy?: User
  approvedBy?: User | null
  items?: QuotationItem[]
  purchaseOrders?: PurchaseOrder[]
}

export interface QuotationItem {
  id: string
  description: string
  unit: string
  quantity: number
  unitRate: number
  amount: number
  quotationId: string
  createdAt: string
  quotation?: Quotation
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  vendorId?: string | null
  title: string
  description?: string | null
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'ISSUED' | 'CLOSED'
  projectId: string
  quotationId?: string | null
  subtotal: number
  tax: number
  total: number
  deliveryDate?: string | null
  terms?: string | null
  approvedById?: string | null
  approvedAt?: string | null
  issuedAt?: string | null
  closedAt?: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  vendor?: Subcontractor | null
  project?: Project
  quotation?: Quotation | null
  createdBy?: User
  approvedBy?: User | null
  items?: PurchaseOrderItem[]
  grvVouchers?: GrvVoucher[]
  paymentVouchers?: PaymentVoucher[]
}

export interface PurchaseOrderItem {
  id: string
  description: string
  unit: string
  orderedQty: number
  unitRate: number
  amount: number
  receivedQty: number
  poId: string
  createdAt: string
  po?: PurchaseOrder
  grvItems?: GrvItem[]
}

export interface GrvVoucher {
  id: string
  grvNumber: string
  poId?: string | null
  title: string
  status: 'DRAFT' | 'QUALITY_CHECKED' | 'VERIFIED' | 'REJECTED'
  projectId: string
  totalItems: number
  notes?: string | null
  invoiceNo?: string | null
  qualityCheckedById?: string | null
  qualityCheckedAt?: string | null
  verifiedById?: string | null
  verifiedAt?: string | null
  createdAt: string
  updatedAt: string
  po?: PurchaseOrder | null
  project?: Project
  qualityCheckedBy?: User | null
  verifiedBy?: User | null
  items?: GrvItem[]
}

export interface GrvItem {
  id: string
  poItemId?: string | null
  description: string
  unit: string
  orderedQty: number
  receivedQty: number
  rejectedQty: number
  unitRate: number
  amount: number
  qualityStatus: QualityStatus | string
  grvId: string
  createdAt: string
  poItem?: PurchaseOrderItem | null
  grv?: GrvVoucher
}

export interface PaymentVoucher {
  id: string
  voucherNo: string
  title: string
  paymentType: PaymentType
  status: PaymentVoucherStatus
  amount: number
  payeeName: string
  paymentMode: PaymentMode
  bankReference?: string | null
  projectId: string
  poId?: string | null
  contractId?: string | null
  description?: string | null
  certificateNo?: string | null
  approvedById?: string | null
  approvedAt?: string | null
  paidAt?: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  project?: Project
  po?: PurchaseOrder | null
  contract?: Contract | null
  approvedBy?: User | null
  createdBy?: User
}

export interface ReceiptVoucher {
  id: string
  voucherNo: string
  title: string
  amount: number
  receivedFrom: string
  paymentMode: PaymentMode
  bankReference?: string | null
  projectId: string
  description?: string | null
  receivedAt?: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  project?: Project
  createdBy?: User
}

export interface Contract {
  id: string
  contractNo: string
  title: string
  contractType: ContractType
  status: ContractStatus
  value: number
  retainagePercent: number
  startDate?: string | null
  endDate?: string | null
  description?: string | null
  terms?: string | null
  projectId: string
  vendorId?: string | null
  createdById: string
  approvedById?: string | null
  approvedAt?: string | null
  closedAt?: string | null
  createdAt: string
  updatedAt: string
  project?: Project
  vendor?: Subcontractor | null
  createdBy?: User
  approvedBy?: User | null
  paymentVouchers?: PaymentVoucher[]
  retainageWaivers?: RetainageWaiver[]
}

// ========================
// Project Management Types
// ========================

export interface Milestone {
  id: string
  title: string
  description?: string | null
  date?: string | null
  status: string
  projectId: string
  createdAt: string
  updatedAt: string
  project?: Project
}

export interface Document {
  id: string
  title: string
  filename: string
  fileType: string
  fileSize: number
  url: string
  category: string
  version: number
  description?: string | null
  projectId: string
  uploadedById: string
  createdAt: string
  updatedAt: string
  project?: Project
  uploadedBy?: User
}

export interface RFI {
  id: string
  title: string
  description: string
  status: RFIStatus
  priority: string
  dueDate?: string | null
  response?: string | null
  projectId: string
  assignedToId?: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  project?: Project
  assignedTo?: User | null
  createdBy?: User
}

export interface Submittal {
  id: string
  title: string
  description: string
  status: SubmittalStatus
  dueDate?: string | null
  reviewNotes?: string | null
  projectId: string
  submittedById?: string | null
  reviewedById?: string | null
  createdAt: string
  updatedAt: string
  project?: Project
  submittedBy?: User | null
  reviewedBy?: User | null
}

export interface DailyLog {
  id: string
  date: string
  weather?: string | null
  temperature?: string | null
  crewSize?: number | null
  notes?: string | null
  safetyNotes?: string | null
  projectId: string
  createdById: string
  createdAt: string
  updatedAt: string
  project?: Project
  createdBy?: User
}

export interface PunchItem {
  id: string
  title: string
  description?: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
  priority: string
  location?: string | null
  dueDate?: string | null
  photoUrl?: string | null
  projectId: string
  taskId?: string | null
  assignedToId?: string | null
  createdById: string
  completedAt?: string | null
  createdAt: string
  updatedAt: string
  project?: Project
  task?: Task
  assignedTo?: User | null
  createdBy?: User
}

export interface ChangeOrder {
  id: string
  title: string
  description: string
  status: ChangeOrderStatus
  costImpact: number
  scheduleImpact?: string | null
  reason?: string | null
  projectId: string
  requestedById?: string | null
  approvedById?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
  project?: Project
  requestedBy?: User | null
  approvedBy?: User | null
}

export interface Material {
  id: string
  name: string
  quantity: number
  unit: string
  unitCost: number
  supplier?: string | null
  status: MaterialStatus
  orderedDate?: string | null
  deliveredDate?: string | null
  notes?: string | null
  projectId: string
  createdAt: string
  updatedAt: string
  project?: Project
}

export interface PhotoDocumentation {
  id: string
  title: string
  filename: string
  url: string
  category: PhotoCategory
  location?: string | null
  description?: string | null
  beforeUrl?: string | null
  projectId: string
  taskId?: string | null
  uploadedById: string
  createdAt: string
  project?: Project
  task?: Task
  uploadedBy?: User
}

export interface RetainageWaiver {
  id: string
  title: string
  vendorName: string
  waiverType: WaiverType
  amount: number
  retainagePercent: number
  status: RetainageStatus
  projectId: string
  approvedById?: string | null
  approvedAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  project?: Project
  approvedBy?: User | null
  contract?: Contract | null
  contractId?: string
}

export interface TaskTemplate {
  id: string
  name: string
  description?: string | null
  priority: string
  estimatedHours?: number | null
  billable: boolean
  isMilestone: boolean
  labels?: string | null
  projectId?: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  project?: Project
  createdBy?: User
}

export interface RecurringTask {
  id: string
  title: string
  description?: string | null
  priority: string
  estimatedHours?: number | null
  projectId: string
  assigneeId?: string | null
  recurrenceRule: string
  nextDueDate: string
  lastGenerated?: string | null
  enabled: boolean
  createdById: string
  createdAt: string
  updatedAt: string
  project?: Project
  assignee?: User | null
  createdBy?: User
}

export interface ChatMessage {
  id: string
  content: string
  type: ChatMessageType
  channelId: string
  userId: string
  createdAt: string
  user?: User
  project?: Project
}

export interface ActivityLog {
  id: string
  action: string
  details?: string | null
  userId: string
  projectId?: string | null
  relatedId?: string | null
  relatedType?: string | null
  createdAt: string
  user?: User
  project?: Project
}

// ========================
// Dashboard Stats
// ========================

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  cancelledProjects: number
  planningProjects: number
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  onHoldTasks: number
  totalMembers: number
  totalBudget: number
  totalSpent: number
  totalExpenses: number
  totalSubcontractors: number
  openRfis: number
  openPunchItems: number
  pendingChangeOrders: number
  activeContracts: number
  overdueTasks: number
  recentProjects: Project[]
  upcomingTasks: Task[]
  recentActivity: ActivityLog[]
  budgetUtilization: number
}