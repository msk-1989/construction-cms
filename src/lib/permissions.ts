export type Permission =
  // Dashboard
  | 'view:dashboard'
  // Projects
  | 'view:projects'
  | 'create:projects'
  | 'edit:projects'
  | 'delete:projects'
  // Tasks
  | 'view:tasks'
  | 'create:tasks'
  | 'edit:tasks'
  | 'delete:tasks'
  // Team
  | 'view:team'
  | 'manage:team'
  // Reports
  | 'view:reports'
  // Settings
  | 'view:settings'
  | 'manage:settings'
  // Admin
  | 'view:admin'
  | 'admin:all'
  // Notifications
  | 'view:notifications'
  // Chat
  | 'view:chat'
  | 'send:chat'
  // Budget & Finance
  | 'view:budget'
  | 'manage:budget'
  | 'view:expenses'
  | 'create:expenses'
  | 'edit:expenses'
  | 'delete:expenses'
  | 'approve:expenses'
  // Subcontractors
  | 'view:subcontractors'
  | 'manage:subcontractors'
  // BOQ
  | 'view:boq'
  | 'edit:boq'
  // Quotations
  | 'view:quotations'
  | 'create:quotations'
  | 'edit:quotations'
  | 'approve:quotations'
  // Purchase Orders
  | 'view:purchase-orders'
  | 'create:purchase-orders'
  | 'edit:purchase-orders'
  | 'approve:purchase-orders'
  // GRV
  | 'view:grv'
  | 'create:grv'
  | 'verify:grv'
  // Payments
  | 'view:payments'
  | 'create:payments'
  | 'approve:payments'
  // Receipts
  | 'view:receipts'
  | 'create:receipts'
  // Contracts
  | 'view:contracts'
  | 'create:contracts'
  | 'edit:contracts'
  | 'approve:contracts'
  // Project Management
  | 'view:milestones'
  | 'manage:milestones'
  | 'view:documents'
  | 'manage:documents'
  | 'view:rfis'
  | 'create:rfis'
  | 'manage:rfis'
  | 'view:submittals'
  | 'create:submittals'
  | 'manage:submittals'
  | 'view:daily-logs'
  | 'create:daily-logs'
  | 'view:punch-items'
  | 'create:punch-items'
  | 'manage:punch-items'
  | 'view:change-orders'
  | 'create:change-orders'
  | 'approve:change-orders'
  | 'view:materials'
  | 'manage:materials'
  | 'view:photos'
  | 'upload:photos'
  | 'view:retainage'
  | 'approve:retainage'
  | 'view:activity-log'
  // Exceptional Grants & System Settings
  | 'view:grants'
  | 'create:grants'
  | 'revoke:grants'
  | 'manage:grant-templates'
  | 'manage:permission-overrides'
  | 'emergency:override'
  | 'view:system-settings'
  | 'manage:system-settings'
  // HR
  | 'view:hr'
  | 'manage:employees'
  | 'manage:attendance'
  | 'manage:payroll'
  | 'manage:recruitment'
  // Procurement
  | 'view:procurement'
  | 'manage:vendors'
  | 'manage:purchase-orders'
  // Finance
  | 'view:finance'
  | 'manage:invoices'
  | 'manage:payments-approval'
  | 'view:financial-reports'
  // QA/QC
  | 'view:qa'
  | 'manage:quality-checks'
  | 'manage:ncr'
  | 'manage:quality-audits'
  // Safety
  | 'view:safety'
  | 'manage:inspections'
  | 'manage:incidents'
  | 'manage:safety-training'
  // Store
  | 'view:store'
  | 'manage:inventory'
  | 'manage:material-requests'
  | 'manage:goods-receipt'
  // Site Engineering
  | 'manage:technical-queries'
  | 'manage:method-statements'
  // Labour
  | 'view:labour'
  | 'manage:labour'
  | 'manage:wages'
  // External
  | 'view:drawings'
  | 'manage:drawings'
  | 'view:work-orders'
  | 'manage:timesheets'

