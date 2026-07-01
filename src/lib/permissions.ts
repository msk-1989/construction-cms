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
]

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: ALL_PERMISSIONS,
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
    ADMIN: 'Administrator',
    MANAGER: 'Project Manager',
    MEMBER: 'Team Member',
  }
  return labels[role] || role
}

export function getRoleBadgeClass(role: string): string {
  const classes: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    MANAGER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    MEMBER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  }
  return classes[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800'
}

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}