export const ALL_PERMISSIONS: Permission[] = [
  'view:dashboard',
  'view:projects',
  'create:projects',
  'edit:projects',
  'delete:projects',
  'view:tasks',
  'create:tasks',
  'edit:tasks',
  'delete:tasks',
  'view:team',
  'manage:team',
  'view:reports',
  'view:settings',
  'manage:settings',
  'view:admin',
  'admin:all',
  'view:notifications',
  'view:chat',
  'send:chat',
  'view:budget',
  'manage:budget',
  'view:expenses',
  'create:expenses',
  'edit:expenses',
  'delete:expenses',
  'approve:expenses',
  'view:subcontractors',
  'manage:subcontractors',
  'view:boq',
  'edit:boq',
  'view:quotations',
  'create:quotations',
  'edit:quotations',
  'approve:quotations',
  'view:purchase-orders',
  'create:purchase-orders',
  'edit:purchase-orders',
  'approve:purchase-orders',
  'view:grv',
  'create:grv',
  'verify:grv',
  'view:payments',
  'create:payments',
  'approve:payments',
  'view:receipts',
  'create:receipts',
  'view:contracts',
  'create:contracts',
  'edit:contracts',
  'approve:contracts',
  'view:milestones',
  'manage:milestones',
  'view:documents',
  'manage:documents',
  'view:rfis',
  'create:rfis',
  'manage:rfis',
  'view:submittals',
  'create:submittals',
  'manage:submittals',
  'view:daily-logs',
  'create:daily-logs',
  'view:punch-items',
  'create:punch-items',
  'manage:punch-items',
  'view:change-orders',
  'create:change-orders',
  'approve:change-orders',
  'view:materials',
  'manage:materials',
  'view:photos',
  'upload:photos',
  'view:retainage',
  'approve:retainage',
  'view:activity-log',
  'view:grants',
  'create:grants',
  'revoke:grants',
  'manage:grant-templates',
  'manage:permission-overrides',
  'emergency:override',
  'view:system-settings',
  'manage:system-settings',
  // HR
  'view:hr',
  'manage:employees',
  'manage:attendance',
  'manage:payroll',
  'manage:recruitment',
  // Procurement
  'view:procurement',
  'manage:vendors',
  'manage:purchase-orders',
  // Finance
  'view:finance',
  'manage:invoices',
  'manage:payments-approval',
  'view:financial-reports',
  // QA/QC
  'view:qa',
  'manage:quality-checks',
  'manage:ncr',
  'manage:quality-audits',
  // Safety
  'view:safety',
  'manage:inspections',
  'manage:incidents',
  'manage:safety-training',
  // Store
  'view:store',
  'manage:inventory',
  'manage:material-requests',
  'manage:goods-receipt',
  // Site Engineering
  'manage:technical-queries',
  'manage:method-statements',
  // Labour
  'view:labour',
  'manage:labour',
  'manage:wages',
  // External
  'view:drawings',
  'manage:drawings',
  'view:work-orders',
  'manage:timesheets',
]

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS,
  CEO: [
    'view:dashboard', 'view:projects', 'view:reports', 'view:team',
    'view:settings', 'view:notifications', 'view:chat', 'send:chat',
    'view:budget', 'view:expenses', 'view:financial-reports',
  ],
  CFO: [
    'view:dashboard', 'view:finance', 'manage:invoices', 'manage:payments-approval',
    'view:financial-reports', 'view:reports', 'view:settings',
    'view:notifications', 'view:chat', 'send:chat', 'view:budget',
    'manage:budget', 'view:projects',
  ],
  COO: [
    'view:dashboard', 'view:projects', 'view:reports', 'view:team',
    'view:settings', 'view:notifications', 'view:chat', 'send:chat',
    'view:budget', 'view:expenses',
  ],
  HR_MANAGER: [
    'view:dashboard', 'view:hr', 'manage:employees', 'manage:attendance',
    'manage:payroll', 'manage:recruitment', 'view:reports',
    'view:settings', 'view:notifications', 'view:chat', 'send:chat', 'view:team',
  ],
  PROCUREMENT_HEAD: [
    'view:dashboard', 'view:procurement', 'manage:vendors', 'manage:purchase-orders',
    'view:reports', 'view:settings', 'view:notifications', 'view:chat', 'send:chat',
    'view:subcontractors', 'manage:subcontractors', 'view:materials', 'manage:materials',
  ],
  PROJECT_DIRECTOR: [
    'view:dashboard', 'view:projects', 'create:projects', 'edit:projects',
    'view:reports', 'view:team', 'manage:team', 'view:settings',
    'view:notifications', 'view:chat', 'send:chat',
    'view:budget', 'view:financial-reports',
  ],
  PROJECT_MANAGER: [
    // Dashboard
    'view:dashboard',
    // Projects - full control
    'view:projects',
    'create:projects',
    'edit:projects',
    // Tasks - full control
    'view:tasks',
    'create:tasks',
    'edit:tasks',
    'delete:tasks',
    // Team - view and manage
    'view:team',
    'manage:team',
    // Reports
    'view:reports',
    // Settings - view only
    'view:settings',
    // Notifications & Chat
    'view:notifications',
    'view:chat',
    'send:chat',
    // Budget & Finance - full
    'view:budget',
    'manage:budget',
    'view:expenses',
    'create:expenses',
    'edit:expenses',
    'delete:expenses',
    'approve:expenses',
    // Subcontractors
    'view:subcontractors',
    'manage:subcontractors',
    // BOQ
    'view:boq',
    'edit:boq',
    // Quotations
    'view:quotations',
    'create:quotations',
    'edit:quotations',
    'approve:quotations',
    // Purchase Orders
    'view:purchase-orders',
    'create:purchase-orders',
    'edit:purchase-orders',
    'approve:purchase-orders',
    // GRV
    'view:grv',
    'create:grv',
    'verify:grv',
    // Payments
    'view:payments',
    'create:payments',
    'approve:payments',
    // Receipts
    'view:receipts',
    'create:receipts',
    // Contracts
    'view:contracts',
    'create:contracts',
    'edit:contracts',
    'approve:contracts',
    // Project Management - full
    'view:milestones',
    'manage:milestones',
    'view:documents',
    'manage:documents',
    'view:rfis',
    'create:rfis',
    'manage:rfis',
    'view:submittals',
    'create:submittals',
    'manage:submittals',
    'view:daily-logs',
    'create:daily-logs',
    'view:punch-items',
    'create:punch-items',
    'manage:punch-items',
    'view:change-orders',
    'create:change-orders',
    'approve:change-orders',
    'view:materials',
    'manage:materials',
    'view:photos',
    'upload:photos',
    'view:retainage',
    'approve:retainage',
    'view:activity-log',
  ],
  SITE_MANAGER: [
    'view:dashboard', 'view:site', 'view:tasks', 'create:tasks', 'edit:tasks',
    'view:team', 'view:reports', 'view:settings', 'view:notifications',
    'view:chat', 'send:chat',
    'view:labour', 'manage:labour', 'manage:wages',
    'view:daily-logs', 'create:daily-logs', 'view:rfis', 'create:rfis', 'manage:rfis',
    'view:photos', 'upload:photos', 'view:materials',
    'view:store', 'manage:inventory', 'manage:material-requests', 'manage:goods-receipt',
    'view:safety', 'manage:inspections', 'manage:incidents', 'manage:safety-training',
  ],
  SITE_ENGINEER: [
    'view:dashboard', 'view:site', 'view:tasks', 'create:tasks', 'edit:tasks',
    'view:reports', 'view:settings', 'view:notifications',
    'view:chat', 'send:chat',
    'view:daily-logs', 'create:daily-logs', 'view:rfis', 'create:rfis',
    'view:photos', 'upload:photos', 'view:materials',
  ],
  QA_QC_ENGINEER: [
    'view:dashboard', 'view:qa', 'manage:quality-checks', 'manage:ncr',
    'manage:quality-audits', 'view:reports', 'view:settings',
    'view:notifications', 'view:chat', 'send:chat',
    'view:rfis', 'view:daily-logs',
  ],
  SAFETY_OFFICER: [
    'view:dashboard', 'view:safety', 'manage:inspections', 'manage:incidents',
    'manage:safety-training', 'view:reports', 'view:settings',
    'view:notifications', 'view:chat', 'send:chat', 'view:daily-logs',
  ],
  STORE_KEEPER: [
    'view:dashboard', 'view:store-panel', 'manage:inventory',
    'manage:material-requests', 'manage:goods-receipt', 'view:reports',
    'view:settings', 'view:notifications', 'view:chat', 'send:chat',
    'view:materials', 'view:purchase-orders', 'view:grv',
  ],
  CLIENT: [
    'view:dashboard', 'view:projects', 'view:settings', 'view:notifications',
    'view:chat', 'send:chat',
    'view:payments', 'view:receipts', 'view:documents', 'view:photos', 'view:reports',
  ],
  CONSULTANT: [
    'view:dashboard', 'view:projects', 'view:settings', 'view:notifications',
    'view:chat', 'send:chat',
    'view:rfis', 'manage:rfis', 'view:drawings', 'manage:drawings',
    'view:documents', 'manage:documents', 'view:photos',
  ],
  ARCHITECT: [
    'view:dashboard', 'view:projects', 'view:settings', 'view:notifications',
    'view:chat', 'send:chat',
    'view:rfis', 'manage:rfis', 'view:drawings', 'manage:drawings',
    'view:documents', 'manage:documents', 'view:photos',
  ],
  SUBCONTRACTOR: [
    'view:dashboard', 'view:settings', 'view:notifications',
    'view:chat', 'send:chat',
    'view:work-orders', 'manage:timesheets',
    'view:payments', 'view:receipts', 'view:documents', 'view:reports',
  ],
  MANAGER: [
    // Dashboard
    'view:dashboard',
    // Projects - full control
    'view:projects',
    'create:projects',
    'edit:projects',
    // Tasks - full control
    'view:tasks',
    'create:tasks',
    'edit:tasks',
    'delete:tasks',
    // Team - view and manage
    'view:team',
    'manage:team',
    // Reports
    'view:reports',
    // Settings - view only
    'view:settings',
    // Notifications & Chat
    'view:notifications',
    'view:chat',
    'send:chat',
    // Budget & Finance - full
    'view:budget',
    'manage:budget',
    'view:expenses',
    'create:expenses',
    'edit:expenses',
    'delete:expenses',
    'approve:expenses',
    // Subcontractors
    'view:subcontractors',
    'manage:subcontractors',
    // BOQ
    'view:boq',
    'edit:boq',
    // Quotations
    'view:quotations',
    'create:quotations',
    'edit:quotations',
    'approve:quotations',
    // Purchase Orders
    'view:purchase-orders',
    'create:purchase-orders',
    'edit:purchase-orders',
    'approve:purchase-orders',
    // GRV
    'view:grv',
    'create:grv',
    'verify:grv',
    // Payments
    'view:payments',
    'create:payments',
    'approve:payments',
    // Receipts
    'view:receipts',
    'create:receipts',
    // Contracts
    'view:contracts',
    'create:contracts',
    'edit:contracts',
    'approve:contracts',
    // Project Management - full
    'view:milestones',
    'manage:milestones',
    'view:documents',
    'manage:documents',
    'view:rfis',
    'create:rfis',
    'manage:rfis',
    'view:submittals',
    'create:submittals',
    'manage:submittals',
    'view:daily-logs',
    'create:daily-logs',
    'view:punch-items',
    'create:punch-items',
    'manage:punch-items',
    'view:change-orders',
    'create:change-orders',
    'approve:change-orders',
    'view:materials',
    'manage:materials',
    'view:photos',
    'upload:photos',
    'view:retainage',
    'approve:retainage',
    'view:activity-log',
  ],
  MEMBER: [
    // Dashboard
    'view:dashboard',
    // Projects - view only
    'view:projects',
    // Tasks - create and edit own, view all
    'view:tasks',
    'create:tasks',
    'edit:tasks',
    // Team - view only
    'view:team',
    // Notifications & Chat
    'view:notifications',
    'view:chat',
    'send:chat',
    // Budget - view only
    'view:budget',
    'view:expenses',
    // Subcontractors - view
    'view:subcontractors',
    // BOQ - view
    'view:boq',
    // Quotations - view
    'view:quotations',
    // Purchase Orders - view
    'view:purchase-orders',
    // GRV - view
    'view:grv',
    // Payments - view
    'view:payments',
    // Receipts - view
    'view:receipts',
    // Contracts - view
    'view:contracts',
    // Project Management - limited
    'view:milestones',
    'view:documents',
    'view:rfis',
    'create:rfis',
    'view:submittals',
    'view:daily-logs',
    'create:daily-logs',
    'view:punch-items',
    'create:punch-items',
    'view:change-orders',
    'create:change-orders',
    'view:materials',
    'view:photos',
    'upload:photos',
    'view:activity-log',
    // Reports
    'view:reports',
  ],
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrator',
    MANAGER: 'Project Manager',
    MEMBER: 'Team Member',
    CEO: 'Chief Executive Officer',
    CFO: 'Chief Financial Officer',
    COO: 'Chief Operating Officer',
    HR_MANAGER: 'HR Manager',
    PROCUREMENT_HEAD: 'Procurement Head',
    PROJECT_DIRECTOR: 'Project Director',
    PROJECT_MANAGER: 'Project Manager',
    SITE_MANAGER: 'Site Manager',
    SITE_ENGINEER: 'Site Engineer',
    QA_QC_ENGINEER: 'QA/QC Engineer',
    SAFETY_OFFICER: 'Safety Officer',
    STORE_KEEPER: 'Store Keeper',
    CLIENT: 'Client',
    CONSULTANT: 'Consultant',
    ARCHITECT: 'Architect',
    SUBCONTRACTOR: 'Subcontractor',
  }
  return labels[role] || role
}

export function getRoleBadgeClass(role: string): string {
  const classes: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    MANAGER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    MEMBER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    CEO: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    CFO: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    COO: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    HR_MANAGER: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    PROCUREMENT_HEAD: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    PROJECT_DIRECTOR: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    PROJECT_MANAGER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    SITE_MANAGER: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400 border-lime-200 dark:border-lime-800',
    SITE_ENGINEER: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    QA_QC_ENGINEER: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800',
    SAFETY_OFFICER: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    STORE_KEEPER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    CLIENT: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400 border-stone-200 dark:border-stone-800',
    CONSULTANT: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    ARCHITECT: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
    SUBCONTRACTOR: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800',
  }
  return classes[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800'
}

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}